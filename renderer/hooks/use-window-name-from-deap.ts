/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { useEffect, useState } from 'react';

export default function useWindowNameFromDEAP(): string {
    const [windowName, setWindowName] = useState<string>('');
    useEffect((): void => {
        if (!window.ipc || windowName.length > 0) return;
        void (async (): Promise<void> => {
            const name: string = await window.ipc.invoke('get-window-id');
            if (!name) return;
            console.log('get-window-name', name);
            setWindowName(name);
        })();
    }, [windowName]);
    return windowName;
}
