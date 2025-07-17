/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import MarkdownPageWrapper from '@components/markdown/wrapper';
import { JSX } from 'react';

export declare interface TermsOfServicePageProps {
    modals: unknown;
}

export default function TermsOfServicePage({ modals: _modals }: TermsOfServicePageProps): JSX.Element {
    return <MarkdownPageWrapper {...{ tagline: '/terms.head', filename: 'terms' }} />;
}
