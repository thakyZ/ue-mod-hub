declare module '@locales/*-dektionary.json' {
    import type { Games } from '@main/config';
    import type { Ue4ssSettings } from '@main/dek/game-map';

    export declare type OptionNames =
        | 'show-api-key'
        | 'auto-boot'
        | 'auto-tiny'
        | 'tiny-tray'
        | 'theme-color'
        | 'theme-image'
        | 'theme-opacity'
        | 'language'
        | 'nxm-links'
        | 'allow-rpc'
        | 'do-update';

    export declare type SetUpPageNames =
        | 'ready'
        | 'need-cache'
        | 'need-ue4ss'
        | 'need-game'
        | 'need-apik'
        | 'invalid-game';

    export declare type Locale = {
        app: {
            brandname: string;
            version: `v${string}`;
            devname: string;
        };
        common: {
            loading: string;
            toggle: [string, string];
            warning: string;
            error: string;
            nexus: string;
            nexusKeyIsValid: string;
            nexusKeyIsPremium: string;
            'select-game': string;
            'open-link': string;
            'no-info': string;
            'can-update': string;
            suggested: string;
            installed: string;
            downloaded: string;
            archived: string;
            latest: string;
            required: string;
            confirm: string;
            cancel: string;
            note: string;
            filetree: string;
            'app-types': {
                demo: string;
                game: string;
                server: string;
            };
        };
        games: {
            generic: Locale['games']['generic-online'] & {
                'theme-opacities'?: [string, string, string];
            };
            'generic-online': {
                name: string;
                info: [string, string, string];
            };
        } & {
            [game in Games]?: Locale['games']['generic'];
        };
        modals: {
            'nxm-link': {
                head: string;
                info: string;
                warn: string;
            };
            'check-mods': {
                head: string;
                update: string;
                install: string;
                validate: string;
                'copy-json': string;
                'save-json': string;
                'load-json': string;
            };
            'load-mods': {
                head: string;
                help: string;
                load: string;
            };
            'play-vanilla': {
                head: string;
                info: string;
                warn: string;
            };
            'mod-table': {
                name: string;
                author: string;
                version: string;
                modids: string;
                status: string;
            };
            'mod-details': {
                tabs: [string, string];
                'view-page': string;
                'file-info': string;
                'file-version': `v${string} - ${string}`;
                'show-archive': string;
                remove: string;
                uninstall: string;
                download: string;
                popups: {
                    'view-tree': string;
                    'view-scan': string;
                    uninstall: string;
                    download: string;
                    install: string;
                };
            };
            'server-details': {
                tabs: [string, string, string];
                join: string;
                'mods-required': string;
                'pass-required': string;
                'join-discord': string;
                'install-mods': string;
                'install-note': string;
            };
            'game-config': {
                head: string;
                tabs: [string, string];
                'game-path': string;
                'root-game-folder': string;
                'game-path-desc': string;
                'ue4ss-path': string;
                'ue4ss-path-desc': string;
            };
            modloader: {
                'installing-ue4ss': string;
            };
            'local-mod': {
                head: string;
                info: string;
                select: string;
                install: string;
            };
        };
        '#updater': {
            starting: string;
            checking: string;
            current: string;
            available: string;
            preparing: string;
            downloading: string;
            error: string;
            install: string;
        };
        '#footer': {
            'hover-nexus-api': string;
            'hover-users-api': string;
            'users-today': string;
        };
        '/play': {
            name: string;
            desc: string;
            head: string;
            'launch-main': string;
            'launch-info': string;
            'vanilla-main': string;
            'vanilla-info': string;
            'check-mods-main': string;
            'check-mods-info': string;
            'load-mods-main': string;
            'load-mods-info': string;
        };
        '/mods': {
            name: string;
            desc: string;
            head: string;
            tabs: [string, string, string, string, string];
            powered: string;
            'search-placeholder': string;
            'search-button': string;
            'add-local': string;
            'drop-zip': string;
            'install-zip': string;
            'manual-mods': string;
            mod_id: string;
            mod_type: string;
            mod_name: string;
            mod_author: string;
            mod_version: string;
            mod_desc: string;
            thumbnail: string;
            file_id: string;
            'curr-list': string;
            'save-list': string;
        };
        '/servers': {
            name: string;
            desc: string;
            betawarn: string;
            players: string;
            powered: string;
            'list-button': {
                head: string;
                info: string;
                span: string;
            };
        };
        '/about': {
            name: string;
            desc: string;
            tldr: string;
            head: string;
            main: string;
            notice: string;
            'supported-games': string;
            'more-games-soon': string;
            discord: string;
            patreon: string;
            changes: string;
            features: {
                head: string;
                list: string[];
            };
        };
        '/privacy': {
            name: string;
            desc: string;
            tldr: string;
            head: string;
        };
        '/terms': {
            name: string;
            desc: string;
            head: string;
        };
        '/faq': {
            name: string;
            desc: string;
            head: string;
            faqs: { q: string; a: string }[];
        };
        '/logs': {
            name: string;
            desc: string;
            head: string;
            tabs: [string, string];
            words: [string];
            'open-file': string;
        };
        '/settings': {
            name: string;
            desc: string;
            head: string;
            words: string[];
            choices: {
                page: [string, string, string];
                'install-type': [string, string, string];
            };
            inputs: {
                'app-cache-dir': Locale['/settings']['inputs']['nexus-api-key'] & { open: string };
                'nexus-api-key': {
                    name: string;
                    desc: string;
                };
                'game-path': Locale['/settings']['inputs']['nexus-api-key'];
            };
            buttons: {
                'get-api-key': string;
                'edit-ue4ss-settings': string;
                'check-ue4ss-update': string;
                'uninstall-ue4ss': string;
                'download-ue4ss': string;
                'select-game-path': string;
                'unmanage-game': string;
                'play-game': string;
                'add-mods': string;
            };
            options: {
                [key in OptionNames]: Locale['/settings']['inputs']['nexus-api-key'];
            };
            setup: {
                [key in SetUpPageNames]: {
                    head: string;
                    body: string[];
                };
            };
            'manage-game': {
                head: string;
                info: string;
                span: string;
            };
        };
        'ue4ss-settings': {
            [key in keyof Ue4ssSettings]: Locale['/settings']['inputs']['nexus-api-key'];
        };
        '/setup': {
            name: string;
        };
    };
    const _default: Locale;
    export default _default;
}

