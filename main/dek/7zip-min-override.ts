import assert from 'node:assert';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { arch, platform } from 'node:process';

import DEAP from '@main/dek/deap';
import type { TypeFunctionWithArgs } from '@typed/common';

// import {fixPathForAsarUnpack} from 'electron-util/node';

export declare interface SevenZipEntry {
    name: string;
    size: string;
    compressed: number;
    attr: string;
    date: string;
    time: string;
    crc: string;
    method: string;
    block: string;
    encrypted: string;
}
export declare type KeyOfSevenZipEntry = keyof SevenZipEntry;
export declare type ListMapValue = KeyOfSevenZipEntry | 'dateTime';
export declare interface ListMap extends Record<string, ListMapValue> {
    Path: 'name';
    Size: 'size';
    'Packed Size': 'compressed';
    Attributes: 'attr';
    Modified: 'dateTime';
    CRC: 'crc';
    Method: 'method';
    Block: 'block';
    Encrypted: 'encrypted';
}
export declare type KeyOfListMap = keyof ListMap;
export declare type RunCallback = (error: Error | null, result?: SevenZipEntry[] | null) => void;

function getPath(): string {
    let dirname: string = DEAP.app.isPackaged ? process.resourcesPath : __dirname; // DEAP.app.getAppPath();//getPath('userData');
    dirname = DEAP.app.isPackaged
        ? `${dirname}/app.asar.unpacked/node_modules/7zip-bin`
        : `${dirname}/../node_modules/7zip-bin`;
    if (platform === 'darwin') {
        return path.join(dirname, 'mac', arch, '7za');
    } else if (platform === 'win32') {
        return path.join(dirname, 'win', arch, '7za.exe');
    } else {
        return path.join(dirname, 'linux', arch, '7za');
    }
}

/**
 * Unpack archive.
 * @param {string} pathToPack path to archive you want to unpack.
 * @param {string} destPathOrCb Either:
 * (i) destination path, where to unpack.
 * (ii) callback function, in case no destPath to be specified
 * @param {RunCallback} [cb] callback function. Will be called once unpack is done. If no errors, first parameter will contain `undefined`
 * @returns {void}
 * @remarks NOTE: Providing destination path is optional. In case it is not provided, cb is expected as the second argument to function.
 * @overload
 */
// function unpack(pathToPack: string, destPathOrCb: RunCallback, cb?: undefined): void;

/**
 * Unpack archive.
 * @param {string} pathToPack path to archive you want to unpack.
 * @param {RunCallback} destPathOrCb Either:
 * (i) destination path, where to unpack.
 * (ii) callback function, in case no destPath to be specified
 * @param {RunCallback} [cb] callback function. Will be called once unpack is done. If no errors, first parameter will contain `undefined`
 * @returns {void}
 * @remarks NOTE: Providing destination path is optional. In case it is not provided, cb is expected as the second argument to function.
 * @overload
 */
// function unpack(pathToPack: string, destPathOrCb: string, cb?: RunCallback): void;

/**
 * Unpack archive.
 * @param {string} pathToPack path to archive you want to unpack.
 * @param {string | RunCallback} destPathOrCb Either:
 * (i) destination path, where to unpack.
 * (ii) callback function, in case no destPath to be specified
 * @param {RunCallback} [cb] callback function. Will be called once unpack is done. If no errors, first parameter will contain `undefined`
 * @returns {void}
 * @remarks NOTE: Providing destination path is optional. In case it is not provided, cb is expected as the second argument to function.
 */
function unpack(pathToPack: string, destPathOrCb: string | RunCallback, cb?: RunCallback): void {
    if (typeof destPathOrCb === 'function' && cb === undefined) {
        cb = destPathOrCb;
        run(getPath(), ['x', pathToPack, '-y'], cb);
    } else {
        assert.ok(cb);
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        run(getPath(), ['x', pathToPack, '-y', '-o' + destPathOrCb], cb);
    }
}

/**
 * Pack file or folder to archive.
 * @param {string} pathToSrc path to file or folder you want to compress.
 * @param {string} pathToDest path to archive you want to create.
 * @param {RunCallback} cb callback function. Will be called once pack is done. If no errors, first parameter will contain `undefined`.
 * @returns {void}
 */
function pack(pathToSrc: string, pathToDest: string, cb: RunCallback): void {
    run(getPath(), ['a', pathToDest, pathToSrc], cb);
}

/**
 * Get an array with compressed file contents.
 * @param {string} pathToSrc path to file its content you want to list.
 * @param {RunCallback} cb callback function. Will be called once list is done. If no errors, first parameter will contain `undefined`.
 * @returns {void}
 */
