declare module '@typed/vdf' {
    /** cSpell:words dlcappid, optionaldlc, schinese */

    /**
     * Type for the {@link LibraryFoldersVdf.libraryfolders} property
     */
    export declare type LibraryFolders = Record<`${number}`, LibraryFolderVdf>;

    /**
     * Type for the {@link LibraryFoldersVdf.libraryfolders} property's values.
     */
    export declare interface LibraryFolderVdf {
        /**
         * Specifies the path to the Steam library folder.
         */
        path: string;

        /**
         * Specifies the display name of the Steam library folder.
         * @remarks Typically a blank string
         * @default ''
         */
        label: string;

        /**
         * Specifies the unique id of the Steam library folder.
         */
        contentid: `${number}`;

        /**
         * Specifies the total size of the drive that the Steam library folder is on.
         */
        totalsize: `${number}`;

        /**
         * Specifies the number of bytes that was cleaned when a Steam app was last updated.
         * @remarks Unsure if this is the actual use of this property.
         */
        update_clean_bytes_tally: `${number}`;

        /**
         * Specifies the last time the Steam library folder was verified as an unix timestamp in seconds.
         */
        time_last_update_verified?: `${number}`;

        /**
         * Specifies the last time the Steam library folder was corrupted as an unix timestamp in seconds.
         */
        time_last_update_corruption?: `${number}`;

        /**
         * A record of the Steam apps in the Steam library folder.
         * @remarks The key is the Steam app identification number, unknown what the value is.
         */
        apps: { [key: `${number}`]: `${number}` };
    }

    /**
     * Contents of a `SteamApps\\libraryfolders.vdf` file.
     * @remarks
     * NOTE: This is not fully complete and may have more properties.
     *       I only went off what was on GitHub
     */
    export declare interface LibraryFoldersVdf {
        /**
         * A record of index and {@link LibraryFolderVdf} of the Steam library folders config.
         */
        libraryfolders: LibraryFolders;
    }

    /**
     * A constant array to simplify making the {@link Language} type.
     */
    export declare const LANGUAGE = ['english', 'schinese', 'german', 'russian'] as const;

    /**
     * Supported language codes of Steam games
     * @remarks not a complete list yet.
     */
    export declare type Language = (typeof LANGUAGE)[number];

    /**
     * Supported platforms of Steam games.
     * @remarks Unknown if `mac` is a valid value
     */
    export declare type Platforms = 'linux' | 'mac' | 'windows' | '';

    /**
     * Type for the {@link AppStateVdf.UserConfig} and {@link AppStateVdf.MountedConfig} property
     */
    export declare interface AppStateConfig {
        /**
         * An optional property that specifies the name of the mod for this Steam app.
         */
        mod?: string;

        /**
         * An optional property that specifies the installed language for this Steam app.
         */
        language?: Language;

        /**
         * An optional property that specifies the beta key that was supplied by the user for the Steam app.
         */
        betakey?: string;

        /**
         * An optional property that specifies the optional dlc for the Steam app.
         * @remarks may be similar to {@link AppStateConfig.DisabledDLC}
         */
        optionaldlc?: `${number}`;

        /**
         * An optional property that specifies the disabled dlc of the Steam app.
         * A comma seperated `${number}` type
         * @example
         * `${number},${number}`
         * @remarks
         * Since it is impossible to make a recursive reference type in TypeScript we'll just use a `string` type.
         */
        DisabledDLC?: string;

        /**
         * An optional property that specifies the destination platform to override to.
         */
        platform_override_dest?: Platforms;

        /**
         * An optional property that specifies the source platform to override from.
         */
        platform_override_source?: Platforms;
    }

    /**
     * Specifies the universe the Steam app is from.
     * @remarks Unknown what the values mean, they seem to always be 1(?)
     */
    export declare type Universe = '0' | '1';

    /**
     * Specifies the update result of the Steam app.
     * @remarks Unknown what the values mean, they seem to always be 0(?)
     */
    export declare type UpdateResult = '0' | '1';

    /**
     * Specifies the download type of the Steam app.
     * @remarks Unknown what the values mean, they seem to always be 3(?)
     */
    export declare type DownloadType = '0' | '1' | '2' | '3';

    /**
     * Specifies the auto update behavior of the Steam app.
     * @remarks
     * 0: 'Use Global setting'
     *
     * 1: 'Wait until I launch the game'
     *
     * 2: 'Immediately download updates'
     *
     * 3: 'Let steam decide when to update'
     */
    export declare type AutoUpdateBehavior = '0' | '1' | '2' | '3';

    /**
     * Specifies the option to allow other downloads while running the Steam app.
     * @remarks
     * 0: 'Use Global setting'
     *
     * 1: 'Always allow background downloads'
     *
     * 2: 'Never allow background downloads'
     */
    export declare type AllowOtherDownloadsWhileRunning = '0' | '1' | '2';

    /**
     * Specifies if the application has a scheduled auto update.
     * @remarks
     * Unknown what the values mean, they seem to always be 0(?)
     */
    export declare type ScheduledAutoUpdate = '0' | '1';

