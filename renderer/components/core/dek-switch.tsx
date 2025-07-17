/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import type { IconsMap } from '@components/core/dek-checkbox';
import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { PropsMouseEvent } from '@typed/common';
import type { Property } from 'csstype';
import type { HTMLAttributes, MouseEvent } from 'react';
import { useCallback /* , useMemo, useState */ } from 'react';
import type { ButtonVariant } from 'react-bootstrap/esm/types';

export declare interface DekSwitchProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
    text?: string | undefined;
    checked?: boolean | undefined;
    iconPos?: 'left' | 'right' | undefined;
    inline?: boolean | undefined;
    onClick?: ((event: PropsMouseEvent<DekSwitchProps, HTMLDivElement>, newval: boolean) => void) | undefined;
    icons?: IconsMap | undefined;
    color?: ButtonVariant | undefined;
    labels?: (string | null | undefined)[] | undefined | null;
    maxIconWidth?: Property.MaxWidth<string | number> | undefined;
}

const DEFAULT_ICONS: IconsMap = {
    enabled: CommonIcons.tog_enabled,
    disabled: CommonIcons.tog_disabled,
};

export default function DekSwitch(props: DekSwitchProps) {
    let text = props.text;
    const {
        checked = false,
        onClick = () => {},
        icons = DEFAULT_ICONS,
        style = {},
        className = '',
        color = 'secondary',
        labels = ['On', 'Off'],
        maxIconWidth,
    } = props;
    // const [active, setActive] = useState(checked);
    const Icon: CommonIcon = checked ? icons.enabled : icons.disabled;
    const onClickedBox = useCallback(
        (event: MouseEvent<HTMLDivElement>): boolean => {
            const newval: boolean = !checked;
            onClick({ props, ...event }, newval);
            return newval;

            // setActive(v => {
            //     const newval = !v;
            //     onClick(newval);
            //     return newval;
            // });
        },
        [checked]
    );

    // overwrite text if labels exist:
    text = labels?.[checked ? 0 : 1] ?? text;

    return (
        <div className={'' + className} style={{ ...style }}>
            <div
                className="btn-group dek-switch w-100"
                role="group"
                style={{ minWidth: 128 }}
                onClick={(event: MouseEvent<HTMLDivElement>) => onClickedBox(event)}
            >
                <div
                    className={`btn btn-dark hover-${color} text-center px-0 py-1`}
                    style={{ maxWidth: maxIconWidth, maxHeight: maxIconWidth }}
                >
                    <Icon fill="currentColor" height="1rem" />
                </div>
                <div className={'btn ' + (checked ? `btn-${color}` : `btn-dark hover-${color}`)}>{text}</div>
            </div>
            {/* {!!text && <p className='d-inline px-2'>{text}</p>} */}
        </div>
    );
}
