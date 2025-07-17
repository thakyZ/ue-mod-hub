/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import DekDiv from '@components/core/dek-div';
import ModTable from '@components/core/mod-table';
import DekCommonAppModal from '@components/core/modal';
import useAppLogger from '@hooks/use-app-logger';
import useCommonChecks, { handleError, parseIntSafe } from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
import useModalResizer from '@hooks/use-modal-resizer';
import type { LogLevelsType } from '@main/dek/logger';
import type { IFileInfo as NexusIFileInfo } from '@nexusmods/nexus-api';
import type { IModInfoWithSavedConfig } from '@typed/palhub';
// import Modal from 'react-bootstrap/Modal';
import wait from '@utils/wait';
import type { OpenDialogReturnValue } from 'electron';
import type { RendererIpcEvent } from 'electron-ipc-extended';
// import IconX from '@svgs/fa5/regular/window-close.svg';
import type { ChangeEvent, Dispatch, ReactElement, SetStateAction } from 'react';
import { useCallback, useEffect, /* useMemo, */ useRef, useState } from 'react';
// import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';

/**
 * Validate pasted JSON
 * Expected structure:
 * [
 *     {
 *         "name": "Pal Details (UI)",
 *         "mod_id": 489,
 *         "author": "DekitaRPG",
 *         "version": "2.3",
 *         "file_id": 6181,
 *         "file_name": "DekPalDetails-489-2-3-1719888927.zip"
 *     },
 *     {
 *         "name": "Mod Config Menu (UI)",
 *         "mod_id": 577,
 *         "author": "DekitaRPG",
 *         "version": "1.8",
 *         "file_id": 6185,
 *         "file_name": "DekModConfigMenu-577-1-8-1719889707.zip"
 *     },
 *     {
 *         "name": "xMOG - Reskin System",
 *         "mod_id": 1204,
 *         "author": "DekitaRPG",
 *         "version": "1.6",
 *         "file_id": 6353,
 *         "file_name": "DekXMOG-1204-1-6-1720258308.zip"
 *     }
 * ]
 */

export declare interface LoadListModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function LoadListModal({ show, setShow }: LoadListModalProps): ReactElement<LoadListModalProps> {
    const applog = useAppLogger('LoadListModal');
    const { t } = useLocalization();
    const { height } = useModalResizer();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir: string | null = commonAppData?.cache;
    const game_path: string | undefined = commonAppData?.selectedGame?.path;
    // const game_data: GameInformation | undefined = commonAppData?.selectedGame;
    const api_key: string | null = commonAppData?.apis?.nexus;

    const [logMessages, setLogMessages] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [mods, setMods] = useState<IModInfoWithSavedConfig[] | null>(null);
    // prettier-ignore
    const logRef = useRef<HTMLDivElement | null>(null);

    const addLogMessage = (message: string, applogtype: LogLevelsType = 'info'): void => {
        setLogMessages((old: string[]): string[] => [...old, message]);
        if (applogtype) void applog(applogtype, message);
        if (logRef.current) {
            setTimeout((): number | false => !!logRef.current && (logRef.current.scrollTop = logRef.current.scrollHeight));
        }
    };

