/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import AutoUpdater from '@components/core/autoupdater';
import * as CommonIcons from '@config/common-icons';
import type { NavbarItem } from '@config/navbar-items';
import navbar_items from '@config/navbar-items';
import type { CommonAppDataContextType } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
// import useAppLogger from '@hooks/use-app-logger';
import type { GamePlatformData } from '@main/dek/game-map';
import game_map from '@main/dek/game-map';
// import { motion } from 'framer-motion';
import Link from 'next/link';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export declare interface MainNavbarModals {
    onClickSettings?: VoidFunction;
    onClickGemStore?: VoidFunction;
    onClickHamburger?: VoidFunction;
}

export declare interface MainNavbarProps {
    modals: MainNavbarModals;
}

export default function MainNavbar({
    modals: { onClickHamburger, onClickGemStore: _onClickGemStore },
}: MainNavbarProps): ReactElement<MainNavbarProps> {
    // const logger = useAppLogger('components/core/navbar');
    const {
        requiredModulesLoaded: _requiredModulesLoaded,
        commonAppData,
        updateSelectedGame: _updateSelectedGame,
    }: CommonAppDataContextType = useCommonChecks();
    const { t } = useLocalization();
    const router: NextRouter = useRouter();
    const active_route: string = router.pathname;

    // Scroll to top when route changes
    useEffect((): void => {
        const main_body: HTMLElement | null = document.querySelector('#main-body');
        if (main_body) main_body.scrollTo(0, 0); // bottom: main_body.scrollHeight
    }, [active_route]);

    const is_settings: boolean = active_route === '/settings';
    const settings_color: string = is_settings ? 'text-warning' : 'hover-dark hover-secondary';
    const settings_classes: string = `col btn no-shadow p-2 pe-4 my-auto ${settings_color}`;

    // if (!ready) return <></>;

    console.log('commonAppData.selectedGame:', commonAppData.selectedGame);

    return (
        <Navbar className="navbar theme-text">
            <Container className="theme-text" fluid>
                {/* Area shown when on a small viewport (shows hamburger menu) */}
                <Nav className="d-flex d-md-none me-auto">
                    <div className={`btn p-2 no-shadow hover-dark hover-secondary`} onClick={onClickHamburger}>
                        <CommonIcons.navtoggle height="1.75rem" fill="currentColor" />
                    </div>
                </Nav>
                {/* Area to display all of the regular navigation links */}
                <Nav className="d-none d-md-flex me-auto" activeKey={active_route}>
                    {navbar_items.map((element: NavbarItem): ReactElement | null => {
                        const is_this_route: boolean = element.href === active_route;
                        const is_route_servers: boolean = element.href === '/servers';
                        // prettier-ignore
                        const hasServers: GamePlatformData | undefined = game_map[commonAppData.selectedGame?.id as keyof typeof game_map]?.platforms?.server;
                        const isServer: boolean = commonAppData.selectedGame?.launch_type === 'server';
                        if (is_route_servers && !(hasServers && !isServer)) return null;

                        const route_color: string = is_this_route ? 'text-warning' : 'hover-dark hover-secondary ';
                        return (
                            <Link href={element.href} key={element.href} className={`btn px-3 no-shadow ${route_color}`}>
                                <strong>{t(element.text)}</strong>
                            </Link>
                        );
                    })}
                </Nav>

                {/* Area to display the update progress & settings cog */}
                <Nav className="text-end">
                    <div className="row">
                        <div className="col-auto">
                            <AutoUpdater />
                        </div>
                        <div className={settings_classes} onClick={(): void => void router.push('/settings')}>
                            <CommonIcons.cog height="1.75rem" fill="currentColor" />
                        </div>
                    </div>
                </Nav>
            </Container>
        </Navbar>
    );
}
