import type {
    AppIpcBinder,
    LoggerBinder,
    NexusBinder,
    PalHubBinder,
    ServerCacheBinder,
    UStoreBinder,
} from '@main/preload';

declare global {
    interface Window {
        ipc: AppIpcBinder;
        logger: LoggerBinder;
        nexus: NexusBinder;
        palhub: PalHubBinder;
        serverCache: ServerCacheBinder;
        uStore: UStoreBinder;
    }
}
