/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import { env } from 'node:process';

import Appbar from '@components/core/appbar';
import Footer from '@components/core/footer';
import MetaHead from '@components/core/metahead';
import Navbar from '@components/core/navbar';
import NavbarModal from '@components/modals/navbar';
import NxmLinkModal from '@components/modals/nxm-link';
import useAppLogger from '@hooks/use-app-logger';
import useCommonChecks from '@hooks/use-common-checks';
import type { DeepLinkNXMType, DeepLinkType } from '@hooks/use-deep-link-listener';
import useDeepLinkListener from '@hooks/use-deep-link-listener';
import useLocalization from '@hooks/use-localization';
import type { Themes, UseThemeSystemReturn } from '@hooks/use-theme-system';
import useThemeSystem, { THEMES } from '@hooks/use-theme-system';
import useWindowNameFromDEAP from '@hooks/use-window-name-from-deap';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { Children, cloneElement, Fragment, useEffect, useMemo, useState } from 'react';
import { PongSpinner } from 'react-spinners-kit';

export declare interface DekAppLayoutWrapperProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    children?: ReactElement | ReactElement[] | undefined;
}

export declare type ThemeController = UseThemeSystemReturn & { themes: readonly Themes[] };

function GoogleTagManager(): ReactElement<DekAppLayoutWrapperProps> | null {
    const enabled: string | undefined = process.env['GOOGLE_TAG_ENABLED'];
    const id: string | undefined = process.env['GOOGLE_TAG_ID'];
    if (!enabled || Boolean(enabled) === false) return null;
    return (
        <Fragment>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
            <script id="google-analytics">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${id});
        `}
            </script>
        </Fragment>
    );
}

export default function DekAppLayoutWrapper({
    children,
}: DekAppLayoutWrapperProps): ReactElement<DekAppLayoutWrapperProps> {
    const logger = useAppLogger('core/layout');
    const { deepLink, linkChanged, consumeDeepLink } = useDeepLinkListener();
    const { requiredModulesLoaded: _requiredModulesLoaded, commonAppData } = useCommonChecks();
    const [deepLinkData, setDeepLinkData] = useState<DeepLinkType | DeepLinkNXMType | undefined>();
    const initialGame: string = (commonAppData?.selectedGame?.id ?? 'none').replace('-demo', '');
    const { theme_id, setThemeID, bg_id, setBgID, bg_opac, setBgOpac } = useThemeSystem(initialGame);
    const [showNavbarModal, setShowNavbarModal] = useState<boolean>(false);
    const [showNxmModal, setShowNxmModal] = useState<boolean>(false);
    const windowName: string = useWindowNameFromDEAP();
    const theme: string = `/themes/${THEMES[theme_id]}.css`;
    const active_route: string = useRouter().pathname;

    // bgopac-low bgopac-med bgopac-high
    const opac: string | undefined = ['low', 'med', 'high'][bg_opac];
    const bg: string = `game-bg ${initialGame}${bg_id + 1} bgopac-${opac}`;
    const can_show_navbar: boolean = !!windowName && !['help', 'setup', 'changes'].includes(windowName);
    const nonav_page: string = can_show_navbar ? '' : 'game-bg-full';
    // const loadDelay: number = can_show_navbar ? 10000 : 0;
    const { ready, t: _t } = useLocalization(null); //, loadDelay);
    // const isActuallyReady: boolean = ready && !!commonAppData?.selectedGame?.id;

    const modals: Record<string, VoidFunction> = {
        // onClickSettings: () => setShowSettingsModal(true),
        onClickHamburger: (): void => setShowNavbarModal(true),
    };

    const isbasepath: boolean = active_route !== '/';
    // const bodystyle = isbasepath ? {overflowY: 'scroll'} : {};
    const bodystyle: CSSProperties = isbasepath ? { overflowY: 'scroll' } : {};
    const commonTitle: string = 'UE Mod Hub';

    const ThemeController = useMemo((): ThemeController => {
        return {
            theme_id,
            setThemeID,
            themes: THEMES,
            bg_id,
            setBgID,
            bg_opac,
            setBgOpac,
        };
    }, [theme_id, bg_id, bg_opac]);

    useEffect((): void => {
        if (linkChanged) {
            void logger('info', `Consumed Deep Link: ${deepLink}`);
            const newDeepLink: DeepLinkType | DeepLinkNXMType | undefined = consumeDeepLink();
            setDeepLinkData(newDeepLink);
            // { game_slug, mod_id, file_id, key, expires, user_id }
            void logger('info', `DEEP LINK: ${JSON.stringify(newDeepLink, null, 2)}`);
            setShowNxmModal(true);
        }
    }, [linkChanged]);

    // prettier-ignore
    return (
        <Fragment>
            {/* <!-- Load theme style: not best practice --> */}
            <Head>
                <link rel="stylesheet" href={theme} />
            </Head>

            {/* <!-- use metahead component to dynamically set social media embeddings per page --> */}
            <MetaHead title={commonTitle} desc={commonTitle} url={active_route} />

            <GoogleTagManager />

            <div className="vh-100 theme-bg selection-secondary app-border">
                {/* Main application page contents */}
                {ready && (
                    <Fragment>
                        {/* Appbar is shown (unless viewport is sm) */}
                        <Appbar />
                        {/* Show the main app navbar */}
                        {can_show_navbar && <Navbar modals={modals} />}
                        {/* Show the main application page contents */}
                        <div id="main-body" className={`main-body h-full ${nonav_page} ${bg}`} style={bodystyle}>
                            {/* Add modals data to children to allow settings and store modal control */}
                            {children ? Children.map(
                                children,
                                (child: ReactElement): ReactElement => cloneElement(child, { modals, ThemeController })
                            ) : undefined}
                        </div>
                        {/* Add the navbar modal (shown when click hamburger menu on sm viewport) */}
                        <NavbarModal show={showNavbarModal} setShow={setShowNavbarModal} />
                        {/* Add the nxm-link modal (shown when deep link is detected) */}
                        <NxmLinkModal show={showNxmModal} setShow={setShowNxmModal} deepLinkData={deepLinkData} />
                        {/* Add the footer to the page */}
                        {can_show_navbar && <Footer />}
                    </Fragment>
                )}
                {/* A basic loading page for when app/localization is finished loading */}
                {/* deap-dragbar to still allow for the window to be moved while loading */}
                {!ready && (
                    <div className={`main-body h-full game-bg-full deap-dragbar`}>
                        <div className="h-100 d-flex justify-content-center align-items-center">
                            <div className="d-grid text-center text-secondary">
                                <PongSpinner color="currentColor" size={256} />
                                <strong className="mt-3">
                                    <small>LOADING:..</small>
                                </strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
