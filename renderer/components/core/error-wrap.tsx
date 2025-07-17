import react, { Component, cloneElement, Children } from "react";
import useAppLogger from '@hooks/useAppLogger';

export class ErrorWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("Caught by ErrorWrapper:", error);
        if (this.props.onError) {
            this.props.onError(error, info);
        }
    }

    render() {

        const onOpenDevTools = () => {
            if (window.ipc) {
                window.ipc.invoke('open-console-window', 'main');
            } else {
                console.warn("openDevTools is not available in this context.");
            }
        };
        if (this.state.hasError) {
            return <div className="container text-start text-white py-5 px-2">
                <h2 className="text-warning">Something went wrong.</h2>
                <pre className="p-3 bg-dark">{this.state.error?.message}</pre>
                <pre className="p-3 bg-dark">{this.state.error?.stack}</pre>
                <button onClick={onOpenDevTools} className="btn btn-secondary">
                    Open Browser Console for More Details
                </button>
            </div>
        }
        return <react.Fragment>
            {Children.map(this.props.children, (child) => cloneElement(child, { 
                ThemeController: this.props.ThemeController,
                modals: this.props.modals, 
            }))}
        </react.Fragment>
        // return this.props.children;
    }
}
