/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import assert from 'node:assert';

import type { DEAPElectronStore } from '@main/dek/deap';
import DEAP from '@main/dek/deap';
import type { LoggerMethods } from '@main/dek/logger';
import { Client } from '@main/dek/palhub';
import Nexus from '@nexusmods/nexus-api';
import type { AllMethodTypes, MethodsOfAlt } from '@typed/common';
import Dekache from 'dekache';
// import type { IpcMainInvokeEvent } from 'electron';
import type { MainIpcEvent } from 'electron-ipc-extended';
import Store from 'electron-store';

export declare type LengthOfOneHour = 3600000;

export declare type LengthOfOneDay = 86400000;

export declare type LengthOfOneWeek = 604800000;

export declare type NexusProperties = MethodsOfAlt<Nexus>;

export declare type INexusFunctionsToCache = {
    [key in NexusProperties]: LengthOfOneHour | LengthOfOneDay | LengthOfOneWeek;
};

export declare interface NexusFunctionsToCache extends Partial<INexusFunctionsToCache> {
    getModInfo: LengthOfOneDay;
    getModFiles: LengthOfOneHour;
    getDownloadURLs: LengthOfOneHour;
    getLatestAdded: LengthOfOneHour;
    getLatestUpdated: LengthOfOneHour;
    getTrending: LengthOfOneHour;
    getTrackedMods: LengthOfOneHour;
}

/**
 * A basic cache for the nexus API to prevent unnecessary requests
 * @type {Dekache}
 */
const nexusApiCache: Dekache = new Dekache({ name: 'need some cache bruh?', mins: 5 });

/**
 * A more long term cache for persistent storage of mod data
 * @type {DEAPElectronStore}
 */
const nexusApiModDataStore: DEAPElectronStore = new Store({ name: '[dek.ue.nexus.cache]' });

/**
 * @type {LengthOfOneHour}
 */
const lengthOfOneHour: LengthOfOneHour = (1000 * 60 * 60) as LengthOfOneHour;

/**
 * @type {LengthOfOneDay}
 */
const lengthOfOneDay: LengthOfOneDay = (lengthOfOneHour * 24) as LengthOfOneDay;

/**
 * @type {LengthOfOneWeek}
 */
const lengthOfOneWeek: LengthOfOneWeek = (lengthOfOneDay * 7) as LengthOfOneWeek; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Functions that should be cached within the data store and their cache duration
 * @type {NexusFunctionsToCache}
 */
const nexusFunctionsToCache: Partial<NexusFunctionsToCache> = {
    getModInfo: lengthOfOneDay,
    getModFiles: lengthOfOneHour,
    getDownloadURLs: lengthOfOneHour,
    getLatestAdded: lengthOfOneHour,
    getLatestUpdated: lengthOfOneHour,
    getTrending: lengthOfOneHour,
    getTrackedMods: lengthOfOneHour,
};

/**
 * @template {NexusProperties} TFuncName
 * @template {Nexus[TFuncName]} TFuncValue
 * @param {MainIpcEvent} _event
 * @param {string} api_key
 * @param {TFuncName} functionName
 * @param {...Parameters<TFuncValue>} functionArgs
 * @returns {Promise<Dekache | null | Awaited<ReturnType<TFuncValue>> | { cache_time?: number }>}
 */
// const _default: NexusIpcHandler = async <
const _default = async <
    TFuncName extends NexusProperties,
    TFuncValue extends Nexus[TFuncName],
    Args extends TFuncValue extends AllMethodTypes ? Parameters<TFuncValue> : unknown[],
    ReturnVal extends TFuncValue extends AllMethodTypes ? ReturnType<TFuncValue> : unknown,
