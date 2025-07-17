/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
use as: 

import useSwrJSON, {fetcher, mutate} from '@hooks/useSwrJSON';

export default function SomePageOrComponent(){
    const {data, error, loading, mutate } = useSwrJSON(`/api/endpoint`);
    if (loading) return (<h1>Loading...</h1>);
    if (error) return (<h1>{error}</h1>);
    return (<pre>{data}</pre>);
}
*/

import useSWR, { useSWRConfig as config } from 'swr';
import type {
    Arguments,
    BareFetcher,
    BlockingData,
    FetcherResponse,
    FullConfiguration,
    Key,
    KeyedMutator,
    SWRConfiguration,
    SWRResponse,
} from 'swr/dist/_internal';

export const useSWRConfig = config;

export const mutate = async <TData = unknown, TMutationData = TData>(
    routekey: (key?: Arguments) => boolean
): Promise<Array<TMutationData | undefined>> => {
    const { mutate: safetate }: FullConfiguration = useSWRConfig();
    return await safetate<TData, TMutationData>(routekey);
};

export const fetcher = async <
    TData extends object,
    TError = Error,
    TOutput extends Partial<TData> & { error?: TError } = Partial<TData> & { error?: TError },
>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<TOutput> => {
    // await wait(10_000); // for testing slow connections
    try {
        const res: Response = await fetch(input, init);
        return (await res.json()) as TOutput;
    } catch (error) {
        return { error: error as TError } as TOutput;
    }
};

export declare type UseSwrJsonReturn<
    TData extends object,
    TError = unknown,
    TOutput extends Partial<TData> & { error?: TError } = Partial<TData> & { error?: TError },
    SWROptions extends SWRConfiguration<TOutput, TError, BareFetcher<TOutput>> | undefined =
        | SWRConfiguration<TOutput, TError, BareFetcher<TOutput>>
        | undefined,
> = {
    data: BlockingData<TOutput, SWROptions> extends true ? TOutput : TOutput | undefined;
    error: TError | undefined;
    loading: boolean;
    mutate: KeyedMutator<TOutput>;
};

export default function useSwrJSON<
    TData extends object,
    TError,
    TOutput extends Partial<TData> & { error?: TError } = Partial<TData> & { error?: TError },
    SWROptions extends SWRConfiguration<TOutput, TError, BareFetcher<TOutput>> | undefined =
        | SWRConfiguration<TOutput, TError, BareFetcher<TOutput>>
        | undefined,
>(
    url: Key,
    options: Partial<SWROptions> = {},
    fetchoptions?: RequestInit
): UseSwrJsonReturn<TData, TError, TOutput, SWROptions> {
    // prettier-ignore
    const thisfetcher: BareFetcher<TOutput> = (): FetcherResponse<TOutput> => fetcher<TData, TError, TOutput>(url as string, fetchoptions)
    const newLocal = useSWR<TOutput, TError, SWROptions>(url, thisfetcher, options as SWROptions);
    const { data, error, mutate, isValidating }: SWRResponse<TOutput, TError, SWROptions> = newLocal;
    const loading = !data && !error && !isValidating;
    return { data, error, loading, mutate };
}
