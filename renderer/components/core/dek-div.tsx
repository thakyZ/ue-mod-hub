import type { HTMLAttributes, ReactElement } from 'react';

export declare interface DekDivProps extends HTMLAttributes<HTMLDivElement> {
    type?: 'DekBody' | 'DekFoot' | undefined;
    disabled?: boolean | undefined;
}

export default function DekDiv({ children, type: _type, ...rest }: DekDivProps): ReactElement<DekDivProps> {
    return <div {...rest}>{children}</div>;
}
