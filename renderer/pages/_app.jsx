/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import react and core layout
import React from 'react';
import DekAppLayoutWrapper from '@components/core/layout';
import { CommonAppDataProvider } from '@hooks/useCommonChecks';
import { LocalizationProvider } from '@hooks/useLocalization';
import { DeepLinkProvider } from '@hooks/useDeepLinkListener';
import { ErrorWrapper } from '@components/core/error-wrap';
import useAppLogger from '@hooks/useAppLogger';
import { useRouter } from 'next/router';

// Import global stylesheets
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

export default function MainAppWrapper({ Component, pageProps }) {
    // console.log({Component, pageProps});
    const applog = useAppLogger("ErrorWrapper");
    const router = useRouter();

    const handleError = (error, info) => {
        applog("error", error.message);
        applog("error", info.componentStack);
    };

    return (
        <LocalizationProvider>
            <DeepLinkProvider>
                <CommonAppDataProvider>
                    <DekAppLayoutWrapper>
                        <ErrorWrapper key={router.pathname} onError={handleError}>
                            <Component {...pageProps}/>
                        </ErrorWrapper>
                    </DekAppLayoutWrapper>
                </CommonAppDataProvider>
            </DeepLinkProvider>
        </LocalizationProvider>
    )
};
