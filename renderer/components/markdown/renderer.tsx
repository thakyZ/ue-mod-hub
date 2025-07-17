/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { Component } from 'hast-util-to-jsx-runtime/lib/components';
import type { AnchorHTMLAttributes, ClassAttributes, ImgHTMLAttributes, ReactElement } from 'react';
import React from 'react';
import Image from 'react-bootstrap/Image';
import type { Components, ExtraProps, Options } from 'react-markdown';
import Markdown from 'react-markdown';

export declare type DekAppLayoutWrapperProps = Pick<Options, 'children'>;
export declare type LinkRendererProps = ClassAttributes<HTMLAnchorElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> &
    ExtraProps;
export declare type ImageRendererProps = ClassAttributes<HTMLImageElement> &
    ImgHTMLAttributes<HTMLImageElement> &
    ExtraProps;

// Custom link renderer to open links in a new tab
const LinkRenderer: Component<LinkRendererProps> = (props: LinkRendererProps): ReactElement<LinkRendererProps> => {
    if (props.href?.startsWith('/') === true) return <a href={props.href}>{props.children}</a>;
    return (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.children}
        </a>
    );
};

const ImageRenderer: Component<ImageRendererProps> = (props: ImageRendererProps): ReactElement<ImageRendererProps> => {
    return <Image src={props.src} alt={props.alt} fluid thumbnail />;
};

function MarkdownRenderer({ children }: DekAppLayoutWrapperProps): ReactElement<DekAppLayoutWrapperProps> {
    const components: Partial<Components> = {
        a: LinkRenderer,
        img: ImageRenderer,
    };
    return (
        <div className="markdown-container">
            <Markdown components={components}>{children}</Markdown>
        </div>
    );
}

export default MarkdownRenderer;
