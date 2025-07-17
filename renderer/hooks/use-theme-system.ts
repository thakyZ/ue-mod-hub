/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import { parse } from 'dotenv';
import { parseIntSafe } from '@hooks/use-common-checks';
import { useCallback, useEffect, useState } from 'react';

// theme files should be located in /public/themes
export const THEMES = [
    'modhub',
    'ff7',
    'mako',
    'pals',
    'ikon',
    'khakii',
    'hogleg',
    'stellar',

    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',

    // 'vivid1',
    // 'dek-dark',
    // 'dek-light',
    // 'steg1',
    // 'burnt-orange',
    // 'nature2',
    // 'nature3',
    // 'nature4',
    // 'purple1',
    // 'purple2',
] as const;

export declare type Themes = (typeof THEMES)[number];
export declare type BackgroundOpacityConstraint = 0 | 1 | 2;

export declare interface UseThemeSystemReturn {
    theme_id: number;
    setThemeID: (newtheme: Themes) => number | null;
    bg_id: number;
    setBgID: (newbg: number) => number | null;
    bg_opac: BackgroundOpacityConstraint;
    setBgOpac: (newopac: BackgroundOpacityConstraint) => BackgroundOpacityConstraint | null;
}

export default function useThemeSystem(_game_id: string): UseThemeSystemReturn {
    // const [theme_id, setTempThemeID] = useState(Number.parseInt(base_theme_id));
    const [theme_id, setTempThemeID] = useState<number>(0);
    const [bg_opac, setTempBgOpac] = useState<BackgroundOpacityConstraint>(0);
    const [bg_id, setTempBgID] = useState<number>(0);

    const setThemeID = useCallback((newtheme: Themes): number | null => {
        if (typeof window === 'undefined') return null;
        if (!THEMES.includes(newtheme)) return null;
        const new_id: number = THEMES.indexOf(newtheme);
        localStorage.setItem('utheme-id', new_id.toString());
        setTempThemeID(new_id);
        return new_id;
    }, []);

    const setBgID = useCallback((newbg: number): number | null => {
        if (typeof window === 'undefined') return null;
        if (newbg < 0 || newbg >= 10) return null;
        localStorage.setItem('utheme-bg', newbg.toString());
        setTempBgID(newbg);
        return newbg;
    }, []);

    const setBgOpac = useCallback((newopac: BackgroundOpacityConstraint): BackgroundOpacityConstraint | null => {
        if (typeof window === 'undefined') return null;
        localStorage.setItem('utheme-bgopac', newopac.toString());
        setTempBgOpac(newopac);
        return newopac;
    }, []);

    useEffect((): void => {
        // prettier-ignore
        const lockIntToBackgroundOpacityConstraint = (value: string | undefined | null): BackgroundOpacityConstraint | undefined =>
            value ? Math.min(Math.max(parseIntSafe(value)!, 0), 2) as BackgroundOpacityConstraint | undefined : undefined;
        let base_theme_id: number = 0;
        let base_theme_bg: number = 0;
        let base_theme_opac: BackgroundOpacityConstraint = 0;
        if (typeof window !== 'undefined') {
            // localStorage.setItem(key, value)
            base_theme_id = parseIntSafe(window.localStorage.getItem('utheme-id') ?? undefined) || 7;
            base_theme_bg = parseIntSafe(window.localStorage.getItem('utheme-bg') ?? undefined) || 0;
            base_theme_opac = lockIntToBackgroundOpacityConstraint(window.localStorage.getItem('utheme-bgopac')) || 0;
        }
        setTempThemeID(base_theme_id);
        setTempBgID(base_theme_bg);
        setTempBgOpac(base_theme_opac);
    }, []);

    // return theme_id and setter function for hook
    return { theme_id, setThemeID, bg_id, setBgID, bg_opac, setBgOpac };
}
