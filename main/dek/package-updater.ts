/**
 * ■ package-updater.js
 * author: dekitarpg@gmail.com
 * stores information on how many times the app has been launched in dev mode! <3
 * can save the data to a separate file and/or update package.json version automatically
 */

import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { PackageJson } from '@main/dek/deap';
import freshRequire from '@main/dek/fresh-require';
import DataStore from 'electron-store';

const UPDATE_PACKAGE_VERSION = true;
const SAVE_TO_SEPERATE_FILE = false;

// max other version is never reached. always 1 below
// as when it reaches MAX, it will increment minor version
// which will then increment major version when minor reaches MAX
const MAX_OTHER_VERSION = 100;

type VersionTuple = [major: number, minor: number, other: number] | number[];
type DateTimeTuple = [date: string, time: string] | string[];
interface AppVersionData {
    bootups: number;
    release: string | undefined;
    version: string | undefined;
}

/**
 * @param {PackageJson} currentPackageJSON
 * @returns {string}
 */
export const updateAppVersion = (currentPackageJSON: PackageJson): string => {
    // fallback default values for bootups/release/version
    /** @type {number} */
    let default_bootups: number = 0;
    /** @type {string | undefined} */
    let default_release: string | undefined = undefined;
    /** @type {string | undefined} */
    let default_version: string | undefined = undefined;
    // get default bootups/release/version from currentPackageJSON
    if (currentPackageJSON) {
        /** @type {{ version: string; release: { date: string; time: string; }; }} */
        const { version, release }: PackageJson = currentPackageJSON;
        if (version) {
            /** @type {VersionTuple} */
            const [major, minor, other]: VersionTuple = version.split('.').map(Number);
            default_bootups = major * MAX_OTHER_VERSION * MAX_OTHER_VERSION + minor * MAX_OTHER_VERSION + other;
        }
        if (release) {
            /** @type {{ date: string; time: string; }} */
            const { date, time }: PackageJson['release'] = release;
            default_release = `${date}, ${time}`;
        }
        default_version = version;
    }
    // actually increment the version from bootups counter
    /** @type {number} */
    const new_bootups: number = default_bootups + 1;
    /** @type {number} */
    const major: number = Math.floor(new_bootups / MAX_OTHER_VERSION / MAX_OTHER_VERSION);
    /** @type {number} */
    const minor: number = Math.floor(new_bootups / MAX_OTHER_VERSION) % MAX_OTHER_VERSION;
    /** @type {number} */
    const other: number = new_bootups % MAX_OTHER_VERSION;
    /** @type {string} */
    const version: string = `${major}.${minor}.${other}`;
    /** @type {string} */
    const release: string = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    if (SAVE_TO_SEPERATE_FILE) {
        // datastore initializer contained in this function
        // to avoid error when launch in production mode
        // or when not being saved to a separate file
        /** @type {DataStore<AppVersionData>} */
        const devstore: DataStore<AppVersionData> = new DataStore<AppVersionData>({
            cwd: path.join(__dirname, '..'),
            name: '[dekapp.version]',
            defaults: {
                bootups: default_bootups, // stores #times server/app rebooted
                release: default_release, // updates after each bootup
                version: default_version, // version based on #bootups
            },
        });
        devstore.set('bootups', new_bootups);
        devstore.set('version', version);
        devstore.set('release', release);
    }
    // update package.json version if enabled
    if (UPDATE_PACKAGE_VERSION && currentPackageJSON) {
        try {
            /** @type {string} */
            const packagePath: string = path.join(__dirname, '..', 'package.json');
            /** @type {PackageJson} */
            const packageJSON: PackageJson = currentPackageJSON ?? freshRequire(packagePath);
            /** @type {DateTimeTuple} */
            const [date, time]: DateTimeTuple = release.split(', ');
            packageJSON.release = { date, time };
            packageJSON.version = version;
            // // remove trailing zeros from version string if any
            // while (packageJSON.version.endsWith('0')) {
            //     if (packageJSON.version.endsWith('.0')) break;
            //     packageJSON.version = packageJSON.version.slice(0, -1);
            // }
            /** @type {string} */
            const updatedJSON: string = JSON.stringify(packageJSON, null, 4);
            writeFileSync(packagePath, updatedJSON, { encoding: 'utf8' });
            console.log('Updated package.json version:', packageJSON.version);
            // console.log('Updated package.json:', updatedJSON);
        } catch (error) {
            console.error('Error updating package.json:', error);
        }
    }
    return version;
};
