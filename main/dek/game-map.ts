/*
* ########################################
* # PalHUB::Client by dekitarpg@gmail.com
* ########################################
list of unreal engine games, their steam game/server app id
(if they have one), and nexus mod id (if they have one)
*/

import type { Games } from '@main/config';
import type { Get, Paths } from 'type-fest';

export declare type Ue4ssSettings = {
    Overrides: {
        /**
         * Path to the 'Mods' folder
         * Default: <dll_directory>/Mods
         */
        ModsFolderPath: string | undefined;
    };
    General: {
        EnableHotReloadSystem: '1' | '0';

        /**
         * Whether the cache system for AOBs will be used.
         * Default: 1
         */
        UseCache: '1' | '0';

        /**
         * Whether caches will be invalidated if ue4ss.dll has changed
         * Default: 1
         */
        InvalidateCacheIfDLLDiffers: '1' | '0';

        /**
         * The number of seconds the scanner will scan for before giving up
         * Default: 30
         */
        SecondsToScanBeforeGivingUp: number;

        /**
         * Whether to create UObject listeners in GUObjectArray to create a fast cache for use instead of iterating GUObjectArray.
         * Setting this to false can help if you're experiencing a crash on startup.
         * Default: 1
         */
        bUseUObjectArrayCache: '1' | '0';
    };
    EngineVersionOverride: {
        MajorVersion: number | undefined;
        MinorVersion: number | undefined;

        /**
         * True if the game is built as Debug, Development, or Test.
         * Default: 0
         */
        DebugBuild: '1' | '0' | undefined;

        /**
         * Whether to force all assets to be loaded before dumping objects
         * WARNING: Can require multiple gigabytes of extra memory
         * WARNING: Is not stable & will crash the game if you load past the main menu after dumping
         * Default: 0
         */
        LoadAllAssetsBeforeDumpingObjects: '1' | '0';
    };
    CXXHeaderGenerator: {
        /**
         * Whether to property offsets and sizes
         * Default: 1
         */
        DumpOffsetsAndSizes: '1' | '0';

        /**
         * Whether memory layouts of classes and structs should be accurate
         * This must be set to true, if you want to use the generated headers in an actual C++ project
         * When set to false, padding member variables will not be generated
         * NOTE: A VALUE OF true HAS NO PURPOSE YET! MEMORY LAYOUT IS NOT ACCURATE EITHER WAY!
         * Default: 1
         */
        KeepMemoryLayout: '1' | '0';

        /**
         * Whether to force all assets to be loaded before generating headers
         * WARNING: Can require multiple gigabytes of extra memory
         * WARNING: Is not stable & will crash the game if you load past the main menu after dumping
         * Default: 0
         */
        LoadAllAssetsBeforeGeneratingCXXHeaders: '1' | '0';
    };
    UHTHeaderGenerator: {
        /**
         * Whether to skip generating packages that belong to the engine
         * Some games make alterations to the engine and for those games you might want to set this to 0
         * Default: 0
         */
        IgnoreAllCoreEngineModules: '1' | '0';

        /**
         * Whether to skip generating the "Engine" and "CoreUObject" packages
         * Default: 0
         */
        IgnoreEngineAndCoreUObject: '1' | '0';

        /**
         * Whether to force all UFUNCTION macros to have "BlueprintCallable"
         * Note: This will cause some errors in the generated headers that you will need to manually fix
         * Default: 1
         */
        MakeAllFunctionsBlueprintCallable: '1' | '0';

        /**
         * Whether to force all UPROPERTY macros to have "BlueprintReadWrite"
         * Also forces all UPROPERTY macros to have "meta=(AllowPrivateAccess=true)"
         * Default: 1
         */
        MakeAllPropertyBlueprintsReadWrite: '1' | '0';

        /**
         * Whether to force UENUM macros on enums to have 'BlueprintType' if the underlying type was implicit or uint8
         * Note: This also forces the underlying type to be uint8 where the type would otherwise be implicit
         * Default: 1
         */
        MakeEnumClassesBlueprintType: '1' | '0';

        /**
         * Whether to force "Config = Engine" on all UCLASS macros that use either one of:
         * "DefaultConfig", "GlobalUserConfig" or "ProjectUserConfig"
         * Default: 1
         */
        MakeAllConfigsEngineConfig: '1' | '0';
    };
    Debug: {
        /**
         * Whether to enable the external UE4SS debug console.
         */
        ConsoleEnabled: '1' | '0';
        GuiConsoleEnabled: '1' | '0';
        GuiConsoleVisible: '1' | '0';

        /**
         * Multiplier for Font Size within the Debug Gui
         * Default: 1
         */
        GuiConsoleFontScaling: number;

        /**
         * Default: ExternalThread
         * Valid values (case-insensitive): dx11, d3d11, opengl
         * Default: opengl
         */
        GraphicsAPI: 'dx11' | 'd3d11' | 'opengl';

        /**
         * The method with which the GUI will be rendered.
         * Valid values (case-insensitive):
         * ExternalThread: A separate thread will be used.
         * EngineTick: The UEngine::Tick function will be used.
         * GameViewportClientTick: The UGameViewportClient::Tick function will be used.
         * Default: ExternalThread
         */
        RenderMode: 'ExternalThread' | 'EngineTick' | 'GameViewportClientTick';
    };
    Threads: {
        /**
         * The number of threads that the sig scanner will use (not real cpu threads, can be over your physical & hyperthreading max)
         * If the game is modular then multi-threading will always be off regardless of the settings in this file
         * Min: 0
         * Max: 4294967295
         * Default: 8
         */
        SigScannerNumThreads: number;

        /**
         * The minimum size that a module has to be in order for multi-threading to be enabled
         * This should be large enough so that the cost of creating threads won't out-weigh the speed gained from scanning in multiple threads
         * Min: 0
         * Max: 4294967295
         * Default: 16777216
         */
        SigScannerMultithreadingModuleSizeThreshold: number;
    };
    Memory: {
        /**
         * The maximum memory usage (in percentage, see Task Manager %) allowed before asset loading (when LoadAllAssetsBefore* is 1) cannot happen.
         * Once this percentage is reached, the asset loader will stop loading and whatever operation was in progress (object dump, or cxx generator) will continue.
         * Default: 85
         */
        MaxMemoryUsageDuringAssetLoading: number;
    };
    Hooks: {
        HookProcessInternal: '1' | '0';
        HookProcessLocalScriptFunction: '1' | '0';
        HookInitGameState: '1' | '0';
        HookLoadMap: '1' | '0';
        HookCallFunctionByNameWithArguments: '1' | '0';
        HookBeginPlay: '1' | '0';
        HookLocalPlayerExec: '1' | '0';
        HookAActorTick: '1' | '0';
        HookEngineTick: '1' | '0';
        HookGameViewportClientTick: '1' | '0';
        FExecVTableOffsetInLocalPlayer: number;
    };
    CrashDump: {
        EnableDumping: '1' | '0';
        FullMemoryDump: '1' | '0';
    };
    ExperimentalFeatures: {
        /** Only enable these features if you know what you are doing. */
        GUIUFunctionCaller: '1' | '0';
    };
};

