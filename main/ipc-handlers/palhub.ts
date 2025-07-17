/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import type { IpcMainInvokeEvent } from 'electron';

import Client from '@main/dek/palhub';
import type { MethodOf2Alt, MethodsOf } from '@typed/common';
import type { MainIpcEvent } from 'electron-ipc-extended';

// export default
export declare type PalHubProperties = MethodsOf<typeof Client>;

// /**
//  * @template {PalHubProperties} TFuncName
//  * @template {MethodOf2<typeof Client, TFuncName>} TFuncValue
//  * @param {IpcMainInvokeEvent} _event
//  * @param {TFuncName} action
//  * @param {...Parameters<TFuncValue>} args
//  * @returns {Promise<Awaited<ReturnType<TFuncValue>> | undefined>}
//  */
// export declare type PalHubIpcHandler = <
//     TFuncName extends PalHubProperties,
//     TFuncValue extends MethodOf2<typeof Client, TFuncName>,
// >(
//     event: IpcMainInvokeEvent,
//     action: TFuncName,
//     ...args: Parameters<TFuncValue>
// ) => Promise<Awaited<ReturnType<TFuncValue>> | undefined>;

// /**
//  * @template {PalHubProperties} TFuncName
//  * @template {MethodOf2<typeof Client, TFuncName>} TFuncValue
//  * @param {TFuncName} method
//  * @param {...Parameters<TFuncValue>} args
//  * @returns {Promise<Awaited<ReturnType<TFuncValue>> | undefined>}
//  */
// export declare type PalHubBinder<
//     TFuncName extends PalHubProperties = PalHubProperties,
//     TFuncValue extends MethodOf2<typeof Client, TFuncName> = MethodOf2<typeof Client, TFuncName>,
// > = (method: TFuncName, ...args: Parameters<TFuncValue>) => Promise<Awaited<ReturnType<TFuncValue>> | undefined>;

/**
 * @template {PalHubProperties} TFuncName
 * @template {MethodOf<typeof Client>} TFuncValue
 * @param {MainIpcEvent} _event
 * @param {TFuncName} action
 * @param {...Parameters<TFuncValue>} args
 * @returns {Promise<Awaited<ReturnType<TFuncValue>> | undefined>}
 */
// const _default: PalHubIpcHandler = async <TFuncName extends PalHubProperties, TFuncValue extends MethodOf2<typeof Client, TFuncName>>(
const _default = <TFuncName extends PalHubProperties, TFuncValue extends MethodOf2Alt<typeof Client, TFuncName>>(
    _event: MainIpcEvent,
    action: TFuncName,
    ...args: Parameters<TFuncValue>
): ReturnType<TFuncValue> | undefined => {
    if (Object.prototype.hasOwnProperty.call(Client, action)) {
        console.error(`PalHUB function ${action} not found`);
        return undefined;
    }
    const fn = Client[action] as CallableFunction;
    return fn(...args); // eslint-disable-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
};
export default _default;
