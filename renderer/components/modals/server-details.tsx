/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// import BBCodeRenderer from '@components/core/bbcode';
import DekCheckbox from '@components/core/dek-checkbox';
import DekChoice from '@components/core/dek-choice';
import DekDiv from '@components/core/dek-div';
// import DekSelect from '@components/core/dek-select';
// import DekSwitch from '@components/core/dek-switch';
import type { ModFileCardProps } from '@components/core/mod-file-card';
import ModFileCard from '@components/core/mod-file-card';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
import MarkdownRenderer from '@components/markdown/renderer';
import { ensureEntryValueType } from '@components/modals/common';
import type { ServerListing } from '@components/server-card';
// import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks, { parseIntSafe } from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { ScreenSize } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';
import type {
    IDownloadURL,
    IFileInfo as NexusIFileInfo,
    IModFiles,
    IModInfo as NexusIModInfo,
} from '@nexusmods/nexus-api';
import type { PromiseVoidFunctionWithArgs, UseStatePair, VoidFunctionWithArgs } from '@typed/common';
import type {
    DownloadModFileEvent,
    ExtractModFileEvent,
    IModInfoWithSavedConfig,
    InstallModFileEvent,
    ValidateGamePathReturnType,
} from '@typed/palhub';
import wait from '@utils/wait';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import Link from 'next/link';
import type { Dispatch, HTMLAttributes, MutableRefObject, ReactElement, SetStateAction } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { CarouselProps } from 'react-bootstrap/Carousel';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';

// HIDDEN either because should not be shown to end user,
// or because the information is shown in a different way <3
const HIDDEN_SERVER_DATA_KEYS: Set<keyof ServerListing> = new Set([
    'mods',
    'splashURL',
    'serverName',
    'gameVersion',
    'serverDescription',
    'longServerDescription',
    'serverURL',
    'discordURL',
    'rESTAPIPort',
    'rESTAPIEnabled',
    'rCONEnabled',
    'rCONPort',
    'banListURL',
    'logFormatType',
    'DekitaWasHere',
    'bUseAuth',
    'publicPort',
    'adminPassword',
    'serverPassword',
    'publicIP',
    'autoSaveSpan',
    'palhubServerURL',
    'discordServerID',
    'playerCount',
    'fps',
]);

export declare interface ServerDetailsModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    server: ServerListing | null;
}

export declare type ServerModFileType = 'required' | 'optional';

export declare interface ServerModFile {
    mod: IModInfoWithSavedConfig;
    file: NexusIFileInfo;
    type?: ServerModFileType;
}

export declare interface ServerDetailsModsEntry {
    [mod_id: number]: number;
}

export declare interface ServerDetailsMods {
    required: ServerDetailsModsEntry;
    optional: ServerDetailsModsEntry;
}