export declare type Ue4ssSettingsFlat = {
    [setting in Paths<Ue4ssSettings, { leavesOnly: true }>]: Get<Ue4ssSettings, setting>;
};

export declare interface KnownModLoader {
    version: string;
    zip?: string;
    required: boolean;
    patches: Record<string, string>[];
    settings: Partial<Ue4ssSettingsFlat>;
}
export declare interface GamePlatform {
    id: string | null;
    root: string;
    app: string;
    url?: boolean;
    match?: RegExp | null;
}
export declare type GamePlatforms = 'steam' | 'epic' | 'xbox';
export declare type ErroredGamePlatforms = '{invalid-path}' | '{UNKNOWN}';
export declare type GamePlatformModLoaderData = { [key: string]: { provider: string; id: string } | KnownModLoader } & {
    readonly ue4ss: KnownModLoader;
};
export declare type GamePlatformData = { [key in GamePlatforms]?: GamePlatform | undefined } & {
    readonly modloader?: GamePlatformModLoaderData;
};
export declare type LaunchTypes = 'demo' | 'game' | 'server';
export declare interface GameMap {
    /** only shown in dev mode */
    is_hidden?: boolean;
    providers: {
        nexus: string;
        [key: string]: string;
    };
    platforms: { [key in LaunchTypes]?: GamePlatformData };
}
export declare type GameMaps = {
    [game in Games]?: GameMap;
};

