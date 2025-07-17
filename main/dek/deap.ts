/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
* system: DEAP - Dekita's Electron App Project
* author: dekitarpg@gmail.com
*
* This module handles creating an electron application
* it uses various configuration options to determine
* how windows behave, and the pages loaded.
*/

// import assert from 'node:assert';
// import { createRequire } from 'node:module';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';
import { argv, defaultApp, execPath, on as process_on, platform } from 'node:process';

import { enable as enableRemoteModule } from '@electron/remote/main';
import type { Config, ConfigDataStore, ConfigDataStoreWindow, ConfigDataStoreWindowsKeys } from '@main/config';
import type { BrowserWindow } from '@main/dek/create-window';
import { createWindow } from '@main/dek/create-window';
import type { LoggerMethods, LogLevelsType } from '@main/dek/logger';
import createLogger, { LoggyBoi } from '@main/dek/logger';
import { updateAppVersion } from '@main/dek/package-updater';
import type { Client } from '@main/dek/palhub';
import type { IpcHandlersInterface } from '@main/ipc-handlers';
import type { default as IpcLogger } from '@main/ipc-handlers/logger';
import type { PalHubProperties } from '@main/ipc-handlers/palhub';
import type {
    ServerCacheAction,
    ServerCacheMethodKey,
    ServerCacheMethodReturn,
    ServerCacheMethodValue,
} from '@main/ipc-handlers/server-cache';
import type { UStoreAction, UStoreMethodKey, UStoreMethodReturn, UStoreMethodValue } from '@main/ipc-handlers/ustore';
import type { default as NexusType } from '@nexusmods/nexus-api';
import type { MethodOf2Alt, MethodsOfAlt, VoidFunctionWithArgs } from '@typed/common';
import type Dekache from 'dekache';
import type {
    App,
    Event,
    FileFilter,
    Input,
    IpcMainInvokeEvent,
    OpenDialogOptions,
    OpenDialogReturnValue,
    SaveDialogReturnValue,
} from 'electron';
import { app, BrowserWindow as _BrowserWindow, dialog, ipcMain, Menu, nativeImage, shell, Tray } from 'electron';
import type { IpcActionDomain, IpcInvokeAction, IpcInvokeActionDomain, MainIpcEvent } from 'electron-ipc-extended';
import type { IpcActions } from 'electron-ipc-extended';
import { MainIpc } from 'electron-ipc-extended';
// import type { IpcRenderer, IpcRendererEvent } from 'electron/renderer';
import serve from 'electron-serve';
import Store, { Options } from 'electron-store';
import { autoUpdater } from 'electron-updater';
import type { AppUpdaterEvents } from 'electron-updater/out/AppUpdater';
import type { ValueOf } from 'type-fest';
// const require: NodeJS.Require = createRequire(__dirname);
const _require = createRequire(__dirname);

export declare type PackageJson = {
    productName: string;
    version: string;
    release: { date: string; time: string };
};
export declare type Callbacks = {
    onLoadWindow: (id: string, window: BrowserWindow) => void;
    onAppReady: (deap: typeof DEAP) => unknown;
    onAppActivate: (deap: typeof DEAP) => unknown;
    onAppWindowsClosed: (deap: typeof DEAP) => unknown;
    onBeforeQuitApp: (deap: typeof DEAP) => unknown;
    onSecondInstanceLaunched: (deap: typeof DEAP) => unknown;
};
export declare type DEAPWindowsCache = Record<string, BrowserWindow | undefined>;
export declare type DEAPElectronStoreData = { readonly name: string; defaults: ConfigDataStore | undefined };
export declare type DEAPElectronStore = Store<ConfigDataStore>;
export declare type PathKeys =
    | 'home'
    | 'appData'
    | 'userData'
    | 'sessionData'
    | 'temp'
    | 'exe'
    | 'module'
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
    | 'recent'
    | 'logs'
    | 'crashDumps';

type IExtraAppIpcActions = {
    [handle in keyof IpcHandlersInterface]: IpcInvokeAction;
};