>(
    _event: MainIpcEvent,
    api_key: string,
    functionName: TFuncName,
    ...functionArgs: Args
): Promise<Dekache | null | ReturnVal | { cache_time?: number }> => {
    /** @type {LoggerMethods} */
    const applog: LoggerMethods = DEAP.useLogger('nexus');

    /** @returns {Promise<ReturnVal | null>} */
    const getUncachedValue = async (): Promise<ReturnVal | null> => {
        /** @type {Nexus} */
        const nexus: Nexus = await Client.ensureNexusLink(api_key);
        try {
            return (await Object.call<TFuncValue, [typeof functionArgs], ReturnVal>(
                nexus[functionName] as TFuncValue,
                functionArgs
            )) as ReturnVal | null;
        } catch (error) {
            let _error = error;
            if (!_error || _error === null) _error = 'Unknown Error';
            if (typeof _error === 'string') _error = new Error(_error);
            else if (!(_error instanceof Error)) _error = new Error(String(_error));
            assert.ok(_error instanceof Error);
            applog.error(`Nexus function ${functionName} failed: ${_error}`);
        }
        return null;
    };
    // return uncached value when checking rate limit, as each other request
    // will also update the rate limit data, so we don't need to cache it.
    if (functionName === 'getRateLimits') return await getUncachedValue();

    // create a cache key based on the function name and arguments
    /** @type {string} */
    const cache_key: string = `${functionName}-${JSON.stringify(functionArgs)}`;
    /** @type {string} */
    let log_key: string = cache_key;

    /** @type {ReturnVal | Dekache | null} */
    let result: ReturnVal | Dekache | null = null;
    /** @type {boolean} */
    let forced: boolean = false;

    // if the function is getModData, check if we are force updating data
    if (functionName === 'getModInfo') forced = functionArgs[1] === true;

    /** @type {boolean} */
    let canPrintLogInfo: boolean = true;
    if (functionName === 'setKey') canPrintLogInfo = false;
    if (functionName === 'validateKey') canPrintLogInfo = false;
    // if the function is getDownloadURLs, redact the first argument (the mod user download key) from the log (if included)
    if (functionName === 'getDownloadURLs') {
        /** @type {Args} */
        const replacedFunctionArgs: Args = functionArgs.map(
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
            (str: unknown, i: number): unknown | 'REDACTED' => {
                if (str && i === 2) return 'REDACTED';
                return str;
            }
        ) as Args;
        log_key = `${functionName as string}-${JSON.stringify(replacedFunctionArgs)}`;
    }

    if (nexusFunctionsToCache[functionName]) {
        /** @type {{ cache_time?: number } | null} */
        const cached: { cache_time?: number } | null = nexusApiModDataStore.get<string, { cache_time?: number } | null>(
            cache_key,
            null
        );
        // if the cache is not forced and the cache duration is not expired, return the cached value
        if (!forced && cached?.cache_time) {
            /** @type {number} */
            const cache_time: number = cached.cache_time;
            /** @type {number} */
            const cache_duration: number = Date.now() - cache_time;
            /** @type {NonNullable<NexusFunctionsToCache[TFuncName]>} */
            const cache_limit: NonNullable<NexusFunctionsToCache[TFuncName]> = nexusFunctionsToCache[functionName];
            if (cache_duration < cache_limit) return cached;
        }
        // else, get the uncached value and set
        result = await nexusApiCache.get<ReturnVal | null>(cache_key, getUncachedValue);
        if (canPrintLogInfo) applog.info(`Caching ${functionName} with key ${log_key}`);
        if (canPrintLogInfo) applog.info(result);
        if (result && 'cache_time' in (result as object)) {
            (result as { cache_time?: number }).cache_time = Date.now(); // add cache time to the result
            nexusApiModDataStore.set(cache_key, result); // only update cache when resultiis returned
        }
    } else {
        // get the cached value or get the uncached value then set the cache and return the result
        if (canPrintLogInfo) applog.info(`Calling ${cache_key}`);
        // result = await nexusApiCache.get(cache_key, getUncachedValue);
        result = await getUncachedValue();
    }

    return result;
};

export default _default;
