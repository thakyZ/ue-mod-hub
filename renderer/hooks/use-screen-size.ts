/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import useMediaQuery from '@hooks/use-media-query';
import { useEffect, useState } from 'react';

export declare type UseScreenSizeReturn = { isDesktop: boolean; hasWidth: boolean; hasHeight: boolean };

export default function useScreenSize(minWidth: string = '1024px', minHeight: string = '768px'): UseScreenSizeReturn {
    const hasWidth: boolean = useMediaQuery(`(min-width: ${minWidth})`);
    const hasHeight: boolean = useMediaQuery(`(min-height: ${minHeight})`);
    const [isDesktop, setIsDesktop] = useState<boolean>(false);

    useEffect((): void => {
        setIsDesktop(hasWidth && hasHeight);
    }, [hasWidth, hasHeight]);

    return { isDesktop, hasWidth, hasHeight };
}
