/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import useAppLogger from '@hooks/use-app-logger';
import { parseIntSafe } from '@hooks/use-common-checks';
import type { PropsChangeEvent } from '@typed/common';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';

export declare interface DekSliderProps {
    value: number;
    label?: string | undefined;
    disabled?: boolean | undefined;
    thin?: boolean | undefined;
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    onChange?: ((event: PropsChangeEvent<DekSliderProps, HTMLInputElement>) => void) | undefined;
}

export default function DekSlider(props: DekSliderProps) {
    const { label, disabled = false, min = 0, max = 99, step = 1, value = 0, thin = false, onChange = () => {} } = props;
    const applog = useAppLogger('DekSlider');
    const _val: number = parseIntSafe(value)!;
    const _min: number = parseIntSafe(min)!;
    const _max: number = parseIntSafe(max)!;
    const perc_min = Math.round(((_val - _min) / (_max - _min)) * 100);
    const perc_max = Math.round(((_val - _min) / (_max - _min)) * 100);
    // prettier-ignore
    const _onChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        void applog('info', 'value', value, 'max', max, 'min', min, '_val', _val, '_min', _min, '_max', _max, 'perc_min', perc_min, 'perc_max', perc_max);
        onChange({ ...event, props });
    }, [value, max, min, _val, _min, _max, perc_min, perc_max]);
    const background = `linear-gradient(to right, var(--dek-info-normal) 0%, var(--dek-secondary-normal) ${perc_min}%, transparent ${perc_max}%)`;
    return (
        <div>
            {label && <label className="form-label px-1">{label}</label>}
            <div className="w-100 btn btn-dark hover-secondary border-3 p-0">
                <input
                    type="range"
                    disabled={disabled}
                    style={{ background }}
                    className={'form-secondary form-range custom-range' + (thin ? ' thin' : '')}
                    // {...{ min, max, step, value, onChange }}
                    {...{ min, max, step, value, _onChange }}
                />
            </div>
        </div>
    );
}
