import type { HTMLAttributes, ReactElement } from 'react';

export declare interface DekItemProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    text?: string;
    active?: boolean;
    id?: string;
}

export default function DekItem({ children, text = '' }: DekItemProps): ReactElement<DekItemProps> {
    return children ? <div>{children}</div> : <div>{text}</div>;
}
