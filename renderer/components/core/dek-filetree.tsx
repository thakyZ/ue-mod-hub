/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { TypeFunctionWithArgs } from '@typed/common';
import type { ReactElement } from 'react';
import React from 'react';
import { SphereSpinner } from 'react-spinners-kit';

export declare interface FileTreeEntry {
    path: string;
    name: string;
    type: string;
    size?: number | string | undefined;
    children?: FileTreeEntry[] | undefined;
}

export declare interface DekFileTreeProps {
    data?: FileTreeEntry | undefined | null;
}

export default function DekFileTree({ data }: DekFileTreeProps): ReactElement<DekFileTreeProps> {
    if (!data || !data.children) {
        return (
            <div className="d-flex justify-content-center p-3">
                <SphereSpinner color="currentColor" />
            </div>
        );
    }

    // prettier-ignore
    const renderTree: TypeFunctionWithArgs<[nodes: FileTreeEntry[]], ReactElement<FileTreeEntry[]>> = (nodes: FileTreeEntry[]): ReactElement<FileTreeEntry[]> => {
        return (
            <ul>
                {nodes.map((node: FileTreeEntry): ReactElement<FileTreeEntry> => (
                    <li key={node.path}>
                        {node.type === 'directory' ? (
                            <>
                                <strong>{node.name}</strong>
                                {node.children && renderTree(node.children)}
                            </>
                        ) : (
                            <span>
                                {node.name} ({node.size})
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return <div>{renderTree(data.children)}</div>;
}
