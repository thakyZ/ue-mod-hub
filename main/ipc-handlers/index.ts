/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import detectGameInstallation from '@main/ipc-handlers/detect-game-installation';
import getUserCount from '@main/ipc-handlers/get-user-count';
import LoggerIpcHandler from '@main/ipc-handlers/logger';
import logger from '@main/ipc-handlers/logger';
import NexusIpcHandler from '@main/ipc-handlers/nexus';
import nexus from '@main/ipc-handlers/nexus';
import PalHubIpcHandler from '@main/ipc-handlers/palhub';
import palhub from '@main/ipc-handlers/palhub';
import ServerCacheIpcHandler from '@main/ipc-handlers/server-cache';
import serverCache from '@main/ipc-handlers/server-cache';
import UStoreIpcHandler from '@main/ipc-handlers/ustore';
import ustore from '@main/ipc-handlers/ustore';
import type { PromiseTypeFunction } from '@typed/common';

export declare interface IpcHandlersInterface {
    nexus: typeof NexusIpcHandler;
    palhub: typeof PalHubIpcHandler;
    uStore: typeof UStoreIpcHandler;
    logger: typeof LoggerIpcHandler;
    serverCache: typeof ServerCacheIpcHandler;
    'get-user-count': PromiseTypeFunction<number | null>;
    'detect-game-installation': PromiseTypeFunction<string | null>;
}

/** @type {IpcHandlersInterface} */
const _default: IpcHandlersInterface = {
    nexus: nexus,
    palhub: palhub,
    uStore: ustore,
    logger: logger,
    serverCache: serverCache,
    'get-user-count': getUserCount,
    'detect-game-installation': detectGameInstallation,
};

export default _default;
