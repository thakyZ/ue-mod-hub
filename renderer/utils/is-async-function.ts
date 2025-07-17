import type { PromiseTypeFunction } from '@typed/common';

type AsyncFunction = ((...args: unknown[]) => Promise<unknown>) | PromiseTypeFunction<unknown>;

export default function isAsyncFunction(func: unknown): func is AsyncFunction {
    return typeof func === 'function' && func.constructor.name === 'AsyncFunction';
}
