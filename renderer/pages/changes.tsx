/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import MarkdownPageWrapper from '@components/markdown/wrapper';
// import type { UseStatePair } from '@typed/common';
import type { /* Dispatch, */ ReactElement /* , SetStateAction */ } from 'react';
// import { useEffect, useState } from 'react';

export declare interface ChangelogsPageProps {
    modals: unknown[];
}

export default function ChangelogsPage({ modals: _modals }: ChangelogsPageProps): ReactElement<ChangelogsPageProps> {
    // type FetchedUrlsPair = { commitUrl: string; releaseUrl: string };
    // const [fetchedUrls, setFetchedUrls]: UseStatePair<FetchedUrlsPair | null> = useState<FetchedUrlsPair | null>(null);
    // const [error, setError]: UseStatePair<string> = useState<string>('');
    // const repo: string = 'Dekita/ue-mod-hub';

    // // useEffect((): void => {
    // //     (async (setFetchedUrls: Dispatch<SetStateAction<FetchedUrlsPair | null>>, setError: Dispatch<SetStateAction<string>>): Promise<void> => {
    // //         try {
    // //             // URL for the latest commit changelog
    // //             const commitUrl: string = `https://raw.githubusercontent.com/${repo}/master/CHANGELOG.md`;

    // //             // Fetch the latest release data
    // //             const releaseApiUrl: string = `https://api.github.com/repos/${repo}/releases/latest`;
    // //             const releaseResponse: string = await fetch(releaseApiUrl, { cache: 'no-store' });
    // //             if (!releaseResponse.ok) {
    // //                 throw new Error(`Failed to fetch release: ${releaseResponse.statusText}`);
    // //             }
    // //             const releaseData: any = await releaseResponse.json();

    // //             // URL for the latest release changelog
    // //             const tagName: string = releaseData.tag_name;
    // //             const releaseUrl: string = `https://raw.githubusercontent.com/${repo}/${tagName}/CHANGELOG.md`;

    // //             // Save URLs
    // //             setFetchedUrls({ commitUrl, releaseUrl });
    // //         } catch (error: unknown) {
    // //             setError(error.message);
    // //         }
    // //     })(setFetchedUrls, setError).catch((error: unknown) => {
    // //         handleError(error, setError));
    // //     });
    // // }, [setFetchedUrls, setError]);

    // // console.log(fetchedUrls)

    return (
        <MarkdownPageWrapper
            {...{
                tagline: '/terms.head',
                // filename: fetchedUrls?.releaseUrl,
                filename: 'https://raw.githubusercontent.com/Dekita/ue-mod-hub/refs/heads/master/CHANGELOG.md',
                fromGithub: true,
                header: false,
            }}
        />
    );
}
