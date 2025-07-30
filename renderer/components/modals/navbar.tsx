/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
modal is displayed when mobile (small view port) user
clicks on "hamburger menu" in navbar :)
*/
import DekDiv from '@components/core/dek-div';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
// import * as CommonIcons from '@config/common-icons';
import type { NavbarItem } from '@config/navbar-items';
import navbar_items from '@config/navbar-items';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import game_map from '@main/dek/game-map';
import { motion } from 'framer-motion';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { useCallback } from 'react';
import Card from 'react-bootstrap/Card';

export declare interface NavbarModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function NavbarModal({ show, setShow }: NavbarModalProps): ReactElement {
    const applog: AppLogger = useAppLogger('NavbarModal');
    const onCancel: VoidFunction = useCallback(() => setShow(false), [setShow]);
    const { handleError, commonAppData }: CommonChecks = useCommonChecks();

    const { t }: Localization = useLocalization();
    const router: NextRouter = useRouter();
    // const active_route: string = router.pathname;
    const headerText: string = t('app.brandname');
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid pt-4 pb-2 text-center">
                {navbar_items.map((element: NavbarItem, index: number): ReactElement | null => {
                    // const is_this_route: boolean = element.href === active_route;
                    const is_route_servers: boolean = element.href === '/servers';
                    const hasServers: boolean = commonAppData.selectedGame?.id
                        ? !!game_map[commonAppData.selectedGame?.id]?.platforms?.server
                        : false;
                    const isServer: boolean = commonAppData.selectedGame?.launch_type === 'server';
                    if (is_route_servers && !(hasServers && !isServer)) return null;
                    const delay = index * 0.1 + 0.25;
                    const onClick: VoidFunction = (): void => {
                        onCancel();
                        router.push(element.href).catch((error: unknown) => handleError(error, applog));
                    };
                    return (
                        <div key={index} className={`btn no-shadow p-0 w-100 hover-dark text-center`} onClick={onClick}>
                            <motion.div
                                initial={{ y: 64, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay }}
                                // whileInView={{ y: 0, opacity: 1 }}
                                className="mb-3 px-5"
                            >
                                <Card className="my-2">
                                    <Card.Body className="p-0">
                                        <Card.Title className="p-3 bg-secondary">
                                            <h4 className="p-0 mb-0">
                                                <b>{t(element.text)}</b>
                                            </h4>
                                        </Card.Title>
                                        <div className="position-relative">
                                            {/* <Image
                                src={element.image}
                                alt={`BG image for ${element.text}`}
                                width={1000}
                                height={600}
                                className='img-thumbnail img-fluid'
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                            /> */}
                                            <div className="w-100 py-2 px-3">
                                                <p className="lead theme-text">
                                                    <strong>{t(element.desc)}</strong>
                                                </p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </div>
                    );
                })}
            </DekDiv>
        </DekCommonAppModal>
    );
}
