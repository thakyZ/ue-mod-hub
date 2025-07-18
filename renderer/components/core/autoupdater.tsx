/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import styles from '@styles/Home.module.css'
// import { motion } from 'framer-motion';
import useLocalization from '@hooks/use-localization';
import type { AutoUpdaterEventType, DownloadProgressType } from '@main/dek/deap';
import type { RendererIpcEvent } from 'electron-ipc-extended';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Fragment, useEffect, useState } from 'react';

export declare interface AutoUpdaterProps {
    _?: never;
}

export default function AutoUpdater({ _: __ }: AutoUpdaterProps): ReactElement<AutoUpdaterProps> {
    const router = useRouter();
    const { t } = useLocalization();
    const active_route = router.pathname;
    const [updateMessage, setUpdateMessage] = useState<null | string>();
    const [canInstallUpdate, setCanInstallUpdate] = useState(false);

    const beginInstallUpdate: VoidFunction = (): void => {
        if (!window.ipc) return console.error('ipc not loaded');
        void window.ipc.invoke('install-update');
    };

    useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_auto_update_handler = window.ipc.on(
            'auto-updater',
            (_event: RendererIpcEvent, type: AutoUpdaterEventType, data: unknown[] | DownloadProgressType) => {
                console.log('auto-update', { type, data });
                switch (type) {
                    case 'checking-for-update':
                        setUpdateMessage(t('#updater.checking'));
                        break;
                    case 'update-available':
                        setUpdateMessage(t('#updater.available'));
                        break;
                    case 'update-not-available':
                        setUpdateMessage(t('#updater.current'));
                        setTimeout(() => setUpdateMessage(null), 3000);
                        break;
                    case 'update-downloaded':
                        setUpdateMessage(null);
                        setCanInstallUpdate(true);
                        break;
                    case 'error':
                        setUpdateMessage(t('#updater.error', { error: JSON.stringify(data) }));
                        break;
                    case 'before-quit-for-update':
                        setUpdateMessage(t('#updater.preparing'));
                        break;
                    case 'download-progress': {
                        const {
                            bytesPerSecond,
                            percent,
                            transferred: _transferred,
                            total: _total,
                        } = data as DownloadProgressType;
                        const mbps: string = (bytesPerSecond / 1024 / 1024).toFixed(2);
                        const perc: string = percent.toFixed(2);
                        setUpdateMessage(t('#updater.downloading', { mbps, perc }));
                        break;
                    }
                    case 'initializing':
                        setUpdateMessage(t('#updater.starting'));
                        break;
                    default:
                        break;
                }
            }
        );

        // // for testing
        // const data = {bytesPerSecond: 1000345543534, percent: 50, transferred: 500, total: 1000};
        // const {bytesPerSecond, percent, transferred, total} = data;
        // const mbps = (bytesPerSecond / 1024 / 1024).toFixed(2);
        // setUpdateMessage(`UPDATING @ ${mbps} MB/s - ${percent.toFixed(2)}%`);
        // setUpdateMessage(null);
        // setCanInstallUpdate(false);

        return () => remove_auto_update_handler();
    }, [active_route, t]);

    const showUpdateMessage = updateMessage || canInstallUpdate;

    return (
        <Fragment>
            {showUpdateMessage && (
                <div className="container text-center">
                    {updateMessage && (
                        <div className="text-white alert alert-danger border-2 border-danger2 py-1 px-3 mt-3">
                            <small>
                                <strong>{updateMessage}</strong>
                            </small>
                        </div>
                    )}
                    {canInstallUpdate && (
                        <button className="btn btn-sm btn-info mt-2 px-3" onClick={beginInstallUpdate}>
                            <small>
                                <strong>{t('#updater.install')}</strong>
                            </small>
                        </button>
                    )}
                </div>
            )}
        </Fragment>
    );
}
