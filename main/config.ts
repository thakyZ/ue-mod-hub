/*
 * ########################################
 * # PalHUB::Client by dekitarpg@gmail.com
 * ########################################
 *
 * This file handles all configuration options for the palhub client.
 * Config data is used to define how the app and windows behave.
 *
 */

// load modules used for generating config:
import type { UUID } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { env } from 'node:process';

import type { ValidLanguages } from '@hooks/use-localization';
import type { GamePlatforms, LaunchTypes } from '@main/dek/game-map';
import type { Get, Paths } from 'type-fest';

export declare type SupportedApis = 'nexus';

export declare type Games =
    | 'palworld'
    | 'ff7remake'
    | 'ff7rebirth'
    | 'hogwarts-legacy'
    | 'black-myth-wukong'
    | 'lockdown-protocol'
    | 'orcs-must-die-3'
    | 'orcs-must-die-deathtrap'
    | 'satisfactory'
    | 'stellar-blade'
    | 'stellar-blade-demo'
    | 'tekken8';

export declare type ErroredGames = '{UNKNOWN}' | 'undefined';

export declare type ExtraGames = 'generic';

export declare type Config = {
    dev_mode: boolean;
    show_debug: boolean;
    single_instance: boolean;
    handle_rejections: boolean;
    handle_exceptions: boolean;
    app_icon: {
        base: string;
        ico: string;
        png: string;
    };
    logger: {
        replacer: string;
    };
    data_store: {
        locale: ValidLanguages;
        uuid: UUID;
        'auto-boot': boolean;
        'auto-play': boolean;
        'auto-tiny': boolean;
        'tiny-tray': boolean;
        'nxm-links': boolean;
        'app-cache': string | null;
        'allow-rpc': boolean;
        'do-update': boolean;
        'show-cwin': boolean;
        'game-path'?: string;
        'api-keys': {
            [api in SupportedApis]: string | null;
        };
        windows?: Exclude<Exclude<Config, undefined>['windows'], undefined>;
        games: {
            [game in Games]?: {
                [game_platform in GamePlatforms]: {
                    [launch_type in LaunchTypes]: string;
                };
            };
        } & {
            [errored_game in ErroredGames]?: unknown;
        } & {
            active: `${Games}.${GamePlatforms}.${LaunchTypes}` | null;
        };
    };
    windows?: {
        [key: string]: {
            page: string;
            size: {
                w: number;
                h: number;
                min_w?: number;
                min_h?: number;
            };
            load: string;
            opts: {
                fullscreen: boolean;
                transparent: boolean;
                show_frame: boolean;
            };
        };
    };
};

export declare type ConfigDataStore = Exclude<Config, undefined>['data_store'];

export declare type ConfigDataStoreApiKeys = Exclude<ConfigDataStore, undefined>['api-keys'];

export declare type ConfigAppIcon = Exclude<Config, undefined>['app_icon'];

export declare type ConfigLogger = Exclude<Config, undefined>['logger'];

export declare type ConfigDataStoreGames = Exclude<ConfigDataStore, undefined>['games'];

export declare type ConfigDataStoreGamesBase = Omit<ConfigDataStore['games'], Games>;

export declare type ConfigDataStoreGamesRecordGamePlatforms = Exclude<ConfigDataStoreGames, undefined>[Games];

// prettier-ignore
export declare type ConfigDataStoreGamesRecordLaunchTypes = Exclude<ConfigDataStoreGamesRecordGamePlatforms, undefined>[GamePlatforms];

export declare type ConfigDataStoreGamesRecord = Omit<ConfigDataStoreWindows, keyof ConfigDataStoreGamesBase>;

export declare type ConfigDataStoreWindows = Exclude<Exclude<Config, undefined>['windows'], undefined>;

export declare type ConfigDataStoreWindowsKeys = Exclude<keyof ConfigDataStoreWindows, number>;

export declare type ConfigDataStoreWindow = Exclude<ConfigDataStoreWindows, undefined>[keyof ConfigDataStoreWindows];

export declare type ConfigDataStoreWindowOptions = Exclude<ConfigDataStoreWindow, undefined>['opts'];

export declare type ConfigDataStoreWindowSize = Exclude<ConfigDataStoreWindow, undefined>['size'];

export declare type ConfigDataStorePath = Paths<ConfigDataStore>;

export declare type ConfigDataStoreValueFromPath<TKey extends ConfigDataStorePath = ConfigDataStorePath> =
    TKey extends keyof ConfigDataStore ? ConfigDataStore[TKey] : Get<ConfigDataStore, TKey>;

// export the configuration:
const CONFIG: Config = {
    /**
     * dev_mode:
     * flag to be used in development only!
     */
    dev_mode: env['NODE_ENV'] !== 'production',

    /**
     * show_debug:
     * shows debug menu (javascript console)
     * devmode must also be true for this to work <3
     */
    show_debug: true,

    /**
     * single_instance:
     * determines if the app is allowed to open multiple instances.
     * NOTE: if dev_mode is enabled, this will always be false.
     */
    single_instance: true,

    /**
     * handle_rejections:
     * handle_exceptions:
     * determine if DEAP should handle unhandled promise rejections/exceptions
     */
    handle_rejections: true,
    handle_exceptions: true,

    /**
     * app_icon:
     * defines the ico and png files for the app icon
     */
    app_icon: {
        base: __dirname,
        ico: path.join(__dirname, '../resources/icon.ico'),
        png: path.join(__dirname, '../resources/icon.png'),
    },

    /**
     * logger:
     * options sent to the logger module
     */
    logger: {
        replacer: __dirname,
    },

    /**
     * data_store:
     * Custom app specific configuration saved to appdata json file
     * these proeprties can be get/set from global.app_settings.
     */
    data_store: {
        // defines the default language to use for the app
        locale: 'en',
        // creates a random uuid on first boot,
        // that uuid is then used afterwords
        uuid: randomUUID(),
        // deap specific user configurables
        'auto-boot': false,
        'auto-play': false,
        'auto-tiny': false,
        'tiny-tray': false,
        'nxm-links': true, // use nexus mod deep links (download with manager button)
        // app specific user configurables
        // used to store app specific cache data
        'app-cache': null,
        'allow-rpc': true, // allow discord rpc to be enabled
        'do-update': true, // check for updates on boot
        'show-cwin': false, // show the browser console window
        // handles all api keys for the app
        'api-keys': {
            nexus: null,
            // "other": null,
        },
        // handles window specific data, eg, position, size, etc
        windows: {},
        // handles game specific path data
        games: {
            active: null, // the active game id
        },
    },

    /**
     * windows:
     * defines each window used within the app
     */
    windows: {
        // window id
        main: {
            // the initial page to load for this window
            page: 'play',
            // size for window
            size: {
                w: 1280,
                h: 830,
                min_w: 420,
                min_h: 360,
            },
            // the preload file to load for this window
            load: path.join(__dirname, './preload.js'),
            // various options for the window behaviour
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false,
            },
        },
        help: {
            page: 'faq',
            size: { w: 640, h: 420 },
            load: path.join(__dirname, './preload.js'),
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false,
            },
        },
        setup: {
            page: 'setup',
            size: { w: 640, h: 420 },
            load: path.join(__dirname, './preload.js'),
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false,
            },
        },
        changes: {
            page: 'changes',
            size: { w: 640, h: 420 },
            load: path.join(__dirname, './preload.js'),
            opts: {
                fullscreen: false,
                transparent: false,
                show_frame: false,
            },
        },
    },
    // end of config
};

// export the configuration:
export default CONFIG;
