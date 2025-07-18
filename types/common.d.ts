declare module '@typed/common';
/// <reference types="node" />

import type {
    ChangeEvent,
    Dispatch,
    EventHandler,
    HTMLInputTypeAttribute,
    MouseEvent,
    MouseEventHandler,
    SetStateAction,
} from 'react';

export declare interface BaseSyntheticEvent<E = object, C = unknown, T = unknown> {
    nativeEvent: E;
    currentTarget: C;
    target: T;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    timeStamp: number;
    type: string;
}

export declare type SyntheticEvent<T = Element, E = Event> = BaseSyntheticEvent<E, EventTarget & T, EventTarget>;

export declare interface OptionalMouseEventHandler<T = Element> extends MouseEventHandler<T> {
    (event?: MouseEvent<T>): void;
}

export declare interface GenericEventWithTarget<T = Element> extends SyntheticEvent<T> {
    target: EventTarget;
}

export declare type GenericEventWithTargetHandler<T = Element> = EventHandler<GenericEventWithTarget<T>>;

export declare interface PropsChangeEvent<P, T = Element> extends ChangeEvent<T, globalThis.ChangeEvent> {
    props: P;
    target: T;
}

export declare type PropsChangeEventHandler<P, T = Element> = EventHandler<PropsChangeEvent<P, T>>;

export declare interface PropsMouseEvent<P, T = Element> extends MouseEvent<T, globalThis.MouseEvent> {
    props: P;
    target: T | EventTarget;
}

export declare type PropsMouseEventHandler<P, T = Element> = EventHandler<PropsMouseEvent<P, T>>;

/**
 * A type to wrap an import with a default field as a type.
 * @example
 * (async () => {
 *     const join = (await import('node:path') as ImportWithDefault).default;
 * }();
 */
export declare interface ImportWithDefault {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: any;
}

export declare interface VoidFunctionWithArgs<TArgs extends unknown[]> {
    (...args: TArgs): void;
}

export declare interface TypeFunction<TReturn> {
    (): TReturn;
}

export declare interface TypeFunctionWithArgs<TArgs extends unknown[], TReturn> {
    (...args: TArgs): TReturn;
}

export declare type PromiseVoidFunction = TypeFunction<Promise<void>>;

export declare interface PromiseVoidFunctionWithArgs<TArgs extends unknown[]> {
    (...args: TArgs): Promise<void>;
}

export declare type PromiseTypeFunction<TReturn> = TypeFunction<Promise<TReturn>>;

export declare interface PromiseTypeFunctionWithArgs<TArgs extends unknown[], TReturn> {
    (...args: TArgs): Promise<TReturn>;
}

/**
 * Default {@link Promise}<{@link T}> resolve type.
 * @template T
 */
export declare type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;

/**
 * Default {@link Promise} reject type.
 */
export declare type PromiseReject = (reason?: Error) => void;

/**
 * Excludes every type but an {@link object} type from {@link T}
 * @template {unknown} T
 */
export declare type ObjectType<T = unknown> = Exclude<
    T,
    Function | symbol | bigint | number | boolean | string | undefined // eslint-disable-line @typescript-eslint/no-unsafe-function-type
>;

/**
 * Gets the method(s) of {@link T}
 * @template T
 */
export declare type MethodOf<T> = MethodOf2<T, MethodsOf<T>>;

/**
 * Gets the method(s) of {@link T}
 * @template T
 */
export declare type MethodOfAlt<T> = MethodOf2Alt<T, MethodsOfAlt<T>>;

/**
 * Gets the method(s) of {@link T} based on {@link TKey}
 * @template T
 * @template {MethodsOf<T>} TKey
 */
export declare type MethodOf2<T, TKey extends MethodsOf<T>> = MethodOf3<T, (...args: any) => any, TKey>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Gets the method(s) of {@link T} based on {@link TKey}
 * @template T
 * @template {MethodsOfAlt<T>} TKey
 */
