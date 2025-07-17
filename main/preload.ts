/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { MainAppIpcActions, RendererAppIpcActions } from '@main/dek/deap';
import type { LogLevelsType } from '@main/dek/logger';
import type { Client } from '@main/dek/palhub';
import type { NexusProperties } from '@main/ipc-handlers/nexus';
import type { PalHubProperties } from '@main/ipc-handlers/palhub';
import type { ServerCacheMethodKey, ServerCacheMethodValue } from '@main/ipc-handlers/server-cache';
import type { UStoreMethodKey, UStoreMethodValue } from '@main/ipc-handlers/ustore';
import type { default as NexusType } from '@nexusmods/nexus-api';
import type { MethodOf2, MethodOf2Alt } from '@typed/common';
import { webUtils } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import type { IpcActionDomain, IpcInvokeAction, IpcInvokeActionDomain, RendererIpcEvent } from 'electron-ipc-extended';
import { RendererIpc } from 'electron-ipc-extended';

const _ipcRenderer: RendererIpc<RendererAppIpcActions, MainAppIpcActions> = new RendererIpc<
    RendererAppIpcActions,
    MainAppIpcActions
>(ipcRenderer, { responseTimeout: 1000 });

// expose the user data (electron-store) API to the renderer process
type UStoreMethodKeyGet = UStoreMethodKey<'get'>;
type UStoreMethodValueGet<TKey extends UStoreMethodKeyGet> = UStoreMethodValue<'get', TKey>;
type UStoreMethodKeySet = UStoreMethodKey<'set'>;
type UStoreMethodValueSet<TKey extends UStoreMethodKeySet> = UStoreMethodValue<'set', TKey>;
type UStoreMethodKeyDelete = UStoreMethodKey<'delete'>;
export declare interface UStoreBinder {
    get<TValue extends UStoreMethodValueGet<TKey>, TKey extends UStoreMethodKeyGet = UStoreMethodKeyGet>(
        key: TKey,
        value?: TValue
    ): Promise<Awaited<TValue>>;
    set<TValue extends UStoreMethodValueSet<TKey>, TKey extends UStoreMethodKeySet = UStoreMethodKeySet>(
        key: TKey,
        value: TValue
    ): Promise<void>;
    delete<TKey extends UStoreMethodKeyDelete = UStoreMethodKeyDelete>(key: NonNullable<TKey>): Promise<void>;
    clear(): Promise<void>;
}

contextBridge.exposeInMainWorld('uStore', {
    async get<TValue extends UStoreMethodValueGet<TKey>, TKey extends UStoreMethodKeyGet = UStoreMethodKeyGet>(
        key: TKey,
        value?: TValue
    ): Promise<Awaited<TValue>> {
        return (await _ipcRenderer.invoke('uStore', 'get', key, value)) as Awaited<TValue>;
    },
    async set<TValue extends UStoreMethodValueSet<TKey>, TKey extends UStoreMethodKeySet = UStoreMethodKeySet>(
        key: TKey,
        value: TValue
    ): Promise<void> {
        return await _ipcRenderer.invoke('uStore', 'set', key, value);
    },
    async delete<TKey extends UStoreMethodKeyDelete = UStoreMethodKeyDelete>(key: NonNullable<TKey>): Promise<void> {
        return await _ipcRenderer.invoke('uStore', 'delete', key);
    },
    async clear(): Promise<void> {
        return await _ipcRenderer.invoke('uStore', 'clear');
    },
} as UStoreBinder);

type ServerCacheMethodKeyGet = ServerCacheMethodKey<'get'>;
type ServerCacheMethodValueGet = ServerCacheMethodValue<'get'>;
type ServerCacheMethodKeySet = ServerCacheMethodKey<'set'>;
type ServerCacheMethodValueSet = ServerCacheMethodValue<'set'>;
type ServerCacheMethodKeyDelete = ServerCacheMethodKey<'delete'>;
export declare interface ServerCacheBinder {
    get<TValue extends ServerCacheMethodValueSet, TKey extends ServerCacheMethodKeyGet = ServerCacheMethodKeyGet>(
        key: NonNullable<TKey>,
        value: TValue
    ): Promise<Awaited<TValue>>;
    set<TValue extends ServerCacheMethodValueSet, TKey extends ServerCacheMethodKeySet = ServerCacheMethodKeySet>(
        key: NonNullable<TKey>,
        value: TValue
    ): Promise<void>;
    delete<TKey extends ServerCacheMethodKeyDelete>(key: NonNullable<TKey>): Promise<void>;
    clear(): Promise<void>;
}

contextBridge.exposeInMainWorld('serverCache', {
    // prettier-ignore
    async get<TValue extends ServerCacheMethodValueGet, TKey extends ServerCacheMethodKeyGet = ServerCacheMethodKeyGet>(key: NonNullable<TKey>, value?: TValue): Promise<TValue> {
        return (await _ipcRenderer.invoke('serverCache', 'get', key, value as undefined)) as TValue;
    },
    // prettier-ignore
    async set<TValue extends ServerCacheMethodValueSet, TKey extends ServerCacheMethodKeySet = ServerCacheMethodKeySet>(key: NonNullable<TKey>, value: TValue): Promise<TValue> {
        return (await _ipcRenderer.invoke('serverCache', 'set', key, value as undefined)) as TValue;
    },
    // prettier-ignore
    async delete<TKey extends ServerCacheMethodKeyDelete>(key: NonNullable<TKey>): Promise<void> {
        return (await _ipcRenderer.invoke('serverCache', 'delete', key)) as void;
    },
    async clear(): Promise<void> {
        return (await _ipcRenderer.invoke('serverCache', 'clear')) as void;
    },
} as ServerCacheBinder);

