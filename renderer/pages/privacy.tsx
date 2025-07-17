/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { MarkdownPageWrapperProps } from '@components/markdown/wrapper';
import MarkdownPageWrapper from '@components/markdown/wrapper';
import type { ReactElement } from 'react';

export declare interface PrivacyPolicyPageProps {
    modals?: unknown[];
}

export default function PrivacyPolicyPage({
    modals: _modals,
}: PrivacyPolicyPageProps): ReactElement<MarkdownPageWrapperProps> {
    return <MarkdownPageWrapper {...{ tagline: '/privacy.head', filename: 'privacy' }} />;
}
