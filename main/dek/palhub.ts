/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// class to interact with the NexusMods API
// see https://github.com/Nexus-Mods/node-nexus-api for more details
import assert from 'node:assert';
import type { ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio } from 'node:child_process';
import { spawn } from 'node:child_process';
import EventEmitter from 'node:events';
import type { Dirent, Mode, ObjectEncodingOptions, OpenMode, PathLike, Stats, WriteStream } from 'node:fs';
import { createWriteStream, existsSync, unlinkSync } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { access, copyFile, cp, readdir, readFile, rmdir, stat, unlink, watch, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resourcesPath, stdout } from 'node:process';
import Stream, { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';

import type { ExtraGames, Games } from '@main/config';
// import stringify from "json-stringify-pretty-compact";
import type { ArchiveEntry, ArchiveEntryData } from '@main/dek/archive-handler';
import ArchiveHandler from '@main/dek/archive-handler';
import DEAP from '@main/dek/deap';
import type { GameMap, GamePlatform, GamePlatforms, KnownModLoader, LaunchTypes } from '@main/dek/game-map';
import GAME_MAP, { KNOWN_MODLOADERS } from '@main/dek/game-map'; // eslint-disable-line import/named
import Utils from '@main/dek/utils';
import type { IFileInfo as NexusIFileInfo, IModInfo as NexusIModInfo } from '@nexusmods/nexus-api';
import Nexus from '@nexusmods/nexus-api';
import type { BooleanChoose, PromiseReject, PromiseResolve } from '@typed/common';
import type {
    AddModDataToJsonExtraProps,
    ChangeDataEvent,
    CheckedPakForLogicMod,
    DownloadCallbacks,
    EventsToHandleMap,
    IModInfoWithSavedConfig,
    LocalModConfig,
    ModConfig,
    PalHubCacheConfig,
    PalHubCacheFileConfig,
    PalHubConfig,
    PalHubModConfigMap,
    ReleaseData,
    RemoveModDataFromJsonReturn,
    Ue4ssProcessDownload,
    ValidateGamePathReturnType,
} from '@typed/palhub';

/** @type {EventEmitter<EventsToHandleMap>} */ // eslint-disable-next-line unicorn/prefer-event-target
export const Emitter: EventEmitter<EventsToHandleMap> = new EventEmitter<EventsToHandleMap>();

/**
 * @param {NonNullable<unknown>} data
 * @returns {string}
 */
function stringifyJSON(data: NonNullable<unknown>): string {
    return JSON.stringify(data, undefined, 4);
    // return stringify(data, { maxLength: 124, indent: 4 });
}

/**
 * PalHUB API Interface <3
 * Handles interactions between the client's machine and the main PalHUB server.
 * @class API
 * @method get
 * @method post
 * @method getModList
 */
export class API {
    /**
     * @template T
     * @param {string} url
     * @returns {Promise<T>}
     */
    static async get<T>(url: string): Promise<T> {
        const response = await fetch(url);
        return response.json() as T;
    }

    /**
     * @template TRequest
     * @template TResponse
     * @param {string} url
     * @param {TRequest} data
     * @returns {Promise<TResponse>}
     */
    static async post<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse> {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json() as TResponse;
    }

    /** @returns {Promise<unknown>} */
    // TODO: Figure out the typing for this.
    static async getModList(): Promise<unknown> {
        // TODO: Type this return type.
        return await API.get('http://localhost:3000/mods');
    }
}

// class DekNexus extends Nexus {

//     //! doesn't work - rip lol
//     //todo: ask for help on this one
//     async getRequiredMods(modId) {
//         await this.mQuota.wait();
//         let urlPath = '/games/{gameId}/mods/{modId}/requirements';
//         return this.request(this.mBaseURL + urlPath, this.args({
//             path: this.filter({ modId, gameId })
//         }));
//     }

// }

/**
 * PalHUB Client Interface <3
 *
 * Handles client machine interactions. eg, managing mods, starting servers, etc.
 */
export class Client {
    /**
     * @type {string | undefined}
     * @static
     * @private
     */
    static appName: string | undefined;

    /**
     * @type {string | undefined}
     * @static
     * @private
     */
    static appVersion: string | undefined;

    /**
     * @type {Nexus | undefined}
     * @static
     * @private
     */
    private static _nexus: Nexus | undefined;

    /**
     * @type {Record<string, AbortController> | undefined}
     * @static
     * @private
     */
    private static _ac: Record<string, AbortController> | undefined;

    /** @type {'palhub.config.json'} */
    static get json_filename(): 'palhub.config.json' {
        return 'palhub.config.json';
    }

    /**
     * @param {string} appName
     * @param {string} appVersion
     */
    static setAppDetails(appName: string, appVersion: string): void {
        Client.appName = appName;
        Client.appVersion = appVersion;
        console.log('setAppDetails:', appName, appVersion);
    }

    /**
     * @param {string} api_key
     * @returns {Promise<Nexus>}
     */
    static async ensureNexusLink(api_key: string): Promise<Nexus> {
        if (Client._nexus) return Client._nexus;
        Client._nexus = new Nexus(Client.appVersion ?? '0.0.1', Client.appName ?? 'PalHUB', '');
        await Client._nexus.setKey(api_key);
        return Client._nexus;
    }

    /**
     * use node js to validate the game installation seems to be a valid game path
     * also determine if it is installeld for steam, xbox pass, or windows store.
     * @param {string} game_path
     * @returns {Promise<ValidateGamePathReturnType>}
     */
    static async validateGamePath(game_path: string): Promise<ValidateGamePathReturnType> {
        if (!game_path) return { type: '{invalid-path}' };
        try {
            console.log('validating game path', game_path);
            // const exists = await access(game_path);
            /** @type {Dirent[]} */
            const files: Dirent[] = await readdir(game_path, { withFileTypes: true }); //, encoding: 'utf-8', recursive: true});
            /** @type {(filename: string) => boolean} */
            const fileExists: (filename: string) => boolean = (filename): boolean =>
                files.some((file) => file.isFile() && file.name === filename);
            // console.log({ files });

            // ue folder/project names
            // Palworld - Pal
            // HL - Phoenix
            // FF7R - End

            for (const [game_key, map_data] of Object.entries(GAME_MAP) as [Games | ExtraGames, GameMap][]) {
                if (game_key === 'generic') continue; // skip generic

                for (const platform of ['epic', 'steam', 'xbox'] as GamePlatforms[]) {
                    for (const launch_type of ['demo', 'game', 'server'] as LaunchTypes[]) {
                        // console.log("checking:", platform, launch_type, game_key);

                        // platforms.game.steam.id = steam app id
                        /** @type {GamePlatform | undefined | null} */
                        const data: GamePlatform | undefined | null = map_data.platforms?.[launch_type]?.[platform];
                        if (!data) continue; // skip if no data

                        // console.log(data);

                        // {id: "7654321", root: "UEProjectRoot", app: "ServerExeName"},
                        type DataDeconstruct = { root: string; app: string; match?: RegExp | undefined | null };
                        /** @type {DataDeconstruct} */
                        const { root, app, match = null }: DataDeconstruct = data;
                        if (!root || !app) continue; // skip if no id, root, or app data

                        // TODO: TEST: steam://rungameid/STEAMGAMEID
                        /** @type {boolean} */
                        const check_for_egstore: boolean = platform === 'epic';
                        /** @type {boolean} */
                        const has_egstore: boolean =
                            check_for_egstore &&
                            (await access(path.join(game_path, '.egstore'))
                                .then(() => true)
                                .catch(() => false));

                        /** @type {string} */
                        const app_name: string = `${app}.exe`;

                        /** @type {boolean} */
                        const checkmatch: boolean = match ? match.test(game_path) : true;

                        // console.log("checking for:", app_name);
                        if (fileExists(app_name) && checkmatch && (!check_for_egstore || has_egstore)) {
                            console.log('found:', app_name);
                            /** @type {string} */
                            const exe_path: string = path.join(game_path, app_name);
                            /** @type {string} */
                            const content_path: string = path.join(game_path, `${root}/Content`);
                            /** @type {string} */
                            const pak_path: string = path.join(game_path, `${root}/Content/Paks`);
                            /** @type {string} */
                            const ue4ss_dir: string = platform === 'xbox' ? 'WinGDK' : 'Win64';
                            /** @type {string} */
                            const ue4ss_root: string = path.join(game_path, `${root}/Binaries/${ue4ss_dir}`);
                            /** @type {string} */
                            const ue4ss_path: string = path.join(ue4ss_root, 'dwmapi.dll');
                            /** @type {boolean} */
                            const has_ue4ss: boolean = await access(ue4ss_path)
                                .then(() => true)
                                .catch(() => false);
                            // const nexus_slug = map_data.providers.nexus

                            // returns `game` object with all the data <3
                            return {
                                id: game_key,
                                type: platform,
                                path: game_path,
                                has_exe: true,
                                exe_path,
                                pak_path,
                                has_ue4ss,
                                ue4ss_path,
                                ue4ss_root,
                                content_path,
                                launch_type,
                                map_data,
                                unreal_root: root,
                                // nexus_slug,
                            };
                        }
                    }
                }
            }

            // /** @type {string} */
            // const content_path = join(game_path, "Pal/Content");
            // /** @type {string} */
            // const pak_path = join(game_path, "Pal/Content/Paks");

            // if (fileExists("Palworld.exe")) { // steam/windows
            //     /** @type {string} */
            //     const exe_path = join(game_path, "Palworld.exe");
            //     /** @type {string} */
            //     const ue4ss_root = join(game_path, "Pal/Binaries/Win64");
            //     /** @type {string} */
            //     const ue4ss_path = join(ue4ss_root, "dwmapi.dll");
            //     /** @type {boolean} */
            //     const has_ue4ss = await access(ue4ss_path).then(()=>true).catch(()=>false);
            //     return {
            //         type: "steam",
            //         has_exe: true,
            //         exe_path,
            //         pak_path,
            //         has_ue4ss,
            //         ue4ss_path,
            //         ue4ss_root,
            //         content_path,
            //     };
            // }
            // else if (fileExists("gamelaunchhelper.exe")) { // xbox gamepass
            //     /** @type {string} */
            //     const exe_path = join(game_path, "gamelaunchhelper.exe");
            //     /** @type {string} */
            //     const ue4ss_root = join(game_path, "Pal/Binaries/WinGDK");
            //     /** @type {string} */
            //     const ue4ss_path = join(ue4ss_root, "dwmapi.dll");
            //     /** @type {boolean} */
            //     const has_ue4ss = await access(ue4ss_path).then(()=>true).catch(()=>false);
            //     // console.log({ exe_path, has_exe, ue4ss_path, has_ue4ss });
            //     return {
            //         type: "xbox",
            //         has_exe: true,
            //         exe_path,
            //         pak_path,
            //         has_ue4ss,
            //         ue4ss_path,
            //         ue4ss_root,
            //         content_path,
            //     };
            // }
            // cant seem to validate game.. unknown path
            throw new Error('Unknown game path');
        } catch (error) {
            console.error('validateGamePath error', error);
            // return reject({ type: "{UNKNOWN}" });
        }
        return { type: '{UNKNOWN}' };
    }

    /**
     * @param {string} cache_dir
     * @param {string} download_url
     * @param {Partial<DownloadCallbacks>} [callbacks={}]
     * @returns {Promise<boolean>}
     */
    static downloadFile(
        cache_dir: string,
        download_url: string,
        callbacks: Partial<DownloadCallbacks> = {}
    ): Promise<boolean> {
        return new Promise<boolean>((resolve: PromiseResolve<boolean>, reject: PromiseReject): void => {
            /** @type {string | undefined} */
            const filename: string | undefined = download_url.split('/').pop();
            if (!filename) return resolve(false); // TODO: make it a reject
            /** @type {string} */
            const outputPath: string = path.join(cache_dir, filename);
            fetch(download_url, { method: 'GET', redirect: 'follow' })
                .then((response: Response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to get '${download_url}' (${response.status})`);
                    }
                    assert.ok(response.body);

                    /** @type {string | null} */
                    const contentLength: string | null = response.headers.get('content-length');
                    assert.ok(contentLength);

                    /** @type {number} */
                    const totalSize: number = Number.parseInt(contentLength, 10);

                    /** @type {number} */
                    let downloadedSize: number = 0;

                    /** @type {Readable} */
                    const responseReader: Readable = Readable.fromWeb(response.body as ReadableStream);
                    responseReader.on('data', (chunk: unknown): void => {
                        if (chunk instanceof Object && 'length' in chunk && typeof chunk.length === 'number') {
                            downloadedSize += chunk.length;
                            /** @type {string} */
                            const percentage: string = ((downloadedSize / totalSize) * 100).toFixed(2);
                            stdout.write(`Downloading: ${percentage}%\r`);
                            if (callbacks.onProgress) callbacks.onProgress({ filename, outputPath, percentage });
                            else
                                Emitter.emit('download-file', {
                                    filename,
                                    outputPath,
                                    percentage,
                                });
                        } else {
                            void DEAP.logger?.warn(
                                `Parameter chunk is not of expected \`{ length: string; }\` got ${chunk?.toString() ?? 'undefined'}`
                            );
                        }
                    });

                    // pipe the response to the new file as its received. This is a streaming download
                    // so the file is saved to disk as it downloads. helpful for large files.
                    /** @type {WriteStream} */
                    const newfile: WriteStream = createWriteStream(outputPath);

                    newfile.on('finish', () => {
                        newfile.close(() => {
                            console.log('\nDownload completed:', filename);
                            if (callbacks.onFinish) callbacks.onFinish({ filename, outputPath });
                            resolve(true);
                        });
                    });

                    newfile.on('error', (error) => {
                        if (callbacks.onError) callbacks.onError({ filename, outputPath, error });
                        unlinkSync(outputPath); // Delete the file async if an error occurs
                        reject(error);
                    });

                    void finished(responseReader.pipe(newfile));
                    return true;
                })
                .catch((error: unknown) => {
                    if (!error || error === undefined) error = 'Unknown Error';
                    if (typeof error === 'string') error = new Error(error);
                    else if (!(error instanceof Error)) error = new Error(String(error));
                    assert.ok(error instanceof Error);
                    if (callbacks.onError) callbacks.onError({ filename, outputPath, error });
                    unlinkSync(outputPath); // Delete the file async if an error occurs
                    reject(error);
                });
        });
    }

    /**
     * download and install mod from nexus
     * mod will be a zip file and may be very large
     * we use steaming to save the file to disk as it downloads
     * @param {string} cache_path
     * @param {string | undefined} download_url
     * @param {IModInfoWithSavedConfig} mod
     * @param {NexusIFileInfo} file
     * @returns {Promise<boolean>}
     */
    static downloadMod(
        cache_path: string,
        download_url: string | undefined,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id'>,
        file: Pick<NexusIFileInfo, 'file_name' | 'version' | 'file_id'>
    ): Promise<boolean> {
        if (!file.file_name) return Promise.resolve(false);
        /** @type {string} */
        const outputPath: string = path.join(cache_path, file.file_name);

        return new Promise<boolean>((resolve: PromiseResolve<boolean>, reject: PromiseReject): void => {
            if (!mod) return reject(new Error('No mod data provided'));
            if (!file) return reject(new Error('No file data provided'));
            if (!download_url) return reject(new Error('No download URL provided'));
            Client.checkModFileIsDownloaded(cache_path, file).then(
                (value: boolean) => {
                    if (value) return reject(new Error('Mod file already downloaded'));

                    /** @type {WriteStream} */
                    const newfile: WriteStream = createWriteStream(outputPath);

                    fetch(download_url)
                        .then(
                            async (response: Response) => {
                                if (!response.ok) {
                                    return reject(new Error(`Failed to get '${download_url}' (${response.status})`));
                                }
                                assert.ok(response.body);

                                /** @type {string | null} */
                                const contentLength: string | null = response.headers.get('content-length');
                                assert.ok(contentLength);

                                /** @type {number} */
                                const totalSize: number = Number.parseInt(contentLength, 10);

                                /** @type {number} */
                                let downloadedSize: number = 0;

                                /** @type {Readable} */
                                const responseReader: Readable = Readable.fromWeb(response.body as ReadableStream);
                                responseReader.on('data', (chunk: unknown): void => {
                                    if (chunk instanceof Object && 'length' in chunk && typeof chunk.length === 'number') {
                                        downloadedSize += chunk.length;
                                        const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);
                                        stdout.write(`Downloading: ${percentage}%\r`);
                                        Emitter.emit('download-mod-file', {
                                            mod_id: Utils.parseIntSafe(mod.mod_id),
                                            file_id: file.file_id,
                                            percentage,
                                        });
                                    } else {
                                        void DEAP.logger?.warn(
                                            `Parameter chunk is not of expected \`{ length: string; }\` got ${chunk?.toString() ?? 'undefined'}`
                                        );
                                    }
                                });

                                // pipe the response to the new file as its received. This is a streaming download
                                // so the file is saved to disk as it downloads. helpful for large files.

                                newfile.on('finish', () => {
                                    newfile.close(() => {
                                        Client.addModDataToCacheJSON(cache_path, mod, file).then(
                                            () => {
                                                console.log('\nDownload completed.');
                                                return resolve(true);
                                            },
                                            (error) => {
                                                if (!error || error === undefined) error = 'Unknown Error';
                                                if (typeof error === 'string') error = new Error(error);
                                                else if (!(error instanceof Error)) error = new Error(String(error));
                                                assert.ok(error instanceof Error);
                                                return reject(error);
                                            }
                                        );
                                    });
                                });

                                newfile.on('error', (error) => {
                                    unlinkSync(outputPath); // Delete the file async if an error occurs
                                    return reject(error);
                                });

                                await finished(responseReader.pipe(newfile));
                            },
                            (error: unknown): void => {
                                if (!error || error === undefined) error = 'Unknown Error';
                                if (typeof error === 'string') error = new Error(error);
                                else if (!(error instanceof Error)) error = new Error(String(error));
                                assert.ok(error instanceof Error);
                                unlinkSync(outputPath); // Delete the file async if an error occurs
                                reject(error);
                            }
                        )
                        .catch((error: unknown): void => {
                            if (!error || error === undefined) error = 'Unknown Error';
                            if (typeof error === 'string') error = new Error(error);
                            else if (!(error instanceof Error)) error = new Error(String(error));
                            assert.ok(error instanceof Error);
                            unlinkSync(outputPath); // Delete the file async if an error occurs
                            reject(error);
                        });
                },
                (error: unknown): void => {
                    if (!error || error === undefined) error = 'Unknown Error';
                    if (typeof error === 'string') error = new Error(error);
                    else if (!(error instanceof Error)) error = new Error(String(error));
                    assert.ok(error instanceof Error);
                    unlinkSync(outputPath); // Delete the file async if an error occurs
                    reject(error);
                }
            );
        });
    }

    /**
     * @param {string} pakFilePath
     * @param {string} [assetName='ModActor.uasset']
     * @returns {Promise<CheckedPakForLogicMod>}
     */
    static async checkPakForLogicMod(
        pakFilePath: string,
        assetName: string = 'ModActor.uasset'
    ): Promise<CheckedPakForLogicMod> {
        try {
            /** @type {string} */
            const dirPath: string = path.dirname(pakFilePath);
            /** @type {string} */
            const baseName: string = path.basename(pakFilePath, '.pak'); // Get the base name without extension

            // Check if corresponding .ucas and .utoc files exist
            /** @type {string} */
            const ucasFilePath: string = path.join(dirPath, `${baseName}.ucas`);
            /** @type {string} */
            const utocFilePath: string = path.join(dirPath, `${baseName}.utoc`);

            // If both .ucas and .utoc files exist, recurse using the .utoc file
            if (existsSync(ucasFilePath) && existsSync(utocFilePath)) {
                console.log(`Found .ucas and .utoc files for ${baseName}, checking ${utocFilePath}...`);
                return Client.checkPakForLogicMod(utocFilePath, assetName); // Recurse with .utoc file
            }

            // If the pak file or .utoc file doesn't exist, proceed with reading the .pak file
            /** @type {Buffer<ArrayBufferLike>} */
            const fileBuffer: Buffer<ArrayBufferLike> = await readFile(pakFilePath);
            /** @type {string} */
            const readableData: string = fileBuffer.toString('utf8');

            // Modify regex to search for the specific asset name (case-insensitive)
            /** @type {RegExpExecArray[]} */
            const matches: RegExpExecArray[] = [...readableData.matchAll(new RegExp(`${assetName}`, 'gi'))];

            // Return true if asset is found, otherwise false
            return {
                found: matches.length > 0,
                paktype: path.extname(pakFilePath).slice(1), // Get the package name without the dot
                assetName,
            };
        } catch (error) {
            console.error('Error reading pak file:', error);
            return { found: false }; // Return false in case of any error
        }
    }

    /**
     * @param {ArchiveEntry[]} zipEntries
     * @param {string} [assetName='ModActor.uasset']
     * @returns {Promise<CheckedPakForLogicMod>}
     */
    static async checkPakForLogicModInZip(
        zipEntries: ArchiveEntry[],
        assetName: string = 'ModActor.uasset'
    ): Promise<CheckedPakForLogicMod> {
        try {
            // Look for pak and utoc files in zip entries
            for (const entry of zipEntries) {
                // Check if the entry is a .pak or .utoc file
                if (
                    !entry.isDirectory &&
                    entry.entryName &&
                    (entry.entryName.endsWith('.pak') || entry.entryName.endsWith('.utoc'))
                ) {
                    /** @type {ArchiveEntryData} */
                    const fileBuffer: ArchiveEntryData = await entry.getData();
                    /** @type {string} */
                    const readableData: string = fileBuffer.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string

                    // Check for asset name in the file
                    /** @type {RegExpExecArray[]} */
                    const matches: RegExpExecArray[] = [...readableData.matchAll(new RegExp(assetName, 'gi'))];

                    if (matches.length > 0) {
                        return {
                            found: true,
                            paktype: path.extname(entry.entryName).slice(1), // Get the package name without the dot
                            fileName: entry.entryName,
                            assetName,
                        };
                    }
                }
            }

            // If no asset was found
            return {
                found: false,
                assetName,
            };
        } catch (error) {
            console.error('Error processing zip file:', error);
            return { found: false }; // Return false in case of any error
        }
    }

    /**
     * @param {string} game_path
     * @param {ArchiveEntry[]} entries
     * @param {string | undefined} [forcedRoot=undefined]
     * @returns {Promise<[string, string[], ArchiveEntry[]]>}
     */
    static async determineInstallPath(
        game_path: string,
        entries: ArchiveEntry[],
        forcedRoot: string | undefined = undefined
    ): Promise<[install_path: string, ignored_files: string[], entries: ArchiveEntry[]]> {
        /** @type {string} */
        let install_path: string = game_path;

        /** @type {ValidateGamePathReturnType} */
        const game_data: ValidateGamePathReturnType = await Client.validateGamePath(game_path);
        // console.log("determineInstallPath:");
        // console.log({ game_path, game_data });
        assert.ok(game_data.type !== '{invalid-path}');
        assert.ok(game_data.type !== '{UNKNOWN}');
        assert.ok('unreal_root' in game_data);

        // determine the actual first entry, ignoring any 'root' directories that may be present
        /** @type {Set<string>} */
        const allowedRoots: Set<string> = new Set<string>([
            game_data.unreal_root,
            'Binaries',
            'Content',
            'Win64',
            'WinGDK',
            'Mods',
            'Movies',
            'Paks',
            'LogicMods',
            '~mods',
        ]);

        /** @type {string} */
        let ignoredRoots: string = '';

        // entries.sort((a, b) => a.entryName.length - b.entryName.length);
        /** @type {Set<string>} */
        const folders: Set<string> = new Set(); // To store unique folder paths
        for (const entry of entries) {
            console.log({ entry });
            /** @type {string} */
            const entryPath: string = entry.entryName;

            // If the entry is not a directory, derive its parent directories
            if (entry.isDirectory) {
                // If the entry is a directory, add it directly
                folders.add(entryPath);
            } else {
                /** @type {string[]} */
                const parts: string[] = entryPath.split('/');
                for (let i = 1; i < parts.length; i++) {
                    folders.add(parts.slice(0, i).join('/') + '/');
                }
            }
        }
        // Convert the set to an array and sort it (optional, for readability)
        /** @type {string[]} */
        const folderList: string[] = [...folders]; //.sort();
        console.log('Detected folders:', folderList);

        /** @returns {ArchiveEntry | undefined} */
        const getFirstFileEntry = (): ArchiveEntry | undefined =>
            entries.find((entry) => {
                /** @type {string} */
                const replaced: string = entry.entryName.replace(ignoredRoots, '');
                /** @type {string | undefined} */
                const root: string | undefined = replaced.split(/[\\/]/).shift();
                console.log('checking root:', root);
                assert.ok(root);
                // console.log({ root, replaced });
                if (allowedRoots.has(root)) return true;
                if (entry.isDirectory) ignoredRoots = `${root}/`;
                return false;
            }) ?? entries[0];

        /** @type {ArchiveEntry | undefined} */
        let firstFileEntry: ArchiveEntry | undefined = getFirstFileEntry();

        if (ignoredRoots === 'Scripts/') {
            // seems to be a lua mod with a dumb zip structure
            // set the output path for each entry, assuming it is a poorly packaged lua mod
            for (const entry of entries) {
                entry.outputPath = `Mods/${entry.entryName}`;
            }
            // add fake first entry:
            entries.unshift({ entryName: 'Mods/', isDirectory: true, outputPath: 'Mods/' } as ArchiveEntry);
            firstFileEntry = getFirstFileEntry(); // replace the first entry with fake 'Mods/' entry
        } else {
            // set the output path for each entry based on the ignored roots
            for (const entry of entries) {
                entry.outputPath = entry.entryName.replace(ignoredRoots, '');
            }
        }

        // if the entry is a file and not in the allowed roots, ignore it
        /** @type {(part: string) => boolean} */
        const part_checker: (part: string) => boolean = (part): boolean => allowedRoots.has(part);
        /** @type {string[]} */
        const VALID_FILETYPES: string[] = ['pak', 'ucas', 'utoc', 'txt', 'json', 'lua', 'md', 'bk2', 'bmp'];
        /** @type {string[]} */
        const ignored_files: string[] = entries
            .filter(({ isDirectory = false, entryName: entryName = '', size = 0 }) => {
                /** @type {boolean} */
                const seemsValid: boolean = VALID_FILETYPES.some((ext) => entryName.endsWith(`.${ext}`));
                if (!isDirectory && seemsValid) return false;
                if (!isDirectory && size === 0) return true;
                return !isDirectory && !entryName.split('/').some((element: string): boolean => part_checker(element));
            })
            .map(({ entryName: entryName }) => entryName);

        console.log({ firstFileEntry, ignoredRoots, ignored_files, game_data });

        if (forcedRoot !== undefined) {
            switch (forcedRoot) {
                case `${game_data.unreal_root}/`:
                    install_path = game_path;
                    break;
                case 'Binaries/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Binaries');
                    break;
                case 'Content/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content');
                    break;
                case 'Mods/':
                    install_path = game_path.includes('XboxGames')
                        ? path.join(game_path, game_data.unreal_root, 'Binaries/WinGDK')
                        : path.join(game_path, game_data.unreal_root, 'Binaries/Win64');
                    break;
                case 'Movies/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Movies');
                    break;
                case 'Splash/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Splash');
                    break;
                case 'Paks/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks');
                    break;
                case 'LogicMods/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/LogicMods');
                    break;
                default: // ~mods/ or unknown mod type ~ assume regular .pak replacement
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/~mods');
                    break;
            }
        } else if (firstFileEntry?.isDirectory === true) {
            switch (forcedRoot ?? firstFileEntry.outputPath) {
                case `${game_data.unreal_root}/`:
                    install_path = game_path;
                    break;
                case 'Binaries/':
                case 'Content/':
                    install_path = path.join(game_path, game_data.unreal_root);
                    break;
                case 'Win64/':
                case 'WinGDK/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Binaries');
                    break;
                case 'Mods/':
                    install_path = game_path.includes('XboxGames')
                        ? path.join(game_path, game_data.unreal_root, 'Binaries/WinGDK')
                        : path.join(game_path, game_data.unreal_root, 'Binaries/Win64');
                    break;
                case 'Movies/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content');
                    break;
                case 'Splash/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content');
                    break;
                case 'Paks/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content');
                    break;
                case 'LogicMods/':
                    install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks');
                    break;
                default: {
                    // ~mods/ or unknown mod type ~ assume regular .pak replacement
                    /** @type {CheckedPakForLogicMod} */
                    const zipAssetFound: CheckedPakForLogicMod = await Client.checkPakForLogicModInZip(entries);
                    // const pakAssetFound = checkPakForLogicMod(pakFilePath);
                    console.log({ zipAssetFound });
                    if (zipAssetFound?.found) {
                        // unknown mod type ~ assume regular .pak replacement
                        install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/LogicMods');
                    } else if (firstFileEntry.entryName.endsWith('.bk2')) {
                        console.log('install type seems like movie file, assuming Movies/');
                        install_path = path.join(game_path, game_data.unreal_root, 'Content/Movies');
                    } else if (/splash/i.test(firstFileEntry.entryName) && firstFileEntry.entryName.endsWith('.bmp')) {
                        console.log('install type seems like image file, assuming Splash/');
                        install_path = path.join(game_path, game_data.unreal_root, 'Content/Splash');
                    } else {
                        console.log('unknown install type assuming ~mods');
                        // unknown mod type ~ assume regular .pak replacement
                        install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/~mods');
                    }
                    break;
                }
            }
        } else {
            /** @type {CheckedPakForLogicMod} */
            const zipAssetFound: CheckedPakForLogicMod = await Client.checkPakForLogicModInZip(entries);
            // const pakAssetFound = checkPakForLogicMod(pakFilePath);
            console.log({ zipAssetFound });
            if (zipAssetFound?.found) {
                // unknown mod type ~ assume regular .pak replacement
                install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/LogicMods');
            } else if (firstFileEntry?.entryName.endsWith('.bk2') === true) {
                console.log('install type seems like movie file, assuming Movies/');
                install_path = path.join(game_path, game_data.unreal_root, 'Content/Movies');
            } else if (
                firstFileEntry &&
                /splash/i.test(firstFileEntry.entryName) &&
                firstFileEntry.entryName.endsWith('.bmp')
            ) {
                console.log('install type seems like image file, assuming Splash/');
                install_path = path.join(game_path, game_data.unreal_root, 'Content/Splash');
            } else {
                console.log('unknown install type assuming ~mods');
                // unknown mod type ~ assume regular .pak replacement
                install_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/~mods');
            }
        }
        return [install_path, ignored_files, entries];
    }

    /**
     * @template {boolean} TIsLocal
     * @template {BooleanChoose<keyof PalHubConfig, 'mods', 'local_mods', TIsLocal>} TScope
     * @template {AddModDataToJsonExtraProps<TScope>} TExtraProps
     * @param {string} cache_path
     * @param {string} game_path
     * @param {NexusIModInfo} mod
     * @param {IFileInfo} file
     * @param {boolean} [isLocal=false]
     * @param {string | undefined} [forcedRoot=undefined]
     * @param {TExtraProps} [extraJsonProps={}]
     * @returns {Promise<boolean>}
     */
    static async installMod<
        TIsLocal = boolean,
        // prettier-ignore
        TScope extends BooleanChoose<keyof PalHubConfig, 'mods', 'local_mods', TIsLocal> = BooleanChoose<keyof PalHubConfig, 'mods', 'local_mods', TIsLocal>,
        // prettier-ignore
        TExtraProps extends AddModDataToJsonExtraProps<TScope, IModInfoWithSavedConfig> = AddModDataToJsonExtraProps<TScope, IModInfoWithSavedConfig>,
    >(
        cache_path: string,
        game_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id' | 'name'>,
        file: Pick<IModInfoWithSavedConfig, 'version' | 'file_name' | 'file_id'>,
        isLocal: TIsLocal = false as TIsLocal,
        forcedRoot: string | undefined = undefined,
        extraJsonProps: TExtraProps = {} as TExtraProps
    ): Promise<boolean> {
        if (!file.file_name) return false;
        // check if the mod is already downloaded
        /** @type {boolean} */
        const downloaded: boolean = (isLocal as boolean) || (await Client.checkModFileIsDownloaded(cache_path, file));
        if (!downloaded) throw new Error('Mod file not downloaded');
        // check if the mod is already installed
        /** @type {boolean} */
        const installed: boolean = await Client.checkModIsInstalled(game_path, mod, file);
        if (installed) throw new Error('Mod already installed');

        // unzip the mods zip file, and copy it to the game directory
        /** @type {ArchiveHandler} */
        const archive: ArchiveHandler = new ArchiveHandler(path.join(cache_path, file.file_name));
        /** @type {ArchiveEntry[]} */
        const entries: ArchiveEntry[] = await archive.getEntries();

        // determine the root path to install this mods files to
        /** @type {[string, string[]]} */
        const [install_path, ignored_files] = await Client.determineInstallPath(game_path, entries, forcedRoot);

        for (const entry of entries) {
            // do backup if bk2 file
            if (entry.entryName.endsWith('.bk2') || entry.entryName.endsWith('.bmp')) {
                console.log('found movie file:', entry.entryName);
                await Client.backupFileForDelete(path.join(install_path, entry.entryName));
            }
        }

        Emitter.emit('install-mod-file', {
            install_path,
            name: mod.name,
            version: file.version,
            mod_id: mod.mod_id,
            file_id: file.file_id,
            entries: entries.map((entry) => entry.entryName),
        });

        // forward the extracting event to the renderer
        archive.on('extracting', (data) => {
            console.log('extracting:', data);
            Emitter.emit('extract-mod-file', data);
        });

        console.log('extracted to:', install_path);
        await archive.extractAllTo(install_path, true, ignored_files);

        // add mod data to the config file
        /** @type {keyof PalHubConfig} */
        const propName: keyof PalHubConfig = isLocal ? 'local_mods' : 'mods';
        await Client.addModDataToJSON(
            game_path,
            mod,
            file,
            entries,
            ignored_files,
            propName,
            install_path,
            extraJsonProps
        );

        return true;
    }

    /**
     * @param {string} game_path
     * @param {Pick<IModInfoWithSavedConfig, 'mod_id' | 'name' | 'file_name'>} mod
     * @param {PalHubConfig | undefined} [config_override=undefined]
     * @param {boolean} [local=false]
     * @returns {Promise<boolean>}
     */
    static async uninstallMod(
        game_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id' | 'name' | 'file_name'>,
        config_override: PalHubConfig | undefined = undefined,
        local: boolean = false
    ): Promise<boolean> {
        console.log('uninstalling mod:', mod?.name ?? 'name not provided');
        // check if the mod is already installed
        /** @type {boolean} */
        const installed: boolean = !!config_override || (await Client.checkModIsInstalled(game_path, mod));
        if (!local && !installed) throw new Error('Mod not installed');
        // remove the mod from the config file
        /** @type {RemoveModDataFromJsonReturn} */
        const { root, entries }: RemoveModDataFromJsonReturn = (await Client.removeModDataFromJSON(
            game_path,
            mod,
            config_override,
            local
        )) ?? { root: undefined!, entries: undefined! };
        console.log('uninstalling mod entries:', entries);

        /** @type {ValidateGamePathReturnType} */
        const game_data: ValidateGamePathReturnType = await Client.validateGamePath(game_path);

        assert.ok(game_data.type !== '{invalid-path}');
        assert.ok(game_data.type !== '{UNKNOWN}');
        assert.ok('unreal_root' in game_data);
        assert.ok(entries);
        // determine the root path to uninstall this mods files from
        /** @type {string | undefined} */
        const firstEntry: string | undefined = entries[0];
        assert.ok(firstEntry);
        /** @type {string} */
        let base_path: string = game_path;
        switch (firstEntry) {
            case `${game_data.unreal_root}/`:
                base_path = game_path;
                break;
            case 'Binaries/':
            case 'Content/':
                base_path = path.join(game_path, game_data.unreal_root);
                break;
            case 'Win64/':
            case 'WinGDK/':
                base_path = path.join(game_path, game_data.unreal_root, 'Binaries');
                break;
            case 'Mods/':
                base_path = game_path.includes('XboxGames')
                    ? path.join(game_path, game_data.unreal_root, 'Binaries/WinGDK')
                    : path.join(game_path, game_data.unreal_root, 'Binaries/Win64');
                break;
            case 'Movies/':
                base_path = path.join(game_path, game_data.unreal_root, 'Content');
                break;
            case 'Splash/':
                base_path = path.join(game_path, game_data.unreal_root, 'Content');
                break;
            case 'Paks/':
                base_path = path.join(game_path, game_data.unreal_root, 'Content');
                break;
            case 'LogicMods/':
                base_path = path.join(game_path, game_data.unreal_root, 'Content/Paks');
                break;
            default: // ~mods/ or unknown mod type ~ assume regular .pak replacement
                base_path = path.join(game_path, game_data.unreal_root, 'Content/Paks/~mods');
                break;
        }
        // remove the mod files from the game directory
        /** @type {string[]} */
        const used_entries: string[] = [];
        for (const entry of entries) {
            /** @type {string} */
            const fileordir: string = path.join(root ?? base_path, entry);
            console.log('iterating:', fileordir);
            // unlink if file, ignore if directory
            const file: Stats = await stat(fileordir);
            if (file.isDirectory()) continue;

            await unlink(fileordir);
            used_entries.push(entry);

            // do backup if bk2 file
            if (fileordir.endsWith('.bk2') || fileordir.endsWith('.bmp')) {
                console.log('restoring movie file:', fileordir);
                await Client.restoreBackupFile(fileordir);
            }
        }

        // sort entries from longest to shortest to ensure we delete the deepest directories first
        entries.sort((a: string, b: string): number => b.length - a.length);

        for (const entry of entries) {
            if (used_entries.includes(entry)) continue;
            /** @type {string} */
            const fileordir: string = path.join(base_path, entry);
            const file: Stats = await stat(fileordir);
            if (!file.isDirectory()) continue;
            /** @type {string[]} */
            const files: string[] = await readdir(fileordir);
            if (files.length > 0) continue;

            console.log('deleting empty directory:', fileordir);
            await rmdir(fileordir, { recursive: true });
        }

        return true;
    }

    /**
     * @param {string} game_path
     * @param {NexusIModInfo} mod
     * @param {Pick<NexusIFileInfo, 'file_name'>} file
     * @returns {Promise<boolean>}
     */
    static async validateModFiles(
        game_path: string,
        mod: Pick<NexusIModInfo, 'name' | 'mod_id'>,
        file: Pick<NexusIFileInfo, 'file_name'>
    ): Promise<boolean> {
        // console.log({ game_path, mod, file });

        // check if the mod is already installed
        /** @type {boolean} */
        const installed: boolean = await Client.checkModIsInstalled(game_path, mod, file);
        if (!installed) throw new Error('Mod not installed');

        console.log('validating mod files:', game_path, mod.mod_id, file.file_name);

        // iterate over the mod files and check if they exist
        /** @type {PalHubConfig} */
        const config: PalHubConfig = await Client.readJSON(game_path);
        console.log('read json config:', config);
        /** @type {ModConfig | undefined} */
        const mod_data: ModConfig | undefined = config.mods[mod.mod_id];
        console.log('mod data:', mod_data);
        assert.ok(mod_data);
        /** @type {ArchiveEntry[]} */
        const entries: ArchiveEntry[] = mod_data.entries.map(
            (entry: string): ArchiveEntry => ({ entryName: entry }) as ArchiveEntry
        );
        assert.ok(mod_data);
        /** @type {[install_path: string, ignored_files: string[], entries: ArchiveEntry[]]} */
        const [base_path, _ignored_files]: [install_path: string, ignored_files: string[], entries: ArchiveEntry[]] =
            await Client.determineInstallPath(game_path, entries);

        console.log('validating base path:', base_path);

        /** @type {{ [key: ArchiveEntry]: boolean }} */
        const results: { [key: string]: boolean } = {};
        for (const entry of entries) {
            /** @type {string} */
            const fileordir: string = path.join(base_path, entry?.outputPath ?? entry.entryName);
            results[entry.entryName] = await access(fileordir)
                .then(() => true)
                .catch(() => false);
        }

        return true;
    }

    /**
     * @param {string} game_path
     * @returns {Promise<Record<string, boolean> | undefined>}
     */
    // todo: update this so that only one read/write for json is done
    static async uninstallAllMods(game_path: string): Promise<Record<string, boolean> | undefined> {
        try {
            console.log('uninstalling all mods from:', game_path);
            /** @type {PalHubConfig} */
            const config: PalHubConfig = await Client.readJSON(game_path);
            /** @type {Record<string, boolean>} */
            const result: Record<string, boolean> = {};
            /** @type {string[]} */
            const mod_keys: string[] = Object.keys(config.mods);
            for (const mod_id_str of mod_keys) {
                const mod_id = Number.parseInt(mod_id_str, 10);
                assert.ok(config.mods[mod_id_str]);
                console.log('uninstalling mod:', mod_id);
                // const mod = config.mods[mod_id];
                result[mod_id] = await Client.uninstallMod(
                    game_path,
                    {
                        mod_id,
                        name: config.mods[mod_id_str].name ?? 'Unknown Mod',
                        file_name: config.mods[mod_id_str].file_name,
                    },
                    config
                );
                console.log('uninstalled mod:', mod_id, result[mod_id]);
            }
            await Client.writeJSON(game_path, config);
            return result;
        } catch (error) {
            console.error('uninstallAllMods error', error);
        }
        return undefined;
    }

    /**
     * @param {string} cache_path
     * @param {Pick<NexusIFileInfo, 'file_name'>} file
     * @returns {Promise<boolean>}
     */
    static async checkModFileIsDownloaded(
        cache_path: string,
        file: Pick<IModInfoWithSavedConfig, 'file_name'>
    ): Promise<boolean> {
        try {
            if (!file.file_name) return false;
            console.log('checking if mod file is downloaded', path.join(cache_path, file.file_name));
            await access(path.join(cache_path, file.file_name));
            console.log(`mod file is downloaded: ${file.file_name}`);
            return true;
        } catch (error) {
            console.log(`mod file is NOT downloaded: ${file.file_name}`, error);
            return false;
        }
    }

    /**
     * @param {string} game_path
     * @param {Pick<IModInfoWithSavedConfig, 'name' | 'mod_id'>} mod
     * @param {Pick<NexusIFileInfo, 'file_name'> | undefined} [file=undefined]
     * @returns {Promise<boolean>}
     */
    static async checkModIsInstalled(
        game_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'name' | 'mod_id'> | LocalModConfig,
        file: Pick<IModInfoWithSavedConfig, 'file_name'> | undefined = undefined
    ): Promise<boolean> {
        console.log('checking if mod is installed', game_path, mod?.name, file?.file_name);
        try {
            // check if the mod is already installed
            /** @type {PalHubConfig} */
            const config: PalHubConfig = await Client.readJSON(game_path);
            if (mod.mod_id && config.local_mods && config.local_mods[mod.mod_id]) return true;

            if (!mod.mod_id || !config.mods[mod.mod_id]) return false;
            /** @type {ModConfig | undefined} */
            const mod_data: ModConfig | undefined = config.mods[mod.mod_id];
            if (!mod_data) return false;

            // return true if file unspecified or matches installed file
            return file ? mod_data.file_name === file.file_name : true;
        } catch (error) {
            console.error('checkModIsInstalled error', error);
        }
        return false;
    }

    /**
     * @param {string} path
     * @returns {Promise<boolean>}
     */
    static async checkIsValidFolderPath(path: string): Promise<boolean> {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @param {...string} args
     * @returns {string}
     */
    static joinPath(...args: string[]): string {
        return path.join(...args);
    }

    /**
     * @overload
     * @param {PathLike | FileHandle} path
     * @param {({encoding?: undefined | null; flag?: OpenMode; } & EventEmitter.Abortable) | undefined} [options=undefined]
     * @returns {Promise<Buffer>}
     */
    static async readFile(
        path: PathLike | FileHandle,
        options: ({ encoding?: undefined | null; flag?: OpenMode } & EventEmitter.Abortable) | undefined
    ): Promise<Buffer>;

    /**
     * @overload
     * @param {PathLike | FileHandle} path
     * @param {({ encoding: BufferEncoding; flag?: OpenMod; } & EventEmitter.Abortable) | BufferEncoding} options
     * @returns {Promise<Buffer>}
     */
    static async readFile(
        path: PathLike | FileHandle,
        options: ({ encoding: BufferEncoding; flag?: OpenMode } & EventEmitter.Abortable) | BufferEncoding
    ): Promise<Buffer>;

    /**
     * @overload
     * @param {PathLike | FileHandle} path
     * @param {(ObjectEncodingOptions & EventEmitter.Abortable & { flag?: OpenMode; }) | BufferEncoding | undefined} [options=undefined]
     * @returns {Promise<string | Buffer>}
     */
    static async readFile(
        path: PathLike | FileHandle,
        options: (ObjectEncodingOptions & EventEmitter.Abortable & { flag?: OpenMode }) | BufferEncoding | undefined
    ): Promise<string | Buffer>;

    /**
     * @param {PathLike | FileHandle} path
     * @param {(ObjectEncodingOptions & EventEmitter.Abortable & { flag?: OpenMode; }) | BufferEncoding | undefined} [options=undefined]
     * @returns {Promise<string | Buffer>}
     */
    static async readFile(
        path: PathLike | FileHandle,
        options:
            | (ObjectEncodingOptions & EventEmitter.Abortable & { flag?: OpenMode })
            | BufferEncoding
            | undefined = undefined
    ): Promise<string | Buffer> {
        return await readFile(path, options);
    }

    /**
     *
     * @param {PathLike | FileHandle} file
     * @param {string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream} data
     * @param {(ObjectEncodingOptions & { mode?: Mode | undefined; flag?: OpenMode | undefined; flush?: boolean | undefined; } & EventEmitter.Abortable) | BufferEncoding | undefined} [options=undefined]
     * @returns {Promise<void>}
     */
    static async writeFile(
        file: PathLike | FileHandle,
        data:
            | string
            | NodeJS.ArrayBufferView
            | Iterable<string | NodeJS.ArrayBufferView>
            | AsyncIterable<string | NodeJS.ArrayBufferView>
            | Stream,
        options:
            | (ObjectEncodingOptions & {
                  mode?: Mode | undefined;
                  flag?: OpenMode | undefined;
                  flush?: boolean | undefined;
              } & EventEmitter.Abortable)
            | BufferEncoding
            | undefined
    ): Promise<void> {
        return await writeFile(file, data, options);
    }

    /**
     * @template T
     * @param {string} base_path
     * @param {string} [filename]
     * @returns {Promise<T>}
     */
    static async readJSON<T>(base_path: string, filename?: string): Promise<T> {
        const config_path = path.join(base_path, filename || Client.json_filename);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return JSON.parse(await readFile(config_path, 'utf8'));
        } catch {
            // Do nothing...
        }
        //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // } catch (error) {
        //     console.error("readJSON error", error);
        // }

        return {} as T;
    }

    /**
     * @template T
     * @param {string} base_path
     * @param {NonNullable<T>} data
     * @param {string} [filename]
     * @returns {Promise<void>}
     */
    static async writeJSON<T>(base_path: string, data: NonNullable<T>, filename?: string): Promise<void> {
        /** @type {string} */
        const config_path: string = path.join(base_path, filename || Client.json_filename);
        return await writeFile(config_path, stringifyJSON(data));
    }

    /**
     * @param {NonNullable<unknown>} data
     * @returns {string}
     */
    static stringifyJSON(data: NonNullable<unknown>): string {
        return stringifyJSON(data);
    }

    /**
     * @template {keyof PalHubConfig} TScope
     * @template {PalHubModConfigMap<TScope>} TOutput
     * @template {AddModDataToJsonExtraProps<TScope>} TExtraProps
     * @param {string} game_path
     * @param {Pick<IModInfoWithSavedConfig, 'mod_id' | 'name'>} mod
     * @param {Pick<IModInfoWithSavedConfig, 'version' | 'file_name' | 'file_id'>} file
     * @param {ArchiveEntry[]} entries
     * @param {string[]} ignored_files
     * @param {TScope} [configPropName='mods']
     * @param {string | undefined} [forcedRoot=undefined]
     * @param {TExtraProps} [extraProps={}]
     * @returns {Promise<void>}
     */
    static async addModDataToJSON<
        TScope extends keyof PalHubConfig = 'mods',
        TOutput extends PalHubModConfigMap<TScope> = PalHubModConfigMap<TScope>,
        // prettier-ignore
        TExtraProps extends AddModDataToJsonExtraProps<TScope, IModInfoWithSavedConfig> = AddModDataToJsonExtraProps<TScope, IModInfoWithSavedConfig>,
    >(
        game_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id' | 'name'>,
        file: Pick<IModInfoWithSavedConfig, 'version' | 'file_name' | 'file_id'>,
        entries: ArchiveEntry[],
        ignored_files: string[],
        configPropName: TScope = 'mods' as TScope,
        forcedRoot: string | undefined = undefined,
        extraProps: TExtraProps = {} as TExtraProps
    ): Promise<void> {
        if (!mod.mod_id) return;
        if (configPropName === 'local_mods') {
            assert.ok('local' in extraProps && typeof extraProps.local === 'boolean' && extraProps.local === true);
            assert.ok('local' in extraProps && typeof extraProps.local === 'boolean' && extraProps.local === true);
        }

        /**
         * @param {ArchiveEntry} entry
         * @returns {boolean}
         */
        const filter = (entry: ArchiveEntry): boolean => !!entry.outputPath && !ignored_files.includes(entry.entryName);

        /**
         * @param {ArchiveEntry} entry
         * @returns {string}
         */
        const mapper = (entry: ArchiveEntry): string => entry.outputPath ?? entry.entryName;
        /** @type {PalHubConfig} */
        const config: PalHubConfig = await Client.readJSON(game_path);
        config[configPropName] ??= {};
        config[configPropName][mod.mod_id] = {
            root: forcedRoot!,
            version: file.version,
            file_id: configPropName === 'mods' ? file.file_id : file.file_name,
            file_name: file.file_name,
            entries: entries
                .filter((entry: ArchiveEntry): boolean => filter(entry))
                .map((entry: ArchiveEntry): string => mapper(entry)),
            ...extraProps,
        } as unknown as TOutput;
        return await Client.writeJSON(game_path, config);
    }

    /**
     * @param {string} game_path
     * @param {IModInfoWithSavedConfig} mod
     * @param {PalHubConfig | undefined} [config_override=undefined]
     * @param {boolean} [local=false]
     * @returns {Promise<RemoveModDataFromJsonReturn | null>}
     */
    static async removeModDataFromJSON(
        game_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'file_name' | 'mod_id'>,
        config_override: PalHubConfig | undefined = undefined,
        local: boolean = false
    ): Promise<RemoveModDataFromJsonReturn | null> {
        /** @type {PalHubConfig} */
        const config: PalHubConfig = config_override ?? (await Client.readJSON(game_path));
        /** @type {keyof PalHubConfig} */
        const modsprop: keyof PalHubConfig = local ? 'local_mods' : 'mods';
        /** @type {keyof PalHubConfig} */
        const idprop: keyof IModInfoWithSavedConfig = local ? 'file_name' : 'mod_id';

        if (!mod[idprop] || !config[modsprop]?.[mod[idprop]]) return null;
        console.log('removing mod', modsprop, idprop, mod[idprop], config[modsprop][mod[idprop]]);

        const modConfig: ModConfig | LocalModConfig | undefined = config[modsprop][mod[idprop]];
        if (!modConfig) return null;
        /** @type {string[]} */
        const entries: string[] = structuredClone(modConfig.entries);
        /** @type {string} */
        const root: string = modConfig.root;
        console.log('removing entries:', entries);
        // config[modsprop][mod[idprop]] = undefined;
        delete config[modsprop][mod[idprop]];

        if (!config_override) await Client.writeJSON(game_path, config);

        return { root, entries };
    }

    /**
     * @param {string} cache_path
     * @param {Pick<IModInfoWithSavedConfig, 'mod_id'>} mod
     * @param {Pick<IModInfoWithSavedConfig, 'file_name' | 'version' | 'file_id'>} file
     * @returns {Promise<void>}
     */
    static async addModDataToCacheJSON(
        cache_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id'>,
        file: Pick<IModInfoWithSavedConfig, 'file_name' | 'version' | 'file_id'>
    ): Promise<void> {
        if (!mod.mod_id || !file.file_id) return;
        file.version ??= '';
        /** @type {PalHubCacheConfig} */
        const config: PalHubCacheConfig = await Client.readJSON(cache_path);
        /** @type {string | undefined} */
        // @ts-expect-error --- ignore that mBaseData is private.
        const gameID: string | undefined = Client._nexus?.mBaseData.path.gameId; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        assert.ok(gameID);
        console.log('adding mod data to cache json', { cache_path, mod, file, gameID });
        config[gameID] ??= {};
        // config.mods = config.mods || {};
        config[gameID][mod.mod_id] ??= {};
        config[gameID][mod.mod_id]![file.file_id] = {
            ver: file.version,
            zip: file.file_name ?? 'Unknown File',
        };
        return await Client.writeJSON(cache_path, config);
    }

    /**
     * @param {string} cache_path
     * @param {Pick<IModInfoWithSavedConfig, 'mod_id'>} mod
     * @param {Pick<NexusIFileInfo, 'file_id'>} file
     * @returns {Promise<void>}
     */
    static async removeModDataFromCacheJSON(
        cache_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id'>,
        file: Pick<NexusIFileInfo, 'file_id'>
    ): Promise<void> {
        if (!mod.mod_id) return;
        /** @type {PalHubCacheConfig} */
        const config: PalHubCacheConfig = await Client.readJSON(cache_path);
        /** @type {string | undefined} */
        // @ts-expect-error --- ignore that mBaseData is private.
        const gameID: string | undefined = Client._nexus?.mBaseData.path.gameId; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        assert.ok(gameID);
        console.log('removing mod data from cache json', { cache_path, mod, file });
        if (!config[gameID] || !config[gameID][mod.mod_id]) return;

        /** @type {string[]} */
        let _entries: string[] = [];
        if (file) {
            if (!config[gameID][mod.mod_id]![file.file_id]) return;
            // config[gameID][mod.mod_id][file.file_id] = undefined;
            delete config[gameID][mod.mod_id]![file.file_id];
            if (Object.keys(config[gameID][mod.mod_id]!).length === 0) {
                _entries = Object.values(config[gameID][mod.mod_id]!).map((entry) => entry.zip);
                // config[gameID][mod.mod_id] = undefined;
                delete config[gameID][mod.mod_id];
            }
        } else {
            if (!config[mod.mod_id]) return;
            _entries = Object.values(config[gameID][mod.mod_id]!).map((entry: PalHubCacheFileConfig): string => entry.zip);
            // config[gameID][mod.mod_id] = undefined;
            delete config[gameID][mod.mod_id];
        }

        await Client.writeJSON(cache_path, config);
    }

    /**
     * @param {string} cache_path
     * @param {Pick<IModInfoWithSavedConfig, 'mod_id'>} mod
     * @param {Pick<NexusIFileInfo, 'file_name' | 'file_id'> | undefined} file
     */
    static async uninstallFilesFromCache(
        cache_path: string,
        mod: Pick<IModInfoWithSavedConfig, 'mod_id'>,
        file: Pick<NexusIFileInfo, 'file_name' | 'file_id'> | undefined
    ): Promise<void> {
        console.log('uninstalling files from cache', { cache_path, mod: mod.mod_id, file });
        if (!file) return;
        // try {
        //     await Client.uninstallMod(cache_path, mod);
        // } catch (error) {
        //     console.log("uninstallFilesFromCache", "failed to uninstall mod:", mod.name, error);
        // }
        await Client.removeModDataFromCacheJSON(cache_path, mod, file);
        await unlink(path.join(cache_path, file.file_name));
    }

    /**
     * @param {string} exe_path
     * @param {readonly string[]} args
     * @param {SpawnOptionsWithoutStdio} [opts={}]
     * @returns {boolean}
     */
    static launchExe(exe_path: string, args: readonly string[], opts: SpawnOptionsWithoutStdio = {}): boolean {
        console.log('launching exe', exe_path);
        // execFile(exe_path, args, (error, stdout, stderr) => {
        //     if (error) return console.error(`exec error: ${error}`);
        //     console.log(`stdout: ${stdout}`);
        //     console.error(`stderr: ${stderr}`);
        // });
        /** @type {ChildProcessWithoutNullStreams} */
        const gameProcess: ChildProcessWithoutNullStreams = spawn(exe_path, args, opts);
        gameProcess.stdout.on('data', (data) => {
            console.log(`Stdout: ${data}`);
        });
        gameProcess.stderr.on('data', (data) => {
            console.error(`Stderr: ${data}`);
        });
        gameProcess.on('close', (code) => {
            console.log(`Process exited with code: ${code}`);
        });

        return true;
    }

    /** @returns {Promise<{ version: string; downloadUrl: string; }>} */
    static async fetchLatestUE4SSVersion(): Promise<{ version: string; downloadUrl: string }> {
        // fetch the latest release from the UE4SS github repo
        const release_url = 'https://api.github.com/repos/UE4SS-RE/RE-UE4SS/releases/latest';
        return new Promise<{ version: string; downloadUrl: string }>(
            (resolve: PromiseResolve<{ version: string; downloadUrl: string }>, reject: PromiseReject): void => {
                fetch(release_url, { headers: { 'User-Agent': 'Node.js' }, method: 'GET', redirect: 'follow' })
                    .then(
                        async (response: Response) => {
                            if (!response.ok) {
                                throw new Error(`Failed to fetch latest UE4SS version (${response.status})`);
                            }
                            assert.ok(response.body);

                            /** @type {string | null} */
                            const contentLength: string | null = response.headers.get('content-length');
                            assert.ok(contentLength);

                            /** @type {string} */
                            let data: string = '';
                            /** @type {ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>} */
                            const reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> =
                                response.body.getReader();
                            /** @type {TextDecoder} */
                            const utf8Decoder: TextDecoder = new TextDecoder();
                            /** @type {ReadableStreamReadResult<Uint8Array<ArrayBufferLike>>} */
                            let nextChunk: ReadableStreamReadResult<Uint8Array<ArrayBufferLike>>;
                            while (!(nextChunk = await reader.read()).done) {
                                const partialData = nextChunk.value;
                                data += utf8Decoder.decode(partialData);
                            }
                            /** @type {ReleaseData} */
                            const releaseData: ReleaseData = JSON.parse(data) as ReleaseData;
                            /** @type {string} */
                            const version: string = releaseData.tag_name.replace('v', '');
                            /** @type {string | undefined} */
                            const downloadUrl: string | undefined = releaseData.assets.find(
                                (asset: { name: string; browser_download_url: string }): boolean =>
                                    asset.name.includes(`UE4SS_v${version}.zip`)
                            )?.browser_download_url;
                            if (!downloadUrl) {
                                return reject(new Error('Download URL not found in release data'));
                            }
                            return resolve({ version, downloadUrl });
                        },
                        (error: unknown) => {
                            if (!error || error === null) error = 'Unknown Error';
                            if (typeof error === 'string') error = new Error(error);
                            else if (!(error instanceof Error)) error = new Error(String(error));
                            assert.ok(error instanceof Error);
                            reject(new Error(`Failed to fetch latest UE4SS version: ${error.message}`));
                        }
                    )
                    .catch((error: unknown) => {
                        if (!error || error === null) error = 'Unknown Error';
                        if (typeof error === 'string') error = new Error(error);
                        else if (!(error instanceof Error)) error = new Error(String(error));
                        assert.ok(error instanceof Error);
                        reject(new Error(`Failed to fetch latest UE4SS version: ${error.message}`));
                    });
            }
        );
    }

    /**
     * downloads latest release from the UE4SS github repo
     * @see https://github.com/UE4SS-RE/RE-UE4SS/releases
     * @see https://github.com/UE4SS-RE/RE-UE4SS/releases/download/v3.0.1/UE4SS_v3.0.1.zip
     * @see https://github.com/UE4SS-RE/RE-UE4SS/releasess/download/v3.0.1/UE4SS_v3.0.1.zip
     * @param {string} cache_dir
     * @param {string} game_path
     * @param {Partial<KnownModLoader>} [options]
     * @returns {Promise<boolean>}
     */
    static async downloadAndInstallUE4SS(
        cache_dir: string,
        game_path: string,
        options?: KnownModLoader
    ): Promise<boolean> {
        options ??= KNOWN_MODLOADERS['required_ue4ss']!;
        // get latest release download url:
        // /** @type {string} */
        // let ue4ss_version = null;
        /** @type {string} */
        const ue4ss_version: string = options.version ?? 'v3.0.1';
        /** @type {string} */
        const ue4ss_zip: string = options.zip ?? `UE4SS_${ue4ss_version}.zip`;

        // if (options.version === 'experimental-latest') {
        //     // fetch the latest experimental version
        //     try {
        //         /** @type {{ version: string; downloadUrl: string; }} */
        //         const latestRelease = await Client.fetchLatestUE4SSVersion();
        //         ue4ss_version = latestRelease.version;
        //         console.log("Latest experimental UE4SS version:", ue4ss_version);
        //     } catch (error) {
        //         console.error("Failed to fetch latest experimental UE4SS version:", error);
        //         return false;
        //     }
        // } else {
        //     ue4ss_version = options.zip ?? options.version ?? '3.0.1';
        // }

        /** @type {string} */
        const release_url: string = 'https://github.com/UE4SS-RE/RE-UE4SS/releases';
        /** @type {string} */
        const url: string = `${release_url}/download/${ue4ss_version}/${ue4ss_zip}`;

        try {
            /** @type {ValidateGamePathReturnType} */
            const path_data: ValidateGamePathReturnType = await Client.validateGamePath(game_path);

            assert.ok(path_data.type !== '{invalid-path}');
            assert.ok(path_data.type !== '{UNKNOWN}');
            assert.ok('ue4ss_path' in path_data);

            // remove dll from path if it exists
            /** @type {string} */
            const ue4ss_install_dir: string = path_data.ue4ss_path.replace('dwmapi.dll', '');

            console.log('downloading UE4SS from', url);
            console.log('installing to', ue4ss_install_dir);

            await Client.downloadFile(cache_dir, url, {
                onProgress: (data: Ue4ssProcessDownload): boolean => Emitter.emit('ue4ss-process', 'download', data),
            });

            // unzip and install
            /** @type {ArchiveHandler} */
            const archive: ArchiveHandler = new ArchiveHandler(path.join(cache_dir, url.split('/').pop()!));
            // forward the extracting event to the renderer
            archive.on('extracting', (data) => {
                Emitter.emit('ue4ss-process', 'extract', data);
            });
            // extract the zip to the game directory
            await archive.extractAllTo(ue4ss_install_dir, true);

            // patchdata example:
            // { "Mods/BPModLoaderMod/Scripts/main.lua": "https://raw.githubusercontent.com/Okaetsu/RE-UE4SS/refs/heads/logicmod-temp-fix/assets/Mods/BPModLoaderMod/Scripts/main.lua" }
            for (const patchdata of options.patches) {
                for (const filetoreplace in patchdata) {
                    if (!Object.prototype.hasOwnProperty.call(patchdata, filetoreplace)) continue;
                    /** @type {string | undefined} */
                    const url: string | undefined = patchdata[filetoreplace];
                    assert.ok(url);
                    await Client.downloadFile(cache_dir, url, {
                        onProgress: (data: Ue4ssProcessDownload): boolean =>
                            Emitter.emit('ue4ss-process', 'download', data),
                    });
                    /** @type {string} */
                    const patchfile: string = path.join(cache_dir, url.split('/').pop()!);
                    /** @type {string} */
                    const patchpath: string = path.join(game_path, filetoreplace);
                    console.log('patching file:', patchfile, patchpath);
                    await copyFile(patchfile, patchpath);
                }
            }

            Emitter.emit('ue4ss-process', 'complete', { success: true });

            return true;
        } catch (error) {
            Emitter.emit('ue4ss-process', 'error', error);
            console.error('downloadAndInstallUE4SS error', error);
        }
        return false;
    }

    /**
     * @param {string} cache_dir
     * @param {string} game_path
     * @param {Partial<KnownModLoader>} options
     * @returns {Promise<boolean>}
     */
    static async uninstallUE4SS(cache_dir: string, game_path: string, options: Partial<KnownModLoader>): Promise<boolean> {
        try {
            /** @type {ValidateGamePathReturnType} */
            const path_data: ValidateGamePathReturnType = await Client.validateGamePath(game_path);
            assert.ok(path_data.type !== '{invalid-path}');
            assert.ok(path_data.type !== '{UNKNOWN}');
            assert.ok('ue4ss_root' in path_data);
            /** @type {string} */
            const ue4ss_install_dir: string = path_data.ue4ss_root;
            console.log('uninstalling UE4SS from', ue4ss_install_dir);

            /** @type {ArchiveHandler} */
            const archive: ArchiveHandler = new ArchiveHandler(
                path.join(cache_dir, options.zip ?? `UE4SS_${options.version}.zip`)
            );
            /** @type {ArchiveEntry[]} */
            const entries: ArchiveEntry[] = await archive.getEntries();
            // remove each entry
            for (const entry of entries) {
                /** @type {string} */
                const fileordir: string = path.join(ue4ss_install_dir, entry.entryName);
                if (entry.isDirectory) {
                    // await rmdir(fileordir, { recursive: true });
                } else {
                    Emitter.emit('ue4ss-process', 'delete', fileordir);
                    await unlink(fileordir);
                }
            }
            assert.ok(options.patches);
            // remove any patches
            for (const patchdata of options.patches) {
                for (const filetoreplace in patchdata) {
                    if (!Object.prototype.hasOwnProperty.call(patchdata, filetoreplace)) continue;
                    /** @type {string} */
                    const patchpath: string = path.join(game_path, filetoreplace);
                    console.log('deleting patched file:', patchpath);
                    Emitter.emit('ue4ss-process', 'delete', patchpath);
                    try {
                        await unlink(patchpath);
                    } catch (error) {
                        console.error('uninstallUE4SS error', error);
                    }
                }
            }

            Emitter.emit('ue4ss-process', 'uninstalled', { success: true });
            return true;
        } catch (error) {
            Emitter.emit('ue4ss-process', 'error', error);
            console.error('uninstallUE4SS error', error);
        }
        return false;
    }

    /**
     * @param {string} file_path
     * @returns {void}
     */
    static watchForFileChanges(file_path: string): void {
        // watchFile(file_path, { interval: 250 }, (curr, prev) => {
        //     const change_data = { path: file_path, curr, prev };
        //     const file_data = readFileSync(file_path, 'utf-8');
        //     Emitter.emit('watched-file-change', change_data, file_data);
        // });
        // return () => unwatchFile(file_path);

        Client._ac ??= {};
        Client._ac[file_path] = new AbortController();
        /** @type {{ signal: AbortSignal }} */
        const { signal }: AbortController = Client._ac[file_path];
        (async () => {
            try {
                /** @type {Stats | undefined} */
                let prev: Stats | undefined;
                for await (const event of watch(file_path, { signal /* interval: 250 */ })) {
                    /** @type {Stats} */
                    const curr: Stats = await stat(file_path);
                    /** @type {ChangeDataEvent} */
                    const change_data: ChangeDataEvent = { path: event.filename!, curr, prev };
                    /** @type {string} */
                    const file_data: string = await readFile(file_path, 'utf8');
                    Emitter.emit('watched-file-change', change_data, file_data);
                    prev = curr;
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;
                /** @type {unknown} */
                let _error: unknown = error;
                if (!_error || _error === null) _error = 'Unknown Error';
                if (typeof _error === 'string') _error = new Error(_error);
                else if (!(_error instanceof Error)) _error = new Error(String(_error));
                assert.ok(_error instanceof Error);
                throw _error;
            }
        })().catch((error: unknown) => Utils.handleError(error));
    }

    /** @param {string} file_path */
    static unwatchFileChanges(file_path: string) {
        Client._ac?.[file_path]?.abort('unwatch');
    }

    /**
     * @param {string} fullFilePath
     * @returns {Promise<string>}
     */
    static async getArchiveEntriesAsJSON(fullFilePath: string): Promise<string> {
        /** @type {ArchiveHandler} */
        const archive: ArchiveHandler = new ArchiveHandler(fullFilePath);
        return JSON.stringify(await archive.getEntries());
    }

    /**
     * @param {string} game_path
     * @param {string} game_id
     * @returns {Promise<void>}
     */
    static async installAppSpecificMods(game_path: string, game_id: Games): Promise<void> {
        /** @type {GameMap | undefined} */
        const game_data: GameMap | undefined = GAME_MAP[game_id];
        if (!game_data) throw new Error('Unknown game id');

        /** @type {string} */
        const root: string = DEAP.app.isPackaged ? resourcesPath : path.join(DEAP.app.getAppPath(), 'resources');
        /** @type {string} */
        const mods_root: string = path.join(root, `app-mods/${game_id}`);

        // await copyFile(game_data.install_script, join(game_path, game_data.install_script.split("/").pop()));
        await cp(mods_root, game_path, { recursive: true, force: true });
        console.log('installed app specific mods:', game_id);
    }

    /**
     * @param {string} filePath
     * @returns {Promise<string>}
     */
    static async backupFileForDelete(filePath: string): Promise<string> {
        /** @type {string} */
        const backupPath: string = `${filePath}.bak`;
        try {
            await copyFile(filePath, backupPath);
            console.log(`Backup created at: ${backupPath}`);
            return backupPath;
        } catch (error) {
            console.error(`Failed to create backup for ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * @param {string} filePath
     * @returns {Promise<void>}
     */
    static async restoreBackupFile(filePath: string): Promise<void> {
        /** @type {string} */
        const backupPath: string = `${filePath}.bak`;
        try {
            await copyFile(backupPath, filePath);
            console.log(`Backup restored from: ${backupPath}`);
            // Optionally, delete the backup after restoring
            await unlink(backupPath);
        } catch (error) {
            console.error(`Failed to restore backup for ${filePath}:`, error);
            throw error;
        }
    }
}

export default Client;
