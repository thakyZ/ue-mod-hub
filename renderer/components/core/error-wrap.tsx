// import useAppLogger from '@hooks/use-app-logger';
import type { ThemeController } from '@components/core/layout';
import type { ErrorInfo, HTMLAttributes, ReactElement } from 'react';
import { Children, cloneElement, Component, Fragment } from 'react';

export declare interface ErrorWrapperProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    onError?: (error: Error, info: ErrorInfo) => void;
    ThemeController?: ThemeController;
    modals?: number | number[];
    children?: ReactElement | ReactElement[] | undefined;
}

export declare interface ErrorWrapperState<T extends Error> {
    hasError: boolean;
    error?: T | null | undefined;
}

export class ErrorWrapper extends Component<ErrorWrapperProps, ErrorWrapperState<Error>> {
    constructor(props: ErrorWrapperProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError<T extends Error>(error?: T): ErrorWrapperState<T> {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('Caught by ErrorWrapper:', error);
        if (this.props.onError) {
            this.props.onError(error, info);
        }
    }

    override render(): ReactElement {
        const onOpenDevTools: VoidFunction = (): void => {
            if (window.ipc) {
                void window.ipc.invoke('open-console-window', 'main');
            } else {
                console.warn('openDevTools is not available in this context.');
            }
        };
        if (this.state.hasError) {
            return (
                <div className="container text-start text-white py-5 px-2">
                    <h2 className="text-warning">Something went wrong.</h2>
                    <pre className="p-3 bg-dark">{this.state.error?.message}</pre>
                    <pre className="p-3 bg-dark">{this.state.error?.stack}</pre>
                    <button onClick={onOpenDevTools} className="btn btn-secondary">
                        Open Browser Console for More Details
                    </button>
                </div>
            );
        }
        return (
            <Fragment>
                {Children.map(this.props.children, (child: ReactElement | undefined): ReactElement | undefined => {
                    if (!child) return undefined;
                    return cloneElement(child, {
                        ThemeController: this.props.ThemeController,
                        modals: this.props.modals,
                    });
                })}
            </Fragment>
        );
        // return this.props.children;
    }
}
