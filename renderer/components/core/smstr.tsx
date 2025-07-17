/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { ReactElement } from 'react';

export declare interface SmallStrongProps {
    text: string;
}

export default function SmallStrong({ text }: SmallStrongProps): ReactElement<SmallStrongProps> {
    return (
        <small>
            <strong>{text}</strong>
        </small>
    );
}
