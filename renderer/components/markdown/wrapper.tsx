/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import BrandHeader from '@components/core/brand-header';
import MarkdownRenderer from '@components/markdown/renderer';
import { handleError } from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
import type { ImportWithDefault } from '@typed/common';
import type { ReactElement } from 'react';
import { Fragment, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';

export declare interface MarkdownPageWrapperProps {
    tagline: string;
    filename: string;
    header?: boolean;
    fromGithub?: boolean;
}

export default function MarkdownPageWrapper({
    tagline,
    filename,
    header = true,
    fromGithub = false,
}: MarkdownPageWrapperProps): ReactElement<MarkdownPageWrapperProps> | null {
    const [content, setContent] = useState('');
    const { t, tString, language } = useLocalization();

    useEffect((): void => {
        // Dynamically import the Markdown file on mount
        (async (): Promise<void> => {
            let markdown: string | null = null;
            try {
                // Try to load the markdown file for the current locale
                // prettier-ignore
                if (!fromGithub) markdown = (((await import(`../../markdown/${filename}.${language}.md`)) as ImportWithDefault).default as string);
            } catch (error: unknown) {
                // Fallback to English if the file doesn't exist for the current locale
                console.log(`Error loading markdown file: ${filename}.${language}.md`);
                handleError(error);
                // prettier-ignore
                if (!fromGithub) markdown = (((await import(`../../markdown/${filename}.en.md`)) as ImportWithDefault).default as string);
            }
            // if from github, load data from given filename as url:
            if (fromGithub) {
                try {
                    console.log(`Fetching markdown file: ${filename}`);
                    const response = await fetch(filename, { cache: 'no-store' });
                    markdown = await response.text();
                } catch (error: unknown) {
                    console.log(`Error loading markdown file: ${filename}`);
                    handleError(error);
                    markdown = null;
                }
            }
            // Set the content of the Markdown file if it was loaded
            if (markdown) setContent(markdown);
        })().catch((error: unknown) => {
            handleError(error);
        });
    }, [filename, language]); // Re-run effect if `markdownFile` changes

    // (keystring, replacers = {}, expectedArraySize = null, bundle_override=null)
    // bundle_point = '', replacers = {}, bundle_override=null

    if (!content) return null;

    return (
        <Fragment>
            {header && <BrandHeader type="altsmall" tagline={t(tagline as '/privacy.head')} />}
            <Container className="noverflow">
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3 pt-5 pb-4">
                        <MarkdownRenderer>{tString(content)}</MarkdownRenderer>
                    </div>
                </div>
            </Container>
        </Fragment>
    );
}