export declare interface GamePathData {
    id: Games;
    type: GamePlatforms;
    path: string;
    has_exe: boolean;
    exe_path: string;
    pak_path: string;
    has_ue4ss: boolean;
    ue4ss_path: string;
    ue4ss_root: string;
    content_path: string;
    launch_type: LaunchTypes;
    map_data: GameMap;
    unreal_root: string;
    // nexus_slug,
}

/** @type {Record<string, Record<string, string>>} */
const KNOWN_PATCHES: Record<string, Record<string, string>> = {
    palworld_server: {
        'Pal/Binaries/Win64/Mods/BPModLoaderMod/Scripts/main.lua':
            'https://raw.githubusercontent.com/Okaetsu/RE-UE4SS/refs/heads/logicmod-temp-fix/assets/Mods/BPModLoaderMod/Scripts/main.lua',
    },
};

/** @type {Record<string, Partial<Ue4ssSettings>>} */
const UE4SS_SETTINGS_PRESETS: Record<string, Partial<Ue4ssSettingsFlat>> = {
    palworld: {
        'General.bUseUObjectArrayCache': '0',
    },
};

/** @type {Record<string, KnownModLoader>} */
export const KNOWN_MODLOADERS: Record<string, KnownModLoader> = {
    required_ue4ss: { version: 'v3.0.1', required: true, patches: [], settings: {} },
    optional_ue4ss: { version: 'v3.0.1', required: false, patches: [], settings: {} },
    experimental_ue4ss: {
        version: 'experimental-latest',
        zip: 'UE4SS_v3.0.1-420-g8e08d13.zip',
        required: false,
        patches: [],
        settings: {},
    },
};

// FORMAT:
// "generic": {
//     is_hidden: true, // only shown in dev mode
//     providers: { // list of mod store providers
//         nexus: "providerslug",
//         other: "otherslug"
//     },
//     platforms: { // list of game store platforms
//         game: {  // game store ids for each platform the main game is available on
//             steam: {id: "1234567", root: "UEProjectRoot", app: "AppExeName", url: true}, // url=true to open game using steam appid url
//             epic: undefined,
//             xbox: undefined,
//             modloader: { // list of compatible modloaders to use with the game
//                 ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
//                 other: {provider: "other", id: "1234567"} // use other mod loader from provider
//             }
//         },
//         server: { // dedicated server store ids for each platform the server is available on
//             steam: {id: "7654321", root: "UEProjectRoot", app: "ServerExeName"},
//             epic: undefined,
//             xbox: undefined,
//             mod: { // community mod to create/host dedicated servers
//                 provider: undefined,
//                 id: undefined
//             },
//             modloader: { // list of compatible modloaders to use with the game SERVER
//                 ue4ss: {version: "3.0.1", patches: []}, // use UE4SS mod loader
//                 other: {provider: "other", id: "1234567"} // use other mod loader from provider
//             }
//         },
//     },
// },

/** @type {GameMap} */
const STELLARBLADE: GameMap = {
    providers: {
        nexus: 'stellarblade',
    },
    platforms: {
        demo: {
            steam: { id: '3564860', root: 'SB', app: 'SB', match: /\/StellarBladeDemo/i, url: true },
            // modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
        },
        game: {
            steam: { id: '3489700', root: 'SB', app: 'SB', url: true },
            // modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
        },
    },
} as const;

// const STELLARBLADEDEMO = { ...STELLARBLADE };
// STELLARBLADEDEMO.platforms.game.steam.id = "3564860";//"1294088";

