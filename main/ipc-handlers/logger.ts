/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DEAP from '@main/dek/deap';
import type { LoggerMethods, LogLevelsType } from '@main/dek/logger';
import type { MainIpcEvent } from 'electron-ipc-extended';

/** @type {Record<string, LoggerMethods>} */
const logger_cache: Record<string, LoggerMethods> = {};

// export declare type LoggerIpcHandler = (event: IpcMainInvokeEvent, id: string, action: LogLevelsType, ...args: unknown[]) => void;

// export default

/**
 * @param {IpcMainInvokeEvent} _event
 * @param {string} id
 * @param {LogLevelsType} action
 * @param {...unknown} args
 * @returns {void}
 */
const _default = (_event: MainIpcEvent, id: string, action: LogLevelsType, ...args: unknown[]): void => {
    if (!logger_cache[id]) logger_cache[id] = DEAP.useLogger(id);
    if (logger_cache[id][action]) logger_cache[id][action](...args);
};
export default _default;
