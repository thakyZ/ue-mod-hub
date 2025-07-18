import type {
    AppIpcBinder,
    LoggerBinder,
    NexusBinder,
    PalHubBinder,
    ServerCacheBinder,
    UStoreBinder,
} from '@main/preload';
import type { ValueOf } from 'type-fest';

declare global {
    interface Window {
        ipc: AppIpcBinder;
        logger: LoggerBinder;
        nexus: NexusBinder;
        palhub: PalHubBinder;
        serverCache: ServerCacheBinder;
        uStore: UStoreBinder;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> {
        // sort(): Array<T>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn>(
            callback: (value: T) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn>(
            callback: (value: T, index: number) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn>(
            callback: (value: T, index: number, array: Array<T>) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<T, TReturn>(predicate: (value: T) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<T, TReturn>(predicate: (value: T, index: number) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<T, TReturn>(
            predicate: (value: T, index: number, array: Array<T>) => unknown,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn | undefined;
    }
    interface ObjectConstructor {
        keys<T, TKey extends keyof T = keyof T>(obj: T): Array<TKey>;
        values<T, TValue extends ValueOf<T> = ValueOf<T>>(obj: T): Array<TValue>;
        entries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(
            obj: T
        ): Array<[key: TKey, value: TValue]>;
        fromEntries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(
            obj: Array<[key: TKey, value: TValue]>
        ): T;
    }
}
