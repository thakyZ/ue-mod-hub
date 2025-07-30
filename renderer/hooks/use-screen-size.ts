/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import UseMediaQuery from '@hooks/use-media-query';
import type { UseStatePair } from '@typed/common';
import { useEffect, useState } from 'react';

export declare type ScreenSize = { isDesktop: boolean; hasWidth: boolean; hasHeight: boolean };

export default function useScreenSize(minWidth: string = '1024px', minHeight: string = '768px'): ScreenSize {
    const hasWidth: boolean = UseMediaQuery(`(min-width: ${minWidth})`);
    const hasHeight: boolean = UseMediaQuery(`(min-height: ${minHeight})`);
    const [isDesktop, setIsDesktop]: UseStatePair<boolean> = useState<boolean>(false);

    useEffect((): void => {
        setIsDesktop(hasWidth && hasHeight);
    }, [hasWidth, hasHeight]);

    return { isDesktop, hasWidth, hasHeight };
}
