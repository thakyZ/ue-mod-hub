/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { UseStatePair } from '@typed/common';
import { useEffect, useState } from 'react';

export default function UseMediaQuery(query: string): boolean {
    const [matches, setMatches]: UseStatePair<boolean> = useState<boolean>(false);

    useEffect((): VoidFunction => {
        const media: MediaQueryList = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener: VoidFunction = (): void => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return (): void => window.removeEventListener('resize', listener);
    }, [matches, query]);

    return matches;
}
