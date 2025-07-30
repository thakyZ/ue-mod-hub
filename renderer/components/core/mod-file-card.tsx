/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import BBCodeRenderer from '@components/core/bbcode';
import type { FileTreeEntry } from '@components/core/dek-filetree';
import DekFileTree from '@components/core/dek-filetree';
import type { Triggers } from '@components/modals/nxm-link';
import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks, { parseIntSafe } from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import { fetcher } from '@hooks/use-swr-json';
import type { IDownloadURL, IFileInfo } from '@nexusmods/nexus-api';
import type { TypeFunctionWithArgs, UseStatePair } from '@typed/common';
import type { DownloadModFileEvent, IModInfoWithSavedConfig } from '@typed/palhub';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { Placement } from 'react-bootstrap/esm/types';
import type { OverlayDelay } from 'react-bootstrap/OverlayTrigger';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import Popover from 'react-bootstrap/Popover';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Tooltip from 'react-bootstrap/Tooltip';

export declare interface ModFileCardProps {
    mod: Pick<IModInfoWithSavedConfig, 'mod_id' | 'name' | 'file_name'>;
    file: IFileInfo;
    triggers?: Triggers | null | undefined;
    showHR?: boolean;
}

export default function ModFileCard({
    mod,
    file,
    triggers = null,
    showHR = true,
}: ModFileCardProps): ReactElement<ModFileCardProps> | null {
    const applog: AppLogger = useAppLogger('ModFileCard');
    const { handleError, requiredModulesLoaded, commonAppData }: CommonChecks = useCommonChecks();

    const api_key: string | null = commonAppData?.apis?.nexus;
    const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const [cache_dir, _setCacheDir]: UseStatePair<string | null> = useState<string | null>(commonAppData?.cache);

    const { t, /* tA, */ language }: Localization = useLocalization();
    const [filetree, setFiletree]: UseStatePair<FileTreeEntry | null> = useState<FileTreeEntry | null>(null);
    const [showFileTree, setShowFileTree]: UseStatePair<boolean> = useState<boolean>(false);
    const [isDownloaded, setIsDownloaded]: UseStatePair<boolean> = useState<boolean>(false);
    const [isInstalled, setIsInstalled]: UseStatePair<boolean> = useState<boolean>(false);
    const [isDownloading, setIsDownloading]: UseStatePair<boolean> = useState<boolean>(false);
    // const [isInstalling, setIsInstalling]: UseStatePair<boolean> = useState<boolean>(false);
    // const [isUninstalling, setIsUninstalling]: UseStatePair<boolean> = useState<boolean>(false);
    const [downloadProgress, setDownloadProgress]: UseStatePair<number> = useState<number>(0);

    console.log({ cache_dir });
    console.log({ mod, file, triggers });

    useEffect((): VoidFunction | undefined => {
        if (!requiredModulesLoaded) return;

        const remove_dl_handler: VoidFunction = window.ipc.on(
            'download-mod-file',
            (_event: RendererIpcEvent, { mod_id, file_id, percentage }: DownloadModFileEvent): void => {
                if (!('mod_id' in mod) || mod_id !== mod.mod_id || file_id !== file.file_id) return;
                setDownloadProgress(Number(percentage));
            }
        );

        (async (): Promise<void> => {
            if (!showFileTree) return;
            const filetree: Partial<FileTreeEntry> & { error?: Error } = await fetcher<FileTreeEntry>(
                file.content_preview_link
            );
            if ('error' in filetree) {
                throw new Error('Failed to get file tree from content preview link of file', {
                    cause: [filetree.error, file],
                });
            }
            console.log({ filetree });
            setFiletree(filetree as FileTreeEntry);
        })().catch((error: unknown): void => handleError(error, applog));

        return (): void => remove_dl_handler();
    }, [applog, file, handleError, mod, requiredModulesLoaded, showFileTree]);

    useEffect((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded) return;
            if (!file || !mod || !('mod_id' in mod) || !cache_dir || !game_path) return;

            // const cache = await window.palhub('joinPath', _cache?.cache, _selectedGame_id);

            const is_downloaded: boolean = await window.palhub('checkModFileIsDownloaded', cache_dir, file); //cache_dir, file);
            setIsDownloaded(is_downloaded);

            const is_installed: boolean = await window.palhub('checkModIsInstalled', game_path, mod, file);
            setIsInstalled(is_installed);

            // setCacheDir(cache);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [applog, cache_dir, commonAppData, file, game_path, handleError, mod, requiredModulesLoaded]);

    const onDownloadModZip: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !api_key || !cache_dir || !mod.mod_id) return;
            try {
                // const api_key = await window.uStore.get('api_key');
                // if (!api_key) return console.error('api_key not found');

                const key: string | undefined = triggers?.key ?? undefined;
                const expires: number | undefined = triggers?.expires;

                const { is_premium } = await window.nexus(api_key, 'getValidationResult');
                if (!is_premium && !(key && expires)) {
                    // https://www.nexusmods.com/palworld/mods/${mod.mod_id}?tab=files&${file.file_id}=6790&nmm=1
                    void window.ipc.invoke(
                        'open-external',
                        `https://www.nexusmods.com/${commonAppData?.selectedGame?.map_data.providers.nexus}/mods/${mod.mod_id}?tab=files&file_id=${file.file_id}&nmm=1`
                    );
                    console.log('You need to be a premium user on Nexus Mods to view the files tab');
                    return;
                    // alert('You need to be a premium user on Nexus Mods to view the files tab');
                }

                setIsDownloading(true);
                console.log('downloading mod:', { api_key, mod, file });
                // prettier-ignore
                const file_links: IDownloadURL[] = await window.nexus(api_key, 'getDownloadURLs', parseIntSafe(mod.mod_id)!, file.file_id, key, expires); //, null, null, mod.game_id);
                console.log({ file_links, mod, file, key, expires });
                const download_url: string | undefined = file_links.find((link: IDownloadURL): boolean => !!link.URI)?.URI;
                console.log({ file_links, download_url });

                const result: boolean = await window.palhub('downloadMod', cache_dir, download_url, mod, file);
                setIsDownloading(false);
                setIsDownloaded(true);
                console.log({ result });
            } catch (error) {
                console.error('error downloading mod:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
        // handleCancel();
    }, [
        applog,
        handleError,
        mod,
        file,
        cache_dir,
        commonAppData?.selectedGame?.map_data.providers.nexus,
        triggers,
        requiredModulesLoaded,
        api_key,
    ]);

    const onInstallModFiles: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !cache_dir || !game_path || !('mod_id' in mod)) return;
            console.log('installing mod:', mod);
            try {
                const result: boolean = await window.palhub('installMod', cache_dir, game_path, mod, file);
                setIsInstalled(true);
                console.log({ result });
            } catch (error) {
                console.error('error installing mod:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
        // handleCancel();
    }, [applog, cache_dir, file, game_path, requiredModulesLoaded, handleError, mod]);

    const onUninstallModFiles: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !game_path || !('mod_id' in mod)) return;
            console.log('uninstalling mod:', mod);
            try {
                const result: boolean = await window.palhub('uninstallMod', game_path, mod);
                setIsInstalled(false);
                console.log({ result });
            } catch (error) {
                console.error('error uninstalling mod:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
        // handleCancel();
    }, [applog, game_path, handleError, mod, requiredModulesLoaded]);

    const onUninstallModCache: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !cache_dir || !('mod_id' in mod)) return;
            console.log('uninstalling mod:', mod);
            setDownloadProgress(0);

            try {
                // try {
                //     await window.palhub('uninstallMod', game_path, mod);
                // } catch {
                //     console.log('error uninstalling mod:', error);
                // }
                await window.palhub('uninstallFilesFromCache', cache_dir, mod, file);
                setIsDownloaded(false);
                // setIsInstalled(false);
            } catch (error) {
                console.error('error uninstalling mod:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
        // handleCancel();
    }, [applog, cache_dir, handleError, file, requiredModulesLoaded, mod]);

    // external_virus_scan_url
    // mod_version
    // uploaded_timestamp
    // uploaded_time
    // version
    // content_preview_link

    const kilobytesToSize: TypeFunctionWithArgs<[kilobytes: number], string> = (kilobytes: number): string => {
        const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (kilobytes == 0) return '0 Bytes';
        const i: number = Math.floor(Math.log(kilobytes) / Math.log(1024));
        return Math.round(kilobytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };
    const delay: OverlayDelay = { show: 100, hide: 250 };
    const placement: Placement = 'bottom';

    const EyeIcon: CommonIcon = showFileTree ? CommonIcons.eye_other : CommonIcons.eye;

    const buttonWidth: number = 54;

    useEffect((): void => {
        if (triggers?.autoDownload) {
            onDownloadModZip();
        }
    }, [triggers, onDownloadModZip]);

    if (!requiredModulesLoaded) return null;

    // if (file && file.category_name === 'ARCHIVED') {
    //     return null;
    // }

    console.log(file);

    return (
        <div className="row" style={{ minHeight: 92 }}>
            <div className={`col`}>
                <div className="row">
                    <div className="col">
                        <h6 className={`pe-3 mb-0`}>{t('modals.mod-details.file-version', { file })}</h6>
                        {/* <h6 className='mb-0'>{file.file_name}</h6> */}
                        <small className="text-dark">
                            {t('modals.mod-details.file-info', {
                                date: new Date(file.uploaded_time).toLocaleString(language ?? 'en', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                }),
                                size: kilobytesToSize(file.size_kb),
                            })}
                        </small>
                    </div>
                    <div className="col text-end pe-0" style={{ maxWidth: 108 }}>
                        {file.is_primary && (
                            <span className="badge bg-secondary border border-secondary2 w-100">
                                {t('common.suggested')}
                            </span>
                        )}
                        {isInstalled && (
                            <span className="badge bg-success border border-success2 w-100">{t('common.installed')}</span>
                        )}
                        {isDownloaded && !isInstalled && (
                            <span className="badge bg-primary border border-primary2 w-100">{t('common.downloaded')}</span>
                        )}
                        {file.category_name === 'ARCHIVED' && (
                            <span className="badge bg-danger border border-danger2 w-100">{t('common.archived')}</span>
                        )}
                    </div>
                </div>

                <BBCodeRenderer bbcodeText={file.description} />
            </div>
            <div className="col text-end px-0" style={{ maxWidth: 206 }}>
                <OverlayTrigger
                    placement={placement}
                    delay={delay}
                    overlay={<Tooltip className="text-end">{t('modals.mod-details.popups.view-tree')}</Tooltip>}
                >
                    <button
                        disabled={false}
                        style={{ minWidth: buttonWidth }}
                        className="btn btn-dark hover-secondary col p-2"
                        onClick={() => setShowFileTree(!showFileTree)}
                    >
                        <EyeIcon fill="currentColor" height="2rem" />
                    </button>
                </OverlayTrigger>

                <OverlayTrigger
                    placement={placement}
                    delay={delay}
                    overlay={
                        <Tooltip className="text-end">
                            {t('modals.mod-details.popups.view-scan')}
                            <br />
                            {t('common.open-link')}
                        </Tooltip>
                    }
                >
                    <a
                        aria-disabled={false}
                        style={{ minWidth: buttonWidth }}
                        href={file.external_virus_scan_url}
                        target="_blank"
                        className="btn btn-dark hover-warning col p-2 mx-2"
                    >
                        <CommonIcons.shield fill="currentColor" height="2rem" />
                    </a>
                </OverlayTrigger>

                {isDownloaded && isInstalled && (
                    <OverlayTrigger
                        placement={placement}
                        delay={delay}
                        overlay={<Tooltip className="text-end">{t('modals.mod-details.popups.uninstall')}</Tooltip>}
                    >
                        <button
                            disabled={false}
                            style={{ minWidth: buttonWidth }}
                            className="btn btn-dark hover-danger col p-2"
                            onClick={onUninstallModFiles}
                        >
                            <CommonIcons.trash fill="currentColor" height="2rem" />
                        </button>
                    </OverlayTrigger>
                )}

                {!isDownloaded && (
                    <OverlayTrigger
                        placement={placement}
                        delay={delay}
                        overlay={<Tooltip className="text-end">{t('modals.mod-details.popups.download')}</Tooltip>}
                    >
                        <button
                            style={{ minWidth: buttonWidth }}
                            disabled={isDownloading}
                            className="btn btn-dark hover-primary col p-2"
                            onClick={onDownloadModZip}
                        >
                            <CommonIcons.download fill="currentColor" height="2rem" />
                        </button>
                    </OverlayTrigger>
                )}

                {isDownloaded && !isInstalled && (
                    <OverlayTrigger
                        placement={placement}
                        delay={delay}
                        overlay={<Tooltip className="text-end">{t('modals.mod-details.popups.install')}</Tooltip>}
                    >
                        <button
                            disabled={false}
                            style={{ minWidth: buttonWidth }}
                            className="btn btn-dark hover-success col p-2"
                            onClick={onInstallModFiles}
                        >
                            <CommonIcons.arrow_right fill="currentColor" height="2rem" />
                        </button>
                    </OverlayTrigger>
                )}

                {isDownloaded && (
                    <button
                        disabled={false}
                        style={{ minWidth: buttonWidth }}
                        className="btn hover-dark hover-danger col p-0"
                        onClick={onUninstallModCache}
                    >
                        {t('modals.mod-details.remove')}
                    </button>
                )}

                {!isDownloaded && isInstalled && (
                    <button
                        disabled={false}
                        style={{ minWidth: buttonWidth }}
                        className="btn hover-dark hover-danger col p-0"
                        onClick={onUninstallModFiles}
                    >
                        {t('modals.mod-details.uninstall')}
                    </button>
                )}

                {isDownloading && (
                    <div className="d-flex justify-content-end">
                        <ProgressBar
                            now={downloadProgress}
                            label={`${downloadProgress}%`}
                            variant="success"
                            className="mt-2 border border-success2 radius0"
                            style={{ width: 182 }}
                        />
                    </div>
                )}
            </div>

            {showFileTree && <DekFileTree data={filetree} />}

            {/* <iframe src={file.content_preview_link} className='w-100' style={{height: '50vh'}}></iframe> */}

            {showHR && <hr className="mt-2" />}
        </div>
    );
}
