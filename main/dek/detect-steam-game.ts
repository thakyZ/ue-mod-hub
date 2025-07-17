/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { existsSync, readFile } from 'node:fs';
import path from 'node:path';

import Utils from '@main/dek/utils';
import * as vdf from '@node-steam/vdf';
import type { PromiseReject, PromiseResolve } from '@typed/common';
import type { AppManifestAcf, AppStateAcf, LibraryFoldersVdf, LibraryFolderVdf } from '@typed/vdf';
import type { RegistryItemCollection } from 'regedit'; //.promisified
import regedit from 'regedit'; //.promisified

/** @type {string} */
const steamRegistryKey: string = String.raw`HKLM\Software\Wow6432Node\Valve\Steam`; //64bit
/** @type {string} */
const _steamRegistry32b: string = String.raw`HKLM\Software\Valve\Steam`; //32bit steam install

/**
 * @param {...string} path_segments
 * @returns {void}
 */
export function setExternalVBS(...path_segments: string[]): void {
    // Assuming the files lie in <app>/resources/my-location
    const vbsDirectory: string = path.join(...path_segments);
    if (!existsSync(vbsDirectory)) {
        console.error('VBS directory not found:', vbsDirectory);
        return;
    }
    console.log('Setting external VBS location:', vbsDirectory);
    regedit.setExternalVBSLocation(vbsDirectory);
}

/** @returns {Promise<string>} */
function getSteamPathFromRegistry(): Promise<string | null> {
    return new Promise<string | null>((resolve: PromiseResolve<string | null>, reject: PromiseReject): void => {
        regedit.list<string>(
            [steamRegistryKey],
            (error: Error | undefined, result: RegistryItemCollection<readonly string[]>): void => {
                if (error) return reject(error);
                resolve(result[steamRegistryKey]?.values?.['InstallPath']?.value as string | null);
            }
        );
    });
}

/**
 * @param {string} basePath
 * @returns {Promise<LibraryFolderVdf[]>}
 */
function getSteamLibraryFolders(basePath: string): Promise<LibraryFolderVdf[]> {
    return new Promise<LibraryFolderVdf[]>((resolve: PromiseResolve<LibraryFolderVdf[]>, reject: PromiseReject): void => {
        /** @type {string} */
        const libraryFile: string = path.join(basePath, 'steamapps', 'libraryfolders.vdf');
        readFile(libraryFile, 'utf8', (error: NodeJS.ErrnoException | null, data: string): void => {
            if (error) return reject(error);
            /** @type {LibraryFoldersVdf} */
            const { libraryfolders }: LibraryFoldersVdf = vdf.parse<LibraryFoldersVdf>(data);
            resolve(Object.values(libraryfolders));
        });
    });
}

/**
 * @param {string} basePath
 * @param {string | number} appId
 * @returns {Promise<AppStateAcf>}
 */
function getGameManifest(basePath: string, appId: string | number): Promise<AppStateAcf | null> {
    return new Promise<AppStateAcf | null>((resolve: PromiseResolve<AppStateAcf | null>, reject: PromiseReject): void => {
        /** @type {string} */
        const manifestFile: string = path.join(basePath, 'steamapps', `appmanifest_${appId}.acf`);
        if (!existsSync(manifestFile)) return resolve(null);
        readFile(manifestFile, 'utf8', (error: NodeJS.ErrnoException | null, data: string): void => {
            if (error) return reject(error);
            /** @type {AppManifestAcf} */
            const appManifest: AppManifestAcf = vdf.parse(data);
            resolve(appManifest.AppState);
        });
    });
}

/**
 * @param {LibraryFolderVdf[]} libraryPaths
 * @param {string | number} appId
 * @returns {Promise<string | null>}
 */
async function findGameInstallation(libraryPaths: LibraryFolderVdf[], appId: string | number): Promise<string | null> {
    for (const libData of libraryPaths) {
        /** @type {AppStateAcf} */
        const manifest: AppStateAcf | null = await getGameManifest(libData.path, appId);
        if (manifest) {
            const gameFolderPath: string = path.join(libData.path, 'steamapps', 'common');
            const potentialGamePath: string = path.join(gameFolderPath, manifest.installdir);
            return potentialGamePath;
        }
    }
    return null;
}

/**
 * @param {string | number} appId
 * @returns {Promise<string | null>}
 * @async
 */
export default async function detectSteamGameInstallation(appId: string | number): Promise<string | null> {
    try {
        /** @type {string | null} */
        const steamPath: string | null = await getSteamPathFromRegistry();
        if (!steamPath) return 'Steam not found.';
        /** @type {LibraryFolderVdf[]} */
        const libraryPaths: LibraryFolderVdf[] = await getSteamLibraryFolders(steamPath);
        /** @type {string | null} */
        const gamePath: string | null = await findGameInstallation(libraryPaths, appId);

        if (gamePath) {
            console.log(`Game found at: ${gamePath}`);
            return gamePath;
        } else {
            console.log('Game not found');
            return 'Game not found';
        }
    } catch (error: unknown) {
        console.error('Error detecting game installation:', error);
        if (Utils.instanceOfNodeError(error, TypeError)) return error.message;
        return `${error?.toString() ?? 'Unknown error when detecting game installation.'}`;
    }
    // return null;
}
