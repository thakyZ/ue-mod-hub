import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, rmdir, unlink } from 'node:fs/promises';
import path from 'node:path';

import DEAP from '@main/dek/deap';
import { app } from 'electron';

/**
 * @param {string} oldAppName
 * @param {string} newAppName
 * @param {string[]} filesToMove
 * @param {boolean} [deleteOldFiles=false]
 * @returns {Promise<void>}
 */
export async function migrateFiles(
    oldAppName: string,
    newAppName: string,
    filesToMove: string[],
    deleteOldFiles: boolean = false
): Promise<void> {
    const appDataPath: string = app.getPath('appData');
    const oldAppDataFolder: string = path.join(appDataPath, oldAppName);
    const newAppDataFolder: string = path.join(appDataPath, newAppName);

    void DEAP.logger?.log(`Migration from ${oldAppDataFolder} to ${newAppDataFolder}`);

    // Check if the old app folder exists
    if (existsSync(oldAppDataFolder)) {
        void DEAP.logger?.log(`Old app data folder detected: ${oldAppDataFolder}`);

        // Ensure the new app folder exists
        try {
            await mkdir(newAppDataFolder, { recursive: true });
            void DEAP.logger?.log(`Created new app data folder: ${newAppDataFolder}`);
        } catch (error: unknown) {
            void DEAP.logger?.error('Error creating new app data folder:', error);
            return;
        }

        // Copy specific files synchronously
        for (const file of filesToMove) {
            const oldFilePath: string = path.join(oldAppDataFolder, file);
            const newFilePath: string = path.join(newAppDataFolder, file);

            if (existsSync(oldFilePath) && !existsSync(newFilePath)) {
                try {
                    await copyFile(oldFilePath, newFilePath);
                    void DEAP.logger?.log(`Copied file: ${file}`);
                } catch (error: unknown) {
                    void DEAP.logger?.error(`Failed to copy file ${file}:`, error);
                }
            } else {
                void DEAP.logger?.warn(`File not found in old folder: ${file}`);
            }
        }

        // Optionally delete old files and folder
        if (deleteOldFiles) {
            try {
                const remainingFiles: string[] = await readdir(oldAppDataFolder);

                // Delete remaining files in the old folder
                for (const file of remainingFiles) {
                    await unlink(path.join(oldAppDataFolder, file));
                }

                // Remove the old folder
                await rmdir(oldAppDataFolder, { recursive: true });
                void DEAP.logger?.log('Old app data folder and files deleted.');
            } catch (error: unknown) {
                void DEAP.logger?.error('Error deleting old app data folder or files:', error);
            }
        } else {
            void DEAP.logger?.log('Old app data folder retained as per configuration.');
        }
    } else {
        void DEAP.logger?.log('No old app data folder found. Skipping migration.');
    }
}
