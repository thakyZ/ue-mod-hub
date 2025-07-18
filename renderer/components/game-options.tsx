import DekDiv from '@components/core/dek-div';
import { ENVEntry, ENVEntry_Input, ENVEntryLabel } from '@components/modals/common';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { UseStatePair, VoidFunctionWithArgs } from '@typed/common';
import type { OpenDialogReturnValue } from 'electron';
// import wait from '@utils/wait';
import type { Dispatch, MouseEvent, ReactElement, SetStateAction } from 'react';
import React, { Fragment, useCallback, useState } from 'react';

export declare interface GameConfigurationProps {
    tempGame: GameInformation | null;
    setTempGame: Dispatch<SetStateAction<GameInformation | null>>;
    runModloaderTask: (eventType: 'install' | 'uninstall' | 'update') => void;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function GameConfiguration({
    tempGame,
    setTempGame,
    runModloaderTask,
    setShow,
}: GameConfigurationProps): ReactElement<GameConfigurationProps> | null {
    const applog: AppLogger = useAppLogger('GameConfiguration');
    const { requiredModulesLoaded, updateSelectedGamePath, forgetGame, handleError }: CommonChecks = useCommonChecks();
    const [knownGamePath, setKnownGamePath]: UseStatePair<string | undefined> = useState<string | undefined>(
        tempGame?.path
    );
    const { t, tA }: UseLocalizationReturn = useLocalization();

    const handleGamePathChange: VoidFunctionWithArgs<[_name: string, new_value: string]> = useCallback(
        (_name: string, new_value: string): void => {
            if (!tempGame) return;
            setKnownGamePath(new_value);
            updateSelectedGamePath(
                tempGame,
                new_value,
                async (selectedGame: GameInformation): Promise<void> => setTempGame(selectedGame) // eslint-disable-line @typescript-eslint/require-await
            ).catch((error: unknown): void => handleError(error, applog));
        },
        [tempGame, updateSelectedGamePath, setTempGame, handleError, applog]
    );

    const install_types: string[] = tA(`/settings.choices.install-type`);
    const installed_type: number = tempGame?.type ? install_types.indexOf(tempGame?.type) : -1;

    const pClasses: string = 'px-3 px-xl-5 mb-0';
    const dangerCard: string = 'col card bg-danger border-danger2 border p-3 text-center';
    // const successCard: string = 'card bg-success border-success2 border p-3 text-center';

    const onForgetGame: VoidFunction = useCallback((): void => {
        if (!tempGame) return;
        forgetGame(tempGame).catch((error: unknown) => handleError(error, applog));
        setShow(false);
    }, [applog, forgetGame, handleError, setShow, tempGame]);

    const onClickSelectGamePath: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!tempGame?.path || !knownGamePath) return;
            // select game path folder:
            const result: OpenDialogReturnValue = await window.ipc.invoke('open-file-dialog', {
                title: t('modals.game-config.root-game-folder', { game: tempGame ?? { name: '' } }),
                // buttonLabel: t('/settings.inputs.game-path.select-button', { game: tempGame ?? {name: ''} }),
                properties: ['openDirectory', 'createDirectory'],
                defaultPath: tempGame?.path ?? knownGamePath,
            });
            console.log('Selected game path:', result);
            if (result && result.filePaths.length > 0) {
                handleGamePathChange('path', result.filePaths[0]!);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [knownGamePath, tempGame, handleGamePathChange, t, handleError, applog]);

    const can_use_ue4ss: boolean = !!tempGame?.map_data?.platforms?.[tempGame?.launch_type]?.modloader?.ue4ss;
    console.log({ can_use_ue4ss, tempGame });

