import type {
    AppIpcBinder,
    LoggerBinder,
    NexusBinder,
    PalHubBinder,
    ServerCacheBinder,
    UStoreBinder,
} from '@main/preload';
import type { ValueOf } from 'type-fest'

declare global {
    interface Window {
        ipc: AppIpcBinder;
        logger: LoggerBinder;
        nexus: NexusBinder;
        palhub: PalHubBinder;
        serverCache: ServerCacheBinder;
        uStore: UStoreBinder;
    }
    interface Array<T> {
        // sort(): Array<T>;
    }
    interface ObjectConstructor {
        keys<T, TKey extends keyof T = keyof T>(obj: T): Array<TKey>;
        values<T, TValue extends ValueOf<T> = ValueOf<T>>(obj: T): Array<TValue>;
        entries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(obj: T): Array<[key: TKey, value: TValue]>;
        fromEntries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(obj: Array<[key: TKey, value: TValue]>): T;
    }
}
