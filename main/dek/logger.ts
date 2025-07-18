/**
 * @module logger.js
 * @summary handles logging with additional functionality.
 * @author DekitaRPG <dekitarpg@gmail.com>
 * @example
 * // opts are OPTIONAL!
 * import createLogger, { LoggyBoi, setGlobalOptions } from '@main/dek/logger.js';
 *
 * const log = createLogger(__filename, {
 * file_options: {
 * filename: 'somefile.log',
 *         options: {flags: 'a', encoding: 'utf8'},
 *     },
 *     http_options: {
 *         port: 1234,  // tcp only
 *         host: 'localhost', // tcp only
 *         path: 'someurlpath', // ipc only
 *     },
 *
 *     file_record: {
 *         fatal: true,
 *         error: true,
 *         warn: false,
 *         http: false,
 *         info: false,
 *     },
 *     log_colors: {
 *         fatal: 'red',
 *         error: 'red',
 *         warn: 'yellow',
 *         http: 'green',
 *         info: 'cyan',
 *     },
 * });
 *
 * log.info('my awesome log');
 * // => 21:22:36 PM [filename] my awesome log
 *
 * // to extend class functionality:
 * class KustoomLoog extends LoggyBoi {}
 */

/*
 * File System Flags in Node.js:
 *
 * 'r'   - Open file for reading. Throws an error if the file does not exist.
 * 'r+'  - Open file for reading and writing. Throws an error if the file does not exist.
 * 'rs+' - Open file for reading and writing in synchronous mode. Skips local file system cache.
 *
 * 'w'   - Open file for writing. Creates the file if it does not exist, or truncates it if it exists.
 * 'wx'  - Like 'w', but fails if the file already exists.
 * 'w+'  - Open file for reading and writing. Creates the file if it does not exist, or truncates it if it exists.
 * 'wx+' - Like 'w+', but fails if the file already exists.
 *
 * 'a'   - Open file for appending. Creates the file if it does not exist.
 * 'ax'  - Like 'a', but fails if the file already exists.
 * 'a+'  - Open file for reading and appending. Creates the file if it does not exist.
 * 'ax+' - Like 'a+', but fails if the file already exists.
 */

import assert from 'node:assert';
import console, { Console } from 'node:console';
import type { WriteStream } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { Socket } from 'node:net';

import { DateTime } from 'luxon';

export declare type LogLevelsType = 'fatal' | 'error' | 'warn' | 'http' | 'info' | 'log';
export declare type LogColorsType =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'crimson';
export declare type FileRecord = Record<LogLevelsType, boolean>;
export declare type SendRecord = Record<LogLevelsType, boolean>;
export declare type LogColors = Record<LogLevelsType, LogColorsType>;
export declare type LogFormatterParam0ObjectType = {
    level: LogLevelsType;
    datetime?: string;
    id: string;
    message: string | Error;
    metadata: unknown;
    color: LogColorsType;
};
export declare type LogTransportType = 'http' | 'console' | 'file';
export declare type LogFormatter = (
    param0: LogFormatterParam0ObjectType,
    transport: LogTransportType,
    logger: LoggyBoi
) => [LogLevelsType, string | undefined, string | undefined, string | Error];
type CreateFileStreamParams = Parameters<typeof createWriteStream>[1];
export declare type FileOptions = {
    filename: string;
    options?: CreateFileStreamParams;
};
export declare type HttpOptions = {
    path: string;
    host: string;
    port: number;
};
export declare type GlobalOptions = {
    log_format: LogFormatter | undefined;
    log_colors: LogColors;
    send_record: SendRecord;
    file_record: FileRecord;
    file_options: FileOptions;
    http_options: HttpOptions;
};
export declare type LoggerMethods = {
    [key in LogLevelsType]: (...args: unknown[]) => void;
};

const colors = {
    reset: '\u001B[0m',
    bright: '\u001B[1m',
    dim: '\u001B[2m',
    underscore: '\u001B[4m',
    blink: '\u001B[5m',
    reverse: '\u001B[7m',
    hidden: '\u001B[8m',

    fg: {
        black: '\u001B[30m',
        red: '\u001B[31m',
        green: '\u001B[32m',
        yellow: '\u001B[33m',
        blue: '\u001B[34m',
        magenta: '\u001B[35m',
        cyan: '\u001B[36m',
        white: '\u001B[37m',
        crimson: '\u001B[38m', // Scarlet
    },
    bg: {
        black: '\u001B[40m',
        red: '\u001B[41m',
        green: '\u001B[42m',
        yellow: '\u001B[43m',
        blue: '\u001B[44m',
        magenta: '\u001B[45m',
        cyan: '\u001B[46m',
        white: '\u001B[47m',
        crimson: '\u001B[48m',
    },
};

