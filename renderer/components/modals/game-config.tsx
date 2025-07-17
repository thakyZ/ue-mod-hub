/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DekChoice from '@components/core/dek-choice';
import DekDiv from '@components/core/dek-div';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
import GameConfiguration from '@components/game-options';
import UE4SSInstallProgress from '@components/ue4ss-install';
import Ue4ssConfigurator from '@components/ue4ss-options';
import useAppLogger from '@hooks/use-app-logger';
import type { GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
import useScreenSize from '@hooks/use-screen-size';
import wait from '@utils/wait';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

export declare interface GameConfigurationModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    tempGame: GameInformation | null;
    setTempGame: Dispatch<SetStateAction<GameInformation | null>>;
}

export default function GameConfigurationModal({
    show,
    setShow,
    tempGame,
    setTempGame,
}: GameConfigurationModalProps): ReactElement<GameConfigurationModalProps> {
    const applog = useAppLogger('GameConfigurationModal');
    const { requiredModulesLoaded, commonAppData, updateSelectedGame } = useCommonChecks();
    const [settingsPageID, setSettingsPageID] = useState<number>(0);
    const { t, tA } = useLocalization(); //'ue4ss');
    const { isDesktop } = useScreenSize();
    const fullscreen = !isDesktop;

    const cache_dir = commonAppData?.cache;
    // const api_key = commonAppData?.apis?.nexus;

    // const height = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const height = fullscreen ? 'calc(100vh - 96px)' : 'calc(100vh / 4 * 2 + 26px)';

    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        setTimeout((): void => {
            setSettingsPageID(0);
        }, 250);
    }, [setShow]);

    // const onResetData: VoidFunction = useCallback((): void => {
    //     setHasChanges(false);
    //     setShowAdvanced(false);
    // }, []);

    const runModloaderTask = useCallback(
        (task: 'install' | 'uninstall' | 'update'): void => {
            (async () => {
                if (!requiredModulesLoaded || !tempGame || !cache_dir) return;
                console.log('runModloaderTask:', task, tempGame);
                switch (task) {
                    case 'install': {
                        setSettingsPageID(2);
                        const { modloader } = tempGame.map_data.platforms[tempGame.launch_type]!;
                        if (modloader?.ue4ss) {
                            await wait(1000);
                            await window.palhub('downloadAndInstallUE4SS', cache_dir, tempGame.path, modloader.ue4ss);
                            await updateSelectedGame(
                                tempGame,
                                // eslint-disable-next-line @typescript-eslint/require-await
                                async (selectedGame: GameInformation | null): Promise<void> => setTempGame(selectedGame)
                            );
                        } else {
                            throw new Error('UE4SS path not provided');
                        }
                        break;
                    }
                    case 'uninstall': {
                        setSettingsPageID(2);
                        const { modloader } = tempGame.map_data.platforms[tempGame.launch_type]!;
                        if (modloader?.ue4ss) {
                            await wait(1000);
                            await window.palhub('uninstallUE4SS', cache_dir, tempGame.path, modloader.ue4ss);
                            await updateSelectedGame(
                                tempGame,
                                // eslint-disable-next-line @typescript-eslint/require-await
                                async (selectedGame: GameInformation | null): Promise<void> => setTempGame(selectedGame)
                            );
                        } else {
                            throw new Error('UE4SS path not provided');
                        }
                        break;
                    }
                    case 'update': {
                        // await window.palhub('updateUE4SS', tempGame?.path);
                        break;
                    }
                }
            })().catch((error: unknown) => handleError((error, applog)));
        },
        [requiredModulesLoaded, cache_dir, tempGame?.path]
    );

    const carouselOptions = useMemo(
        () => ({
            interval: null,
            controls: false,
            indicators: false,
            className: 'container-fluid p-0',
            activeIndex: settingsPageID,
        }),
        [settingsPageID]
    );

    // if (settings) console.log(settings);

    const isInstallingModloader = settingsPageID === 2;
    const headerText = isInstallingModloader ? t('modals.modloader.installing-ue4ss') : t('modals.game-config.head');
    const modalOptions: DekCommonAppModalProps = {
        show,
        setShow,
        onCancel,
        headerText,
        showX: !isInstallingModloader,
    };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-block overflow-y-auto pb-3" style={{ height }}>
                {modalOptions.showX && (
                    <DekChoice
                        disabled={!tempGame?.has_ue4ss}
                        className="p-3"
                        color="warning"
                        active={settingsPageID}
                        choices={tA('modals.game-config.tabs', 2)}
                        onClick={(i: number, _value: string | number): void => setSettingsPageID(i)}
                    />
                )}
                <Carousel {...carouselOptions}>
                    <Carousel.Item className="container-fluid px-3">
                        <GameConfiguration {...{ tempGame, setTempGame, runModloaderTask, setShow }} />
                    </Carousel.Item>
                    <Carousel.Item className="container-fluid px-3">
                        <Ue4ssConfigurator game={tempGame} />
                    </Carousel.Item>
                    <Carousel.Item className="">
                        <UE4SSInstallProgress
                            game={tempGame}
                            onComplete={(): Promise<void> => Promise.resolve(setSettingsPageID(0))}
                        />
                    </Carousel.Item>
                </Carousel>
            </DekDiv>
        </DekCommonAppModal>
    );
}