// prettier-ignore
export declare type NexusBinder = <
    TFuncName extends NexusProperties,
    TFuncValue extends MethodOf2Alt<NexusType, TFuncName> = MethodOf2Alt<NexusType, TFuncName>,
>(
    api_key: string,
    method: TFuncName,
    ...args: Parameters<TFuncValue>
) => Promise<Awaited<ReturnType<TFuncValue>>>;

// expose nexus functionality to renderer process
// prettier-ignore
contextBridge.exposeInMainWorld(
    'nexus',
    (async <TFuncName extends NexusProperties, TFuncValue extends MethodOf2<NexusType, TFuncName> = MethodOf2<NexusType, TFuncName>>(
        api_key: string,
        method: TFuncName,
        ...args: Parameters<TFuncValue>
    ): Promise<Awaited<ReturnType<TFuncValue>>> => {
        return (await _ipcRenderer.invoke('nexus', api_key, method, args)) as Awaited<ReturnType<TFuncValue>>;
    }) as NexusBinder
);

export declare type PalHubBinder = <
    TFuncName extends PalHubProperties,
    TFuncValue extends MethodOf2Alt<typeof Client, TFuncName> = MethodOf2Alt<typeof Client, TFuncName>,
>(
    method: TFuncName,
    ...args: Parameters<TFuncValue>
) => Promise<Awaited<ReturnType<TFuncValue>>>;

// expose main palhub functionality to renderer process
// prettier-ignore
contextBridge.exposeInMainWorld(
    'palhub',
    (async <TFuncName extends PalHubProperties, TFuncValue extends MethodOf2Alt<typeof Client, TFuncName> = MethodOf2Alt<typeof Client, TFuncName>>(
        method: TFuncName,
        ...args: Parameters<TFuncValue>
    ): Promise<Awaited<ReturnType<TFuncValue>>> => {
        return await _ipcRenderer.invoke('palhub', method, args) as Awaited<ReturnType<TFuncValue>>;
    }) as PalHubBinder
);

// expose the logger to the renderer process
const LOG_TYPES: LogLevelsType[] = ['log', 'info', 'http', 'warn', 'error', 'fatal'];
export declare type LoggerBinder = {
    [key in LogLevelsType]: (...args: unknown[]) => Promise<void>;
};
contextBridge.exposeInMainWorld(
    'logger',
    LOG_TYPES.reduce<Partial<LoggerBinder>>(
        (acc: Partial<LoggerBinder>, logtype: LogLevelsType): Partial<LoggerBinder> => {
            return {
                ...acc,
                [logtype]: async (id: string, ...args: unknown[]): Promise<void> => {
                    return await _ipcRenderer.invoke('logger', id, logtype, ...args);
                },
            };
        },
        {}
    ) as LoggerBinder
);

// prettier-ignore
export declare interface AppIpcBinder {
    send<
        Events extends MainAppIpcActions['events'],
        Action extends keyof Events,
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(channel: Action, ...value: Args): void;
    removeListener<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): void;
    removeAllListeners<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
    >(eventName?: EventName): void;
    invoke<
        Commands extends MainAppIpcActions['commands'],
        Command extends Commands extends IpcInvokeActionDomain ? keyof Commands : never,
        Args extends Commands[Command] extends IpcInvokeAction ? Commands[Command]['params'] : unknown[],
        ReturnVal extends Commands[Command] extends IpcInvokeAction ? Commands[Command]['returnVal'] : unknown,
        TReturn extends ReturnVal extends Promise<unknown> ? ReturnVal : Promise<ReturnVal>,
    >(command: Command, ...value: Args): TReturn;
    once<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): void;
    on<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): VoidFunction;
    getPathForFile(path: File): string;
}

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('ipc', {
    send<
        Events extends MainAppIpcActions['events'],
        Action extends keyof Events,
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(channel: Action, ...value: Args): void {
        _ipcRenderer.send(channel.toString(), ...value);
    },
    removeListener<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): void {
        _ipcRenderer.removeListener(eventName, callback);
    },
    removeAllListeners<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
    >(eventName?: EventName): void {
        _ipcRenderer.removeAllListeners(eventName);
    },
    invoke<
        Commands extends MainAppIpcActions['commands'],
        Command extends Commands extends IpcInvokeActionDomain ? keyof Commands : never,
        Args extends Commands[Command] extends IpcInvokeAction ? Commands[Command]['params'] : unknown[],
        ReturnVal extends Commands[Command] extends IpcInvokeAction ? Commands[Command]['returnVal'] : unknown,
        TReturn extends ReturnVal extends Promise<unknown> ? ReturnVal : Promise<ReturnVal>,
    >(command: Command, ...value: Args): TReturn {
        return _ipcRenderer.invoke(command, value) as TReturn;
    },
    once<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): void {
        _ipcRenderer.once(eventName, callback);
    },
    on<
        Events extends MainAppIpcActions['events'],
        EventName extends Events extends IpcActionDomain ? keyof Events : never,
        Args extends Events[EventName] extends unknown[] ? Events[EventName] : unknown[],
    >(eventName: EventName, callback: (event: RendererIpcEvent, ...args: Args) => void): VoidFunction {
        const subscription = (event: RendererIpcEvent, ...args: Args): unknown => callback(event, ...args);
        _ipcRenderer.on(eventName, subscription);
        return (): void => _ipcRenderer.removeListener(eventName, subscription);
    },

    // Expose the webUtils API to getPathForFile in the renderer process
    getPathForFile(path: File): string {
        return webUtils.getPathForFile(path);
    },
} as AppIpcBinder);