// should log type be recorded to error file
/** @type {FileRecord} */
const LOG_RECORD: FileRecord = {
    fatal: true,
    error: true,
    warn: true,
    http: true,
    info: true,
    log: false,
};

/** @type {SendRecord} */
const LOG_SEND: SendRecord = {
    fatal: false,
    error: false,
    warn: false,
    http: false,
    info: false,
    log: false,
};

/** @type {LogColors} */
const LOG_COLORS: LogColors = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    http: 'green',
    info: 'cyan',
    log: 'cyan',
};

// transport: 'console', 'file', 'http'
/** @type {LogFormatter} */
const LOG_FORMATTER: LogFormatter = (
    { level, datetime, id, message, metadata: _metadata, color }: LogFormatterParam0ObjectType,
    transport: LogTransportType,
    logger: LoggyBoi
): [LogLevelsType, string | undefined, string, string | Error] => {
    switch (transport) {
        // return object for http so it sends log as json <3
        // case 'http': return {level, datetime, id, message, metadata};

        // colorize elements for console logging only
        // (adds extra characters for color codes)
        case 'console':
            level = logger.colorize(color, level.toUpperCase()) as LogLevelsType;
            id = logger.colorize(color, id);
            break;
    }
    // return array used for log format..
    return [level, datetime, id, message];
};

// new FileTransport({filename, options});
class FileTransport extends Console {
    /**
     * @type {string}
     * @public
     */
    filename: string;

    /** @param {Partial<FileOptions>} file_options */
    constructor(file_options: Partial<FileOptions>) {
        /** @type {Partial<FileOptions>} */
        const { filename = '', options = {} }: Partial<FileOptions> = file_options;
        /** @type {WriteStream} */
        const log_stream: WriteStream = createWriteStream(filename, options);
        super({ stdout: log_stream, stderr: log_stream });
        /** @type {string} */
        this.filename = filename;
    }
}

// new HTTPTransport({path}); // ipc
// new HTTPTransport({host, port}); // tcp
class HTTPTransport extends Console {
    /** @param {Partial<HttpOptions>} http_options */
    constructor(http_options: Partial<HttpOptions>) {
        /** @type {Socket} */
        const socket: Socket = new Socket();
        /** @type {Partial<HttpOptions>} */
        const { path, host, port }: Partial<HttpOptions> = http_options;
        if (!path && !host && !port)
            throw new Error(
                'Invalid parameters for HTTPTransport, either `path` must be specified or both `host` and `port`. None were provided.'
            );
        else if (host && !port)
            throw new Error(
                'Invalid parameters for HTTPTransport, either `path` must be specified or both `host` and `port`. `port` was not provided.'
            );
        else if (!host && port)
            throw new Error(
                'Invalid parameters for HTTPTransport, either `path` must be specified or both `host` and `port`. `host` was not provided.'
            );
        else if (path)
            socket.connect({ path }); // ipc
        else {
            assert.ok(host && port);
            socket.connect({ port, host }); // tcp
        }
        super({ stdout: socket, stderr: socket });
    }
}

class LoggyBoi {
    /**
     * @type {string | undefined}
     * @static
     */
    static logpath: string | undefined;

    /**
     * @type {string | undefined}
     */
    idtag: string | undefined;

    /**
     * @type {FileRecord | undefined}
     * @static
     * @private
     */
    static _grecord: FileRecord | undefined;

    /**
     * @type {FileRecord | undefined}
     */
    file_record: FileRecord | undefined;

    /**
     * @type {SendRecord | undefined}
     * @static
     * @private
     */
    static _gsend: SendRecord | undefined;

    /**
     * @type {SendRecord | undefined}
     */
    http_record: SendRecord | undefined;

    /**
     * @type {LogColors | undefined}
     * @static
     * @private
     */
    static _gcolors: LogColors | undefined;

    /**
     * @type {LogColors | undefined}
     */
    log_colors: LogColors | undefined;

    /**
     * @type {LogFormatter | undefined}
     * @static
     * @private
     */
    static _gformatter: LogFormatter | undefined;

    /**
     * @type {LogFormatter | undefined}
     * @private
     */
    _formatter: LogFormatter | undefined;

    /**
     * @type {FileTransport | undefined}
     * @static
     * @private
     */
    static _gfilestream: FileTransport | undefined;

    /**
     * @type {FileTransport | undefined}
     * @private
     */
    _filestream: FileTransport | undefined;

    /**
     * @type {HTTPTransport | undefined}
     * @static
     * @private
     */
    static _ghttpstream: HTTPTransport | undefined;

    /**
     * @type {HTTPTransport | undefined}
     * @private
     */
    _httpstream: HTTPTransport | undefined;