// prettier-ignore
interface ExtraAppIpcActions extends IpcInvokeActionDomain, IExtraAppIpcActions {
    'detect-game-installation': { params: []; returnVal: Promise<string | undefined> };
    'get-user-count': { params: []; returnVal: Promise<number | undefined> };
    logger: { params: [id: string, action: LogLevelsType, ...args: unknown[]] /* Omit<Parameters<typeof IpcLogger>, 0> */; returnVal: ReturnType<typeof IpcLogger> };
    nexus: {
        params: [api_key: string, functionName: MethodsOfAlt<NexusType>, functionArgs: Parameters<MethodOf2Alt<NexusType, MethodsOfAlt<NexusType>>>];
        returnVal: Promise<Dekache | undefined | Awaited<ReturnType<MethodOf2Alt<NexusType, MethodsOfAlt<NexusType>>>> | { cache_time?: number }>;
    };
    palhub: {
        params: [action: PalHubProperties, args: Parameters<MethodOf2Alt<typeof Client, PalHubProperties>>];
        returnVal: ReturnType<MethodOf2Alt<typeof Client, PalHubProperties>>;
    };
    uStore: {
        params: [action: UStoreAction, key?: UStoreMethodKey<UStoreAction>, value?: UStoreMethodValue<UStoreAction, UStoreMethodKey<UStoreAction>>];
        returnVal: UStoreMethodReturn<UStoreAction, UStoreMethodKey<UStoreAction>, UStoreMethodValue<UStoreAction, UStoreMethodKey<UStoreAction>>>;
    };
    serverCache: {
        params: [action: ServerCacheAction, key?: ServerCacheMethodKey<ServerCacheAction>, value?: ServerCacheMethodValue<ServerCacheAction>];
        returnVal: ServerCacheMethodReturn<ServerCacheAction, ServerCacheMethodValue<ServerCacheAction>>;
    };
}

// prettier-ignore
export declare interface AppIpcActions extends IpcInvokeActionDomain {
    'get-name': { params: [], returnVal: string },
    'get-version': { params: [], returnVal: string },
    'get-path': { params: [key: PathKeys | 'log' | 'app'], returnVal: string },
    'open-external': { params: [url: string], returnVal: void },
    'open-file-location': { params: [filepath: string], returnVal: void },
    'open-file-dialog': { params: [options: OpenDialogOptions], returnVal: Promise<OpenDialogReturnValue> },
    'open-console-window': { params: [id: string], returnVal: boolean },
    'save-file-dialog': { params: [], returnVal: Promise<SaveDialogReturnValue> },
    'get-config': { params: [key: keyof ConfigDataStore, defaultValue?: ValueOf<ConfigDataStore> | undefined], returnVal: ValueOf<ConfigDataStore> },
    'set-config': { params: [key: keyof ConfigDataStore, value?: ValueOf<ConfigDataStore>], returnVal: ValueOf<ConfigDataStore> | undefined },
    'delete-config': { params: [id: keyof ConfigDataStore], returnVal: void },
    'open-child-window': { params: [id: string, window_config?: ConfigDataStoreWindow], returnVal: void },
    'reload-window': { params: [id: string], returnVal: boolean },
    // 'window-fully-rendered': { params: [id: keyof typeof DEAP._windows], returnVal: void },
    'check-for-updates': { params: [], returnVal: void },
    'install-update': { params: [], returnVal: void },
    'app-action': { params: [id: string, action: 'maximize' | 'minimize' | 'exit'], returnVal: boolean | void },
    'get-window-id': { params: [], returnVal: string },
    'check-image-path': { params: [pathtocheck?: string], returnVal: { path: string | undefined; valid: boolean } },
    'get-path-for-file': { params: [path: File], returnVal: string },
}

export declare type DownloadProgressType = { bytesPerSecond: number; percent: number; transferred: number; total: number };

export declare type AutoUpdaterEventType = keyof AppUpdaterEvents | 'before-quit-for-update' | 'initializing';

// prettier-ignore
export declare interface AppIpcEvents extends IpcActionDomain {
    'auto-updater': [type: AutoUpdaterEventType, data: unknown[] | DownloadProgressType],
    'open-deap-link': [url: string]
}

export declare interface MainAppIpcActions extends IpcActions {
    events: AppIpcEvents;
    // calls: {};
    commands: AppIpcActions & ExtraAppIpcActions;
}

export declare interface RendererAppIpcActions extends IpcActions {
    events: AppIpcEvents;
    // calls: { }
    commands: AppIpcActions & ExtraAppIpcActions;
}

// !see: https://www.electronjs.org/docs/latest/api/command-line-switches
// app.commandLine.appendSwitch('remote-debugging-port', '8315')

// !see: https://www.electronjs.org/docs/latest/api/session
// !see: https://www.electronjs.org/docs/latest/api/extensions
// session.defaultSession.loadExtension(join(__dirname, '../../extensions/react-devtools'));

// set the userData path to include (development) when in dev mode
// called here to ensure imported libs that use electron store are
// also updated/configured to use the correct path
if (!app.isPackaged) {
    const basePath: string = app.getPath('userData');
    app.setPath('userData', `${basePath} (dev)`);
}

// get the package.json file for the app (when in dev mode)
/** @type {PackageJson} */
const PACKAGE_JSON: PackageJson = ((): PackageJson => {
    if (app.isPackaged) return {} as PackageJson;
    return _require('../../package.json') as PackageJson;
})();

// set the app name and version from package.json or app.getXXX()
/** @type {string} */
const APP_NAME: string = ((): string => {
    if (app.isPackaged) return app.getName();
    return PACKAGE_JSON.productName;
})();

