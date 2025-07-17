import { createRequire } from 'node:module';
const _require: NodeJS.Require = createRequire(__dirname);

/**
 * requires a module, but also removes it from the cache first
 * to ensure data returned is crispy fresh good <3
 * @template T
 * @param {string} modulename
 * @returns {T}
 */
export default function freshRequire<T>(modulename: string): T {
    delete require.cache[require.resolve(modulename)];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return _require(modulename);
}
