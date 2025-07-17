'use client';
/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo } from 'react';

export declare interface UseFixMissingScrollProps {
    hasMoreItems: boolean;
    fetchMoreItems: VoidFunction;
    query?: string;
}

function useFixMissingScroll({ hasMoreItems, fetchMoreItems, query = 'main-body' }: UseFixMissingScrollProps): void {
    const mainElement: Element | null = useMemo((): Element | null => document?.querySelector(query), []);
    /** @returns {void} */
    const fetchCb: VoidFunction = useCallback((): void => {
        fetchMoreItems();
    }, [fetchMoreItems]);
    useEffect((): void => {
        const hasScroll: boolean = mainElement ? mainElement.scrollHeight > mainElement.clientHeight : false;
        if (!hasScroll && hasMoreItems) setTimeout((): void => fetchCb(), 100);
    }, [hasMoreItems, fetchCb, mainElement]);
}

export default useFixMissingScroll;
