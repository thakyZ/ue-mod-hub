import type { Stats } from 'node:fs';

import type { ErroredGamePlatforms, GamePathData } from '@main/dek/game-map';
import type { IFileInfo as NexusIFileInfo, IMod as NexusIMod, IModInfo as NexusIModInfo } from '@nexusmods/nexus-api';

// // prettier-ignore
// export declare interface IModInfo extends Omit<NexusIModInfo, 'description' | 'mod_id' | 'name'>, Omit<NexusIFileInfo, 'file_id' | 'name'> {
//     root: string;
//     version: string;
//     file_id: number | 'local';
//     file_name: string;
//     entries: string[];
//     mod_id?: string;
//     installed?: boolean;
//     downloaded?: boolean;
//     latest?: boolean;
//     name?: string;
// }

export declare interface IModConfig {
    name?: string;
    root: string;
    version: string;
    file_name: string;
    entries: string[];
    file_id: number | 'local';
    mod_id?: number | string | undefined;
}

export declare interface ModConfig extends IModConfig {
    file_id: number;
    mod_id: number;
}

export declare interface LocalModConfig extends IModConfig {
    file_id: 'local';
    local: true;
    author: string;
    description: string;
    thumbnail: string;
}

export declare interface SavedConfig {
    root?: string;
    saved_config?: Pick<ModConfig, 'file_id' | 'mod_id' | 'file_name'> | undefined;
    installed?: boolean;
    file_id?: string | number;
    file_name?: string | number;
    mod_id?: string | number | undefined;
    latest?: boolean;
    downloaded?: boolean;
    local?: boolean;
    thumbnail?: string;
    picture?: string | undefined;
    ad?: boolean;
}

export declare type IModInfoWithSavedConfig = Pick<
    Partial<NexusIModInfo>,
    | 'name'
    | 'available'
    | 'author'
    | 'description'
    | 'picture_url'
    | 'status'
    | 'uploaded_by'
    | 'uploaded_users_profile_url'
> &
    SavedConfig &
    Pick<Partial<IModConfig>, 'entries'> &
    Pick<
        Partial<NexusIMod>,
        | 'category'
        | 'game'
        | 'gameId'
        | 'id'
        | 'ipAddress'
        | 'modCategory'
        | 'modId'
        | 'pictureUrl'
        | 'summary'
        | 'trackingData'
        | 'uid'
        | 'uploader'
    > &
    Pick<
        Partial<NexusIFileInfo>,
        | 'category_id'
        | 'category_name'
        | 'changelog_html'
        | 'content_preview_link'
        | 'version'
        | 'size'
        | 'size_kb'
        | 'file_name'
        | 'uploaded_timestamp'
        | 'uploaded_time'
        | 'mod_version'
        | 'external_virus_scan_url'
        | 'is_primary'
    >;

export declare interface PalHubConfig {
    mods: Record<string, ModConfig>;
    local_mods: Record<string, LocalModConfig>;
}

// prettier-ignore
export declare type AddModDataToJsonExtraProps<TScope extends keyof PalHubConfig, TIModInfo extends IModInfoWithSavedConfig> =
    TScope extends 'mods' ? Partial<TIModInfo> :
    TScope extends 'local_mods' ? Partial<TIModInfo> :
    never;

// prettier-ignore
export declare type PalHubModConfigMap<TScope extends keyof PalHubConfig> =
    TScope extends 'mods' ? ModConfig :
    TScope extends 'local_mods' ? LocalModConfig :
    never;

export declare interface PalHubCacheFileConfig {
    ver: string;
    zip: string;
}

export declare type PalHubCacheModConfig = Record<string, PalHubCacheFileConfig>;

export declare type PalHubCacheGameConfig = Record<string, PalHubCacheModConfig>;

export declare type PalHubCacheConfig = Record<string, PalHubCacheGameConfig>;

export declare type ValidateGamePathReturnType = GamePathData | { type: ErroredGamePlatforms };

export declare interface CheckedPakForLogicMod {
    found: boolean;
    paktype?: string;
    fileName?: string;
    assetName?: string;
}

export declare interface ChangeDataEvent {
    path: string;
    curr: Stats;
    prev?: Stats | undefined;
}

export declare interface DownloadFileEvent {
    filename: string;
    outputPath: string;
    percentage: string;
}

export declare interface DownloadModFileEvent {
    mod_id: number | undefined;
    file_id: number;
    percentage: string;
}

export declare interface InstallModFileEvent {
    install_path: string;
    name: string | undefined;
    version: string | undefined;
    mod_id: number | string | undefined;
    file_id: IModInfoWithSavedConfig['file_id'];
    entries: string[];
}

export const EVENTS_TO_HANDLE = [
    'watched-file-change',
    'download-file',
    'download-mod-file',
    'install-mod-file',
    'extract-mod-file',
    'ue4ss-process',
] as const;

type EventsToHandle = (typeof EVENTS_TO_HANDLE)[number];

// prettier-ignore
export declare type Ue4ssProcessState =
    | 'uninstalled'
    | 'delete'
    | 'error'
    | 'download'
    | 'complete'
    | 'extract';

export declare interface Ue4ssProcessUninstalled {
    // TODO: figure out typing information.
    _: unknown;
}

export declare interface Ue4ssProcessDelete {
    // TODO: figure out typing information.
    _: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export declare type Ue4ssProcessError = Error | unknown | null;

export declare interface Ue4ssProcessDownload {
    filename: string;
    outputPath: string;
    percentage: string;
}

export declare interface Ue4ssProcessComplete {
    success: boolean;
}

export declare interface Ue4ssProcessExtract {
    // TODO: figure out typing information.
    _: unknown;
}

// prettier-ignore
export declare type Ue4ssProcess<T extends Ue4ssProcessState> = T extends 'uninstalled'
    ? Ue4ssProcessUninstalled
    : T extends 'delete'
    ? Ue4ssProcessDelete
    : T extends 'error'
    ? Ue4ssProcessError
    : T extends 'download'
    ? Ue4ssProcessDownload
    : T extends 'complete'
    ? Ue4ssProcessComplete
    : T extends 'extract'
    ? Ue4ssProcessExtract
    : never;

export type Ue4ssProcessTuple<T extends Ue4ssProcessState = Ue4ssProcessState> = [T, Ue4ssProcess<T>];

export interface EventsToHandleMap extends Record<EventsToHandle, unknown[]> {
    'watched-file-change': [ChangeDataEvent, string];
    'download-file': [DownloadFileEvent];
    'download-mod-file': [DownloadModFileEvent];
    'install-mod-file': [InstallModFileEvent];
    'ue4ss-process': Ue4ssProcessTuple;
}

export declare interface DownloadCallbacks {
    onProgress: ({ filename, outputPath, percentage }: Ue4ssProcessDownload) => void;
    onError: ({ filename, outputPath, error }: { filename: string; outputPath: string; error: Error }) => void;
    onFinish: ({ filename, outputPath }: { filename: string; outputPath: string }) => void;
}

export declare interface ReleaseDataAssets {
    name: string;
    browser_download_url: string;
}

export declare interface ReleaseData {
    tag_name: string;
    assets: ReleaseDataAssets[];
}

export declare interface FileInfo extends File {
    install_path: string;
    ignored_files: string[];
}

export declare interface RemoveModDataFromJsonReturn {
    root: string;
    entries: string[];
}
