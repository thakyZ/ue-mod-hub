/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { PromiseResolve } from '@typed/common';

export default async function wait(milliseconds: number = 1000): Promise<void> {
    return new Promise<void>((r: PromiseResolve<void>): NodeJS.Timeout => setTimeout(r, milliseconds));
}