/** @type {GameMap} */
const PALWORLD: GameMap = {
    providers: {
        nexus: 'palworld',
    },
    platforms: {
        game: {
            steam: { id: '1623730', root: 'Pal', app: 'Palworld' },
            xbox: { id: null, root: 'Pal', app: 'gamelaunchhelper' },
            modloader: {
                ue4ss: {
                    ...KNOWN_MODLOADERS['required_ue4ss'],
                    settings: UE4SS_SETTINGS_PRESETS['palworld']!,
                } as KnownModLoader,
            },
        },
        server: {
            steam: { id: '2394010', root: 'PalServer', app: 'PalServer' },
            modloader: {
                ue4ss: {
                    ...KNOWN_MODLOADERS['required_ue4ss']!,
                    patches: [KNOWN_PATCHES['palworld_server']!],
                    settings: UE4SS_SETTINGS_PRESETS['palworld']!,
                },
            },
        },
    },
} as const;

/** @type {GameMap} */
const FF7REMAKE: GameMap = {
    providers: {
        nexus: 'finalfantasy7remake',
    },
    platforms: {
        game: {
            steam: { id: '1462040', root: 'End', app: 'ff7remake', url: true },
            // modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
        },
    },
} as const;

/** @type {GameMap} */
const FF7REBIRTH: GameMap = {
    providers: {
        nexus: 'finalfantasy7rebirth',
    },
    platforms: {
        game: {
            steam: { id: '2909400', root: 'End', app: 'ff7rebirth', url: true },
            // modloader: {ue4ss: KNOWN_MODLOADERS.optional_ue4ss}
        },
    },
} as const;

/** @type {GameMap} */
const HOGWARTSLEGACY: GameMap = {
    providers: {
        nexus: 'hogwartslegacy',
    },
    platforms: {
        game: {
            steam: { id: '1554650', root: 'Phoenix', app: 'HogwartsLegacy' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

/** @type {GameMap} */
const BLACKMYTHWUKONG: GameMap = {
    providers: {
        nexus: 'blackmythwukong',
    },
    platforms: {
        game: {
            steam: { id: '2358720', root: 'b1', app: 'b1' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

/** @type {GameMap} */
const LOCKDOWNPROTOCOL: GameMap = {
    providers: {
        nexus: 'lockdownprotocol',
    },
    platforms: {
        game: {
            steam: { id: '1683320', root: 'LockdownProtocol', app: 'LockdownProtocol' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

/** @type {GameMap} */
const TEKKEN8: GameMap = {
    providers: {
        nexus: 'tekken8',
    },
    platforms: {
        game: {
            steam: { id: '2385860', root: 'Polaris', app: 'Polaris-Win64-Shipping' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

/** @type {GameMap} */
const ORCSMUSTDIE3: GameMap = {
    providers: {
        nexus: 'orcsmustdie3',
    },
    platforms: {
        game: {
            steam: { id: '1029890', root: 'OMD', app: 'Orcs Must Die! 3' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

/** @type {GameMap} */
const ORCSMUSTDIEDEATHTRAP: GameMap = {
    providers: {
        nexus: 'orcsmustdiedeathtrap',
    },
    platforms: {
        game: {
            steam: { id: '2273980', root: 'OMD', app: 'OMD-Win64-Shipping' },
            modloader: { ue4ss: KNOWN_MODLOADERS['optional_ue4ss']! },
        },
    },
} as const;

// /** @type {GameMap} */
// const SATISFACTORY = {
//     is_hidden: true,
//     providers: {
//         nexus: 'satisfactory',
//     },
//     platforms: {
//         game: {
//             steam: { id: '526870', root: 'FactoryGame', app: 'FactoryGameSteam' },
//             modloader: { ue4ss: KNOWN_MODLOADERS.optional_ue4ss },
//         },
//     },
// };

/** @type {GameMaps} */
const gameMaps: GameMaps = {
    palworld: PALWORLD,
    ff7remake: FF7REMAKE,
    ff7rebirth: FF7REBIRTH,
    'hogwarts-legacy': HOGWARTSLEGACY,
    'black-myth-wukong': BLACKMYTHWUKONG,
    'lockdown-protocol': LOCKDOWNPROTOCOL,
    'orcs-must-die-3': ORCSMUSTDIE3,
    'orcs-must-die-deathtrap': ORCSMUSTDIEDEATHTRAP,
    // "satisfactory": SATISFACTORY,
    'stellar-blade': STELLARBLADE,
    // "stellar-blade-demo": STELLARBLADEDEMO,
    tekken8: TEKKEN8,
} as const;

export default gameMaps;
