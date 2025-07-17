import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * @param {string} gameName
 * @returns {string | null}
 */
function getEpicGameInstallPath(gameName: string): string | null {
    /** @type {string} */
    const manifestDir: string = path.join('C:', 'ProgramData', 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');

    try {
        /** @type {string[]} */
        const files: string[] = readdirSync(manifestDir);
        for (const file of files) {
            if (path.extname(file) === '.item') {
                /** @type {string} */
                const filePath: string = path.join(manifestDir, file);
                /** @type {string} */
                const manifestData: string = readFileSync(filePath, 'utf8');

                // Check if the game name exists in the manifest data
                if (manifestData.includes(gameName)) {
                    /** @type {Partial<{ InstallLocation: string }>} */
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const manifest: Partial<{ InstallLocation: string }> = JSON.parse(manifestData);
                    return manifest.InstallLocation || null;
                }
            }
        }
    } catch (error: unknown) {
        console.error('Error reading Epic Games manifests:', error);
    }
    return null;
}

/** @type {string} */
const gameName: string = 'YourGameName'; // Replace with the name of the game you're looking for
/** @type {string | null} */
const installPath: string | null = getEpicGameInstallPath(gameName);

if (installPath) {
    console.log(`${gameName} is installed at: ${installPath}`);
} else {
    console.log(`${gameName} is not installed.`);
}