// if the app is not packaged, update app version in the package.json file
/** @type {string} */
const APP_VERSION: string = ((): string => {
    if (app.isPackaged) return app.getVersion();
    return updateAppVersion(PACKAGE_JSON);
})();

class DEAP {
    /**
     * @type {DEAPElectronStore | undefined}
     * @private
     * @static
     */
    private static _datastore: DEAPElectronStore | undefined;

    /**
     * @type {DEAPWindowsCache | undefined}
     * @private
     * @static
     */
    private static _windows: DEAPWindowsCache | undefined;

    /**
     * @type {Partial<Config> | undefined}
     * @private
     * @static
     */
    private static _config: Partial<Config> | undefined;

    /**
     * @type {boolean}
     * @default true
     * @private
     * @static
     */
    private static _can_launch: boolean = true;

    /**
     * @type {string | undefined}
     * @private
     * @static
     */
    private static _user_agent: string | undefined;

    /**
     * @type {LoggyBoi | undefined}
     * @public
     * @static
     */
    static logger: LoggyBoi | undefined;

    /**
     * @type {Tray | undefined}
     * @private
     * @static
     */
    private static _tray: Tray | undefined;

    /**
     * @type {VoidFunctionWithArgs<[id: string, window: BrowserWindow]> | undefined}
     * @private
     * @static
     */
    private static _onLoadWindowCB: VoidFunctionWithArgs<[id: string, window: BrowserWindow]> | undefined;

    private static _ipcMain: MainIpc<MainAppIpcActions, RendererAppIpcActions> | undefined;

    /**
     * Quick reference to electron.app;
     * @type {App}
     */
    static get app(): App {
        return app;
    }

    /** @type {string} */
    // NOTE: Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'DEAP'.ts(2699)
    static get appName(): string {
        return APP_NAME;
    }

    /** @type {PackageJson} */
    static get pack_json(): PackageJson {
        return PACKAGE_JSON;
    }

    /** @type {string} */
    static get version(): string {
        return APP_VERSION;
    }

    /** @type {DEAPElectronStore | undefined} */
    static get datastore(): DEAPElectronStore | undefined {
        return DEAP._datastore;
    }

    /** @type {(keyof DEAPWindowsCache)[]} */
    static get window_keys(): (keyof DEAPWindowsCache)[] {
        if (!DEAP._windows) return [];
        return Object.keys(DEAP._windows);
    }

    /** @type {_BrowserWindow | undefined} */
    static get main_window(): _BrowserWindow | undefined {
        const shifted: keyof DEAPWindowsCache = DEAP.window_keys.shift() as keyof DEAPWindowsCache;
        return shifted ? DEAP._windows?.[shifted] || undefined : undefined;
    }

    /**
     * setup app using given config
     * @param {Partial<Config>} [config={}]
     * @param {(...args: unknown[]) => void} [callback=(): void => {}]
     */
    static setup(
        config: Partial<Config> = {},
        callback: VoidFunctionWithArgs<[...args: unknown[]]> = (): void => {}
    ): void {
        DEAP._windows = {};
        DEAP._config = config;
        // setup app instance lock and return if we are not the main instance
        DEAP._can_launch = DEAP.setInstanceLock();
        if (!DEAP._can_launch) return;
        //! note:
        //! serve the app from the app.asar file when packaged
        //! purposely after setInstanceLock to ensure that we
        //! are the main instance of the application
        if (app.isPackaged) serve({ directory: 'app' });
        // setup the logger system
        /** @type {string} */
        const userDataPath: string = app.getPath('userData');
        /** @type {string} */
        const logfileName: string = '[dek.ue.applog].log';
        LoggyBoi.logpath = path.join(userDataPath, logfileName);
        LoggyBoi.setGlobalOptions({
            ...config.logger,
            file_options: {
                filename: LoggyBoi.logpath,
                options: { flags: 'w', encoding: 'utf8' },
            },
            // http_options: {
            //     port: 9699,
            //     host: '127.0.0.1',
            // }
        });
        DEAP.logger = createLogger('deap');
        void DEAP.logger.info(userDataPath);
        DEAP.setUserAgent('by dekitarpg.com');
        DEAP.setupDefaultIPC();
        config.data_store = config.data_store || ({} as ConfigDataStore);
        DEAP.setDatastore({
            name: '[dek.ue.appdata]',
            defaults: config.data_store,
        });
        if (callback) callback(DEAP);
    }

    /**
     * @returns {boolean}
     */
    static setInstanceLock(): boolean {
        if (!app.isPackaged) return true;
        if (DEAP._config && !DEAP._config.single_instance) return true;
        // returns true if we are the main instance
        return app.requestSingleInstanceLock({});
    }