export declare type MethodOf2Alt<T, TKey extends MethodsOfAlt<T>> = MethodOf3Alt<T, (...args: any) => any, TKey>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Gets the method(s) of {@link T} that are of type {@link V} based on {@link TKey}
 * @template T
 * @template {(...args: any) => any} V
 * @template {MethodsOf<T, V>} TKey
 */
export declare type MethodOf3<T, V extends (...args: any) => any, TKey extends MethodsOf<T, V>> = T[TKey]; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Gets the method(s) of {@link T} that are of type {@link V} based on {@link TKey}
 * @template T
 * @template {(...args: any) => any} V
 * @template {MethodsOfAlt<T, V>} TKey
 */
export declare type MethodOf3Alt<T, V extends (...args: any) => any, TKey extends MethodOfAlt<T, V>> = T[TKey]; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Finds any key matching type of {@link V} in {@link T}
 * @template T
 * @template V
 * @see https://stackoverflow.com/a/54520829/1112800
 */
export declare type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

/**
 * Finds any key who's type is of {@link V} and inherits from {@link AllMethodTypes} in {@link T}
 * @template T
 * @template {(...args: any) => any} V
 * @see https://stackoverflow.com/a/66144780/1112800
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type MethodsOf<T, V extends (...args: any) => any = (...args: any) => any> = {
    [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

/**
 * Finds any key who's type is of {@link V} and inherits from {@link AllMethodTypes} in {@link T}
 * @template T
 * @template {(...args: any) => any} V
 * @see https://stackoverflow.com/a/66144780/1112800
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type MethodsOfAlt<T, V extends (...args: any) => any = (...args: any) => any> = keyof {
    [K in keyof T]-?: T[K] extends V ? K : never;
};

/**
 * Finds any key value pair who's type is of {@link V} in {@link T}
 * @template T
 * @template V
 * @see https://stackoverflow.com/a/66144780/1112800
 */
export declare type KeysWithValuesOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T;

/**
 * Types of asynchronous methods up to 8 parameters
 */
export declare type AsyncMethodTypes =
    | PromiseTypeFunction<unknown>
    | ((...args: unknown[]) => Promise<unknown>)
    | ((arg0: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown, arg2: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown) => Promise<unknown>)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown, arg6: unknown) => Promise<unknown>) // prettier-ignore
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown, arg6: unknown, arg7: unknown) => Promise<unknown>); // prettier-ignore

/**
 * Types of synchronous methods up to 8 parameters
 */
export declare type SyncMethodTypes =
    | (() => unknown)
    | ((...args: unknown[]) => unknown)
    | ((arg0: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown, arg2: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown) => unknown)
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown, arg6: unknown) => unknown) // prettier-ignore
    | ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown, arg6: unknown, arg7: unknown) => unknown); // prettier-ignore

/**
 * Types of both synchronous and asynchronous methods up to 8 parameters
 */
// prettier-ignore
export declare type AllMethodTypes =
    | AsyncMethodTypes
    | SyncMethodTypes;

export declare type Nullable<T> = T | null;

export declare type Undefinable<T> = T | undefined;

export declare type MaybeUnset<T> = Nullable<T> | Undefinable<T>;

export declare type BooleanSet = '0' | '1' | boolean;

export declare type ValueType =
    | HTMLInputTypeAttribute
    | 'intbool'
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'undefined'
    | 'null'; // | ((...args: unknown[]) => ReactNode);

export declare type BooleanChoose<
    T extends T1 | T2,
    T1 extends string = string,
    T2 extends string = string,
    TI = boolean,
> = TI extends true ? T2 : TI extends false ? T1 : T;

export declare type DetermineType<TReturn1, TReturn2, TDetermine, TConstrain1, TConstrain2> =
    TDetermine extends TConstrain1 ? TReturn1 : TDetermine extends TConstrain2 ? TReturn2 : never;

export declare type FunctionCollection<V> = {
    [K in keyof V]: (_: V[K]) => string;
};

export declare type UseStatePair<T> = [value: T, setter: Dispatch<SetStateAction<T>>];

export declare type ParseIntSafeReturn<T extends readonly string[] | string | number> = T extends readonly string[]
    ? number[]
    : number;
