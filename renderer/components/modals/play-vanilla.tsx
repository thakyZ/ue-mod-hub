/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import DekDiv from '@components/core/dek-div';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
import useActiveGame from '@hooks/use-active-game';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { Dispatch, MouseEvent, MouseEventHandler, ReactElement, SetStateAction } from 'react';
import { useCallback } from 'react';
import Button from 'react-bootstrap/Button';

export declare interface PlayVanillaModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    onRunGameExe: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export default function PlayVanillaModal({
    show,
    setShow,
    onRunGameExe,
}: PlayVanillaModalProps): ReactElement<PlayVanillaModalProps> {
    const applog: AppLogger = useAppLogger('PlayVanillaModal');
    const { handleError, commonAppData }: CommonChecks = useCommonChecks();
    const onCancel: VoidFunction = useCallback((): void => setShow(false), [setShow]);
    const { activeGame } = useActiveGame();
    const game: GameInformation | undefined = activeGame;
    const { t }: Localization = useLocalization();

    const onClickPlayVanillaPalworld: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event: MouseEvent<HTMLButtonElement>): void => {
            (async (): Promise<void> => {
                if (!window.uStore) return console.error('uStore not loaded');
                if (!window.palhub) return console.error('palhub not loaded');
                if (!window.nexus) return console.error('nexus not loaded');
                // const game_path = await window.uStore.get('game_path');
                const game_path: string | undefined = commonAppData?.selectedGame?.path;
                if (!game_path) return console.error('game_path not found');

                /* const result: Record<string, boolean> | undefined = */ await window.palhub(
                    'uninstallAllMods',
                    game_path
                );
                // console.log({game_path, result});
                await onRunGameExe(event);
                onCancel();
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [onRunGameExe, commonAppData, applog, handleError, onCancel]
    );

    const headerText: string = t('modals.play-vanilla.head', { game });
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid p-3 px-4 text-center">
                <h3 className="">{t('common.warning')}</h3>
                <p className="lead text-warning mb-1">{t('modals.play-vanilla.info', { game })}</p>
                <p className="lead text-warning mb-1"></p>
                <strong className="lead text-warning">{t('modals.play-vanilla.warn')}</strong>
            </DekDiv>
            <DekDiv type="DekFoot" className="d-flex w-100 gap-3">
                <Button variant="danger" className="col p-2 px-3" disabled={false} onClick={onCancel}>
                    <strong>{t('common.cancel')}</strong>
                </Button>
                <Button variant="success" className="col p-2 px-3" disabled={false} onClick={onClickPlayVanillaPalworld}>
                    <strong>{t('common.confirm')}</strong>
                </Button>
            </DekDiv>
        </DekCommonAppModal>
    );
}