    /**
     * sets global defaults for all loggers created in future
     * @static
     * @param {Partial<GlobalOptions>} [global_options={}]
     * @returns {void}
     */
    static setGlobalOptions(global_options: Partial<GlobalOptions> = {}): void {
        type GlobalOptionsDeconstruct = {
            log_format?: LogFormatter | undefined;
            log_colors?: Partial<LogColors>;
            send_record?: Partial<SendRecord>;
            file_record?: Partial<FileRecord>;
            file_options?: Partial<FileOptions>;
            http_options?: Partial<HttpOptions>;
        };
        /** @type {GlobalOptionsDeconstruct} */
        const {
            log_format = undefined,
            log_colors = {},
            send_record = {},
            file_record = {},
            file_options = {},
            http_options = {},
        }: GlobalOptionsDeconstruct = global_options;

        this._grecord = {
            ...LOG_RECORD,
            ...file_record,
        };
        this._gsend = {
            ...LOG_SEND,
            ...send_record,
        };
        this._gcolors = {
            ...LOG_COLORS,
            ...log_colors,
        };
        this._gformatter = log_format || LOG_FORMATTER;
        console.log('global options set:', file_options);
        if (this.validFileOptions(file_options)) {
            this._gfilestream = new FileTransport(file_options);
        }
        if (this.validHTTPOptions(http_options)) {
            this._ghttpstream = new HTTPTransport(http_options);
        }
    }

    /**
     * @param {unknown} file_options
     * @returns {file_options is FileOptions} based on if file_options is valid
     */
    static validFileOptions(file_options: unknown): file_options is FileOptions {
        return (
            file_options !== undefined &&
            file_options !== null &&
            Object.hasOwn(file_options, 'filename') &&
            Object.values(Object.keys(file_options as FileOptions).indexOf('filename')) !== undefined
        );
    }

    /**
     * @param {unknown} http_options
     * @returns {http_options is HttpOptions} based on if http_options is valid
     */
    static validHTTPOptions(http_options: unknown): http_options is HttpOptions {
        return (
            http_options !== undefined &&
            http_options !== null &&
            ((Object.hasOwn(http_options, 'path') &&
                Object.values(Object.keys(http_options as HttpOptions).indexOf('path')) !== undefined) ||
                (Object.hasOwn(http_options, 'port') &&
                    Object.values(Object.keys(http_options as HttpOptions).indexOf('port')) !== undefined))
        );
    }

    /**
     * @param {string} id_or_filename
     * @param {Partial<GlobalOptions>} [logger_options={}]
     */
    constructor(id_or_filename: string, logger_options?: Partial<GlobalOptions>) {
        this.initialize(id_or_filename, logger_options);
    }

    /**
     * @param {string} id_or_filename
     * @param {Partial<GlobalOptions>} [logger_options={}]
     * @returns {void}
     */
    initialize(id_or_filename: string, logger_options: Partial<GlobalOptions> = {}): void {
        type GlobalOptionsDeconstruct = {
            log_colors?: Partial<LogColors>;
            send_record?: Partial<SendRecord>;
            file_record?: Partial<FileRecord>;
        };
        /** @type {GlobalOptionsDeconstruct} */
        const { file_record = {}, send_record = {}, log_colors = {} }: GlobalOptionsDeconstruct = logger_options;
        this.file_record = { ...LoggyBoi._grecord, ...file_record } as FileRecord;
        this.http_record = { ...LoggyBoi._gsend, ...send_record } as SendRecord;
        this.log_colors = { ...LoggyBoi._gcolors, ...log_colors } as LogColors;
        this.addFileTransport(logger_options.file_options);
        this.addHTTPTransport(logger_options.http_options);
        this.setFormatter(logger_options.log_format);
        this.setID(id_or_filename);
    }

    /**
     * @param {LogFormatter} formatter_function
     * @returns {void}
     */
    setFormatter(formatter_function?: LogFormatter | null): void {
        this._formatter = formatter_function || LoggyBoi._gformatter;
    }

    /**
     * @param {Partial<FileOptions>} [file_options={}]
     * @returns {void}
     */
    addFileTransport(file_options: Partial<FileOptions> = {}): void {
        this._filestream = LoggyBoi.validFileOptions(file_options)
            ? new FileTransport(file_options)
            : LoggyBoi._gfilestream;
    }

    /**
     * @param {Partial<HttpOptions>} [http_options={}]
     * @returns {void}
     */
    addHTTPTransport(http_options: Partial<HttpOptions> = {}): void {
        this._httpstream = LoggyBoi.validFileOptions(http_options)
            ? new FileTransport(http_options)
            : LoggyBoi._ghttpstream;
    }

