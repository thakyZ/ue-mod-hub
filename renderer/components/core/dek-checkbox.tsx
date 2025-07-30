/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { TypeFunction, UseStatePair } from '@typed/common';
import type { HTMLAttributes, ReactElement } from 'react';
import { useCallback, /* useMemo, */ useState } from 'react';
import type { ButtonVariant } from 'react-bootstrap/esm/types';

export declare interface IconsMap {
    enabled: CommonIcon;
    disabled: CommonIcon;
}

export declare interface DekCheckboxProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
    text?: string;
    checked?: boolean;
    onClick?: (newval: boolean) => void;
    icons?: IconsMap;
    inline?: boolean;
    iconPos?: 'right' | 'left';
    color?: ButtonVariant;
    labels?: [string | null | undefined, string | null | undefined];
}

const DEFAULT_ICONS: IconsMap = {
    enabled: CommonIcons.tog_enabled,
    disabled: CommonIcons.tog_disabled,
};

export default function DekCheckbox({
    text = 'option-text',
    checked = false,
    onClick = (): void => {},
    icons = DEFAULT_ICONS,
    inline = false,
    iconPos = 'right',
    style = {},
    className = '',
    color = 'secondary',
    labels = [null, null],
}: DekCheckboxProps): ReactElement<DekCheckboxProps> {
    const [active, _setActive]: UseStatePair<boolean> = useState<boolean>(checked);
    const Icon: CommonIcon = checked ? icons.enabled : icons.disabled;
    const onClickedBox: TypeFunction<boolean> = useCallback((): boolean => {
        const newval: boolean = !checked;
        onClick(newval);
        return newval;

        // setActive(v => {
        //     const newval = !v;
        //     onClick(newval);
        //     return newval;
        // });
    }, [checked, onClick]);

    // overwrite text if labels exist:
    text = labels[active ? 0 : 1] ?? text;

    if (inline)
        return (
            <div
                className={`d-inline-block hover-dark hover-${color} ${className}`}
                onClick={onClickedBox}
                style={{ cursor: 'pointer', ...style }}
            >
                {iconPos === 'left' ? (
                    <div className="">
                        <Icon fill="currentColor" height="1rem" />
                        <small className="mx-1">{text}</small>
                    </div>
                ) : (
                    <>
                        <small className="mx-1">{text}</small>
                        <Icon fill="currentColor" height="1rem" />
                    </>
                )}
            </div>
        );

    return (
        <div
            className={'btn p-0 no-shadow hover-dark hover-secondary ' + className}
            onClick={onClickedBox}
            style={{ ...style }}
        >
            <div className="col text-center">
                <div className="row">
                    <small className="me-0">{text}</small>
                </div>
                <div className="d-inline">
                    <Icon height="1rem" fill="currentColor" />
                </div>
            </div>
        </div>
    );
}