declare module '@locales/*-ue4ss.json' {
    declare type LocaleEntry = {
        name: string;
        desc: string;
    };
    export declare type Locale = {
        modal: {
            header: string;
            'save-changes': string;
            'console-choices': [string, string, string];
            'guiconsole-choices': [string, string, string];
            'show-all-settings': string;
            'show-all-help': string;
            'show-console-name': string;
            'show-console-help': string;
            'graphics-api-name': string;
            'graphics-api-help': string;
        };
        Overrides: {
            ModsFolderPath: LocaleEntry;
        };
        General: {
            EnableHotReloadSystem: LocaleEntry;
            UseCache: LocaleEntry;
            InvalidateCacheIfDLLDiffers: LocaleEntry;
            SecondsToScanBeforeGivingUp: LocaleEntry;
            bUseUObjectArrayCache: LocaleEntry;
        };
        EngineVersionOverride: {
            MajorVersion: LocaleEntry;
            MinorVersion: LocaleEntry;
        };
        ObjectDumper: {
            LoadAllAssetsBeforeDumpingObjects: LocaleEntry;
        };
        CXXHeaderGenerator: {
            DumpOffsetsAndSizes: LocaleEntry;
            KeepMemoryLayout: LocaleEntry;
            LoadAllAssetsBeforeGeneratingCXXHeaders: LocaleEntry;
        };
        UHTHeaderGenerator: {
            IgnoreAllCoreEngineModules: LocaleEntry;
            IgnoreEngineAndCoreUObject: LocaleEntry;
            MakeAllFunctionsBlueprintCallable: LocaleEntry;
            MakeAllPropertyBlueprintsReadWrite: LocaleEntry;
            MakeEnumClassesBlueprintType: LocaleEntry;
            MakeAllConfigsEngineConfig: LocaleEntry;
        };
        Debug: {
            ConsoleEnabled: LocaleEntry;
            GuiConsoleEnabled: LocaleEntry;
            GuiConsoleVisible: LocaleEntry;
            GuiConsoleFontScaling: LocaleEntry;
            GraphicsAPI: LocaleEntry;
            LiveViewObjectsPerGroup: LocaleEntry;
        };
        Threads: {
            SigScannerNumThreads: LocaleEntry;
            SigScannerMultithreadingModuleSizeThreshold: LocaleEntry;
        };
        Memory: {
            MaxMemoryUsageDuringAssetLoading: LocaleEntry;
        };
        Hooks: {
            HookProcessInternal: LocaleEntry;
            HookProcessLocalScriptFunction: LocaleEntry;
            HookInitGameState: LocaleEntry;
            HookCallFunctionByNameWithArguments: LocaleEntry;
            HookLocalPlayerExec: LocaleEntry;
            FExecVTableOffsetInLocalPlayer: LocaleEntry;
        };
        CrashDump: {
            EnableDumping: LocaleEntry;
            FullMemoryDump: LocaleEntry;
        };
        ExperimentalFeatures: {
            GUIUFunctionCaller: LocaleEntry;
        };
    };
    export declare type LocaleEntry = Locale['/settings']['inputs']['nexus-api-key'];
    export declare type BaseGameLocalization = Locale['games']['generic-online'];
    export declare type GenericGameLocalization = Exclude<Locale['games']['generic'], BaseGameLocalization>;
    const _default: Locale;
    export default _default;
}
