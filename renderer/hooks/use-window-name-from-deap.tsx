/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { UseStatePair } from '@typed/common';
import { useEffect, useState } from 'react';

export default function UseWindowNameFromDEAP(): string {
    const { handleError }: CommonChecks = useCommonChecks();
    const applog: AppLogger = useAppLogger('useWindowNameFromDEAP');
    const [windowName, setWindowName]: UseStatePair<string> = useState<string>('');
    useEffect((): void => {
        if (!window.ipc || windowName.length > 0) return;
        (async (): Promise<void> => {
            const name: string = await window.ipc.invoke('get-window-id');
            if (!name) return;
            console.log('get-window-name', name);
            setWindowName(name);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [windowName, handleError, applog]);
    return windowName;
}
