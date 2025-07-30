/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import BBCodeRenderer from '@components/core/bbcode';
// import DekCheckbox from '@components/core/dek-checkbox';
import DekChoice from '@components/core/dek-choice';
import DekDiv from '@components/core/dek-div';
// import DekSelect from '@components/core/dek-select';
import type { DekSwitchProps } from '@components/core/dek-switch';
import DekSwitch from '@components/core/dek-switch';
import ModFileCard from '@components/core/mod-file-card';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
// import MarkdownRenderer from '@components/markdown/renderer';
// import { ENVEntry } from '@components/modals/common';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks, { parseIntSafe } from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
// import useMediaQuery from '@hooks/use-media-query';
import type { ScreenSize } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';
import type { IModInfoWithSavedConfig } from '@main/dek/palhub-types';
import type { IFileInfo as NexusIFileInfo, IModFiles as NexusIModFiles } from '@nexusmods/nexus-api';
// import IconX from '@svgs/fa5/regular/window-close.svg';
import type { PropsMouseEvent, UseStatePair } from '@typed/common';
import Link from 'next/link';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { useCallback, useEffect, /* useMemo, useRef, */ useState } from 'react';
// import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
// import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
// import Modal from 'react-bootstrap/Modal';
// import Row from 'react-bootstrap/Row';

export declare interface ModDetailsModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    mod: IModInfoWithSavedConfig | null;
    refreshModList: VoidFunction;
}

export default function ModDetailsModal({
    show,
    setShow,
    mod,
    refreshModList,
}: ModDetailsModalProps): ReactElement<ModDetailsModalProps> | null {
    const applog: AppLogger = useAppLogger('ModDetailsModal');
    const { handleError, commonAppData }: CommonChecks = useCommonChecks();
    const { t, tA }: Localization = useLocalization();
    const { isDesktop }: ScreenSize = useScreenSize();
    const fullscreen: boolean = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    const [modpageID, setModpageID]: UseStatePair<number> = useState<number>(0);
    const modpageTypes: string[] = tA('modals.mod-details.tabs', 2);

    const [modFiles, setModFiles]: UseStatePair<NexusIFileInfo[]> = useState<NexusIFileInfo[]>([]);
    const [showArchive, setShowArchive]: UseStatePair<boolean> = useState<boolean>(false);

    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        setTimeout((): void => {
            setModpageID(0);
            setModFiles([]);
            setShowArchive(false);
            refreshModList();
        }, 250);
    }, [setShow, refreshModList]);

    useEffect((): void => {
        (async (): Promise<void> => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mod) return;

            try {
                const api_key: string | null = await window.uStore.get<string | null>('api-keys.nexus');
                if (!api_key) return;
                const game_slug: string | undefined = commonAppData?.selectedGame?.map_data.providers.nexus;
                const result: NexusIModFiles = await window.nexus(
                    api_key,
                    'getModFiles',
                    parseIntSafe(mod.mod_id)!,
                    game_slug
                );
                console.log('updateModFiles result:', result);
                const { files, file_updates }: NexusIModFiles = result;
                files.sort((a: NexusIFileInfo, b: NexusIFileInfo): number => b.uploaded_timestamp - a.uploaded_timestamp);
                console.log({ files, file_updates });
                // const links: IDownloadURL[] = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id);
                // console.log({links});
                setModFiles(files);
            } catch (error: unknown) {
                console.log('updateModFiles error:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [mod, applog, handleError, commonAppData?.selectedGame?.map_data.providers.nexus]);

    if (!mod) return null;

    const height: string = fullscreen ? 'calc(100vh - 96px)' : 'calc(100vh / 4 * 3)';
    const headerText: string = `${mod.name} by ${mod.author}`;
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: true };
    const hasArchivedFiles: boolean = modFiles.some(
        (file: NexusIFileInfo): boolean => file && file.category_name === 'ARCHIVED'
    );
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-block overflow-y-scroll p-2" style={{ height }}>
                <div>
                    <div className="ratio ratio-16x9">
                        <Image src={mod.picture_url} alt={mod.name} className="d-block w-100" />
                    </div>
                    <DekChoice
                        className="py-2"
                        // disabled={true}
                        choices={modpageTypes}
                        active={modpageID}
                        onClick={(i: number, value: string | number): void => {
                            console.log(`Setting Page: ${value}`);
                            setModpageID(i);
                        }}
                    />
                    <Carousel
                        interval={null}
                        indicators={false}
                        controls={false}
                        className="theme-border"
                        activeIndex={modpageID}
                    >
                        <Carousel.Item className="container-fluid">
                            <BBCodeRenderer bbcodeText={mod.description ?? ''} />
                        </Carousel.Item>

                        <Carousel.Item className="container-fluid">
                            {hasArchivedFiles && (
                                <div className="row">
                                    <DekSwitch
                                        // labels={['Hide Archived Files','Display Archived Files']}
                                        labels={[]}
                                        className="mb-3 px-0"
                                        text={t('modals.mod-details.show-archive')}
                                        checked={showArchive}
                                        maxIconWidth={64}
                                        onClick={(
                                            _event: PropsMouseEvent<DekSwitchProps, HTMLDivElement>,
                                            newval: boolean
                                        ): void => setShowArchive(newval)}
                                    />
                                </div>
                            )}
                            {modFiles.map((file: NexusIFileInfo, i: number): ReactElement | null => {
                                if (!showArchive && file && file.category_name === 'ARCHIVED') return null;
                                return <ModFileCard key={i} mod={mod} file={file} />;
                            })}
                        </Carousel.Item>
                        <Carousel.Item className="container-fluid">
                            <BBCodeRenderer bbcodeText={mod.description ?? ''} />
                        </Carousel.Item>
                    </Carousel>
                    <div className="text-center mb-1">
                        <Link
                            href={`https://www.nexusmods.com/${commonAppData?.selectedGame?.map_data.providers.nexus}/mods/${mod.mod_id}`}
                            target="_blank"
                            className="btn btn-warning p-2 px-4"
                        >
                            <strong>{t('modals.mod-details.view-page')}</strong>
                            <br />
                            <small>{t('common.open-link')}</small>
                        </Link>
                    </div>
                </div>
            </DekDiv>
        </DekCommonAppModal>
    );
}