    /**
     * @param {string} id
     * @returns {LoggerMethods}
     */
    static useLogger(id: string): LoggerMethods {
        /**
         * @param {LogLevelsType} action
         * @param {...unknown} args
         * @returns {void}
         */
        const logger: VoidFunctionWithArgs<[action: LogLevelsType, ...args: unknown[]]> = (
            action: LogLevelsType,
            ...args: unknown[]
        ): void => {
            if (!DEAP.logger) return;
            type LoggerDeconstruct = { idtag: string | undefined };
            /** @type {LoggerDeconstruct} */
            const { idtag }: LoggerDeconstruct = DEAP.logger; // get the current idtag
            DEAP.logger.idtag = id; // set the idtag to the id
            void DEAP.logger[action](...(args as [message: string, metadata?: unknown])); // log the action to the console
            DEAP.logger.idtag = idtag; // reset the idtag to previous value
        };
        /** @type {LogLevelsType[]} */
        const logkeys: LogLevelsType[] = ['log', 'info', 'warn', 'error', 'fatal'];
        return logkeys.reduce((acc: Partial<LoggerMethods>, key: LogLevelsType): Partial<LoggerMethods> => {
            return {
                ...acc,
                [key]: (...args: unknown[]): void => logger(key, ...args),
            };
        }, {}) as LoggerMethods;
    }

    /**
     * @param {Options<ConfigDataStore> | undefined} store_options
     * @return {void}
     */
    static setDatastore(store_options: Options<ConfigDataStore>): void {
        DEAP._datastore = new Store(store_options);
        void DEAP.logger?.info('Datastore initialized');
    }

    /**
     * @param {string} agent_str
     * @return {void}
     */
    static setUserAgent(agent_str: string): void {
        DEAP._user_agent = `${APP_NAME} ${APP_VERSION} ${agent_str}`.trim();
        void DEAP.logger?.info(DEAP._user_agent);
    }

    private static setupMainIpc(): void {
        if (!DEAP._ipcMain) {
            DEAP._ipcMain = new MainIpc<MainAppIpcActions, RendererAppIpcActions>(ipcMain, { responseTimeout: 1000 });
        }
    }

