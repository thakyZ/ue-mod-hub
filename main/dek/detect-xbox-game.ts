/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

//! This code is only for Windows OS (used to detect if an Xbox game is installed on the system)
//! NON FUNCTIONAL DUE TO REQUIRE POWERSHELL ADMIN
//! ALSO RETURNS VIRTUALIZED PATH DIRECTORY, NOT
//! THE ACTUAL GAME INSTALLATION PATH

import type { ExecException } from 'node:child_process';
import { exec } from 'node:child_process';

import type { PromiseReject, PromiseResolve } from '@typed/common';

type InstalledXboxGame = { name: string | undefined; installLocation: string };

/** @returns {Promise<InstalledXboxGame[]>} */
function getInstalledXboxGames(): Promise<InstalledXboxGame[]> {
    return new Promise<InstalledXboxGame[]>(
        (resolve: PromiseResolve<InstalledXboxGame[]>, reject: PromiseReject): void => {
            /** @type {string} */
            const psCommand: string =
                'Get-AppxPackage -AllUsers | Where-Object {$_.PackageFamilyName -like *Microsoft.GamingApp*} | Select-Object -Property Name, InstallLocation';

            exec(
                `powershell.exe -Command "${psCommand}"`,
                (error: ExecException | null, stdout: string, stderr: string): void => {
                    if (error) {
                        return reject(new Error(`Error: ${stderr}`, { cause: error }));
                    }

                    /** @type {string[]} */
                    const lines: string[] = stdout.trim().split('\n').slice(2); // Skip header lines
                    /** @type {InstalledXboxGame[]} */
                    const games: InstalledXboxGame[] = lines.map((line: string): InstalledXboxGame => {
                        const [name, ...installLocationParts]: string[] = line.trim().split(/\s{2,}/);
                        const installLocation: string = installLocationParts.join(' ');
                        return { name, installLocation };
                    });

                    resolve(games);
                }
            );
        }
    );
}

/**
 * @param {string} gameName
 * @returns {Promise<void>}
 */
export default async function detectXboxGameInstallation(gameName: string): Promise<void> {
    try {
        const games: InstalledXboxGame[] = await getInstalledXboxGames();
        const game: InstalledXboxGame | undefined = games.find<InstalledXboxGame, InstalledXboxGame>(
            (g) => g.name && g.name.toLowerCase().includes(gameName.toLowerCase())
        );
        if (game) {
            console.log(`XBOX Game found at: ${game.installLocation}`);
        } else {
            console.log('XBOX Game not found');
        }
    } catch (error) {
        console.error('Error detecting XBOX game installation:', error);
    }
}
