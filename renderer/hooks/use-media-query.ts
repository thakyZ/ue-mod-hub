/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useEffect, useState } from 'react';

const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect((): VoidFunction => {
        const media: MediaQueryList = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = (): void => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return (): void => window.removeEventListener('resize', listener);
    }, [matches, query]);

    return matches;
};

export default useMediaQuery;