    /**
     * ■ ipc handlers:
     * @returns {void}
     */
    static setupDefaultIPC(): void {
        DEAP.setupMainIpc();
        // default ipc handlers
        DEAP._ipcMain!.handle('get-name', (_e: MainIpcEvent): string => APP_NAME);
        DEAP._ipcMain!.handle('get-version', (_e: MainIpcEvent): string => APP_VERSION);
        DEAP._ipcMain!.handle('get-path', (_event: MainIpcEvent, key: PathKeys | 'log' | 'app'): string => {
            if (key === 'log') {
                assert.ok(LoggyBoi.logpath);
                return LoggyBoi.logpath;
            }
            if (key === 'app') return app.getAppPath();
            return app.getPath(key);
        });
        DEAP._ipcMain!.handle('open-external', (_event: MainIpcEvent, url: string): void => {
            console.log(`open-external: ${url}`);
            void shell.openExternal(url);
        });
        DEAP._ipcMain!.handle('open-file-location', (_event: MainIpcEvent, filepath: string): void => {
            shell.showItemInFolder(filepath);
        });
        DEAP._ipcMain!.handle(
            'open-file-dialog',
            async (_event: MainIpcEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> => {
                if (options) return await dialog.showOpenDialog(options);
                const extensions: string[] = ['jpg', 'png', 'gif'];
                return await dialog.showOpenDialog({
                    filters: [{ name: 'Images', extensions }],
                    properties: ['openFile'],
                });
            }
        );
        DEAP._ipcMain!.handle('open-console-window', (_event: MainIpcEvent, id: string): boolean => {
            if (!DEAP._windows?.[id]) return false;
            if (DEAP._windows[id].webContents.isDevToolsOpened()) {
                DEAP._windows[id].webContents.closeDevTools();
            } else {
                DEAP._windows[id].webContents.openDevTools({ mode: 'detach' });
            }
            return true;
        });
        DEAP._ipcMain!.handle('save-file-dialog', async (_event: MainIpcEvent): Promise<SaveDialogReturnValue> => {
            const filters: FileFilter[] = [{ name: 'Stylesheet', extensions: ['css'] }];
            return await dialog.showSaveDialog({ filters });
        });
        DEAP._ipcMain!.handle(
            'get-config',
            (
                _event: MainIpcEvent,
                key: keyof ConfigDataStore,
                defaultvalue: ValueOf<ConfigDataStore> | undefined = undefined
            ): ValueOf<ConfigDataStore> => {
                assert.ok(DEAP._datastore);
                return DEAP._datastore.get<string, ValueOf<ConfigDataStore>>(key as string, defaultvalue);
            }
        );
        DEAP._ipcMain!.handle(
            'set-config',
            (
                _event: MainIpcEvent,
                key: keyof ConfigDataStore,
                value: ValueOf<ConfigDataStore> | undefined
            ): ValueOf<ConfigDataStore> | undefined => {
                DEAP._datastore?.set<keyof ConfigDataStore>(key, value);
                if (key === 'auto-boot') DEAP.updateAutoBootMode();
                return value;
            }
        );
        DEAP._ipcMain!.handle(
            'delete-config',
            <TKey extends keyof ConfigDataStore>(_event: MainIpcEvent, key: TKey): void => {
                DEAP._datastore?.delete(key);
            }
        );
        DEAP._ipcMain!.handle(
            'open-child-window',
            (_event: IpcMainInvokeEvent, id: string, window_config?: ConfigDataStoreWindow): void => {
                return DEAP.createWindow(id, window_config);
            }
        );
        DEAP._ipcMain!.handle('reload-window', (_event: IpcMainInvokeEvent, id: string): boolean => {
            if (!DEAP._windows || !DEAP._windows[id]) return false;
            DEAP._windows[id].reload();
            return true;
        });
        // ipcMain.handle("window-fully-rendered", async (event: IpcMainInvokeEvent, id): Promise<void> => {
        //     DEAP._windows[id].emit('window-fully-rendered');
        // });
        DEAP._ipcMain!.handle('check-for-updates', (): void => {
            if (app.isPackaged) void autoUpdater.checkForUpdates();
        });
        DEAP._ipcMain!.handle('install-update', (): void => {
            if (app.isPackaged) autoUpdater.quitAndInstall(true, true);
        });
        DEAP._ipcMain!.handle(
            'app-action',
            (_event: IpcMainInvokeEvent, id: string, action: 'maximize' | 'minimize' | 'exit'): void | boolean => {
                void DEAP.logger?.info(`app-action: ${id} -- ${action}`);
                if (!DEAP._windows || !DEAP._windows[id]) return;
                switch (action) {
                    case 'maximize': {
                        if (DEAP._windows[id].isMaximized()) {
                            DEAP._windows[id].restore();
                            return false;
                        }

                        DEAP._windows[id].maximize();
                        return true;
                    }
                    case 'minimize':
                        return DEAP._windows[id].minimize();
                    case 'exit':
                        if (!id) return app.quit();

                        return DEAP._windows[id].close();
                }
            }
        );
        DEAP._ipcMain!.handle('get-window-id', (event: IpcMainInvokeEvent): string => {
            return (_BrowserWindow.fromWebContents(event.sender) as BrowserWindow)?.deap_id;
        });
        DEAP._ipcMain!.handle(
            'check-image-path',
            (
                _event: IpcMainInvokeEvent,
                pathtocheck: string | undefined = DEAP._config?.app_icon?.ico
            ): { path: string | undefined; valid: boolean } => {
                if (!pathtocheck) return { path: undefined, valid: false };
                /** @type {string} */
                const thepath: string = path.join(__dirname, pathtocheck);
                return {
                    path: thepath,
                    valid: !nativeImage.createFromPath(thepath).isEmpty(),
                };
            }
        );
    }

    /**
     * @template {(event: IpcMainInvokeEvent, ...args: unknown[]) => unknown} T
     * @param {string} handle
     * @param {T} callback
     * @returns {void}
     */
    static addIPCHandler<T extends (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown>(
        handle: string,
        callback: T
    ): void {
        DEAP.setupMainIpc();
        DEAP._ipcMain!.handle(handle, callback);
    }

    /**
     * @param {ConfigDataStoreWindowsKeys} id
     * @param {ConfigDataStoreWindow | undefined} [window_config=DEAP._config?.windows?.[id]]
     * @returns {void}
     */
    // prettier-ignore
    static createWindow(id: ConfigDataStoreWindowsKeys, window_config: ConfigDataStoreWindow | undefined = DEAP._config?.windows?.[id]): void {
        assert.ok(window_config, new Error(`window ${id} is not defined in config!`));
        assert.ok(DEAP._windows, new Error('DEAP client not yet initalized!'));
        if (DEAP._windows[id]) return DEAP._windows[id].reload();
        // if making first window, then assign it systray on mini:
        const assign_systray: boolean = DEAP.window_keys.length === 0;
        const width: number = window_config.size.w;
        const height: number = window_config.size.h;
        const min_w: number = window_config.size.min_w || width;
        const min_h: number = window_config.size.min_h || height;

        let reloading: boolean = false;

        assert.ok(DEAP._config, new Error("DEAP's config has not yet been initalized."));
        assert.ok(DEAP._config.app_icon, new Error("DEAP's config's app icon value is invalid."));

        // DEAP._windows[id] = new BrowserWindow({
        const win: BrowserWindow = createWindow(DEAP, id, {
            icon: DEAP._config.app_icon.ico,
            show: false,
            width,
            height,
            minWidth: min_w,
            minHeight: min_h,
            autoHideMenuBar: true,
            useContentSize: true,
            backgroundColor: '#36393f',
            frame: window_config.opts.show_frame,
            fullscreen: window_config.opts.fullscreen,
            transparent: window_config.opts.transparent,
            webPreferences: {
                preload: window_config.load,
                // enableRemoteModule: false,
                nodeIntegration: false,
                contextIsolation: true,
            },
        });
        enableRemoteModule(win.webContents);
        win.setMenu(null);
        win.on('minimize', (event: Event): void => {
            assert.ok(
                DEAP._windows,
                new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
            );
            assert.ok(
                DEAP._windows[id],
                new Error(
                    `DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`
                )
            );
            assert.ok(
                DEAP._windows[id] instanceof _BrowserWindow,
                new Error(
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'undefined'}, this should not have happened.`
                )
            );
            if (assign_systray && DEAP._datastore?.get('tiny-tray') === true) {
                DEAP._windows[id].setSkipTaskbar(true);
                DEAP.createTray(DEAP._windows[id]);
                event.preventDefault();
            }
        });
        win.on('restore', (event: Event): void => {
            assert.ok(
                DEAP._windows,
                new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
            );
            assert.ok(
                DEAP._windows[id],
                new Error(
                    `DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`
                )
            );
            assert.ok(
                DEAP._windows[id] instanceof _BrowserWindow,
                new Error(
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'undefined'}, this should not have happened.`
                )
            );
            if (assign_systray && DEAP._datastore?.get('tiny-tray') === true) {
                DEAP._windows[id].setSkipTaskbar(false);
                DEAP.destroyTray();
            }
            event.preventDefault();
            reloading = true;
        });
        win.on('closed', (_event: Event): void => {
            assert.ok(
                DEAP._windows,
                new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
            );
            assert.ok(
                DEAP._windows[id],
                new Error(
                    `DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`
                )
            );
            assert.ok(
                DEAP._windows[id] instanceof _BrowserWindow,
                new Error(
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'undefined'}, this should not have happened.`
                )
            );
            DEAP._windows[id] = undefined;
            delete DEAP._windows[id];
            if (!assign_systray) return; // - child windows
            const other_keys: string[] = DEAP.window_keys.filter((key: string): boolean => key !== id); // main window:
            for (const key of other_keys) DEAP._windows[key]?.close(); // - close kids
        });

        win.on('ready-to-show', (): void => {
            assert.ok(
                DEAP._windows,
                new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
            );
            assert.ok(
                DEAP._windows[id],
                new Error(
                    `DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`
                )
            );
            assert.ok(
                DEAP._windows[id] instanceof _BrowserWindow,
                new Error(
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'undefined'}, this should not have happened.`
                )
            );
            // DEAP._windows[id].on('window-fully-rendered', (): void => {
            const can_tiny: boolean = assign_systray && !reloading && DEAP._datastore?.get('auto-tiny') === true;
            const can_show_console: boolean =
                DEAP._config?.dev_mode === true || DEAP._datastore?.get('show-cwin', false) === true;
            if (can_show_console) DEAP._windows[id].webContents.openDevTools();
            if (can_tiny) DEAP._windows[id].minimize();
            else DEAP._windows[id].show();
            reloading = false;
        });
        win.on('show', (): void => {
            assert.ok(
                DEAP._windows,
                new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
            );
            assert.ok(
                DEAP._windows[id],
                new Error(
                    `DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`
                )
            );
            assert.ok(
                DEAP._windows[id] instanceof _BrowserWindow,
                new Error(
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'undefined'}, this should not have happened.`
                )
            );
            // DEAP._windows[id].webContents.send('deap-window-setup', id);
            if (DEAP._onLoadWindowCB) {
                DEAP._onLoadWindowCB(id, DEAP._windows[id]);
                // DEAP._onLoadWindowCB = undefined;
            }
            DEAP._windows[id].focus();
        });
        win.webContents.on('before-input-event', (event: Event, input: Input): void => {
            if (input.control && input.key.toUpperCase() === 'R') {
                void DEAP.loadFileToWindow(id, window_config);
                event.preventDefault();
            }
        });
        // prettier-ignore
        /** @see https://github.com/electron/electron/issues/20330 */
        // win.on('will-prevent-default', (event: Event): void => {
        //     event.preventDefault();
        // });

        DEAP._windows[id] = win;

        void DEAP.loadFileToWindow(id, window_config);
    }

    /**
     * Creates a system tray icon and defines its options
     * @param {_BrowserWindow} window
     * @returns {void}
     */
    static createTray(window: _BrowserWindow): void {
        assert.ok(DEAP._config, new Error("DEAP's config has not yet been initalized."));
        assert.ok(DEAP._config.app_icon, new Error("DEAP's config's app icon value is invalid."));
        const trayIcon: string | undefined = app.isPackaged
            ? path.join(__dirname, './icon.ico') // when in dev mode
            : DEAP._config.app_icon.ico; // fix for packaged app
        DEAP._tray = new Tray(nativeImage.createFromPath(trayIcon));
        const menu: Menu = DEAP.createTrayMenu(window);
        DEAP._tray.on('double-click', (): void => window.show());
        DEAP._tray.setToolTip(window.title);
        DEAP._tray.setContextMenu(menu);
    }

    /**
     * @param {_BrowserWindow} window
     * @returns {Menu}
     */
    static createTrayMenu(window: _BrowserWindow): Menu {
        return Menu.buildFromTemplate([
            { label: 'Show', click: (): void => window.show() },
            {
                label: 'Exit',
                click: (): void => {
                    // app.isQuiting = true;
                    app.quit();
                },
            },
        ]);
    }

    /**
     * @returns {void}
     */
    static destroyTray(): void {
        if (!DEAP._tray) return;
        DEAP._tray.destroy();
        DEAP._tray = undefined;
    }

    /**
     * @param {ConfigDataStoreWindowsKeys} id
     * @param {ConfigDataStoreWindow} config
     * @returns {Promise<void>}
     */
    static async loadFileToWindow(id: ConfigDataStoreWindowsKeys, config: ConfigDataStoreWindow): Promise<void> {
        assert.ok(
            DEAP._windows,
            new Error("DEAP's windows cache has not yet been initalized, this should not have happened.")
        );
        assert.ok(
            DEAP._windows[id],
            new Error(`DEAP's windows cache has no entry for the current window id ${id}, this should not have happened.`)
        );
        assert.ok(
            DEAP._windows[id] instanceof _BrowserWindow,
            new Error(
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                `DEAP's windows cache has an invalid entry for the window id of ${id}, got ${DEAP._windows?.[id]?.toString() ?? 'null'}, this should not have happened.`
            )
        );
        assert.ok(
            DEAP._user_agent,
            new Error(`DEAP's user agent configuration has not yet been initalized, this should not have happened.`)
        );
        // set user agent and show/reload
        const window: _BrowserWindow = DEAP._windows[id];
        window.webContents.setUserAgent(DEAP._user_agent);
        void DEAP.logger?.info(`Loading window: ${id}`);
        if (window.isVisible()) window.reload();
        else if (app.isPackaged) await window.loadURL(`app://./${config.page}`);
        else await window.loadURL(`http://localhost:${argv[2]}/${config.page}`);
    }

    /**
     * updates the 'auto-start at system boot' feature
     * @returns {void}
     */
    static updateAutoBootMode(): void {
        const openAtLogin: boolean = DEAP._datastore?.get('auto-boot', false) ?? false;
        app.setLoginItemSettings({ openAtLogin });
    }

    /**
     * @param {Partial<Callbacks>} [callbacks={}]
     * @returns {void}
     */
    static launch(callbacks: Partial<Callbacks> = {}): void {
        // if we are not the main instance, then quit the app
        if (!DEAP._can_launch) return app.quit();
        // handle uncaught exceptions and rejections
        if (DEAP._config?.handle_rejections === true) {
            process_on(
                'unhandledRejection',
                (...args: [reason: unknown, promise: Promise<unknown>]): void =>
                    void (DEAP.logger?.error(...(args as [message: string, metadata?: unknown])) ?? console.error(args))
            );
        }
        if (DEAP._config?.handle_exceptions === true) {
            process_on(
                'uncaughtException',
                (...args: [error: Error, origin: NodeJS.UncaughtExceptionOrigin]): void =>
                    void (
                        DEAP.logger?.error(...(args as unknown as [message: string, metadata?: unknown])) ??
                        console.error(args)
                    )
            );
        }
        // setup app event listeners
        app.on('ready', (): void => DEAP.onAppReady(callbacks));
        app.on('activate', (): void => DEAP.onAppActivate(callbacks));
        app.on('before-quit', (): void => DEAP.onBeforeQuitApp(callbacks));
        app.on('window-all-closed', (): void => DEAP.onAppWindowsClosed(callbacks));
        // handles forwarding deep links for macOS
        app.on('open-url', (...args: [event: Event, url: string]): void => DEAP.onAppOpenURL(...args));
        // handles forwarding deep links for windows / linux
        app.on('second-instance', (...args: [event: Event, commandLine: string[], workingDirectory: string]): void =>
            DEAP.onSecondInstanceLaunched(callbacks, ...args)
        );
        if (callbacks.onLoadWindow) DEAP._onLoadWindowCB = callbacks.onLoadWindow;
    }

    /**
     * @param {Partial<Callbacks>} callbacks
     * @returns {void}
     */
    static onAppReady(callbacks: Partial<Callbacks>): void {
        // setup for deep linking in packaged app
        if (app.isPackaged) {
            /** @type {[string, string[]]} */
            let extra_args: [string, string[]] = ['', []];
            if (defaultApp && argv.length >= 2 && argv[1]) {
                extra_args = [execPath, [path.resolve(argv[1])]];
                void DEAP.logger?.info(`deep-linking: ${extra_args.join(' --- ')}`);
            }
            // app.setAsDefaultProtocolClient('dek-ue', ...extra_args);

            // nxm://palworld/mods/2017/files/8213?key=KWVYopKUGVMi42jyp9mt_Q&expires=1735734581&user_id=51283421
            if (DEAP._datastore && DEAP._datastore.get('nxm-links', false) === true) {
                app.setAsDefaultProtocolClient('nxm', ...extra_args);
            }
        }
        DEAP.createWindow('main'); // create main window when electron has initialized.
        if (callbacks.onAppReady) callbacks.onAppReady(DEAP);
        setTimeout((): void => DEAP.initializeAutoUpdater(), 3000);
    }

    /**
     * @param {Partial<Callbacks>} callbacks
     * @returns {void}
     */
    static onAppActivate(callbacks: Partial<Callbacks>): void {
        if (callbacks.onAppActivate) callbacks.onAppActivate(DEAP);
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (_BrowserWindow.getAllWindows().length === 0) DEAP.createWindow('main');
    }

    /**
     * @param {Partial<Callbacks>} callbacks
     * @returns {void}
     */
    static onAppWindowsClosed(callbacks: Partial<Callbacks>): void {
        if (callbacks.onAppWindowsClosed) callbacks.onAppWindowsClosed(DEAP);
        if (platform !== 'darwin') app.quit();
    }

    /**
     * Cleanup any resources before quitting
     * @param {Partial<Callbacks>} callbacks
     * @returns {void}
     */
    static onBeforeQuitApp(callbacks: Partial<Callbacks>): void {
        DEAP.destroyTray();
        void DEAP.logger?.info('Application is quitting...');
        if (callbacks.onBeforeQuitApp) callbacks.onBeforeQuitApp(DEAP);
    }

    /**
     * Someone tried to run a second instance of app
     * @param {Partial<Callbacks>} callbacks
     * @param {Event} _event
     * @param {string[]} commandLine
     * @param {string} _workingDirectory
     * @returns {void}
     */
    static onSecondInstanceLaunched(
        callbacks: Partial<Callbacks>,
        _event: Event,
        commandLine: string[],
        _workingDirectory: string
    ): void {
        if (!DEAP._config?.single_instance || !DEAP.main_window) return;
        // if (DEAP.main_window.isMinimized()) DEAP.main_window.restore();
        if (callbacks.onSecondInstanceLaunched) callbacks.onSecondInstanceLaunched(DEAP);
        // the commandLine is array of strings in which last element is deep link url
        DEAP.main_window.webContents.send('open-deap-link', commandLine.pop());
        DEAP.main_window.focus();
    }

    /**
     * @param {Event} event
     * @param {string} url
     * @returns {void}
     */
    static onAppOpenURL(event: Event, url: string): void {
        event.preventDefault();
        // open-deep-link when macOS
        if (platform === 'darwin') {
            void DEAP.logger?.info(`open-deap-link[open-url]: ${url}`);
            DEAP.main_window?.webContents?.send('open-deap-link', url);
        } else {
            void DEAP.logger?.error(`IGNORED-open-deap-link: ${url}`);
        }
    }

    /**
     * @returns {void}
     */
    static initializeAutoUpdater(): void {
        /** @type {boolean} */
        const updatesEnabled: boolean = app.isPackaged && DEAP._datastore?.get('do-update', true) === true;
        void DEAP.logger?.info(`Automatic Updates Enabled: ${updatesEnabled}`);
        if (!updatesEnabled) return;
        if (!app.isPackaged) {
            DEAP.main_window?.webContents?.send('auto-updater', 'not-packaged');
            return;
        }
        DEAP.main_window?.webContents?.send('auto-updater', 'initializing');
        // define listeners:
        const updater_events: AutoUpdaterEventType[] = [
            'checking-for-update',
            'update-available',
            'update-not-available',
            'download-progress',
            'update-downloaded',
            'before-quit-for-update',
            'error',
            'initializing',
        ];
        for (const event of updater_events) {
            // @ts-expect-error --- unknown as to why 'before-quit-for-update' is not defined.
            autoUpdater.on(event, (...data: unknown[]): void => {
                DEAP.main_window?.webContents?.send('auto-updater', event, ...data);
            });
        }
        // begin checking updates:
        void autoUpdater.checkForUpdates();
        // check for updates every hour
        setInterval((): void => void autoUpdater.checkForUpdates(), 1000 * 60 * 60); // 1 hour
    }
}

export default DEAP;
