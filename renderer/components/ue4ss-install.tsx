/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
// import type { UseLocalizationReturn } from '@hooks/use-localization';
// import useLocalization from '@hooks/use-localization';
import type { UseScreenSizeReturn } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';
import type { Ue4ssSettingsFlat } from '@main/dek/game-map';
import type { PromiseVoidFunction, UseStatePair, VoidFunctionWithArgs } from '@typed/common';
import type { DownloadFileEvent, ValidateGamePathReturnType } from '@typed/palhub';
import replaceUe4ssIniKeyValue from '@utils/replace-ini-key';
import wait from '@utils/wait';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import type { MutableRefObject, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export declare interface UE4SSInstallProgressProps {
    game: GameInformation | null;
    onComplete: PromiseVoidFunction;
}

export default function UE4SSInstallProgress({
    game,
    onComplete,
}: UE4SSInstallProgressProps): ReactElement<UE4SSInstallProgressProps> {
    const applog: AppLogger = useAppLogger('UE4SSInstallProgress');
    const { requiredModulesLoaded, handleError }: CommonChecks = useCommonChecks();
    // const { t, tA }: UseLocalizationReturn = useLocalization();

    const { isDesktop }: UseScreenSizeReturn = useScreenSize();
    const fullscreen: boolean = !isDesktop;

    // const height: string = fullscreen ? 'calc(100vh - 182px)' : '352px';
    // const height: string = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const height: string = fullscreen ? 'calc(100vh - 96px)' : 'calc(100vh / 4 * 2 + 26px)';

    const logRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

    const [logMessages, setLogMessages]: UseStatePair<string[]> = useState<string[]>([]);

    const addLogMessage: VoidFunctionWithArgs<[message: string]> = useCallback(
        (message: string): void => {
            setLogMessages((old: string[]): string[] => [...old, message]);
            if (logRef.current) {
                setTimeout(
                    (): number | false => !!logRef.current && (logRef.current.scrollTop = logRef.current.scrollHeight)
                );
            }
        },
        [setLogMessages, logRef]
    );

    const resetLogMessages: VoidFunction = useCallback((): void => {
        setLogMessages([]);
    }, [setLogMessages]);

    const onFinished: VoidFunction = useCallback((): void => {
        (async (resetLogMessages: VoidFunction, onComplete: PromiseVoidFunction): Promise<void> => {
            await wait(2500);
            await onComplete();
            setTimeout((): void => {
                resetLogMessages();
            }, 500);
        })(resetLogMessages, onComplete).catch((error: unknown): void => handleError(error, applog));
    }, [resetLogMessages, onComplete, handleError, applog]);

    // initialize the ue4ss installation's configuration
    const setUe4ssDefaultSettings: VoidFunction = useCallback((): void => {
        (async (game: GameInformation | null, onFinished: VoidFunction): Promise<void> => {
            if (!requiredModulesLoaded || !game) return;
            try {
                addLogMessage('Setting UE4SS Default Settings');

                const game_data: ValidateGamePathReturnType = await window.palhub('validateGamePath', game.path);
                // if (game_data.type === '{invalid-path}' || game_data.type === '{UNKNOWN}' || !('ue4ss_root' in game_data)) return;
                if (game_data.type === '{invalid-path}')
                    throw new Error(`Failed to validate game path at ${game.path}, got ${game_data.type}`, {
                        cause: game_data,
                    });
                if (game_data.type === '{UNKNOWN}')
                    throw new Error(`Failed to validate game path at ${game.path}, got ${game_data.type}`, {
                        cause: game_data,
                    });
                if (!('ue4ss_root' in game_data))
                    throw new Error(
                        `Failed to validate game path at ${game.path}, invalid type (Property 'ue4ss_root' does not exist in data)`,
                        { cause: game_data }
                    );
                const ini_path: string = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS-settings.ini');
                let updated_ini: string = (await window.palhub('readFile', ini_path, { encoding: 'utf8' })) as string;

                const settings: Ue4ssSettingsFlat | undefined = game_data.map_data.platforms[game.launch_type]?.modloader
                    ?.ue4ss?.settings as Ue4ssSettingsFlat | undefined;
                if (!settings) return;
                for (const setting of Object.keys(settings)) {
                    if (!Object.prototype.hasOwnProperty.call(settings, setting)) continue;
                    const [category, key] = setting.split('.');
                    updated_ini = replaceUe4ssIniKeyValue(updated_ini, category!, key!, settings[setting]!);
                    addLogMessage(`Set ${setting} to ${settings[setting]?.toString() ?? 'undefined'}`);
                }
                //  do any other configuration initialization changes here.
                await window.palhub('writeFile', ini_path, updated_ini, { encoding: 'utf8' });
                addLogMessage('Successfully updated UE4SS-Settings.ini');
                onFinished();
            } catch (error: unknown) {
                console.error(error);
            }
        })(game, onFinished).catch((error: unknown) => handleError(error, applog));
    }, [addLogMessage, applog, game, handleError, onFinished, requiredModulesLoaded]);

    useEffect((): void | VoidFunction => {
        if (!requiredModulesLoaded) return;

        type ProcessDataType = 'download' | 'extract' | 'delete' | 'error' | 'complete' | 'uninstalled';
        const processData = (_event: RendererIpcEvent, type: ProcessDataType, data: DownloadFileEvent | string) => {
            switch (type) {
                case 'download': {
                    addLogMessage(
                        `Downloading: ${(data as DownloadFileEvent).filename} - ${(data as DownloadFileEvent).percentage}%`
                    );
                    break;
                }
                case 'extract': {
                    addLogMessage(`Extracting: ${(data as DownloadFileEvent).outputPath}`);
                    break;
                }
                case 'delete': {
                    addLogMessage(`Deleting: ${data as string}`);
                    break;
                }
                case 'error': {
                    addLogMessage(data as string);
                    break;
                }
                case 'complete': {
                    addLogMessage('UE4SS Installation Complete!');
                    setUe4ssDefaultSettings();
                    break;
                }
                case 'uninstalled': {
                    addLogMessage('UE4SS Uninstallation Complete!');
                    onFinished();
                }
            }
        };

        const removeDataHandler = window.ipc.on('ue4ss-process', processData);
        return (): void => removeDataHandler();
    }, [addLogMessage, onFinished, requiredModulesLoaded, setUe4ssDefaultSettings]);

    // return <pre className="m-0 p-2 text-start">{logMessages.join('\n')}</pre>;

    return (
        <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
            <pre className="m-0 p-2 text-start">{logMessages.join('\n')}</pre>
        </div>
    );
}
