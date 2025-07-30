/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DekChoice from '@components/core/dek-choice';
// import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { ensureError } from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { OptionalMouseEventHandler, UseStatePair } from '@typed/common';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import type { MouseEvent, ReactElement } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
// import type { PromiseTypeFunction, WrappedProps } from '@typed/common';
// import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';

export declare interface LogsPageProps {
    _?: any | undefined | null; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents,  @typescript-eslint/no-explicit-any
}

// export const getServerSideProps: PromiseTypeFunction<WrappedProps<FAQPageProps>> = async (): Promise<
//     WrappedProps<FAQPageProps>
// > => {
//     return { props: {} };
// };

export default function LogsPage(_props: LogsPageProps): ReactElement<LogsPageProps> {
    const { t, tA }: Localization = useLocalization();
    const applog: AppLogger = useAppLogger('LogsPage');
    const { requiredModulesLoaded, commonAppData, handleError }: CommonChecks = useCommonChecks();
    // const cache_dir: string | null = commonAppData?.cache;
    // const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const game_data: GameInformation | undefined = commonAppData?.selectedGame;
    // const api_key: string | null = commonAppData?.apis?.nexus;

    const [appLogs, setAppLogs]: UseStatePair<string> = useState<string>('');
    const [appLogPath, setAppLogPath]: UseStatePair<string | null> = useState<string | null>(null);
    const [ue4ssLogs, setUE4SSLogs]: UseStatePair<string> = useState<string>('');
    const [ue4ssLogPath, setUE4SSLogPath]: UseStatePair<string | null> = useState<string | null>(null);
    const [logPageID, setLogPageID]: UseStatePair<number> = useState<number>(0);
    const [scrollPosition, setScrollPosition]: UseStatePair<number> = useState<number>(0);
    const [showScrollHelpers, setShowScrollHelpers]: UseStatePair<boolean> = useState<boolean>(false);

    const openFileLocation: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            const logPath: string | null = logPageID === 0 ? appLogPath : ue4ssLogPath;
            if (!logPath) return;
            await window.ipc.invoke('open-file-location', logPath);
        })().catch((error: unknown) => handleError(error, applog));
    }, [logPageID, appLogPath, ue4ssLogPath, handleError, applog]);

    //!? todo?: only watch the file for selected page??
    useEffect((): void | VoidFunction => {
        if (!requiredModulesLoaded) return;

        // Listen for changes in the various watched files
        const removeWatchedFileChangeHandler: VoidFunction = window.ipc.on(
            'watched-file-change',
            (_event: RendererIpcEvent, data: { path: string }, contents: string): void => {
                if (data.path.endsWith('UE4SS.log')) setUE4SSLogs(contents.trim());
                else setAppLogs(contents.trim());
            }
        );

        // Initialize the logs
        (async (): Promise<void> => {
            if (!game_data) return;
            try {
                setAppLogPath(await window.ipc.invoke('get-path', 'log'));
                const app_log_string: string = (await window.palhub('readFile', appLogPath!, {
                    encoding: 'utf8',
                })) as string;
                await window.palhub('watchForFileChanges', appLogPath!);
                setAppLogs(app_log_string.trim());
            } catch (error: unknown) {
                setAppLogs(`Error fetching logs:\n${ensureError(error).message}`);
            }
            try {
                setUE4SSLogPath(await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS.log'));
                let path_valid: boolean = await window.palhub('checkIsValidFolderPath', ue4ssLogPath!);
                if (!path_valid) {
                    setUE4SSLogPath(await window.palhub('joinPath', game_data.ue4ss_root, 'ue4ss/UE4SS.log'));
                    path_valid = await window.palhub('checkIsValidFolderPath', ue4ssLogPath!);
                }
                if (!path_valid) {
                    console.error('Invalid path for UE4SS log file:', ue4ssLogPath);
                    return;
                }
                const ue4ss_log_string: string = (await window.palhub('readFile', ue4ssLogPath!, {
                    encoding: 'utf8',
                })) as string;
                await window.palhub('watchForFileChanges', ue4ssLogPath!);
                setUE4SSLogs(ue4ss_log_string.trim());
            } catch (error: unknown) {
                setUE4SSLogs(`Error fetching logs:\n${ensureError(error).message}`);
            }
        })().catch((error: unknown): void => handleError(error, applog));

        // Remove the watcher when the component is unmounted
        return () => {
            removeWatchedFileChangeHandler();
            if (appLogPath)
                window
                    .palhub('unwatchFileChanges', appLogPath)
                    .catch((error: unknown): void => handleError(error, applog));
            if (ue4ssLogPath)
                window
                    .palhub('unwatchFileChanges', ue4ssLogPath)
                    .catch((error: unknown): void => handleError(error, applog));
        };
    }, [appLogPath, game_data, requiredModulesLoaded, ue4ssLogPath, handleError, applog]);

    const scrollToTop: OptionalMouseEventHandler<HTMLButtonElement> = useCallback(
        (_event?: MouseEvent<HTMLButtonElement>): void => {
            const main_body = document.querySelector('#main-body');
            if (main_body) main_body.scrollTo(0, 0);
        },
        []
    );
    const scrollToBottom: OptionalMouseEventHandler<HTMLButtonElement> = useCallback(
        (_event?: MouseEvent<HTMLButtonElement>): void => {
            const main_body = document.querySelector('#main-body');
            if (main_body) main_body.scrollTo(0, main_body.scrollHeight);
        },
        []
    );

    // Handler for the scroll event
    useEffect((): void | VoidFunction => {
        const main_body: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#main-body');
        if (!main_body) return;
        const handleScroll: EventListenerOrEventListenerObject = (_event: Event): void => {
            const limitBuffer = 1024;
            const position: number = main_body.scrollTop;
            const max: number = main_body.scrollHeight;
            const height: number = main_body.clientHeight;
            const isAboveMin: boolean = position > limitBuffer;
            const isBelowMax: boolean = position < max - height - limitBuffer;
            setShowScrollHelpers(isAboveMin && isBelowMax);
            setScrollPosition(position / max);
        };
        // Add the scroll event listener when the component mounts
        main_body.addEventListener('scroll', handleScroll);
        // Cleanup the event listener when the component unmounts
        return (): void => main_body.removeEventListener('scroll', handleScroll);
    }, []); // The empty dependency array ensures this effect runs once when the component mounts

    // Scroll to the bottom of the logs when they change
    // React.useEffect(scrollToBottom, [appLogs, ue4ssLogs, logPageID]);
    useEffect((): void => {
        if (scrollPosition < 0.9) return;
        scrollToBottom();
    }, [appLogs, ue4ssLogs, logPageID, scrollToBottom, scrollPosition]);

    const logString = [appLogs, ue4ssLogs][logPageID];

    return (
        <Fragment>
            {/* <BrandHeader
            type='altsmall'
            words={tA('/logs.words)}
            tagline={t('/logs.head')}
        /> */}
            {showScrollHelpers && (
                <div className="position-fixed top-50 end-0 translate-middle">
                    <div className={`d-grid transition-all ${showScrollHelpers ? 'opacity1' : 'opacity0'}`}>
                        <button className="btn btn-info" onClick={scrollToTop}>
                            <CommonIcons.arrow_up fill="currentColor" height="2rem" />
                        </button>
                        <button className="btn btn-info mt-2" onClick={scrollToBottom}>
                            <CommonIcons.arrow_down fill="currentColor" height="2rem" />
                        </button>
                    </div>
                </div>
            )}
            <Container className="text-start pt-5 pb-3 noverflow">
                <div className="row">
                    <div className="col">
                        <DekChoice
                            className="pb-3"
                            disabled={!game_data?.has_ue4ss}
                            active={logPageID}
                            choices={tA('/logs.tabs', 2)}
                            onClick={(i: number, _v: string | number) => setLogPageID(i)}
                        />
                    </div>
                    <div className="col-8 col-md-3 col-lg-3 pb-3 pe-0">
                        <button className="btn btn-dark w-100" onClick={openFileLocation}>
                            {t('/logs.open-file')}
                        </button>
                    </div>
                    <div className="col-4 col-md-2 col-lg-1 pb-3">
                        <button className="btn btn-info w-100" onClick={scrollToBottom}>
                            <CommonIcons.arrow_down fill="currentColor" height="1.25rem" />
                        </button>
                    </div>
                </div>
                <pre>{logString}</pre>
                <button className="btn btn-info w-100" onClick={scrollToTop}>
                    <CommonIcons.arrow_up fill="currentColor" height="2rem" />
                </button>
            </Container>
        </Fragment>
    );
}
