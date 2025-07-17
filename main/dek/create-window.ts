/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import assert from 'node:assert';

import { enable as enableRemoteModule } from '@electron/remote/main';
import type { ConfigDataStoreWindowsKeys } from '@main/config';
import type { DEAPElectronStore } from '@main/dek/deap';
import DEAP from '@main/dek/deap';
import type { TypeFunction, TypeFunctionWithArgs } from '@typed/common';
import type {
    BrowserWindowConstructorOptions,
    Display,
    HandlerDetails,
    Rectangle,
    WebPreferences,
    WindowOpenHandlerResponse,
} from 'electron';
import { BrowserWindow as _BrowserWindow, Menu, screen, shell } from 'electron';

export declare interface NewWindowOptions extends BrowserWindowConstructorOptions {
    icon: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    autoHideMenuBar: boolean;
    useContentSize: boolean;
    backgroundColor: string;
    frame: boolean;
    fullscreen: boolean;
    transparent: boolean;
    webPreferences: Partial<WebPreferences>;
}

export declare type BrowserWindow = _BrowserWindow & { deap_id: ConfigDataStoreWindowsKeys };

/**
 * @param {DEAP} _DEAP
 * @param {ConfigDataStoreWindowsKeys} windowName
 * @param {NewWindowOptions} options
 * @returns {BrowserWindow}
 */
export const createWindow: TypeFunctionWithArgs<
    [_DEAP: DEAP, windowName: ConfigDataStoreWindowsKeys, options: NewWindowOptions],
    BrowserWindow
> = (_DEAP: DEAP, windowName: ConfigDataStoreWindowsKeys, options: NewWindowOptions): BrowserWindow => {
    /** @type {string} */
    const key: string = `windows.${windowName}`;
    /** @type {DEAPElectronStore} */
    const store: DEAPElectronStore | undefined = DEAP.datastore;
    /** @type {Partial<Rectangle>} */
    const defaultSize: Partial<Rectangle> = {
        width: options.width,
        height: options.height,
    };
    /** @returns {Partial<Rectangle>} */
    const getCurrentPosition: TypeFunction<Rectangle> = (): Rectangle => {
        /** @type {number[]} */
        const position: number[] = win.getPosition();
        assert.ok(position[0] && position[1]);
        /** @type {number[]} */
        const size: number[] = win.getSize();
        assert.ok(size[0] && size[1]);
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1],
        };
    };

    /**
     * @param {Rectangle} windowState
     * @param {Rectangle} bounds
     * @returns {boolean}
     */
    const windowWithinBounds: TypeFunctionWithArgs<[windowState: Rectangle, bounds: Rectangle], boolean> = (
        windowState: Rectangle,
        bounds: Rectangle
    ): boolean => {
        return (
            windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height
        );
    };
    /** @returns {Rectangle} */
    const resetToDefaults: TypeFunction<Rectangle> = (): Rectangle => {
        /** @type {Rectangle} */
        const bounds: Rectangle = screen.getPrimaryDisplay().bounds;
        assert.ok(defaultSize.width && defaultSize.height);
        return Object.assign({}, defaultSize, {
            x: (bounds.width - defaultSize.width) / 2,
            y: (bounds.height - defaultSize.height) / 2,
        }) as Rectangle;
    };
    /** @returns {Rectangle} */
    const ensureVisibleOnSomeDisplay: TypeFunction<Rectangle> = (): Rectangle => {
        /** @type {Rectangle} */
        const windowState: Rectangle = (store?.get(key, defaultSize) || defaultSize) as Rectangle;
        console.log('ensureVisibleOnSomeDisplay', windowState);
        /** @type {boolean} */
        const visible: boolean = screen.getAllDisplays().some((display: Display): boolean => {
            return windowWithinBounds(windowState, display.bounds);
        });
        // Window is partially or fully not visible now.
        // Reset it to safe defaults.
        if (!visible) return resetToDefaults();
        return windowState;
    };

    /** @type {Rectangle} */
    const state: Rectangle = ensureVisibleOnSomeDisplay();

    const win: BrowserWindow = new _BrowserWindow({
        ...options,
        ...state,
        show: false, // Don't show the window until it's ready
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // enableRemoteModule: false,
            ...options.webPreferences,
        },
    }) as BrowserWindow;

    enableRemoteModule(win.webContents);

    Menu.setApplicationMenu(null);
    // win.webContents.on('new-window', (event, url) => {
    //     event.preventDefault();
    //     shell.openExternal(url);
    // });
    win.webContents.setWindowOpenHandler(({ url }: HandlerDetails): WindowOpenHandlerResponse => {
        void shell.openExternal(url);
        return { action: 'deny' };
    });
    // save state on window close
    win.on('close', (): void => {
        if (!win.isMinimized() && !win.isMaximized()) {
            Object.assign(state, getCurrentPosition());
        }
        store?.set(key, state);
    });
    // store reference to the window id for deap system
    win.deap_id = windowName;

    // return de vindow wuuuut?!
    return win;
};
