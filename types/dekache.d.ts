import { EventEmitter as Emitter } from 'node:events';

import { PromiseTypeFunction } from '@typed/common';
declare module 'dekache' {
    /**
     * Used within the Dekache class.
     * @class
     */
    declare class DekacheItem {
        /**
         * See {@link DekacheItem#initialize}
         */
        constructor();
        /**
         * The data that this cache item is storing.
         * @type {object}
         * @read_only
         */
        get data();
        /**
         * The Date.now() this item was last renewed.
         * @type {number}
         * @read_only
         */
        get time();
        /**
         * The Date.now() when this item was initially created.
         * @type {number}
         * @read_only
         */
        get init();

        /**
         * Called automatically when constructed
         * @param cache_data The data to hold, can be any object or primitive
         */
        initialize(cache_data: unknown): void;

        /**
         * Checks if this item was created longer than `mins` ago.
         * @param mins the number of minutes to check against (integer).
         * @returns Based on if item was renewed longer than `mins` ago.
         */
        checkTimeDiff(mins: number): boolean;

        /**
         * Renews the time for this item. This will stop {@link DekacheItem#checkTimeDiff} from returning true.
         * Which in turn, will stop the item from being cleared from the cache.
         */
        renew(): void;
    }

    /**
     * An object containing key value pairs where the key is a string identifier,
     * and the value is an object with the properties detailed below:
     */
    declare interface DekacheOptions {
        /** An identifier for this cache. */
        name?: string;
        /** The cache type, either 'force' or 'renew'. */
        type?: string;
        /** Number of minutes to cache each item for */
        mins?: number;
        /** The frequency to check cache items for deletion (ms) */
        freq?: number;
    }

    /**
     * ```
     * const mycache = new Dekache({name:'you got any cache?', mins: 2})
     * await mycache.get('some-identifier', async() => { return 1 });
     * ```
     * `mycache.get('some-identifier', ()=>{})` calls will now return a
     * promise that resolves to 1 until the number of mins (2) has been reached.
     * @class
     */
    declare class Dekache extends Emitter {
        /**
         * @constant
         * @default
         */
        static DEFAULT_OPTS: DekacheOptions = {
            name: 'unnamed-cache', // the cache name for easy identifications
            type: 'force', // should renew data, or 'force' refresh after mins?
            mins: 1, // duration before data is removed from the cache
            freq: 1000, // frequency at which the cache items are checked for removal.
        };

        /**
         * See {@link Dekache#initialize}
         */
        constructor(object: object);

        /**
         * @property {object} data - stores key value pairs for cache items
         */
        get data();

        /**
         * Called automatically when created
         * @param options a cache options object.
         */
        initialize(options: DekacheOptions = {}): void;

        /**
         * Starts the cache loop. Can be later stopped called {@link Dekache#stop}
         * @returns Based on if started. False if already started.
         * @async
         */
        async start(): Promise<boolean>;

        /**
         * Stops the cache loop. Can later be restarted calling {@link Dekache#start}
         * @returns Based on if stopped. False if already stopped.
         * @async
         */
        async stop(): Promise<boolean>;

        /**
         * The main cache loop function. Calls {@link Dekache#clear} .
         * @async
         */
        async loop(): Promise<void>;

        /**
         * Delete the given key from the cache
         * @param data_key the identifier for the cache item to delete.
         * @returns Based on if any item was deleted from cache. False if not.
         */
        async delete(data_key: string): Promise<boolean>;

        /**
         * Iterates over each cache item and clears any that have overstayed the duration.
         * @param forced Should all cache items be forced out regardless of duration?
         */
        async clear(forced: boolean = false): Promise<void>;

        /**
         * Get the data, or uses callback function to populate cache and then returns data.
         * @param data_key the identifier for the cache item to get.
         * @param callback an asynchronous callback that should be called if no data is currently in the cache.
         * @returns Based on the data returned from the first time that
         * this function was called and the callbacks return data.
         * @promise
         */
        get<T>(data_id: string, new_data_callback: PromiseTypeFunction<T>): Promise<T>;

        /**
         * Set the cache data to new data directly and then returns promise.
         * @param data_key the identifier for the cache item to get.
         * @param new_data some object or primitive.
         * @return that resolves with new_data
         * @promise
         */
        set<T>(data_id: string, new_data: T): Promise<T>;

        /**
         * Gets the internal key from data_id. Can be used for comparing an id when a cache item is cleared.
         * @param data_key the identifier for the cache item to get.
         * @returns the internal cache key used
         */
        key(data_id: string): string;
    }
    export default Dekache;
    export { DekacheItem, DekacheOptions };
}
