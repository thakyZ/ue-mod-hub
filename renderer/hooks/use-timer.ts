/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { UseStatePair } from '@typed/common';
import { useCallback, useEffect, useState } from 'react';

type SecondsLength = 1_000;
type MinutesLength = 60_000;
type HoursLength = 3_600_000;
type DaysLength = 86_400_000;

const SECOND: SecondsLength = 1_000;
const MINUTE: MinutesLength = (SECOND * 60) as MinutesLength;
const HOUR: HoursLength = (MINUTE * 60) as HoursLength;
const DAY: DaysLength = (HOUR * 24) as DaysLength;

export declare type Time = {
    d: number;
    h: number;
    m: number;
    s: number;
    ms: number;
};

export default function useTimer(initial: number, interval = SECOND): Time {
    const [time, setTime]: UseStatePair<Time> = useState<Time>({
        d: 0, // days
        h: 0, // hours
        m: 0, // mins
        s: 0, // secs
        ms: 0, // millisec
    });

    const updater: VoidFunction = useCallback(
        (): void =>
            setTime((_time: Time): Time => {
                const diff: number = Math.abs(Date.now() - initial);
                return {
                    d: Math.floor(diff / DAY),
                    h: Math.floor((diff / HOUR) % 24),
                    m: Math.floor((diff / MINUTE) % 60),
                    s: Math.floor((diff / SECOND) % 60),
                    ms: diff % 1000,
                };
            }),
        [initial]
    );

    useEffect((): VoidFunction => {
        const handle: NodeJS.Timeout = setInterval(updater, interval);
        return (): void => clearInterval(handle);
    }, [interval]);

    return time;
}
