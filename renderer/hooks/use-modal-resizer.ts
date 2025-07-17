/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { UseScreenSizeReturn } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';

export declare type UseModalResizerReturn = { fullscreen: boolean; height: string };

export default function useModalResizer(_size_type: null = null): UseModalResizerReturn {
    const { isDesktop }: UseScreenSizeReturn = useScreenSize();
    const fullscreen: boolean = !isDesktop;
    const height: string = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    // switch (size_type) {
    //     case 'fullscreen': return {fullscreen: fullscreen, height: height};
    // }
    return { fullscreen: fullscreen, height: height };
}
