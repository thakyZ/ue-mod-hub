/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import BBCode, { Tag } from 'bbcode-to-react';
import DOMPurify from 'dompurify';
import React from 'react';

export declare interface BBCodeRendererProps {
    bbcodeText: string;
}

class SizeTag extends Tag {
    override params: { size: 1 | 2 | 3 | 4 | 5 | 6 };
    constructor(size: 1 | 2 | 3 | 4 | 5 | 6, renderer: unknown, settings: unknown) {
        super(renderer, settings);
        this.params = { size };
    }
    // 1=small, 6=large
    override toHTML(): string[] {
        const size_map: Record<number, string> = {
            1: '8px',
            2: '12px',
            3: '16px',
            4: '18px',
            5: '24px',
            6: '32px',
        };
        const size: string = size_map[this.params.size]!;
        return [`<span style="font-size: ${size};">${this.getContent()}</span>`];
    }
    // toReact() {}
}

class ImageTag extends Tag {
    override toHTML(): string[] {
        return [`<img class="img-fluid" src="${this.getContent()}" />`];
    }
    // toReact() {}
}

class LinkTag extends Tag {
    override params: { url: string };
    constructor(url: string, renderer: unknown, settings: unknown) {
        super(renderer, settings);
        this.params = { url };
    }
    override toHTML(): string[] {
        return [
            `<a class="hover-dark hover-warning" target="_blank" rel="noopener noreferrer" href="${this.params.url}">${this.getContent()}</a>`,
        ];
    }
}

BBCode.registerTag('size', SizeTag); // add custom size tag
BBCode.registerTag('img', ImageTag); // add custom image tag
BBCode.registerTag('url', LinkTag); // add custom link tag

function decodeHTMLEntities(text: string): string {
    const textarea: HTMLTextAreaElement = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function sanitizeBB(bbcodeText: string): string {
    // remove anything malicious
    bbcodeText = DOMPurify.sanitize(bbcodeText);
    // remove <br /> tags and replace them with newlines
    bbcodeText = bbcodeText.replaceAll(/<br\s*\/?>/gi, '');
    // decode HTML entities
    bbcodeText = decodeHTMLEntities(bbcodeText);
    // convert BBCode to html
    bbcodeText = BBCode.toHTML(bbcodeText)[0]!;
    // return the formatted bbcodeText
    return bbcodeText ?? '';
}

export default function BBCodeRenderer({ bbcodeText }: BBCodeRendererProps) {
    return <div className="bbcode-div mb-3" children={BBCode.toReact(sanitizeBB(bbcodeText))} />;
}