export default function ServerDetailsModal({
    show,
    setShow,
    server,
}: ServerDetailsModalProps): ReactElement<ServerDetailsModalProps> | null {
    const applog: AppLogger = useAppLogger('ServerDetailsModal');
    const { handleError, commonAppData }: CommonChecks = useCommonChecks();

    const { t, tA }: Localization = useLocalization();
    const { isDesktop }: ScreenSize = useScreenSize();
    const fullscreen: boolean = !isDesktop;
    const height: string = fullscreen ? 'calc(100vh - 96px)' : 'calc(100vh / 4 * 3)';

    const [serverpageID, setServerpageID]: UseStatePair<number> = useState<number>(0);
    const serverpageTypes: string[] = tA('modals.server-details.tabs', 3);
    const [servermodFiles, setServerModFiles]: UseStatePair<ServerModFile[]> = useState<ServerModFile[]>(
        [] as ServerModFile[]
    );

    const [logMessages, setLogMessages]: UseStatePair<string[]> = useState<string[]>([] as string[]);
    const [isProcessing, setIsProcessing]: UseStatePair<boolean> = useState<boolean>(false);
    const [isComplete, setIsComplete]: UseStatePair<boolean> = useState<boolean>(false);
    const logRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

    const [showPassword, setShowPassword]: UseStatePair<boolean> = useState<boolean>(false);
    const [rememberPassword, setRememberPassword]: UseStatePair<boolean> = useState<boolean>(true);
    const passwordRef: MutableRefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

    const [hasGotMods, setHasGotMods]: UseStatePair<boolean> = useState<boolean>(false);
    const [hasGotPassword, setHasGotPassword]: UseStatePair<boolean> = useState<boolean>(false);

    const addLogMessage: VoidFunctionWithArgs<[message: string]> = useCallback((message: string): void => {
        setLogMessages((old: string[]): string[] => [...old, message]);
        if (logRef.current) setTimeout((): number => (logRef.current!.scrollTop = logRef.current!.scrollHeight));
    }, []);

    const resetLogMessages: VoidFunction = useCallback((): void => {
        setLogMessages([]);
    }, []);

    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        setTimeout((): void => {
            setIsProcessing(false);
            setServerModFiles([]);
            setIsComplete(false);
            setServerpageID(0);
        }, 250);
    }, [setShow]);

    const onClickJoinServer: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            try {
                if (!window.uStore) return console.error('uStore not loaded');
                if (!window.palhub) return console.error('palhub not loaded');
                if (!window.nexus) return console.error('nexus not loaded');
                if (!server) return;

                // const game_path = await window.uStore.get('game_path');
                const game_path: string | undefined = commonAppData?.selectedGame?.path;
                if (!game_path) return console.error('game_path not found');

                const game_data: ValidateGamePathReturnType = await window.palhub('validateGamePath', game_path);
                if (!('has_exe' in game_data) || !game_data.has_exe) return console.error('game exe not found');

                // const api_key: string = await window.uStore.get('api-keys.nexus');
                const cache_dir: string = await window.uStore.get<string>('app-cache');

                await window.palhub('installAppSpecificMods', game_path, game_data.id);

                // check all required mods are installed:
                for (const [_index, { mod, file }] of servermodFiles.entries()) {
                    const is_downloaded: boolean = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                    const is_installed: boolean = await window.palhub('checkModIsInstalled', game_path, mod); //, file);
                    if (!is_downloaded) throw new Error('mod not downloaded:', { cause: { mod, file } });
                    if (!is_installed) throw new Error('mod not installed:', { cause: { mod, file } });
                }

                if (rememberPassword && server.palhubServerURL && passwordRef?.current?.value?.length) {
                    await window.serverCache.set(server.palhubServerURL, passwordRef?.current.value);
                }
                // await window.uStore.set('remeber_server_passwords', rememberPassword);

                console.log('writing launch config:', game_data.content_path);
                await window.palhub(
                    'writeJSON',
                    game_data.content_path,
                    {
                        'auto-join-server': {
                            // Handle IPv4-mapped IPv6 addresses (like ::ffff:172.24.0.6)
                            path: server.palhubServerURL,
                            pass: passwordRef?.current?.value ?? '',
                        },
                    },
                    'palhub.launch.config.json'
                );

                console.log('launching game:', game_data.exe_path);
                await window.palhub('launchExe', game_data.exe_path, []);
                onCancel();
            } catch (error) {
                console.log('onClickJoinServer error:', error);
                setHasGotPassword(!!passwordRef?.current?.value?.length);
                setHasGotMods(false);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [server, servermodFiles, passwordRef, rememberPassword, commonAppData, onCancel, applog, handleError]);

    const onInstallServerModList: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            console.log('onInstallServerModList');
            // return;

            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!servermodFiles || servermodFiles.length === 0) return;

            const api_key: string = await window.uStore.get('api-keys.nexus');
            const game_path: string | undefined = await window.uStore.get('game-path');
            if (!game_path) return;
            const cache_dir: string = await window.uStore.get('app-cache');

            setIsComplete(false);
            setIsProcessing(true);

            resetLogMessages();
            addLogMessage('Downloading and Installing Mods...');

            const wait_between: number = 1000;

            console.log({ api_key, game_path, cache_dir });

            addLogMessage('Uninstalling Previous Mods...');
            await window.palhub('uninstallAllMods', game_path);
            await wait(wait_between);
            addLogMessage('Uninstalled Previous Mods...');

            const total: number = servermodFiles.length;
            for (const [index, { mod, file }] of servermodFiles.entries()) {
                if (!mod.mod_id) continue;
                // console.log({index, mod, file});

                addLogMessage(`Processing Mod... ${index + 1} / ${total}`);
                // downloadMod(cache_path, download_url, mod, file)

                let download: string | boolean = 'already-downloaded';
                try {
                    const downloaded: boolean = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                    if (!downloaded) {
                        addLogMessage(`Getting Download Link: ${mod.name}`);
                        const file_links: IDownloadURL[] = await window.nexus(
                            api_key,
                            'getDownloadURLs',
                            parseIntSafe(mod.mod_id)!,
                            file.file_id
                        );
                        const download_url: string | undefined = file_links.find(
                            (link: IDownloadURL): boolean => !!link.URI
                        )?.URI;

                        addLogMessage(`Downloading Mod From: ${download_url}`);
                        download = await window.palhub('downloadMod', cache_dir, download_url, mod, file);

                        await wait(wait_between);
                        addLogMessage(`Downloaded Mod... ${mod.name}`);
                        console.log({ file_links, download_url, download });
                    }
                } catch (error: unknown) {
                    addLogMessage(`Error Downloading Mod: ${mod.name}`);
                    console.log('download error:', error);
                }
                await wait(wait_between);
                try {
                    const install: boolean = await window.palhub('installMod', cache_dir, game_path, mod, file);

                    await wait(wait_between);
                    addLogMessage(`Successfully Installed Mod: ${mod.name}`);
                    console.log({ install });
                } catch (error: unknown) {
                    addLogMessage(`Error Installing Mod: ${mod.name}`);
                    console.log('install error:', error);
                }
                await wait(wait_between);
            }

            addLogMessage(`Downloaded and Installed ${total} mods!`);
            await wait(wait_between);
            setIsProcessing(false);
            setIsComplete(true);

            setTimeout((): void => {
                setIsComplete(false);
            }, 1000);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [servermodFiles, handleError, resetLogMessages, addLogMessage, applog]);

    useEffect((): VoidFunction | void => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_dl_handler: VoidFunction = window.ipc.on(
            'download-mod-file',
            (_event: RendererIpcEvent, { mod_id, file_id, percentage }: DownloadModFileEvent): void => {
                addLogMessage(`Downloading Mod: ${mod_id} / ${file_id} - ${percentage}%`);
            }
        );

        const remove_in_handler: VoidFunction = window.ipc.on(
            'install-mod-file',
            (
                _event: RendererIpcEvent,
                {
                    install_path: _install_path,
                    name,
                    version,
                    mod_id: _mod_id,
                    file_id: _file_id,
                    entries: _entries,
                }: InstallModFileEvent
            ): void => {
                addLogMessage(`Installing Mod: ${name} v${version}`);
                // console.log({_install_path, _mod_id, _file_id, _entries});
            }
        );

        const remove_ex_handler: VoidFunction = window.ipc.on(
            'extract-mod-file',
            (_event: RendererIpcEvent, { entry, outputPath: _outputPath }: ExtractModFileEvent): void => {
                addLogMessage(`Extracting: ${entry}`);
                // console.log({entry, _outputPath});
            }
        );

        return (): void => {
            remove_dl_handler();
            remove_in_handler();
            remove_ex_handler();
        };
    }, [applog, rememberPassword, servermodFiles, addLogMessage]);

    const shouldShowLogs: boolean = isComplete || isProcessing;

    useEffect((): void => {
        (async (): Promise<void> => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!window.serverCache) return console.error('serverCache not loaded');
            if (!server || !server.mods) return;
            const api_key: string = await window.uStore.get('api-keys.nexus');
            const game_path: string | undefined = await window.uStore.get('game-path');
            const cache_dir: string | null = await window.uStore.get('app-cache');
            if (!cache_dir || !game_path) return;

            const server_mod_files: ServerModFile[] = [];

            const addModAndFile: PromiseVoidFunctionWithArgs<
                [mod_id: number, file_id: number, type: ServerModFileType]
            > = async (mod_id: number, file_id: number, type: ServerModFileType): Promise<void> => {
                console.log('getModAndFile:', mod_id, file_id, type);
                try {
                    const mod: NexusIModInfo = await window.nexus(api_key, 'getModInfo', mod_id);
                    if (!mod) throw new Error(`mod not found: ${mod_id}`);
                    const { files }: IModFiles = await window.nexus(api_key, 'getModFiles', mod_id);
                    const file: NexusIFileInfo | undefined = files.find(
                        (f: NexusIFileInfo): boolean => f.file_id == file_id // not === as may be string or int
                    );
                    if (!file) throw new Error(`file not found: ${file_id}`);
                    server_mod_files.push({ file, mod, type });
                } catch (error: unknown) {
                    console.log('getModAndFile error:', error);
                }
            };

            for (const mod_id of Object.keys(server.mods.required)) {
                const file_id: number | undefined = server.mods.required[mod_id];
                if (!file_id) continue;
                await addModAndFile(mod_id, file_id, 'required');
            }
            for (const mod_id of Object.keys(server.mods.optional)) {
                const file_id: number | undefined = server.mods.optional[mod_id];
                if (!file_id) continue;
                await addModAndFile(mod_id, file_id, 'optional');
            }
            // for (const mod_id in server.mods.blocked) {
            //     const file_id = server.mods.blocked[mod_id];
            //     await addModAndFile(mod_id, file_id, 'blocked');
            // }

            if (rememberPassword && server.palhubServerURL) {
                console.log('getting:/...', server.palhubServerURL);
                const password: string | undefined = await window.serverCache.get(server.palhubServerURL, undefined!);
                if (password && passwordRef.current) passwordRef.current.value = password;
            }

            setServerModFiles(server_mod_files);

            // check if password is required:
            const wants_password: boolean = !!server.serverPassword?.length;
            const has_password: boolean = !!passwordRef?.current?.value?.length;
            setHasGotPassword(wants_password ? has_password : true);

            // check all required mods are installed:
            for (const [_index, { mod, file }] of servermodFiles.entries()) {
                const is_downloaded: boolean = await window.palhub('checkModFileIsDownloaded', cache_dir, file);
                const is_installed: boolean = await window.palhub('checkModIsInstalled', game_path, mod, file);
                if (!is_downloaded || !is_installed) return setHasGotMods(false);
            }
            setHasGotMods(true);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [
        applog,
        rememberPassword,
        servermodFiles,
        server,
        show,
        setServerModFiles,
        setHasGotPassword,
        setHasGotMods,
        handleError,
    ]); //server, rememberPassword, passwordRef?.current?.value]);

    if (!server) return null;

    const carouselOptions: CarouselProps = {
        interval: null,
        indicators: false,
        controls: false,
        className: 'theme-border',
        activeIndex: serverpageID,
    };

    const headerText: string = `${server.serverName} - ${server.gameVersion}`;
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: !shouldShowLogs };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-block overflow-y-scroll" style={{ height }}>
                <div className="p-3">
                    {!shouldShowLogs && (
                        <Fragment>
                            <div className="ratio ratio-16x9">
                                <Image src={server.splashURL} alt={server.serverName} className="d-block w-100" />
                            </div>
                            <div className="row">
                                <DekChoice
                                    className="col py-3"
                                    // disabled={true}
                                    choices={serverpageTypes}
                                    active={serverpageID}
                                    onClick={(i: number, value: string | number): void => {
                                        console.log(`Setting Page: ${value}`);
                                        setServerpageID(i);
                                    }}
                                />
                                <div className="col-12 col-sm-4 col-md-3 pt-sm-3 pt-0 py-3">
                                    <button className="btn btn-success px-4 w-100" onClick={onClickJoinServer}>
                                        <strong>{t('modals.server-details.join')}</strong>
                                        <br />
                                    </button>
                                </div>
                            </div>
                        </Fragment>
                    )}

                    {(!hasGotMods || !hasGotPassword) && (
                        <div className="alert alert-danger text-center">
                            {!hasGotMods && (
                                <div className="container">
                                    <strong>{t('common.note')}</strong> {t('modals.server-details.mods-required')}
                                </div>
                            )}
                            {!hasGotPassword && (
                                <div className="container">
                                    <strong>{t('common.note')}</strong> {t('modals.server-details.pass-required')}
                                </div>
                            )}
                        </div>
                    )}

                    <Carousel {...carouselOptions}>
                        <Carousel.Item className="container-fluid">
                            {/* <BBCodeRenderer bbcodeText={server.longServerDescription} /> */}
                            <MarkdownRenderer>{server.longServerDescription}</MarkdownRenderer>
                            {server.discordServerID && (
                                <div className="text-center mb-1">
                                    <Link
                                        className="btn btn-warning p-2 px-4"
                                        href={`https://discord.gg/${server.discordServerID}`}
                                        target="_blank"
                                    >
                                        <strong>{t('modals.server-details.join-discord', { server })}</strong>
                                        <br />
                                        <small>{t('common.open-link')}</small>
                                    </Link>
                                </div>
                            )}
                        </Carousel.Item>

                        <Carousel.Item className="container-fluid">
                            {server?.serverPassword?.length && (
                                <div className="row">
                                    <div className="card bg-secondary border border-secondary2 pt-3 px-3 pb-2 mb-3">
                                        <input
                                            autoComplete="off"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter Server Password Here.."
                                            className="form-control form-dark theme-bg mb-1"
                                            style={{ width: '100%' }}
                                            ref={passwordRef}
                                        />
                                        <div className="row px-2">
                                            <div className="col">
                                                <DekCheckbox
                                                    inline={true}
                                                    color="dark"
                                                    text="Show Server Password"
                                                    iconPos="left"
                                                    checked={showPassword}
                                                    onClick={setShowPassword}
                                                />
                                            </div>
                                            <div className="col text-end">
                                                <DekCheckbox
                                                    inline={true}
                                                    color="dark"
                                                    text="Remember Server Password"
                                                    // iconPos='left'
                                                    checked={rememberPassword}
                                                    onClick={setRememberPassword}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="row">
                                {Object.keys(server)
                                    .sort()
                                    .map<keyof ServerListing, ReactElement<HTMLAttributes<HTMLDivElement>> | null>(
                                        (
                                            key: keyof ServerListing,
                                            i: number
                                        ): ReactElement<HTMLAttributes<HTMLDivElement>> | null => {
                                            if (HIDDEN_SERVER_DATA_KEYS.has(key)) return null;
                                            return (
                                                <div key={i} className="col-12 col-md-6">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <strong>{key}</strong>
                                                        </div>
                                                        <div className="col-6 text-end">
                                                            {ensureEntryValueType(server[key]) || '???'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                            </div>
                        </Carousel.Item>

                        <Carousel.Item className="container-fluid">
                            {shouldShowLogs && (
                                <div className="m-0 p-3" ref={logRef}>
                                    <pre className="m-0 p-2">{logMessages.join('\n')}</pre>
                                </div>
                            )}
                            {!shouldShowLogs && (
                                <Fragment>
                                    {servermodFiles.map<ServerModFile, ReactElement<ModFileCardProps>>(
                                        ({ file, mod }: ServerModFile, i: number): ReactElement<ModFileCardProps> => {
                                            return <ModFileCard key={i} mod={mod} file={file} />;
                                        }
                                    )}
                                    <div className="text-center mb-1">
                                        <button className="btn btn-success p-2 px-4" onClick={onInstallServerModList}>
                                            <strong>{t('modals.server-details.install-mods', { server })}</strong>
                                            <br />
                                            <small>{t('modals.server-details.install-note')}</small>
                                        </button>
                                    </div>
                                </Fragment>
                            )}
                        </Carousel.Item>
                    </Carousel>
                </div>
            </DekDiv>
        </DekCommonAppModal>
    );
}
