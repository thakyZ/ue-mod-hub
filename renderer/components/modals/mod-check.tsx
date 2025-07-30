/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import DekDiv from '@components/core/dek-div';
import ModTable from '@components/core/mod-table';
import DekCommonAppModal from '@components/core/modal';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { parseIntSafe } from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { ScreenSize } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';
import type { IDownloadURL, IFileInfo as NexusIFileInfo, IModInfo as NexusIModInfo } from '@nexusmods/nexus-api';
// import IconX from '@svgs/fa5/regular/window-close.svg';
import type { UseStatePair } from '@typed/common';
import type { IModInfoWithSavedConfig, ModConfig, PalHubConfig } from '@typed/palhub';
import wait from '@utils/wait';
import type { IpcRendererEvent } from 'electron';
import type { Dispatch, MutableRefObject, ReactElement, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal';

export declare interface CheckModsModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function CheckModsModal({ show, setShow }: CheckModsModalProps): ReactElement<CheckModsModalProps> {
    const applog: AppLogger = useAppLogger('CheckModsModal');
    const { t }: Localization = useLocalization();
    const { handleError, requiredModulesLoaded, commonAppData }: CommonChecks = useCommonChecks();
    const cache_dir: string | null = commonAppData?.cache;
    const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const game_data: GameInformation | undefined = commonAppData?.selectedGame;
    const api_key: string | null = commonAppData?.apis?.nexus;

    const onCancel: VoidFunction = useCallback((): void => setShow(false), [setShow]);
    const { isDesktop }: ScreenSize = useScreenSize();
    const fullscreen: boolean = !isDesktop;
    const [modConfig, setModConfig]: UseStatePair<PalHubConfig | null> = useState<PalHubConfig | null>(null);
    type ModsTypePair = NexusIModInfo & IModInfoWithSavedConfig;
    const [mods, setMods]: UseStatePair<ModsTypePair[]> = useState<ModsTypePair[]>([]);
    const [shouldShowLogs, setShouldShowLogs]: UseStatePair<boolean> = useState<boolean>(false);
    const [logMessages, setLogMessages]: UseStatePair<string[]> = useState<string[]>([]);
    const logRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

    const addLogMessage = (message: string): void => {
        setLogMessages((old: string[]): string[] => [...old, message]);
        setTimeout((): void => {
            if (!logRef?.current) return;
            logRef.current.scrollTop = logRef.current.scrollHeight;
        });
    };

    const resetLogMessages: VoidFunction = (): void => {
        setLogMessages([]);
    };

    const prepareModList = (mods: NexusIModInfo[], modConfig: PalHubConfig): string => {
        return JSON.stringify(
            mods.map(
                (mod: NexusIModInfo): IModInfoWithSavedConfig =>
                    ({
                        name: mod.name,
                        mod_id: mod.mod_id,
                        author: mod.author,
                        version: mod.version,
                        file_id: modConfig.mods[mod.mod_id.toString()]?.file_id ?? -1,
                        file_name: modConfig.mods[mod.mod_id.toString()]?.file_name ?? '',
                    }) as IModInfoWithSavedConfig
            ),
            null,
            4
        ).trim();
    };

    const onCopyModList: VoidFunction = useCallback((): void => {
        if (!modConfig) return;
        const json: string = prepareModList(mods, modConfig);
        navigator.clipboard.writeText(json).catch((error: unknown) => handleError(error, applog));
    }, [mods, modConfig, handleError, applog]);

    const onSaveModList: VoidFunction = useCallback((): void => {
        if (!modConfig) return;
        // download json document:
        const element: HTMLAnchorElement = document.createElement('a');
        const json: string = prepareModList(mods, modConfig);
        const file: Blob = new Blob([json], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = 'mod-list-filename.json';
        document.body.append(element); // Required for this to work in FireFox
        element.click();
        element.remove();
        URL.revokeObjectURL(element.href);
    }, [mods, modConfig]);

    const checkLatestIsNewer = (installed: string, latest: string): boolean => {
        // remove all characters to ensure strings are only numbers
        const splitter = (str: string): string[] => str.split('.').map((e: string): string => e.replaceAll(/\D/g, ''));
        const [i_major, i_minor, i_patch]: number[] = splitter(installed).map(Number);
        const [l_major, l_minor, l_patch]: number[] = splitter(latest).map(Number);
        return (i_major ?? 0) < (l_major ?? 0) || (i_minor ?? 0) < (l_minor ?? 0) || (i_patch ?? 0) < (l_patch ?? 0);
    };

    const onUpdateMods: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!modConfig || !api_key || !cache_dir || !game_path) return;
            resetLogMessages();
            setShouldShowLogs(true);

            // const api_key = nexusApiKey;//await getApiKey();
            // const game_path = appGamePath;//await getGamePath();
            // const cache_dir = appCacheDir;//await getCacheDir();

            const wait_between: number = 1000;
            await wait(wait_between);

            const total: number = mods.length;
            for (const [index, mod] of mods.entries()) {
                addLogMessage(`Processing Mod... ${index + 1} / ${total}`);

                const latest: string = mod.version;
                const installed: string | undefined = modConfig.mods[mod.mod_id]?.version;
                if (!installed) {
                    addLogMessage(`Skipping Mod: ${mod.name} - Mod Version is Undefined`);
                    continue;
                }
                if (!checkLatestIsNewer(installed, latest)) {
                    addLogMessage(`Skipping Mod: ${mod.name} - Already Up To Date`);
                    continue;
                }

                try {
                    addLogMessage(`Getting Latest Version: ${mod.name}`);
                    const result = await window.nexus(api_key, 'getModFiles', mod.mod_id);
                    console.log('getModFiles:', result);

                    const { files } = result ?? { files: [] };
                    files.sort((a, b) => b.uploaded_timestamp - a.uploaded_timestamp);
                    const latest_file: NexusIFileInfo | undefined = files.find(
                        (file: NexusIFileInfo): boolean => file.version === latest
                    );

                    if (!latest_file) {
                        addLogMessage(`Skipping Mod: ${mod.name} - Failed To Find Latest File.`);
                        continue;
                    }

                    addLogMessage(`Getting Download Link: ${mod.name}`);
                    const file_links: IDownloadURL[] = await window.nexus(
                        api_key,
                        'getDownloadURLs',
                        mod.mod_id,
                        latest_file.file_id
                    );
                    const download_url: string | undefined = file_links.find((link) => !!link.URI)?.URI;
                    console.log({ mod, latest_file, file_links, download_url });

                    if (!download_url) {
                        addLogMessage(`Skipping Mod: ${mod.name} - Failed To Find Download URL.`);
                        continue;
                    }

                    try {
                        addLogMessage(`Downloading Mod From: ${download_url}`);
                        await window.palhub('downloadMod', cache_dir, download_url, mod, latest_file);
                    } catch (error) {
                        console.log('download error:', error);
                        addLogMessage(error?.toString() ?? 'Unknown Error');
                    }

                    await wait(wait_between);

                    try {
                        const install = await window.palhub('installMod', cache_dir, game_path, mod, latest_file);

                        await wait(wait_between);
                        addLogMessage(`Successfully Installed Mod: ${mod.name}`);
                        console.log({ install });
                    } catch (error) {
                        console.log('install error:', error);
                        addLogMessage(error?.toString() ?? 'Unknown Error');
                    }
                    await wait(wait_between);
                } catch (error: unknown) {
                    console.log('download error:', error);
                    addLogMessage(error?.toString() ?? 'Unknown Error');
                }
            }

            await wait(wait_between);
            setShouldShowLogs(false);
        })().catch((error: unknown): void => {
            addLogMessage(error?.toString() ?? 'Unknown Error');
            handleError(error, applog);
        });
    }, [api_key, cache_dir, mods, modConfig, game_path, handleError, applog]);

    const onValidateFiles = useCallback((): void => {
        (async (mods: ModsTypePair[], modConfig: PalHubConfig | null, game_path: string | undefined): Promise<void> => {
            if (!game_path) return;
            resetLogMessages();
            setShouldShowLogs(true);

            // const api_key = nexusApiKey;//await getApiKey();
            // const game_path = appGamePath;//await getGamePath();
            // const cache_dir = appCacheDir;//await getCacheDir();

            const wait_between = 1000;
            await wait(wait_between);

            const total = mods.length;

            console.log(game_path);
            for (const [index, mod] of mods.entries()) {
                addLogMessage(`Processing Mod... ${index + 1} / ${total}`);
                console.log(`Processing Mod... ${index + 1} / ${total}`);
                try {
                    const file: ModConfig | undefined = modConfig?.mods[mod.mod_id];
                    if (!file) {
                        addLogMessage(`Failed to determine mod config for ${mod.name}`);
                        continue;
                    }
                    console.log({ mod, file });
                    const result: boolean = await window.palhub('validateModFiles', game_path, mod, file);
                    addLogMessage(`Validation Successful: ${mod.name} - ${result}`);
                } catch (error: unknown) {
                    console.log('validate error:', error);
                    handleError(error, addLogMessage, 1);
                }
                await wait(wait_between);
            }

            await wait(wait_between);
            setShouldShowLogs(false);
        })(mods, modConfig, game_path).catch((error: unknown) => handleError(error, applog));
    }, [mods, modConfig, game_path, handleError, applog]);

    const updateButtonEnabled: boolean = useMemo((): boolean => {
        if (!mods || !modConfig) return false;
        return mods.some((mod: ModsTypePair): boolean => {
            if (!mod) return false;
            console.log({ mod });
            const latest: string = mod.version;
            const installed: string | undefined = modConfig.mods[mod.mod_id]?.version;
            if (!installed) return false;
            return checkLatestIsNewer(installed, latest);
        });
    }, [mods, modConfig]);

    useEffect((): VoidFunction | undefined => {
        if (!requiredModulesLoaded) return undefined;
        const remove_dl_handler = window.ipc.on(
            'download-mod-file',
            (_event: IpcRendererEvent, { mod_id, file_id, percentage }) => {
                addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`);
            }
        );
        const remove_in_handler = window.ipc.on(
            'install-mod-file',
            (
                _event: IpcRendererEvent,
                { install_path: _install_path, name, version, mod_id: _mod_id, file_id: _file_id, entries: _entries }
            ) => {
                addLogMessage(`Installing Mod: ${name} v${version}`);
            }
        );
        const remove_ex_handler = window.ipc.on(
            'extract-mod-file',
            (_event: IpcRendererEvent, { entry, outputPath: _outputPath }) => {
                addLogMessage(`Extracting: ${entry}`);
            }
        );
        return () => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, [requiredModulesLoaded]);

    useEffect((): void => {
        if (!requiredModulesLoaded) return;
        (async (
            game_path: string | undefined,
            game_data: GameInformation | undefined,
            api_key: string | null
        ): Promise<void> => {
            if (!mods || !game_data || !game_path || !api_key) return;

            const config: PalHubConfig = (await window.palhub('readJSON', game_path)) as PalHubConfig;
            if (!config) return console.error('config not loaded');

            const mod_ids: string[] = Object.keys(config?.mods || []);
            const nexus_id: string = game_data.map_data.providers.nexus;
            const newMods: ModsTypePair[] = await Promise.all(
                mod_ids.map(async (mod_id: string): Promise<ModsTypePair> => {
                    return (await window.nexus(api_key, 'getModInfo', parseIntSafe(mod_id)!, nexus_id)) as ModsTypePair;
                })
            );
            // console.log({ newMods });
            setMods(newMods);
            setModConfig(config);
        })(game_path, game_data, api_key).catch((error: unknown): void => handleError(error, applog));
    }, [mods, shouldShowLogs, requiredModulesLoaded, game_path, game_data, api_key, handleError, applog]);

    // console.log({ mods, modConfig });

    const height = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const headerText = t('modals.check-mods.head', { game: commonAppData?.selectedGame });
    const modalOptions = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid">
                {/* map mods into a table */}
                {!shouldShowLogs && modConfig && (
                    <ModTable
                        {...{ show, setShow }}
                        mods={mods.map((mod: ModsTypePair): IModInfoWithSavedConfig | null => {
                            const modConfigEntry: ModConfig | undefined = modConfig?.mods[mod.mod_id];
                            if (!modConfigEntry) return null;
                            const { file_id, file_name, version }: ModConfig = modConfigEntry;
                            return {
                                ...mod,
                                file_id,
                                file_name,
                                installed: true,
                                downloaded: true,
                                latest: mod.version === version,
                            };
                        })}
                        showStatus={true}
                    />
                )}
                {/* show the log messages while downloading/installing/validating */}
                {shouldShowLogs && (
                    <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
                        <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
                    </div>
                )}
            </DekDiv>
            <DekDiv type="DekFoot" className="d-block w-100">
                <div className="row">
                    <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                        <Button variant="primary" className="w-100" onClick={onCopyModList}>
                            <strong>{t('modals.check-mods.copy-json')}</strong>
                        </Button>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                        <Button variant="secondary" className="w-100" onClick={onSaveModList}>
                            <strong>{t('modals.check-mods.save-json')}</strong>
                        </Button>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                        <Button variant="warning" className="w-100" disabled={!updateButtonEnabled} onClick={onUpdateMods}>
                            <strong>{t('modals.check-mods.update')}</strong>
                        </Button>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-0 px-1">
                        <Button variant="success" className="w-100" onClick={onValidateFiles}>
                            <strong>{t('modals.check-mods.validate')}</strong>
                        </Button>
                    </div>
                </div>
            </DekDiv>
        </DekCommonAppModal>
    );
}
