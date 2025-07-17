/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################

<DekSelect onChange={(event, value)=>{}}>
    <dekItem text='Option 1' active/>
    <dekItem text='Option 2'/>
    <dekItem text='Option 3'/>
    <dekItem text='Option 4'/>
</DekSelect> 
*/

// import assert from 'node:assert';

import type { DekItemProps } from '@components/core/dek-item';
import type { CommonIcon } from '@config/common-icons';
import IconDown from '@svgs/fa5/solid/arrow-down.svg';
import IconList from '@svgs/fa5/solid/list-ul.svg';
import type { HTMLAttributes, MouseEvent, ReactElement, ReactNode, RefObject } from 'react';
import React, { Children, Component, createRef, useEffect, useMemo, useState } from 'react';

// import styles from '../styles/dekselect.module.css';

export declare type OnClickOutsideCallback = (event: globalThis.MouseEvent) => void;

function useOnClickOutside(ref: RefObject<HTMLDivElement>, callback: (event: globalThis.MouseEvent) => void): void {
    useEffect((): VoidFunction => {
        const handleClickOutside = (event: globalThis.MouseEvent): void => {
            if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
                // alert("You clicked outside of me!");
                if (callback) callback(event); // eslint-disable-line unicorn/no-lonely-if
            }
        };
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);
}

export declare type OnChangeCallback = (
    event: MouseEvent<HTMLLIElement>,
    selected_text: ReactNode,
    innerText: string | null,
    index: number
) => void;

export declare interface DekSelectProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    onChange: OnChangeCallback;
    active_id: number | undefined;
    uid?: string;
    disableInput?: boolean;
}

export default function DekSelect({
    children,
    onChange,
    active_id,
    uid,
    disableInput = false,
}: DekSelectProps): ReactElement<DekSelectProps> {
    const child_array: ReactElement<DekItemProps>[] = Children.toArray(children)
        .filter((c: Exclude<ReactNode, boolean | null | undefined>): boolean => {
            void window.logger.info(`type of element in dek-select children is ${c.toString()}`); // eslint-disable-line @typescript-eslint/no-base-to-string
            // prettier-ignore
            return c instanceof Component && 'active' in c.props
                && (typeof (c.props as DekItemProps).active === 'boolean' || !(c.props as DekItemProps).active);
        })
        .map((c: Exclude<ReactNode, boolean | null | undefined>): ReactElement<DekItemProps> => {
            return c as unknown as ReactElement<DekItemProps>;
        });
    const active: ReactElement<DekItemProps> | undefined = useMemo((): ReactElement<DekItemProps> | undefined => {
        return child_array.find((c: ReactElement<DekItemProps>, index: number): boolean => {
            return c.props.active || active_id === index;
        }) as unknown as ReactElement<DekItemProps> | undefined;
    }, [child_array, active_id]);
    // prettier-ignore
    const selected_text: ReactNode = useMemo((): ReactNode =>
        (!active || !active.props) ? 'not-selected' : active.props.children || active.props.text
    , [active]);
    const [showUL, setShowUL] = useState<boolean>(false);

    // const ref = useOnClickOutside((e)=>{
    //     console.log('ref-e:', uid === e.target?.id);
    //     setShowUL(false);
    // });

    const ref: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    useOnClickOutside(ref, (): void => setShowUL(false));

    // when main element is clicked
    const onClickElement = (event: MouseEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();
        if (disableInput) return;
        setShowUL((old): boolean => !old);
    };
    // when list item is clicked
    const onClickItem = (event: MouseEvent<HTMLLIElement>): void => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target instanceof HTMLLIElement && event.target.parentNode !== null) {
            const index = Array.prototype.slice
                .call(event.target.parentNode.children)
                .indexOf(event.target);
            // setSelected(event.target.innerText);
            onChange(event, selected_text, event.target.textContent, index);
            setShowUL(false);
        }
    };

    const IconComponent: CommonIcon = showUL ? IconDown : IconList;

    const mainclasses: string = ['form-control btn-select dekselect-secondary', showUL ? 'active' : ''].join(' ');

    return (
        <div className={mainclasses} onClick={onClickElement} aria-disabled={disableInput} ref={ref} id={uid}>
            <small className="btn-select-value form-control">{selected_text}</small>
            <span className="btn-select-arrow text-center">
                <IconComponent width={16} height={16} fill="currentColor" />
            </span>
            <ul className={showUL ? 'd-block thin-scroller' : 'd-none'}>
                {child_array.map((child: ReactElement<DekItemProps>): ReactElement<HTMLAttributes<HTMLLIElement>> => {
                    return (
                        <li id={child.props.id} key={child.key || child.props.id} onClick={onClickItem}>
                            {child.props.children ?? (child.props.text || child.key)}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
