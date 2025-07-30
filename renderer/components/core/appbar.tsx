/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import useWindowNameFromDEAP from '@hooks/use-window-name-from-deap';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import type { ContainerProps } from 'react-bootstrap/Container';
import Container from 'react-bootstrap/Container';

export default function MainAppbar(): ReactElement<ContainerProps> {
    const { t /* , ready */ }: Localization = useLocalization();
    const windowName: string = useWindowNameFromDEAP();
    const [appVersion, setAppVersion] = useState<string>('0.0.0');
    const logger: AppLogger = useAppLogger('components/core/appbar');

    const onClickMinimizeApp: VoidFunction = useCallback((): void => {
        void window?.ipc?.invoke('app-action', windowName, 'minimize');
        void logger('info', 'onClickMinimizeApp');
    }, [logger, windowName]);
    const onClickMaximizeApp: VoidFunction = useCallback((): void => {
        void window?.ipc?.invoke('app-action', windowName, 'maximize');
        void logger('info', 'onClickMaximizeApp');
    }, [logger, windowName]);
    const onClickCloseApp: VoidFunction = useCallback((): void => {
        void window?.ipc?.invoke('app-action', windowName, 'exit');
        void logger('info', 'onClickCloseApp');
    }, [logger, windowName]);

    useEffect((): void => {
        void window?.ipc?.invoke('get-version').then(setAppVersion);
    }, []);

    // if (!ready) return <></>;

    return (
        <Container className="theme-text p-0 appbar" fluid>
            <div className="d-flex p-0">
                <div className="px-3 text-dark" style={{ paddingTop: 6 }}>
                    <small>
                        <strong>{t('app.brandname')}</strong> {t('app.version', { version: appVersion })}
                    </small>
                </div>
                <div className="col deap-dragbar px-2">{/* is the main draggable region to move de vindoe */}</div>
                <div className="text-end">
                    <button onClick={onClickMinimizeApp} className="btn appbar-btn py-1 no-shadow">
                        <CommonIcons.minimize height="1rem" fill="currentColor" />
                    </button>
                    <button onClick={onClickMaximizeApp} className="btn appbar-btn py-1 no-shadow">
                        <CommonIcons.maximize height="1rem" fill="currentColor" />
                    </button>
                    <button onClick={onClickCloseApp} className="btn appbar-btn py-1 no-shadow">
                        <CommonIcons.close_window height="1rem" fill="currentColor" />
                    </button>
                </div>
            </div>
        </Container>
    );
}