    /**
     * @param {string} id_or_filename
     * @returns {void}
     */
    setID(id_or_filename: string): void {
        /** @type {string} */
        let idtag: string = String(id_or_filename);
        if (idtag.startsWith('/')) {
            const replacer = /\/bot-.*\/src\//g;
            idtag = idtag.replaceAll(replacer, '');
        }
        if (idtag.endsWith('.js')) {
            idtag = idtag.replace('.js', '');
            idtag = `[${idtag}]`;
        }
        this.idtag = idtag;
    }

    /**
     * @param {LogColorsType} color
     * @param {string} text
     * @returns {string}
     */
    colorize(color: LogColorsType, text: string): string {
        return `${colors.fg[color]}${text}${colors.reset}`;
    }

    /**
     * @public
     * @type {LoggyBoi}
     */
    get Logger() {
        return LoggyBoi;
    } //for creating children if needed

    /**
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async log(...args: [message: string, metadata?: unknown]): Promise<void> {
        await this._log('info', ...args);
    } // should use .info instead.

    /**
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async info(...args: [message: string, metadata?: unknown]): Promise<void> {
        await this._log('info', ...args);
    }

    /**
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async http(...args: [message: string, metadata?: unknown]): Promise<void> {
        await this._log('http', ...args);
    }

    /**
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async warn(...args: [message: string, metadata?: unknown]): Promise<void> {
        await this._log('warn', ...args);
    }

    /**
     * @param {...[level: LogLevelsType, message: string | Error, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async error(...args: [message: string | Error, metadata?: unknown]): Promise<void> {
        await this._log('error', ...args);
    }

    /**
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async fatal(...args: [message: string, metadata?: unknown]): Promise<void> {
        await this._log('fatal', ...args);
    }

    /** @type {string} */
    get timestamp(): string {
        return DateTime.now().toLocaleString(DateTime.DATETIME_MED);
    }

    /**
     * @param {LogLevelsType} log_level
     * @param {...unknown} rest
     * @returns {Promise<void>}
     */
    async tofile(log_level: LogLevelsType, ...rest: unknown[]): Promise<void> {
        if (!this._filestream) return;
        await (this._filestream[log_level as keyof Console] as (...args: unknown[]) => Promise<void>)(
            this.timestamp,
            this.idtag,
            ...rest
        );
    }

    /**
     * @private
     * @param {LogLevelsType} level
     * @param {...[level: LogLevelsType, message: string, metadata?: unknown]} args
     * @returns {Promise<void>}
     */
    async _log(level: LogLevelsType, ...args: [message: string | Error, metadata?: unknown]): Promise<void> {
        assert.ok(this._formatter, new Error("LoggyBoi's formatter function is undefined, this should not happen."));
        /** @type {LogFormatterParam0ObjectType} */
        const format_data: LogFormatterParam0ObjectType = this._formatArgs(level, ...args);
        await (console[level as keyof Console] as (...args: unknown[]) => Promise<void>)(
            ...this._formatter(format_data, 'console', this)
        ); // regular console log:
        if (this._filestream && this.file_record?.[level]) {
            // log to file::
            await (this._filestream[level as keyof Console] as (...args: unknown[]) => Promise<void>)(
                ...this._formatter(format_data, 'file', this)
            );
        }
        if (this._httpstream && this.http_record?.[level]) {
            // log to http::
            await (this._httpstream[level as keyof Console] as (...args: unknown[]) => Promise<void>)(
                ...this._formatter(format_data, 'http', this)
            );
        }
    }

    /**
     * @private
     * Converts arguments sent to _log function into an object
     * @param {LogLevelsType} level
     * @param {string} message
     * @param {unknown} [metadata={}]
     * @returns {LogFormatterParam0ObjectType}
     */
    _formatArgs(level: LogLevelsType, message: string | Error, metadata: unknown = {}): LogFormatterParam0ObjectType {
        assert.ok(this.idtag && this.log_colors);
        return {
            id: this.idtag,
            datetime: this.timestamp,
            color: this.log_colors[level],
            level,
            message,
            metadata,
        };
    }
}

// initialize default values
// LoggyBoi.setGlobalOptions();

// export as function to quickly create new logger

/**
 * @param {string} idtag
 * @param {Partial<GlobalOptions> | undefined} [options]
 * @returns {LoggyBoi}
 */
export default function createLogger(idtag: string, options?: Partial<GlobalOptions>): LoggyBoi {
    return new LoggyBoi(idtag, options);
}

// export class as import { LoggyBoi } from 'module';
export { LoggyBoi };

// export function for setGlobalOptions

/**
 * @param {...Partial<GlobalOptions>} args
 * @returns {void}
 */
export function setGlobalOptions(...args: [global_options?: Partial<GlobalOptions>]): void {
    LoggyBoi.setGlobalOptions(...args);
}