    const resetLogMessages = (): void => {
        setLogMessages([]);
    };

    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        setTimeout((): void => {
            setMods(null);
            setIsProcessing(false);
            setIsComplete(false);
        }, 250);
    }, []);

    const validatePastedJSON = (json: unknown): IModInfoWithSavedConfig[] | false => {
        try {
            const obj: IModInfoWithSavedConfig[] =
                typeof json === 'string'
                    ? (JSON.parse(json) as IModInfoWithSavedConfig[])
                    : (json as IModInfoWithSavedConfig[]);
            if (!Array.isArray(obj)) return false;
            for (const item of obj) {
                if (!item.name) return false;
                if (!item.mod_id) return false;
                if (!item.author) return false;
                if (!item.version) return false;
                if (!item.file_id) return false;
                if (!item.file_name) return false;
            }
            return obj;
        } catch {
            return false;
        }
    };

    const processJSON = useCallback(async (json: IModInfoWithSavedConfig[]): Promise<void> => {
        if (!requiredModulesLoaded || !cache_dir || !game_path) return;
        if (!json) return applog('error', 'json not found - unable to process');

        // use mod as both 'mod' and 'file' for palhub checks,
        for (const mod of json) {
            if (!mod.file_name) continue;
            mod.downloaded = await window.palhub('checkModFileIsDownloaded', cache_dir, mod as { file_name: string });
            mod.installed = await window.palhub('checkModIsInstalled', game_path, mod, mod as { file_name: string });
            mod.latest = true;
        }
    }, []);

    const onClickedLoadFromFile = useCallback((): void => {
        if (!requiredModulesLoaded) return;
        void applog('info', 'Loading Mod List From File');

        (async (): Promise<void> => {
            const result: OpenDialogReturnValue = await window.ipc.invoke('open-file-dialog', {
                title: 'Select Mod List JSON File',
                properties: ['openFile'],
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });

            if (result.filePaths.length === 0) return applog('error', 'No File Selected');
            const file_path = result.filePaths[0];
            void applog('info', `Loading From File: ${file_path}`);
            const json_str: unknown = await window.palhub('readJSON', '', file_path);
            const json: false | IModInfoWithSavedConfig[] = validatePastedJSON(json_str);
            if (json === false) return applog('error', 'Failed to load mods from file');
            await processJSON(json);
            setMods(json);
            void applog('info', `Loaded ${json.length} mods from file`);
        })().catch((error: unknown) => handleError(error, applog));
    }, []);

    const onTextAreaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
        if (!requiredModulesLoaded) return;
        if (!e.target.value) return;
        void applog('info', 'Loading Mod List From Pasted JSON');
        (async (): Promise<void> => {
            const json_string: string = e.target.value;
            const json: false | IModInfoWithSavedConfig[] = validatePastedJSON(json_string);

            if (json === false) {
                e.target.classList.remove('form-secondary');
                e.target.classList.add('form-danger');
            } else {
                e.target.classList.remove('form-danger', 'form-secondary');
                e.target.classList.add('form-success', 'disabled');

                await wait(1000);

                e.target.classList.remove('form-success', 'form-danger', 'disabled');
                e.target.classList.add('form-secondary');

                await processJSON(json);
                setMods(json);
            }
            void applog('info', `Pasted JSON is ${json === false ? 'invalid' : 'valid'}`);
            void applog('info', `Loaded ${json === false ? null : json.length} mods from pasted JSON`);
        })().catch((error: unknown) => handleError(error, applog));
    }, []);

    const onClickedDownloadAndInstall = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !game_path || !cache_dir || !api_key) return;
            if (!mods) return void applog('error', 'mods not found - unable to process');
            setIsComplete(false);
            setIsProcessing(true);

            resetLogMessages();
            addLogMessage('Downloading and Installing Mods...', 'info');

            const wait_between: number = 1000;

            await window.palhub('uninstallAllMods', game_path);
            await wait(wait_between);

            const counters = {
                downloaded: 0,
                installed: 0,
            };

            const total = mods.length;
            for (const [index, mod] of mods.entries()) {
                if (
                    !mod.file_id ||
                    typeof mod.file_id !== 'number' ||
                    !mod.version ||
                    !mod.file_name ||
                    typeof mod.file_name !== 'string'
                )
                    continue;
                addLogMessage(`Processing Mod... ${index + 1} / ${total}`);

                await wait(wait_between);
                // check if mod is already downloaded
                try {
                    if (!mod.downloaded) {
                        addLogMessage(`Getting Download URL: (${mod.mod_id}-${mod.file_id}) ${mod.name}`, 'info');
                        const file_links = await window.nexus(
                            api_key,
                            'getDownloadURLs',
                            parseIntSafe(mod.mod_id)!,
                            mod.file_id
                        );
                        const download_url = file_links.find((link) => !!link.URI)?.URI;
                        addLogMessage(`Mod Download URL: ${download_url}`, 'info');
                        const downloaded = await window.palhub(
                            'downloadMod',
                            cache_dir,
                            download_url,
                            mod,
                            mod as Pick<NexusIFileInfo, 'version' | 'file_id' | 'file_name'>
                        );
                        addLogMessage(`Downloaded Mod... ${mod.name} - ${downloaded}`, 'info');
                        if (downloaded) counters.downloaded++;
                    }
                } catch (error) {
                    addLogMessage(`Error Downloading Mod: ${mod.name}`, 'error');
                    if (error instanceof Error) addLogMessage(error.message, 'error');
                }

                await wait(wait_between);
                // check if mod is already installed
                try {
                    const installed = await window.palhub(
                        'installMod',
                        cache_dir,
                        game_path,
                        mod,
                        mod as Pick<NexusIFileInfo, 'version' | 'file_id' | 'file_name'>
                    );
                    addLogMessage(`Successfully Installed Mod: ${mod.name} - ${installed}`, 'info');
                    if (installed) counters.installed++;
                } catch (error) {
                    addLogMessage(`Error Installing Mod: ${mod.name}`, 'error');
                    if (error instanceof Error) addLogMessage(error.message, 'error');
                }
                await wait(wait_between);
            }

            addLogMessage(`Downloaded: ${counters.downloaded} / Installed: ${counters.installed}`);
            await wait(wait_between);
            setIsProcessing(false);
            setIsComplete(true);
        })().catch((error: unknown) => handleError(error, applog));
    }, [mods]);

    useEffect((): VoidFunction | void => {
        if (!requiredModulesLoaded) return;
        const remove_dl_handler = window.ipc.on(
            'download-mod-file',
            (_event: RendererIpcEvent, { mod_id, file_id, percentage }): void => {
                addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`, 'info');
            }
        );
        const remove_in_handler = window.ipc.on(
            'install-mod-file',
            (
                _event: RendererIpcEvent,
                { install_path: _install_path, name, version, mod_id, file_id, entries: _entries }
            ): void => {
                addLogMessage(`Installing Mod: ${name} v${version} - (${mod_id}-${file_id})`, 'info');
            }
        );
        const remove_ex_handler = window.ipc.on(
            'extract-mod-file',
            (_event: RendererIpcEvent, { entry, outputPath: _outputPath }): void => {
                addLogMessage(`Extracting: ${entry}`, 'info');
            }
        );
        return () => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, []);

    const shouldShowLogs = isComplete || isProcessing;

    const headerText = t('modals.load-mods.head');
    const modalOptions = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid">
                {/* add area for logs */}
                {shouldShowLogs && (
                    <div className="overflow-auto m-0 p-3" style={{ height }} ref={logRef}>
                        <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
                    </div>
                )}
                {/* map mods into a table */}
                {!shouldShowLogs && mods && <ModTable mods={mods} showStatus={true} setShow={setShow} show={show} />}
                {/* add area for users to paste json as text */}
                {!shouldShowLogs && !mods && (
                    <div className="p-2">
                        <textarea
                            className="form-control form-secondary overflow-y-auto m-0"
                            placeholder={t('modals.load-mods.help')}
                            style={{ resize: 'none', height }}
                            onChange={onTextAreaChange}
                        />
                    </div>
                )}
            </DekDiv>
            {!shouldShowLogs && (
                <DekDiv type="DekFoot" className="d-flex w-100 gap-3">
                    {mods && (
                        <Button variant="danger" className="col p-2 px-3" onClick={() => setMods(null)}>
                            <strong>{t('common.cancel')}</strong>
                        </Button>
                    )}
                    {mods && (
                        <Button variant="success" className="col p-2 px-3" onClick={onClickedDownloadAndInstall}>
                            <strong>{t('modals.load-mods.load')}</strong>
                        </Button>
                    )}
                    {!mods && (
                        <Button variant="secondary" className="col p-2 px-3" onClick={onClickedLoadFromFile}>
                            <strong>{t('modals.check-mods.load-json')}</strong>
                        </Button>
                    )}
                </DekDiv>
            )}
        </DekCommonAppModal>
    );
}
