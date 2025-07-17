import assert from 'node:assert';
import { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

import type { AsyncMethodTypes, PromiseReject, PromiseResolve } from '@typed/common';
import type { DurationLikeObject, DurationObjectUnits } from 'luxon';
import { DateTime, Duration } from 'luxon';
import { Valid } from 'luxon/src/_util';
import type { ValueOf } from 'type-fest';

import DEAP from './deap';

// variables used privately within class:
const boottime: number = Date.now();
Object.freeze(boottime);

/**
 * @class
 */
export default class Utils {
    /**
     * returns Date object for when utils module was first accessed
     * @type {number}
     */
    static get BOOTTIME(): number {
        return boottime;
    }

    /**
     * @param {number} [milliseconds=1000] number of ms to wait
     * @returns {Promise<void>} that will resolve in number ms
     */
    static async wait(milliseconds: number = 1000): Promise<void> {
        return new Promise((r: PromiseResolve<void>): NodeJS.Timeout => setTimeout(r, milliseconds));
    }

    /**
     * @param {number} max the max number to get
     * @param {number} min the min number to get
     * @returns {number} between max and min
     */
    static rand(max: number, min: number): number {
        //const n = min || 0, x = max || 100;
        //return Math.floor(n + (Math.random()*(x-n)));
        /** @type {number} */
        const n: number = Math.ceil(min || 0);
        /** @type {number} */
        const x: number = Math.floor(max || 100);
        return Math.floor(Math.random() * (x - n)) + n;
        // return Math.floor(Math.random() * (x - n + 1)) + n;
    }

    /**
     * returns random boolean
     * @returns {false | true}
     */
    static randBool(): false | true {
        return this.randFromArray([false, true]);
    }

    /**
     * returns random element from given array
     * @template T
     * @param {T[]} array
     * @returns {T}
     */
    static randFromArray<T>(array: T[]): T {
        // Check if the array is not empty (maybe return undefined instead)
        assert.ok(array.length > 0);
        let returned: T | undefined = undefined;
        // Keep trying until we get a valid entry.
        while (!returned) {
            returned = array[this.rand(array.length, 0)];
        }
        return returned;
    }

    /**
     * returns random element from given array
     * @template T
     * @param {T[]} array
     * @returns {T}
     */
    static arrayRand<T>(array: T[]): T {
        return this.randFromArray(array);
    }

    /**
     * returns random value from available object properties
     * @template {object} T
     * @template {keyof T} TKey
     * @param {T} object
     * @returns {ValueOf<T, TKey>}
     */
    static randFromObject<T extends Record<string | number | symbol, unknown>>(object: T): ValueOf<T> {
        return object[this.randFromArray(Object.keys(object))] as ValueOf<T>;
    }

    /**
     * clamps value between min and max
     * @param {string} value
     * @param {number} max
     * @param {number} min
     * @returns {number}
     */
    static clamp(value: string, max: number, min: number): number {
        return Math.min(Math.max(Number.parseInt(value), min || 0), max);
    }

    /**
     * @overload
     * get ms difference between now and given timestamp/date
     * @param {number} timestamp
     * @returns {number}
     */
    static getMSDiff(timestamp: number): number;

    /**
     * @overload
     * get ms difference between now and given timestamp/date
     * @param {Date} timestamp
     * @returns {Date}
     */
    static getMSDiff(timestamp: Date): Date;

    /**
     * get ms difference between now and given timestamp/date
     * @param {Date | number} timestamp
     * @returns {Date | number}
     */
    static getMSDiff(timestamp: Date | number): Date | number {
        const calc: number = Date.now() - (timestamp instanceof Date ? timestamp.getTime() : timestamp) * 1000;
        return timestamp instanceof Date ? new Date(calc) : calc;
    }

    /**
     * @overload
     * return true if `date` is older than `mins` old
     * @param {number} date
     * @param {number} mins
     * @returns {boolean}
     */
    static checkTimeDiff(date: number, mins: number): boolean;

    /**
     * @overload
     * return true if `date` is older than `mins` old
     * @param {Date} date
     * @param {number} mins
     * @returns {boolean}
     */
    static checkTimeDiff(date: Date, mins: number): boolean;

    /**
     * return true if `date` is older than `mins` old
     * @param {Date | number} date
     * @param {number} mins
     * @returns {boolean}
     */
    static checkTimeDiff(date: Date | number, mins: number): boolean {
        const wait = 1000 * 60 * mins - 100;
        return this.getMSDiff(date instanceof Date ? date.getTime() : date) >= wait;
    }

    /**
     * @overload
     * returns a basic datestring
     * @param {number | undefined} [date=undefined]
     * @param {Intl.LocalesArgument | boolean} [type='en-US']
     * @returns {string}
     */
    static dateString(date: number | undefined, type: Intl.LocalesArgument | boolean): string;

    /**
     * @overload
     * returns a basic datestring
     * @param {Date | undefined} [date=new Date()]
     * @param {Intl.LocalesArgument | boolean} [type='en-US']
     * @returns {string}
     */
    static dateString(date: Date | undefined, type: Intl.LocalesArgument | boolean): string;

    /**
     * returns a basic datestring
     * @param {number | Date | undefined} [date]
     * @param {Intl.LocalesArgument | boolean} [type='en-US']
     * @returns {string}
     */
    static dateString(date: number | Date | undefined, type: Intl.LocalesArgument | boolean = 'en-US'): string {
        date = new Date(date ?? new Date());
        if (typeof type === 'string') return date.toLocaleDateString(type);
        /** @type {Intl.DateTimeFormatOptions} */
        const format: Intl.DateTimeFormatOptions = DateTime.DATETIME_MED_WITH_WEEKDAY;
        /** @type {DateTime<Valid>} */
        const datetime: DateTime<Valid> | DateTime<false> = DateTime.fromJSDate(date);
        return datetime.toLocaleString(format);
    }

    // // requires a module, but also removes it from the cache first
    // // to ensure data returned is crispy fresh good <3
    // static freshRequire(modulename) {
    //     delete require.cache[require.resolve(modulename)];
    //     return require(modulename);
    // }

    /**
     * generates a random hex color code
     * @param {boolean} [type2=false]
     * @returns {string}
     */
    static generateHexColor(type2: boolean = false): string {
        if (!type2) return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).slice(1, 7)}`;
    }

    /**
     * capitalizes the given string
     * @param {[char1: string, ...rest: string[]]} param0
     * @returns {string}
     */
    static capitalize([char1, ...rest]: string): string {
        return char1?.toUpperCase() + rest.join('');
    }

    /**
     * checks if string is like a discord snowflake id
     * @param {string} potential_flake
     * @returns {boolean}
     */
    static seemsFlakey(potential_flake: string): boolean {
        return /^[0-9]{14,19}$/.test(potential_flake);
    }

    /**
     * returns true if given object is a valid number
     * @param {unknown} value
     * @returns {value is number}
     */
    static isValidNumber(value: unknown): value is number {
        return typeof value === 'number' && !Number.isNaN(value);
    }

    /**
     * returns true if given object is a valid string
     * @param {unknown} value
     * @returns {value is string}
     */
    static isValidString(value: unknown): value is string {
        return typeof value === 'string' && !!value;
    }

    /**
     * returns true if given string is a valid url
     * @param {string} string
     * @returns {boolean}
     */
    static isValidURL(string: string): boolean {
        return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g.test(
            String(string)
        );
    }

    /**
     * returns true if given string is a valid image url
     * @param {string} string
     * @returns {boolean}
     */
    static isImageURL(string: string): boolean {
        if (!this.isValidURL(string)) return false;
        return /.(jpg|gif|png|jpeg)$/i.test(string);
    }

    /**
     * @param {unknown} variable
     * @returns {value is CallableFunction}
     */
    static isFunction(variable: unknown): variable is CallableFunction {
        if (!variable) return false;
        // eslint-disable-next-line unicorn/no-instanceof-builtins
        return variable instanceof Function || typeof variable === 'function';
    }

    /**
     * format string using object properties as replacers
     * @param {string} str
     * @param {Record<string, string>} object
     * @returns {string}
     * @example
     * format("hi NAME!", {NAME: 'mr hankey'});
     */
    static format(str: string, object: Record<string, string>): string {
        const regstr: string = Object.keys(object).join('|');
        const regexp = new RegExp(regstr, 'gi');
        return str.replace(regexp, (matched: string): string => {
            return object[matched.toLowerCase()] ?? matched;
        });
    }

    /**
     * format bytes number into MB, GB, etc
     * @see https://stackoverflow.com/a/18650828
     * @param {number} bytes
     * @param {number} [decimals=2]
     * @returns {string}
     */
    static formatBytes(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm: number = Math.max(decimals, 0);
        const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i: number = Math.floor(Math.log(bytes) / Math.log(k));
        const value: string = (bytes / Math.pow(k, i)).toFixed(dm);
        return `${Number.parseFloat(value)} ${sizes[i]}`;
    }

    /**
     * format time, using DateTime, based on format template:
     *
     * const template = "HH:MM:SS PERIOD";
     *
     * const template = "HH:MM:SS PERIOD";
     *
     * const template = "HH:MM:SS";
     * @param {DateTime<true>} [time=DateTime.now()]
     * @param {string} template
     * @returns {string}
     */
    static formatTime(time: DateTime<true> = DateTime.now(), template: string = 'HH:MM PERIOD'): string {
        return this.format(template, {
            hh: String(time.hour).padStart(2, '0'),
            mm: String(time.minute).padStart(2, '0'),
            ss: String(time.second).padStart(2, '0'),
            period: `${time.hour > 12 ? 'PM' : 'AM'}`,
        });
    }

    /**
     * format duration from given ms into years, days, hours, etc.
     * @param {number} duration_ms
     * @returns {string}
     */
    static formatDuration(duration_ms: number): string {
        let forced: boolean = false;
        const base_dur: Duration<Valid> = Duration.fromMillis(duration_ms);
        const shift_args: (keyof DurationLikeObject)[] = ['years', 'days', 'hours', 'minutes', 'seconds'];
        const duration: DurationObjectUnits = base_dur.shiftTo(...shift_args).toObject();
        const template: string = shift_args
            .filter((type: keyof DurationLikeObject): boolean => {
                if ((duration as Record<keyof Duration<Valid>, number>)[type as keyof Duration<Valid>] > 0) forced = true;
                return forced || type === 'seconds';
            })
            .join(', ');
        return this.format(template, {
            years: `${duration.years}y`,
            days: `${duration.days}d`,
            hours: `${duration.hours}h`,
            minutes: `${duration.minutes}m`,
            seconds: `${duration.seconds}s`,
        });
    }

    /**
     * randomize a given array!
     *
     * !note: destructive to initial array
     * @see https://stackoverflow.com/a/12646864
     * @template T
     * @param {T[]} array
     * @returns {void}
     */
    static shuffleArray<T>(array: T[]): void {
        for (let i: number = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j]!, array[i]!];
        }
    }

    /**
     * recursively get all files from a given directory
     * @param {string} directory
     * @returns {AsyncGenerator<string, any, void>}
     * @example
     * for await (const filepath of UTILS.getFiles('some/dir')) {}
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async *getFiles(directory: string): AsyncGenerator<string, any, void> {
        const entries: Dirent[] = await readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const result: string = path.resolve(directory, entry.name);
            if (entry.isDirectory()) yield* this.getFiles(result);
            else yield result;
        }
    }

    /**
     * debounce some callback to only run every delay ms
     * @template T
     * @param {(...args: T[]) => void} callback
     * @param {number} [delay=1000]
     * @returns {(...args: T[]) => void}
     */
    static debounce<T>(callback: (...args: T[]) => void, delay: number = 1000): (...args: T[]) => void {
        /** @type {NodeJS.Timeout | undefined} */
        let timeout: NodeJS.Timeout | undefined = undefined;
        return (...args: T[]): void => {
            clearTimeout(timeout);
            timeout = setTimeout((): void => {
                callback(...args);
            }, delay);
        };
    }

    /**
     * throttle some callback to only run every delay ms
     * @template T
     * @param {(...args: T[]) => void} callback
     * @param {number} [delay=1000]
     * @returns {(...args: T[]) => void}
     */
    static throttle<T>(callback: (...args: T[]) => void, delay: number = 1000): (...args: T[]) => void {
        /** @type {T[] | null} */
        let waiting_args: T[] | null = null;
        /** @type {boolean} */
        let waiting: boolean = false;
        /** @returns {void} */
        const timeout: VoidFunction = (): void => {
            if (waiting_args === null) {
                waiting = false;
            } else {
                callback(...waiting_args);
                waiting_args = null;
                setTimeout(timeout, delay);
            }
        };
        /** @type {(...args: T[]) => void} */
        return (...args: T[]): void => {
            if (waiting) {
                waiting_args = args;
                return;
            }
            waiting = true;
            callback(...args);
            setTimeout(timeout, delay);
        };
    }

    /**
     * race some promise against a timeout.
     * @template T
     * @param {Promise<T>} promise
     * @param {number} [timeout=5000]
     * @returns {Promise<T>}
     * @async
     */
    static raceTimeout<T = unknown>(promise: Promise<T>, timeout: number = 5000): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_: PromiseResolve<T>, reject: PromiseReject): void => {
                setTimeout((): void => reject(new Error('timeout')), timeout);
            }),
        ]);
    }

    // static wait(ms) {
    //     return new Promise(r => setTimeout(r, ms));
    // };

    /**
     * A typeguarded version of `instanceof Error` for NodeJS.
     * @author Joseph JDBar Barron
     * @link https://dev.to/jdbar
     * @see https://dev.to/jdbar/the-problem-with-handling-node-js-errors-in-typescript-and-the-workaround-m64
     * @template {(new (...args: unknown[]) => Error) | (new (message: string) => Error)} T
     * @param {unknown} value
     * @param {T} errorType
     * @returns {value is InstanceType<T> & NodeJS.ErrnoException}
     */
    static instanceOfNodeError<T extends (new (...args: unknown[]) => Error) | (new (message: string) => Error)>(
        value: unknown,
        errorType: T
    ): value is InstanceType<T> & NodeJS.ErrnoException {
        return value instanceof errorType;
    }

    static isAsyncFunction(func: unknown): func is AsyncMethodTypes {
        return typeof func === 'function' && func.constructor.name === 'AsyncFunction';
    }

    static handleError(error: unknown): void {
        if (!error || error === null) void DEAP.logger?.error(new Error('Unknown Error'));
        else if (typeof error === 'string') void DEAP.logger?.error(new Error(error));
        else if (error instanceof Error) void DEAP.logger?.error(error);
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        else void DEAP.logger?.error(new Error(error.toString()));
    }

    static isArray(value: unknown): value is unknown[] {
        return typeof value === 'object' && Array.isArray(value);
    }

    static isArrayFrozen(value: unknown): value is readonly unknown[] {
        return Utils.isArray(value) && Object.isFrozen(value);
    }

    static isArrayT<T>(value: unknown, type: T): value is T[] {
        return Utils.isArray(value)
            ? value.length > 0
                ? value.every((entry: unknown): boolean => typeof entry === typeof type)
                : true
            : false;
    }

    static isArrayFrozenT<T>(value: unknown, type: T): value is readonly T[] {
        return Utils.isArrayT<T>(value, type) && Utils.isArrayFrozen(value);
    }

    static isObject(value: unknown): value is object {
        return typeof value === 'object';
    }

    static isEmptyString(value: string): value is '' {
        return typeof value === 'string' && value === '';
    }

    static parseIntSafe(value: string | number | undefined, radix: number = 10): number | undefined {
        return typeof value === 'string' ? Number.parseInt(value, radix) : value;
    }
}
