/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import DekDiv from '@components/core/dek-div';
import ModFileCard from '@components/core/mod-file-card';
import DekCommonAppModal from '@components/core/modal';
import useActiveGame from '@hooks/use-active-game';
import type { GameInformation } from '@hooks/use-common-checks';
import { handleError, isNXMDeepLink } from '@hooks/use-common-checks';
// import useCommonChecks from '@hooks/use-common-checks';
import type { DeepLinkNXMType, DeepLinkType } from '@hooks/use-deep-link-listener';
import useLocalization, { type UseLocalizationReturn } from '@hooks/use-localization';
import type { IFileInfo } from '@nexusmods/nexus-api';
import type { UseStatePair } from '@typed/common';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
// import Button from 'react-bootstrap/Button';

export declare interface NxmLinkModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    deepLinkData?: DeepLinkType | DeepLinkNXMType | null | undefined;
}

export declare interface Triggers {
    autoDownload: boolean;
    key: string;
    expires: number;
}

export default function NxmLinkModal({
    show,
    setShow,
    deepLinkData = null,
}: NxmLinkModalProps): ReactElement<NxmLinkModalProps> {
    // const { requiredModulesLoaded, commonAppData } = useCommonChecks();

    const onCancel: VoidFunction = useCallback((): void => setShow(false), [setShow]);
    const { activeGame } = useActiveGame();
    const { t }: UseLocalizationReturn = useLocalization();
    const game: GameInformation | undefined = activeGame;

    const [triggers, setTriggers]: UseStatePair<Triggers | null> = useState<Triggers | null>(null);
    const [file, setFile]: UseStatePair<IFileInfo | undefined | null> = useState<IFileInfo | undefined | null>(null);

    useEffect((): void => {
        if (!show) return;
        if (!isNXMDeepLink(deepLinkData) || !deepLinkData?.game_slug || !deepLinkData?.mod_id) {
            return;
            // onCancel();
        }

        void (async (): Promise<void> => {
            const api_key: string | null = await window.uStore.get<string | null>('api-keys.nexus');
            if (!api_key) return;
            const game_slug: string | undefined = deepLinkData.game_slug; //commonAppData?.selectedGame?.map_data.providers.nexus;
            const { files, file_updates: _file_updates } = await window.nexus(
                api_key,
                'getModFiles',
                deepLinkData.mod_id,
                game_slug
            );
            setFile(files.find((f: IFileInfo): boolean => f.file_id == deepLinkData.file_id));

            // 577
            // 6185

            setTriggers({
                autoDownload: true,
                key: deepLinkData.key,
                expires: deepLinkData.expires,
            });
        })().catch((error: unknown) => {
            handleError(error);
        });
    }, [show, deepLinkData, onCancel]);

    console.log('d', deepLinkData);

    const headerText = t('modals.nxm-link.head', { game, mod: deepLinkData });
    const modalOptions = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid p-3 px-4 text-start">
                {deepLinkData && file && <ModFileCard mod={deepLinkData} file={file} triggers={triggers} showHR={false} />}
            </DekDiv>
        </DekCommonAppModal>
    );
}
