/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { UseSwrJsonReturn } from '@hooks/use-swr-json';
import json from '@hooks/use-swr-json';
import type { BareFetcher, SWRConfiguration } from 'swr';

export declare type Stats = {
    error: unknown;
    todo: {
        data: unknown;
    };
    refreshInterval: number;
};

function fallbackStats(): Partial<Stats> {
    return { todo: { data: null } };
}

export default function swrStats<
    TError = unknown,
    TOutput extends Partial<Stats> & { error?: TError } = Partial<Stats> & { error?: TError },
    SWROptions extends SWRConfiguration<TOutput, TError, BareFetcher<TOutput>> | undefined =
        | SWRConfiguration<TOutput, TError, BareFetcher<TOutput>>
        | undefined,
>(
    refreshInterval: number = 10000,
    fallbackData: Partial<Stats> = fallbackStats(),
    path: string = `/api/stats`,
    opts: Partial<SWROptions> = {}
): UseSwrJsonReturn<Stats, TError, TOutput, SWROptions> {
    return json<Stats, TError, TOutput, SWROptions>(path, { fallbackData, refreshInterval, ...opts });
}