    /**
     * Type for the {@link AppStateAcf.InstalledDepots} property.
     */
    export declare interface InstalledDepot {
        /**
         * Specifies the manifest id of the depot.
         */
        manifest: `${number}`;

        /**
         * Specifies a number of the depot size in bytes.
         */
        size?: `${number}`;

        /**
         * An optional value that specifies a number of the DLC app identification number.
         */
        dlcappid?: `${number}`;
    }

    /**
     * Type for the {@link AppManifestAcf.AppState} property.
     */
    export declare interface AppStateAcf {
        /**
         * Specifies the Steam app identification number
         */
        appid: `${number}`;

        /**
         * Specifies the universe the Steam app is from.
         */
        universe: Universe;

        /**
         * Specifies the path to the launcher of the Steam app.
         * @remarks Seems to be always "C:\\Program Files (x86)\\Steam\\steam.exe" or where ever steam is installed.
         */
        LauncherPath: string;

        /**
         * Specifies the display name of the Steam app.
         */
        name: string;

        /**
         * Specifies the flags of the state of this Steam app.
         * @remarks More than likely a flag enum. Values unknown, commonly "4".
         */
        StateFlags: `${number}`;

        /**
         * Specifies the installed directory name in the `SteamApps/common` directory.
         */
        installdir: string;

        /**
         * Specifies the last updated time of the Steam app as an Unix timestamp in seconds.
         */
        LastUpdated: `${number}`;

        /**
         * Specifies the last played time of the Steam app as an Unix timestamp in seconds.
         */
        LastPlayed: `${number}`;

        /**
         * Specifies a number representing the Steam app size in bytes.
         */
        SizeOnDisk: `${number}`;

        /**
         * Specifies a number representing the Steam app staging size in bytes.
         */
        StagingSize: `${number}`;

        /**
         * Specifies a number representing the Steam db build id.
         */
        buildid: `${number}`;

        /**
         * Specifies a number representing the Steam user id of the last owner.
         */
        LastOwner: `${number}`;

        /**
         * Specifies the download type of the Steam app.
         */
        DownloadType: DownloadType;

        /**
         * Specifies the update result of the Steam app.
         */
        UpdateResult: UpdateResult;

        /**
         * Specifies a number representing the size of the Steam app left to download in bytes.
         */
        BytesToDownload: `${number}`;

        /**
         * Specifies a number representing the size of the Steam app that has been downloaded in bytes.
         */
        BytesDownloaded: `${number}`;

        /**
         * Specifies a number representing the size of the Steam app that needs to be staged in bytes.
         */
        BytesToStage: `${number}`;

        /**
         * Specifies a number representing the size of the Steam app that has been staged in bytes.
         */
        BytesStaged: `${number}`;

        /**
         * Specifies a number representing the Steam db of the target build id.
         * @see {@link AppStateAcf.buildid}
         */
        TargetBuildID: `${number}`;

        /**
         * Specifies the auto update behavior of the Steam app.
         */
        AutoUpdateBehavior: AutoUpdateBehavior;

        /**
         * Specifies the option to allow other downloads while running the Steam app.
         */
        AllowOtherDownloadsWhileRunning: AllowOtherDownloadsWhileRunning;

        /**
         * Specifies if the application has a scheduled auto update.
         */
        ScheduledAutoUpdate: ScheduledAutoUpdate;

        /**
         * An optional property that specifies a record of installed Steam db depots.
         */
        InstalledDepots?: { [key: `${number}`]: InstalledDepot };

        /**
         * An optional property that specifies a record of shared Steam db depots by identification number.
         */
        SharedDepots?: { [key: `${number}`]: `${number}` };

        /**
         * An optional property that specifies a record of mounter Steam db depots by identification number.
         */
        MountedDepots?: { [key: `${number}`]: `${number}` };

        /**
         * An optional property that specifies the user configuration of the Steam app.
         */
        UserConfig?: AppStateConfig;

        /**
         * An optional property that specifies the mounted configuration of the Steam app.
         */
        MountedConfig?: AppStateConfig;

        /**
         * An optional property that specifies a collection of install scripts based on a DB id, and path.
         * @example
         * "1245621": "Game\\EasyAntiCheat\\install_script.vdf"
         */
        InstallScripts?: { [key: `${number}`]: string };
    }

    /**
     * Contents of a `00000000_appmanifest.acf` file.
     * @remarks
     * NOTE: This is not fully complete and may have more properties.
     *       I only went off what was on GitHub
     */
    export declare interface AppManifestAcf {
        /**
         * The inital key of the app manifest file.
         */
        AppState: AppStateAcf;
    }

    /**
     * Type wrapping of all Steam vdf/acf types.
     */
    export declare type SteamVdfTypes = LibraryFoldersVdf | AppManifestAcf;
}

declare module '@node-steam/vdf' {
    import type { SteamVdfTypes } from '@typed/vdf';

    /**
     * Parses a VDF string and returns an object.
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any
    export function parse<T extends SteamVdfTypes | any = any>(string: string): T;

    /**
     * Dumps an object to a VDF string.
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any
    export function dump<T extends SteamVdfTypes | any = any>(obj: T): string;
}
