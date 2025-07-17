/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import react and core layout
// Import global stylesheets
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

// import assert from 'node:assert';

import { ErrorWrapper } from '@components/core/error-wrap';
import DekAppLayoutWrapper from '@components/core/layout';
import useAppLogger from '@hooks/use-app-logger';
import { CommonAppDataProvider } from '@hooks/use-common-checks';
import { DeepLinkProvider } from '@hooks/use-deep-link-listener';
import { LocalizationProvider } from '@hooks/use-localization';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import type { ErrorInfo, ReactElement } from 'react';
import React from 'react';

export default function MainAppWrapper({ Component, pageProps }: AppProps): ReactElement<AppProps> {
    // console.log({Component, pageProps});
    const applog = useAppLogger('ErrorWrapper');
    const router = useRouter();

    const handleError = (error: unknown, info: ErrorInfo): void => {
        /** @type {unknown} */
        let _error: unknown = error;
        if (!_error || _error === null) _error = 'Unknown Error';
        if (typeof _error === 'string') _error = new Error(_error);
        else if (!(_error instanceof Error)) _error = new Error(String(_error));
        else if (_error instanceof Error) void applog('error', _error.message);
        else void applog('error', new Error(String(_error)));
        void applog('error', info.componentStack);
    };

    return (
        <LocalizationProvider>
            <DeepLinkProvider>
                <CommonAppDataProvider>
                    <DekAppLayoutWrapper>
                        <ErrorWrapper key={router.pathname} onError={handleError}>
                            <Component {...pageProps} />
                        </ErrorWrapper>
                    </DekAppLayoutWrapper>
                </CommonAppDataProvider>
            </DeepLinkProvider>
        </LocalizationProvider>
    );
}
