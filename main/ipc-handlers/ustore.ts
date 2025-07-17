/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import assert from 'node:assert';

import type { ConfigDataStore, ConfigDataStorePath } from '@main/config';
import DEAP from '@main/dek/deap';
import type { IpcMainInvokeEvent } from 'electron';
import type { Get } from 'type-fest';

// prettier-ignore
export declare type UStoreAction =
    | 'get'
    | 'set'
    | 'delete'
    | 'clear';

// prettier-ignore
export declare type UStoreMethodKey<TAction extends UStoreAction> =
    TAction extends 'get' ? ConfigDataStorePath :
    TAction extends 'set' ? ConfigDataStorePath :
    TAction extends 'delete' ? ConfigDataStorePath :
    TAction extends 'clear' ? never :
    never;

// prettier-ignore
export declare type UStoreMethodValue<
    TAction extends UStoreAction,
    TKey extends UStoreMethodKey<TAction>,
> = 
    TAction extends 'get' ? Get<UStoreAction, TKey> :
    TAction extends 'set' ? Get<UStoreAction, TKey> :
    TAction extends 'delete' ? never :
    TAction extends 'clear' ? never :
    never;

// prettier-ignore
export declare type UStoreMethodReturn<
    TAction extends UStoreAction,
    TKey extends UStoreMethodKey<TAction>,
    TValue extends UStoreMethodValue<TAction, TKey>,
> = 
    TAction extends 'get' ? TValue :
    TAction extends 'set' ? Promise<void> :
    TAction extends 'delete' ? Promise<void> :
    TAction extends 'clear' ? Promise<void> :
    never;

/**
 * @template {UStoreAction} TAction
 * @template {UStoreMethodKey<TAction>} TKey
 * @template {UStoreMethodValue<TAction, TKey>} TValue
 * @template {UStoreMethodReturn<TAction, TKey, TValue>} TReturn
 * @param {IpcMainInvokeEvent} _event
 * @param {TAction} action
 * @param {TKey} key
 * @param {TValue} value
 * @returns {TReturn}
 */
// prettier-ignore
// const _default: UStoreIpcHandler = <
const _default = <
    TAction extends UStoreAction,
    TKey extends UStoreMethodKey<TAction>,
    TValue extends UStoreMethodValue<TAction, TKey>,
    TReturn extends UStoreMethodReturn<TAction, TKey, TValue>,
>(
    _event: IpcMainInvokeEvent,
    action: TAction,
    key: TKey,
    value?: TValue
): TReturn => {
    if (key) {
        //!TEMP: key switcher until all other modules are updated
        const switchable_keys: Record<string, string> = {
            cache_dir: 'app-cache',
            api_key: 'api-keys.nexus',
            game_path: 'games.palworld.path',
        };
        if (switchable_keys[key as UStoreMethodKey<TAction>]) {
            const old_key: TKey = key;
            key = switchable_keys[key] as Exclude<NonNullable<TKey>, UStoreMethodKey<TAction>>;
            console.log(`switched key from ${old_key} to ${key}`);
        }
    }
    assert.ok(DEAP.datastore);
    // console.log(`ustore: ${action} ${key} ${value}`);
    switch (action) {
        // handle uStore events that DO desire a return value:
        case 'get':
            return DEAP.datastore.get(key as keyof ConfigDataStore, value ?? null) as TReturn;
        // handle uStore events that do NOT desire a return value:
        case 'set':
            return DEAP.datastore.set(key, value) as TReturn;
        case 'delete':
            return DEAP.datastore.delete(key as keyof ConfigDataStore) as TReturn;
        case 'clear':
            return DEAP.datastore.clear() as TReturn;
    }
};

export default _default;