function list(pathToSrc: string, cb: RunCallback): void {
    run(getPath(), ['l', '-slt', '-ba', pathToSrc], cb);
}

/**
 * Run 7za with parameters specified in `paramsArr`.
 * @param {string[]} paramsArr array of parameter. Each array item is one parameter.
 * @param {RunCallback} cb callback function. Will be called once command is done. If no errors, first parameter will contain `undefined`. If no output, second parameter will be `undefined`.
 * @returns {void}
 */
function cmd(paramsArr: string[], cb: RunCallback): void {
    run(getPath(), paramsArr, cb);
}

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {RunCallback} cb
 * @returns {void}
 */
function run(bin: string, args: string[], cb: RunCallback): void {
    cb = onceify(cb);
    const runError: Error = new Error(`Error running process "${bin}" with arguments ["${args.join('", "')}"]`); // get full stack trace
    const proc: ChildProcessWithoutNullStreams = spawn(bin, args, { windowsHide: true });
    let output: string = '';
    proc.on('error', function (err: Error): void {
        cb(err);
    });
    proc.on('exit', function (code: number | undefined): void {
        let result: SevenZipEntry[] | undefined = undefined;
        if (args[0] === 'l') {
            result = parseListOutput(output);
        }
        if (code) {
            runError.message = `7-zip exited with code ${code}\n${output}`;
        }
        cb(code ? runError : null, result);
    });
    proc.stdout.on('data', (chunk: Buffer | string): void => {
        output += chunk.toString();
    });
    proc.stderr.on('data', (chunk: Buffer | string): void => {
        output += chunk.toString();
    });
}

// http://stackoverflow.com/questions/30234908/javascript-v8-optimisation-and-leaking-arguments
// javascript V8 optimisation and “leaking arguments”
// making callback to be invoked only once

/**
 * @template {(...args: any) => any} TFunc
 * @param {TFunc} fn
 * @returns {(this: TFunc, ...args: Parameters<TFunc>) => void}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onceify<TFunc extends TypeFunctionWithArgs<[...args: any[]], any>>(
    fn: TFunc
): (this: TFunc, ...args: Parameters<TFunc>) => void {
    let called: boolean = false;
    return function (...args: Parameters<TFunc>): void {
        if (called) return;
        called = true;
        fn.apply(this, Array.prototype.slice.call(args)); // slice arguments
    };
}

/**
 * @param {string} str
 * @returns {SevenZipEntry[]}
 */
function parseListOutput(str: string): SevenZipEntry[] {
    if (str.length === 0) return [];
    str = str.replaceAll(/(\r\n|\n|\r)/gm, '\n');
    const items: string[] = str.split(/^\s*$/m);
    const res: SevenZipEntry[] = [];
    /** @type {ListMap} */
    const LIST_MAP: ListMap = {
        Path: 'name',
        Size: 'size',
        'Packed Size': 'compressed',
        Attributes: 'attr',
        Modified: 'dateTime',
        CRC: 'crc',
        Method: 'method',
        Block: 'block',
        Encrypted: 'encrypted',
    };

    if (items.length === 0) return [];

    for (const item of items) {
        if (item.length === 0) continue;
        /** @type {SevenZipEntry} */
        const obj: Partial<SevenZipEntry> = {};
        /** @type {string[]} */
        const lines: string[] = item.split('\n');
        if (lines.length === 0) continue;
        for (const line of lines) {
            // Split by first " = " occurrence. This will also add an empty 3rd elm to the array. Just ignore it
            /** @type {string[]} */
            const data: string[] = line.split(/ = (.*)/s);
            if (data.length !== 3) continue;
            assert.ok(data[0] && data[1]);
            /** @type {string} */
            const name: string = data[0].trim();
            /** @type {string} */
            const val: string = data[1].trim();
            if (LIST_MAP[name]) {
                if (LIST_MAP[name] === 'dateTime') {
                    /** @type {string[]} */
                    const dtArr: string[] = val.split(' ');
                    if (dtArr.length !== 2) continue;
                    assert.ok(dtArr[0] && dtArr[1]);
                    obj['date'] = dtArr[0];
                    obj['time'] = dtArr[1];
                } else {
                    // @ts-expect-error --- ignore that 'string' is not assignable to 'undefined'
                    obj[LIST_MAP[name]] = val;
                }
            }
        }
        // @ts-expect-error --- ignore that 'obj' is of type 'Partial<SevenZipEntry>' but shouldn't be.
        if (Object.keys(obj).length > 0) res.push(obj);
    }
    return res;
}

export default { unpack, pack, list, cmd };

// exports.unpack = unpack;
// exports.pack = pack;
// exports.list = list;
// exports.cmd = cmd;