    if (!requiredModulesLoaded || !tempGame) return null;
    return (
        <Fragment>
            {tempGame?.id && (
                <div className="btn-group dek-choice w-100 mb-3" role="group">
                    <DekDiv className="btn btn-secondary px-3 w-50 disabled" disabled={true}>
                        <strong>{install_types[installed_type] ?? '???'}</strong>
                    </DekDiv>
                    <DekDiv className="btn btn-dark px-3 w-100 disabled" disabled={true}>
                        <strong>{tempGame?.name ?? 'No Game Found'}</strong>
                    </DekDiv>
                </div>
            )}

            {/* <ENVEntry 
            disabled={tempGame?.id}
            value={tempGame?.path ?? knownGamePath}
            updateSetting={handleGamePathChange}
            name={t('/settings.inputs.game-path.name', { game: tempGame ?? {name: ''}})}
            tooltip={t('/settings.inputs.game-path.desc', { game: tempGame ?? {name: 'game'} })}
        /> */}
            <ENVEntryLabel
                name={t('/settings.inputs.game-path.name', { game: tempGame ?? { name: '' } })}
                tooltip={t('/settings.inputs.game-path.desc', { game: tempGame ?? { name: 'game' } })}
            />
            <div className="d-flex w-100" role="group">
                <ENVEntry_Input
                    disabled={!!tempGame?.id}
                    value={tempGame?.path ?? knownGamePath}
                    updateSetting={(name: string, value: string | number | readonly string[] | undefined) => {
                        if (typeof value === 'number') value = value.toString();
                        else if (typeof value === 'object') value = JSON.stringify(value);
                        else if (value === undefined) value = '';
                        handleGamePathChange(name, value);
                    }}
                    name={t('/settings.inputs.game-path.name', { game: tempGame ?? { name: '' } })}
                    tooltip={t('/settings.inputs.game-path.desc', { game: tempGame ?? { name: 'game' } })}
                    type="text"
                    noLabel={true}
                    onClick={onClickSelectGamePath}
                />
                {!tempGame?.id && (
                    <button className="btn btn-secondary" onClick={onClickSelectGamePath}>
                        ...
                    </button>
                )}
            </div>

            {tempGame?.id && (
                <div className="row">
                    <div className="col">
                        <ENVEntry
                            disabled={true} //tempGame?.id}
                            value={tempGame?.map_data?.platforms[tempGame.launch_type]?.[tempGame.type]?.root}
                            updateSetting={handleGamePathChange}
                            name={'Unreal Project Root'}
                            tooltip={'Unreal Project Root Tooltip'}
                        />
                    </div>
                    <div className="col">
                        <ENVEntry
                            disabled={true} //tempGame?.id}
                            value={tempGame?.map_data?.platforms[tempGame.launch_type]?.[tempGame.type]?.app}
                            updateSetting={handleGamePathChange}
                            name={'Executable Name'}
                            tooltip={'Executable Name Tooltip'}
                        />
                    </div>
                </div>
            )}

            {tempGame?.id && (
                <div className="py-2">
                    {(can_use_ue4ss || tempGame?.has_ue4ss) && (
                        <ENVEntryLabel name={'Modloader Setup'} tooltip={'Modloader Setup Tooltip'} />
                    )}
                    {tempGame?.has_ue4ss && (
                        <div className="col">
                            <div
                                className="col btn btn-danger px-3 w-100"
                                onClick={(_event: MouseEvent<HTMLDivElement>): void => runModloaderTask('uninstall')}
                            >
                                <strong>{t('/settings.buttons.uninstall-ue4ss')}</strong>
                            </div>
                        </div>
                    )}
                    {!tempGame.has_ue4ss && can_use_ue4ss && (
                        <div className={dangerCard}>
                            <h4 className="mb-0 text-warning">
                                <strong>{t(`/settings.setup.need-ue4ss.head`, { game: tempGame })}</strong>
                            </h4>
                            {tA(`/settings.setup.need-ue4ss.body`, { game: tempGame }).map(
                                (text: string, i: number): ReactElement => (
                                    <p key={i} className={pClasses}>
                                        {text}
                                    </p>
                                )
                            )}
                            <button
                                className="btn btn-warning p-3 w-100 mt-3"
                                onClick={(_event: MouseEvent<HTMLButtonElement>): void => runModloaderTask('install')}
                            >
                                <strong>{t('/settings.buttons.download-ue4ss', { game: tempGame })}</strong>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tempGame?.name && (
                <div className="row pt-2">
                    <div className="col">
                        <div className="col btn btn-danger px-3 w-100" onClick={onForgetGame}>
                            <strong>{t('/settings.buttons.unmanage-game')}</strong>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
