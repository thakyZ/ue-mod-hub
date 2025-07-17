/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import DEAP from "@main/dek/deap";
import type { IpcMainInvokeEvent } from 'electron';
import Store from 'electron-store';

// export default
export declare type ServerPasswordCache = Record<string, string | undefined | null>;

// Create a new instance of electron-store for handling
// user specific data storage.
const serverPasswordCache = new Store<ServerPasswordCache>({ name: '[dek.ue.server.pass]' });

// prettier-ignore
export declare type ServerCacheAction =
    | 'get'
    | 'set'
    | 'delete'
    | 'clear';

export declare type ServerCacheMethodKey<TAction extends ServerCacheAction> = TAction extends 'get'
    ? string
    : TAction extends 'set'
      ? string
      : TAction extends 'delete'
        ? string
        : TAction extends 'clear'
          ? never
          : never;

// prettier-ignore
export declare type ServerCacheMethodValue<
    TAction extends ServerCacheAction
> = 
    TAction extends 'get' ? string | undefined | null :
    TAction extends 'set' ? string | undefined | null :
    TAction extends 'delete' ? never :
    TAction extends 'clear' ? never :
    never;

// prettier-ignore
export declare type ServerCacheMethodReturn<
    TAction extends ServerCacheAction,
    TValue extends ServerCacheMethodValue<TAction>
> = 
    TAction extends 'get' ? TValue :
    TAction extends 'set' ? Promise<void> :
    TAction extends 'delete' ? Promise<void> :
    TAction extends 'clear' ? Promise<void> :
    never;

/**
 * @template {ServerCacheAction} TAction
 * @template {ServerCacheMethodKey<TAction>} TKey
 * @template {ServerCacheMethodValue<TAction, TKey>} TValue
 * @template {ServerCacheMethodReturn<TAction, TKey, TValue>} TReturn
 * @param {IpcMainInvokeEvent} _event
 * @param {TAction} action
 * @param {TKey} key
 * @param {TValue} value
 * @returns {TReturn}
 */
const _default = <
    TAction extends ServerCacheAction,
    TKey extends ServerCacheMethodKey<TAction>,
    TValue extends ServerCacheMethodValue<TAction>,
    TReturn extends ServerCacheMethodReturn<TAction, TValue>,
>(
    _event: IpcMainInvokeEvent,
    action: TAction,
    key: TKey,
    value: TValue
): TReturn => {
    switch (action) {
        // handle ServerCache events that DO desire a return value:
        case 'get':
            return serverPasswordCache.get<TKey, TValue>(key as Exclude<TKey, string>, value) as unknown as TReturn;
        // handle ServerCache events that do NOT desire a return value:
        case 'set':
            return serverPasswordCache.set<TKey>(key, value) as TReturn;
        case 'delete':
            return serverPasswordCache.delete<TKey>(key) as TReturn;
        case 'clear':
            return serverPasswordCache.clear() as TReturn;
    }
};

export default _default;
