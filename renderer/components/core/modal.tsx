/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import type { DekDivProps } from '@components/core/dek-div';
import useScreenSize, { type ScreenSize } from '@hooks/use-screen-size';
import IconX from '@svgs/fa5/regular/window-close.svg';
import type { TypeFunctionWithArgs } from '@typed/common';
import type { Dispatch, HTMLAttributes, ReactElement, ReactNode, SetStateAction } from 'react';
import { Children } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export declare interface DekCommonAppModalProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>> | TypeFunctionWithArgs<[show: boolean], boolean>;
    onCancel?: VoidFunction;
    headerText?: string;
    showX?: boolean;
    children?: ReactNode | ReactElement<DekDivProps>;
}

export default function DekCommonAppModal({
    show,
    setShow,
    onCancel = (): void => {},
    headerText = '',
    showX = true,
    children,
}: DekCommonAppModalProps): ReactElement<DekCommonAppModalProps> {
    const { isDesktop }: ScreenSize = useScreenSize();
    const fullscreen: true | string = isDesktop ? true : '';
    const handleCancel: VoidFunction = (): void => {
        setShow(false);
        onCancel();
    };
    type ChildrenArrayIndicie = ReturnType<typeof Children.toArray>[0];
    const childrenArray: Array<ChildrenArrayIndicie> = Children.toArray(children);
    // prettier-ignore
    const bodyChildren: Array<ReactElement<DekDivProps>> = childrenArray.filter<ChildrenArrayIndicie, ReactElement<DekDivProps>>((child: ChildrenArrayIndicie): boolean => {
        return typeof child !== 'boolean'
            && typeof child === 'object'
            && child !== null
            && 'props' in child
            && typeof child.props === 'object'
            && child.props !== null
            && 'type' in child.props
            && typeof (child.props as { type?: unknown }).type === 'string'
            && (child.props as { type: string }).type === 'DekBody';
    });
    // prettier-ignore
    const footChildren: Array<ReactElement<DekDivProps>> = childrenArray.filter<ChildrenArrayIndicie, ReactElement<DekDivProps>>((child: ChildrenArrayIndicie): boolean => {
        return typeof child !== 'boolean'
            && typeof child === 'object'
            && child !== null
            && 'props' in child
            && typeof child.props === 'object'
            && child.props !== null
            && 'type' in child.props
            && typeof (child.props as { type?: unknown }).type === 'string'
            && (child.props as { type: string }).type === 'DekFoot';
    });
    // return the actual envmodal
    // prettier-ignore
    return (
        <Modal
            show={show}
            size="lg"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header className="p-4 theme-border">
                <Modal.Title className="col py-1">
                    <strong className="">{headerText}</strong>
                </Modal.Title>
                {showX && (
                    <Button variant="none" className="p-0 hover-danger no-shadow" onClick={handleCancel}>
                        <IconX className="modalicon" fill="currentColor" />
                    </Button>
                )}
            </Modal.Header>
            {bodyChildren.length > 0 && <Modal.Body className="p-0">{bodyChildren}</Modal.Body>}
            {!!footChildren && footChildren.length > 0 && <Modal.Footer className="justify-content-center">{footChildren}</Modal.Footer>}
        </Modal>
    );
}
