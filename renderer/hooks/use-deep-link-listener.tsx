/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// import assert from 'node:assert';

import useAppLogger from '@hooks/use-app-logger';
import type { TypeFunction } from '@typed/common';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import type { HTMLAttributes, ReactElement } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export declare interface DeepLinkContextType {
    deepLink: string | null;
    linkChanged: boolean;
    consumeDeepLink: () => DeepLinkType | DeepLinkNXMType | undefined;
}

export declare type DeepLinkProviderProps = Pick<HTMLAttributes<HTMLDivElement>, 'children'>;

// Context for Localization
const DeepLinkContext = createContext<DeepLinkContextType>(undefined!);

export declare interface DeepLinkType {
    segments: string[];
    params: Record<string, string>;
    file_name?: string;
}

export declare interface DeepLinkNXMType extends DeepLinkType {
    game_slug: string;
    mod_id: number;
    file_id: number;
    expires: number;
    key: string;
}

// // dek-ue://???
// function parseDeepLink(deepLink: string | URL): DeepLinkType {
//     // Parse the deep link
//     const url = new URL(deepLink);
//     // Ensure the protocol is correct
//     if (url.protocol !== 'dek-ue:') {
//         logger('error', `Invalid DEAP Link Protocol: ${url.protocol}`);
//         return { segments: [], params: {} };
//     }
//     // Split and filter to get path segments
//     const segments: string[] = url.pathname.split('/').filter(Boolean);
//     // Use URLSearchParams to extract query parameters
//     const params: Record<string, string> = Object.fromEntries(url.searchParams.entries());
//     // Return the segments and params
//     return { segments, params };
// }

// nxm://palworld/mods/2017/files/8213?key=KWVYopKUGVMi42jyp9mt_Q&expires=1735734581&user_id=51283421
function parseDeepLinkNXM(link: string | URL): DeepLinkType | DeepLinkNXMType {
    const url: URL = new URL(link);
    if (url.protocol !== 'nxm:') {
        return { segments: [], params: {} };
    }
    const splits: string[] = url.pathname.split('/');
    const segments: string[] = splits.filter(Boolean);
    const params: Record<string, string> = Object.fromEntries(url.searchParams.entries());
    const [game_slug, _page_type, mod_id_str, _link_type, file_id_str] = segments;
    if (!game_slug) throw new Error(`Failed to get game slug from url ${link}`);
    if (!mod_id_str) throw new Error(`Failed to get mod id from url ${link}`);
    if (!file_id_str) throw new Error(`Failed to get file id from url ${link}`);
    const mod_id: number = Number.parseInt(mod_id_str);
    if (!Number.isInteger(mod_id)) throw new Error(`Failed parse mod id into number ${mod_id_str}`);
    const file_id: number = Number.parseInt(file_id_str);
    if (!Number.isInteger(file_id)) throw new Error(`Failed parse file id into number ${file_id_str}`);
    return { segments, params, game_slug, mod_id, file_id, ...params };
}

// DeepLink Provider Component
export const DeepLinkProvider = ({ children }: DeepLinkProviderProps): ReactElement<DeepLinkProviderProps> => {
    const [deepLink, setDeepLink] = useState<string | null>('');
    const [linkChanged, setLinkChanged] = useState<boolean>(false);
    const logger = useAppLogger('hooks/use-deep-link-listener');

    useEffect((): VoidFunction | void => {
        if (!window.ipc || deepLink === null || deepLink.length > 0) return;
        const removeLinkListener = window.ipc.on('open-deap-link', (_e: RendererIpcEvent, link: string): void => {
            void logger('info', `Received DEAP Link: ${link}`);
            setDeepLink(link);
        });
        return (): void => removeLinkListener();
    }, [deepLink]);

    useEffect((): void => {
        if (!deepLink) return;
        setLinkChanged(true);
    }, [deepLink]);

    // prettier-ignore
    const consumeDeepLink: TypeFunction<DeepLinkType | DeepLinkNXMType | undefined> = useCallback((): DeepLinkType | DeepLinkNXMType | undefined => {
        if (!deepLink) return undefined;
        const consumed = parseDeepLinkNXM(deepLink);
        setLinkChanged(false);
        setDeepLink(null);
        return consumed;
    }, [deepLink]);

    const exposed: DeepLinkContextType = { deepLink, linkChanged, consumeDeepLink };
    return <DeepLinkContext.Provider value={exposed}>{children}</DeepLinkContext.Provider>;
};

// Export actual hook to useLocalization
export default function useDeepLinkListener(): DeepLinkContextType {
    return useContext(DeepLinkContext);
}
