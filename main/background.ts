/**
 * system: PalHUB Client
 * author: dekitarpg@gmail.com
 *
 * loads DEAP and API modules.
 * Add handler for API functions.
 * Launch application via DEAP.
 */

import assert from 'node:assert';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { platform, resourcesPath } from 'node:process';

import config from '@main/config';
import DEAP from '@main/dek/deap';
import { setExternalVBS } from '@main/dek/detect-steam-game';
import RPC from '@main/dek/discord-rpc';
import { Client, Emitter } from '@main/dek/palhub';
import ipcHandlers from '@main/ipc-handlers';
import { migrateFiles } from '@main/migrator';
import { EVENTS_TO_HANDLE } from '@typed/palhub';
import type { IpcMainInvokeEvent } from 'electron';
import { BrowserWindow } from 'electron';

// set the app details for nexus api requests
Client.setAppDetails(DEAP.appName, DEAP.version);

// setup the application using the given configuration
// will handle uncaught exceptions and rejections if enabled
DEAP.setup(config, (): void => {
    // then run this callback
    if (platform === 'win32') {
        // update regedit script path
        // In a packaged app, resourcesPath points to the resources directory
        // when packaged, use the resourcesPath to find the vbs script
        if (DEAP.app.isPackaged) setExternalVBS(resourcesPath, 'vbs'); // eslint-disable-line unicorn/no-lonely-if
    }
    // add all ipc handlers defined in ipc-handlers folder
    for (const key in ipcHandlers) {
        if (!Object.prototype.hasOwnProperty.call(ipcHandlers, key)) continue;
        DEAP.addIPCHandler(
            key,
            ipcHandlers[key as keyof typeof ipcHandlers] as unknown as (
                event: IpcMainInvokeEvent,
                ...args: unknown[]
            ) => unknown
        );
    }
    // handle events from DEAP that should be forwarded to the renderer process
    for (const event of EVENTS_TO_HANDLE) {
        Emitter.on(event, (...args: unknown[]): void => DEAP.main_window?.webContents.send(event, ...args));
    }
    // migrate files from old app name to new app name
    const newAppName: string | undefined = DEAP.app.getPath('userData').split(path.sep).pop();
    assert.ok(newAppName);
    const oldAppName: string = newAppName.replace('UE Mod Hub', 'PalHUB Client');
    console.log({ oldAppName, newAppName });
    const filesToMove: string[] = ['[dek.ue.appdata].json', '[dek.ue.nexus.cache].json'];
    migrateFiles(oldAppName, newAppName, filesToMove, false).then(
        () => console.log('File migration completed successfully!'),
        (error: unknown) => console.error('Error during file migration:', error)
    );
    // ensure the ModCache folder is created on app ready
    let appDataPath: string = DEAP.app.getAppPath();
    if (DEAP.app.isPackaged) {
        // appDataPath = path.dirname(DEAP.app.getPath('exe'));
        appDataPath = DEAP.app.getPath('documents');
    }
    console.log('App data path:', appDataPath);
    const appFolder: string = path.join(appDataPath, 'ModHubCache');
    if (!existsSync(appFolder)) {
        console.log('Creating app folder:', appFolder);
        mkdirSync(appFolder, { recursive: true });
        console.log('App folder created');
        DEAP.datastore?.set('app-cache', appFolder);
    }
});

// launch the electron app via DEAP wrapper
DEAP.launch({
    // onAppReady() {},
    // onAppActivate: () => {},
    // onAppWindowsClosed:() => {},
    // onSecondInstanceLaunched: () => {},
    onBeforeQuitApp: () => {
        // TODO: call abort for any AbortHandler
    },
    onLoadWindow(id: string, _win: BrowserWindow) {
        // start the discord rpc client
        if (id !== 'main') return;
        // // Track when the window is focused/blurred
        // win.webContents.on('did-finish-load', ()=>{
        //     win.on('restore', ()=>{ // focus
        //         console.log('Window focused');
        //         RPC.unpause();
        //     });
        //     win.on('minimize', ()=>{ //blur
        //         console.log('Window blurred');
        //         RPC.pause();
        //     });
        // });
        RPC.start();
    },
});
