/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { CommonIcon } from '@config/common-icons';
import type { HTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import type { ButtonVariant } from 'react-bootstrap/esm/types';
// import { useCallback, useMemo, useState } from 'react';

export declare interface DekChoiceProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
    active?: number;
    choices?: (number | string)[];
    onClick?: (index: number, choice: string | number) => void;
    labels?: string[];
    icons?: (CommonIcon | null)[];
    color?: ButtonVariant | undefined;
    disabled?: boolean | undefined;
}

export default function DekChoice({
    active = 0,
    choices = [1, 4, 9],
    onClick = (): void => {},
    labels = choices.map(String),
    icons = [null, null],
    color = 'secondary',
    className = '',
    style = {},
    disabled = false,
}: DekChoiceProps): ReactElement<DekChoiceProps> {
    // const [activeID, setActiveID] = useState(active);

    // prettier-ignore
    return (
        <div className={'' + className} style={{ ...style }}>
            <div className="btn-group dek-choice w-100" role="group">
                {choices.map((choice: string | number, i: number): ReactElement<HTMLAttributes<HTMLDivElement>> => {
                    const Icon: CommonIcon | null | undefined = icons[i];
                    const isActive: boolean = active === i;
                    const deClass: string =
                        'w-100 btn ' +
                        (isActive ? `btn-${color}` : `btn-dark hover-${color}`) +
                        (disabled ? ' disabled' : '');
                    const deClick: VoidFunction = (): void => {
                        if (disabled) return;
                        // setActiveID(i);
                        onClick(i, choice);
                    };
                    return (
                        <div key={i} className={deClass} onClick={deClick} aria-disabled={disabled}>
                            {Icon ? <Icon fill="currentColor" height="1rem" /> : labels[i]}
                        </div>
                    );
                })}
            </div>
            {/* {!!text && <p className='d-inline px-2'>{text}</p>} */}
        </div>
    );
}
