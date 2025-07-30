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

    interface Array {
        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        map<T, TReturn>(
            predicate: (value: T) => TReturn,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn[];

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        map<T, TReturn>(
            predicate: (value: T, index: number) => TReturn,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn[];

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        map<T, TReturn>(
            predicate: (value: T, index: number, array: Array<T>) => TReturn,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn[];

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn = T>(
            callback: (value: T) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn = T>(
            callback: (value: T, index: number) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<T, TReturn = T>(
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
        find<T, TReturn = T>(predicate: (value: T) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<T, TReturn = T>(predicate: (value: T, index: number) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<T, TReturn = T>(
            predicate: (value: T, index: number, array: Array<T>) => unknown,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn | undefined;
    }

    interface Array<T> {
        // sort(): Array<T>;

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        map<TReturn>(
            predicate: (value: T) => TReturn,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn[];

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        map<TReturn>(
            predicate: (value: T, index: number) => TReturn,
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
        map<TReturn>(
            predicate: (value: T, index: number, array: Array<T>) => TReturn,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<TReturn = T>(
            callback: (value: T) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<TReturn = T>(
            callback: (value: T, index: number) => boolean,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): Array<TReturn>;

        /**
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the
         * predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If
         * thisArg is omitted, undefined is used as the this value.
         */
        filter<TReturn = T>(
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
        find<TReturn = T>(predicate: (value: T) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<TReturn = T>(predicate: (value: T, index: number) => unknown, thisArg?: any): TReturn | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        /**
         * Returns the value of the first element in the array where predicate is true, and undefined
         * otherwise.
         * @param predicate find calls predicate once for each element of the array, in ascending
         * order, until it finds one where predicate returns true. If such an element is found, find
         * immediately returns that element value. Otherwise, find returns undefined.
         * @param thisArg If provided, it will be used as the this value for each invocation of
         * predicate. If it is not provided, undefined is used instead.
         */
        find<TReturn = T>(
            predicate: (value: T, index: number, array: Array<T>) => unknown,
            thisArg?: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ): TReturn | undefined;
    }
    interface ObjectConstructor {
        /**
         * Returns an array of a given object's own enumerable string-keyed property names.
         * @param obj An object.
         * @returns An array of strings representing the given object's own enumerable string-keyed property keys.
         */
        keys<T, TKey extends keyof T = keyof T>(obj: T): Array<TKey>;

        /**
         * Returns an array of a given object's own enumerable string-keyed property values.
         * @param obj An object.
         * @returns An array containing the given object's own enumerable string-keyed property values.
         */
        values<T, TValue extends ValueOf<T> = ValueOf<T>>(obj: T): Array<TValue>;

        /**
         * Returns an array of a given object's own enumerable string-keyed property key-value pairs.
         * @param obj An object.
         * @returns An array of the given object's own enumerable string-keyed property key-value pairs.
         * Each key-value pair is an array with two elements: the first element is the property
         * key (which is always a string), and the second element is the property value.
         */
        entries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(
            obj: T
        ): Array<[key: TKey, value: TValue]>;

        /**
         * Transforms a list of key-value pairs into an object.
         * @param iterable An iterable, such as an Array or Map, containing a list of objects. Each object
         * should have two properties:
         *
         * - 0 A string or {@link symbol} representing the property key.
         * - 1 The property value.
         *
         * Typically, this object is implemented as a two-element array, with the first
         * element being the property key and the second element being the property value.
         * @returns A new object whose properties are given by the entries of the iterable.
         */
        fromEntries<T, TKey extends keyof T = keyof T, TValue extends ValueOf<T, TKey> = ValueOf<T, TKey>>(
            iterable: Array<[key: TKey, value: TValue]>
        ): T;
    }
}
