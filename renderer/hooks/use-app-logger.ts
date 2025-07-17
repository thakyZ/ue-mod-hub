'use client';
/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
Used to create a logger wrapper for the application logger
*/

import type { LogLevelsType } from '@main/dek/logger';

export declare type AppLogger = ReturnType<typeof useAppLogger>;

export default function useAppLogger(id: string): (action: LogLevelsType, ...args: unknown[]) => Promise<void> {
    // return a function that will log to the application logger using id
    return async (action: LogLevelsType, ...args: unknown[]): Promise<void> => {
        if (window === undefined || !window?.ipc) return; // Ensure window ipc is defined
        await window.ipc.invoke('logger', `[${id}]`, action, ...args);
    };
}
