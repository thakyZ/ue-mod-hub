import type { HTMLAttributes, ReactElement } from 'react';

export declare interface GradientBannerProps extends Pick<HTMLAttributes<HTMLDivElement>, 'children'> {
    height?: number;
    a?: string;
    b?: string;
}

export default function GradientBanner({
    height = 69,
    a = 'info',
    b = 'secondary',
    children,
}: GradientBannerProps): ReactElement<HTMLAttributes<HTMLDivElement>> {
    const gradient_a: string = `bg-gradient-${a}-to-${b} border-${a}`;
    const gradient_b: string = `bg-${b} border-${a}`;
    const gradient_c: string = `bg-gradient-${b}-to-${a} border-${a}`;
    return (
        <div className="position-relative">
            <div className="row mb-2" style={{ height }}>
                <div
                    className={`col transition-all border border-4 border-end-0 radius9 no-radius-end ${gradient_a}`}
                ></div>
                <div className={`col transition-all border border-4 border-start-0 border-end-0 ${gradient_b}`}></div>
                <div
                    className={`col transition-all border border-4 border-start-0 radius9 no-radius-start ${gradient_c}`}
                ></div>
            </div>
            <div className="position-absolute top-0 w-100 p-1 py-2">{children}</div>
        </div>
    );
}
