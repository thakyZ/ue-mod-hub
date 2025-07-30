/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import DekChoice from '@components/core/dek-choice';
// import DekSelect from '@components/core/dek-select';
import type { DekSliderProps } from '@components/core/dek-slider';
import DekSlider from '@components/core/dek-slider';
import type { DekSwitchProps } from '@components/core/dek-switch';
import DekSwitch from '@components/core/dek-switch';
import { info as InfoIcon } from '@config/common-icons';
import useLocalization from '@hooks/use-localization';
import type { Ue4ssSettings } from '@main/dek/game-map';
import type {
    GenericEventWithTarget,
    GenericEventWithTargetHandler,
    PropsChangeEvent,
    PropsMouseEvent,
    PropsMouseEventHandler,
    ValueType,
} from '@typed/common';
import type { CSSProperties, HTMLInputTypeAttribute, KeyboardEvent, KeyboardEventHandler, ReactElement } from 'react';
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import Popover from 'react-bootstrap/Popover';
import Tooltip from 'react-bootstrap/Tooltip';

export declare interface IENVEntryProps<T, TElement, TParent extends IENVEntryProps<T, TElement> = never> {
    name?: string | undefined | null;
    value?: T | undefined | null;
    onClick?: PropsMouseEventHandler<TParent, TElement> | undefined;
    updateSetting?: (name: string, value: T) => void;
    defaults?: Ue4ssSettings | undefined;
    envdatas?: ENVDatas | undefined;
    tooltip?: string | undefined;
    labels?: (string | null | undefined)[] | undefined | null;
    type?: ValueType | undefined;
    noLabel?: boolean | undefined;
    disabled?: boolean | undefined;
    limits?: RangeLimits | undefined | null;
}

export declare interface DelayProps {
    show: number;
    hide: number;
}

export declare interface ENVData {
    val: string;
}

export declare interface ENVDatas {
    [key: string]: ENVData;
}

export function ensureEntryValueType(value: unknown, _num_type: 'int' | 'float' = 'float'): ValueType {
    switch (typeof value) {
        case 'string':
            return typeof value;
        case 'number':
            return typeof value;
        case 'boolean':
            return typeof value;
        default:
            return typeof value;
    }

    // if (typeof value !== 'string') return value as ValueType;

    // // const numval = num_type === 'int' ? Number.parseInt(value) : parseFloat(value);
    // // if (num_type && !isNaN(numval)) return numval;

    // const lowerval: string = (value?.toString() ?? '').toLowerCase();
    // const isboolval = ['true', 'false'].includes(lowerval);
    // if (isboolval) return typeof (lowerval === 'true');

    // return value as ValueType;
}

export function prepareDescription(desc: unknown, scanning_env?: unknown): string {
    if (typeof desc !== 'string') return '???';

    if (scanning_env) {
        const lines: string[] = desc.split('\n');
        const filtered: string[] = lines.filter((line: string): boolean => line.trim().startsWith('#'));
        const newdesc: string = filtered.join('\n');
        return newdesc.replaceAll('#', '').trim();
    }

    return desc;
}

export declare interface ENVEntryLabelProps extends IENVEntryProps<string, HTMLDivElement, ENVEntryLabelProps> {
    name: string;
    tooltip: string;
}

export function ENVEntryLabel({ name, envdatas, tooltip }: ENVEntryLabelProps): ReactElement<ENVEntryLabelProps> {
    // console.log({tooltip})
    // const customStyle: CSSProperties = {
    //     backgroundColor: '#3498db',  // Background color
    //     color: '#ffffff',            // Text color
    //     borderRadius: '5px',         // Border radius
    //     padding: '10px',             // Padding
    //     fontSize: '14px',            // Font size
    // };

    const has_envdata: boolean = !!envdatas?.[name];
    const prepare_text: string = envdatas?.[name] ? envdatas[name].val : tooltip;
    const tooltip_text: string = prepareDescription(prepare_text, has_envdata);
    const button_style: CSSProperties = { borderRadius: 99, boxShadow: 'none' };
    const delay: DelayProps = { show: 100, hide: 250 };
    const overlay: ReactElement = <Tooltip className="text-end">{tooltip_text}</Tooltip>;
    const icon_size: number = 16;

    const placement: 'top' | 'bottom' = 'top';
    const onClick: VoidFunction = () => {};

    return (
        <div className="px-2 pb-2">
            <div className="row">
                <div className="col truncate">
                    <p className="mb-0 font-bold truncate">{name}</p>
                </div>
                <div className="col" style={{ maxWidth: '36px' }}>
                    <OverlayTrigger placement={placement} delay={delay} overlay={overlay}>
                        <div
                            className="p-0 border-0 hover-secondary w-100 text-end"
                            style={button_style}
                            onClick={onClick}
                        >
                            <InfoIcon fill="currentColor" width={icon_size} height={icon_size} />
                        </div>
                    </OverlayTrigger>
                </div>
            </div>
        </div>
    );
}

// prettier-ignore
export declare interface ENVEntry_InputProps extends IENVEntryProps<string | readonly string[] | number | undefined, HTMLInputElement, ENVEntry_InputProps> {
    name: string;
    envdatas?: ENVDatas | undefined;
    tooltip: string;
    noLabel: boolean;
}

export function ENVEntry_Input({
    name,
    value,
    onClick,
    updateSetting,
    defaults: _defaults,
    envdatas,
    tooltip,
    type = 'text',
    noLabel,
    disabled = false,
}: ENVEntry_InputProps): ReactElement<ENVEntry_InputProps> {
    // const [knownValue, setKnownValue] = useState(value);

    const onKeyUp: KeyboardEventHandler<HTMLInputElement> = (e: KeyboardEvent<HTMLInputElement>): void => {
        // Check if the key pressed is 'Enter' (key code 13)
        if (e.key !== 'Enter') return;
        onChanged(e);
    };

    const onChanged: GenericEventWithTargetHandler<HTMLInputElement> = (
        e: GenericEventWithTarget<HTMLInputElement>
    ): void => {
        // setKnownValue(e.target.value);
        updateSetting?.(name, (e.target as HTMLInputElement).value);
    };

    // console.log(name, envdatas[name])

    return (
        <div className={noLabel ? 'w-100' : 'w-100 py-2'}>
            {!noLabel && <ENVEntryLabel {...{ name, envdatas, tooltip }} />}
            <input
                type={type}
                placeholder={name}
                id={name + '-input'}
                name={name + '-input'}
                className="form-control form-secondary w-100"
                onChange={onChanged}
                onClick={onClick}
                disabled={disabled}
                autoComplete="off"
                // list="fruitsList"
                style={{ width: '100%' }}
                onKeyUp={onKeyUp}
                value={value ?? undefined}
            />
        </div>
    );
}

export declare interface ENVEntry_BoolProps extends IENVEntryProps<boolean, HTMLDivElement, ENVEntry_BoolProps> {
    name: string;
    tooltip: string;
}

export function ENVEntry_Bool({
    name,
    value,
    onClick: _onClick,
    updateSetting,
    defaults: _defaults,
    envdatas,
    tooltip,
    noLabel,
    labels,
}: ENVEntry_BoolProps): ReactElement<ENVEntry_BoolProps> {
    // const [knownValue, setKnownValue] = useState(value);
    // updateSetting(name)
    return (
        <div className={noLabel ? 'w-100' : 'w-100 py-2'}>
            {!noLabel && <ENVEntryLabel {...{ name, envdatas, tooltip }} />}
            <DekSwitch
                className="w-100"
                maxIconWidth={64}
                labels={labels}
                // icons={NSFWIcons}
                checked={value ?? undefined}
                onClick={(_event: PropsMouseEvent<DekSwitchProps, HTMLDivElement>, newval: boolean): void =>
                    updateSetting?.(name, newval)
                }
                iconPos="left"
                inline={true}
            />
        </div>
    );
}

export declare interface RangeLimits {
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
}

// prettier-ignore
export declare interface ENVEntry_RangeProps extends DekSliderProps, IENVEntryProps<number, HTMLInputElement, ENVEntry_RangeProps> {
    name: string;
    value: number;
    limits: RangeLimits;
    tooltip: string;
}

export function ENVEntry_Range({
    name,
    value,
    onClick: _onClick,
    updateSetting,
    defaults: _defaults,
    envdatas,
    tooltip,
    noLabel,
    disabled,
    limits,
}: ENVEntry_RangeProps): ReactElement<ENVEntry_RangeProps> {
    // const [knownValue, setKnownValue] = useState(value);
    // updateSetting(name)
    return (
        <div className={noLabel ? 'w-100' : 'w-100 py-2'}>
            {!noLabel && <ENVEntryLabel {...{ name: `${name}: ${value}`, envdatas, tooltip }} />}
            <DekSlider
                // label={name}
                disabled={disabled}
                min={limits.min}
                max={limits.max}
                step={limits.step ?? 1}
                value={value}
                onChange={(e: PropsChangeEvent<DekSliderProps, HTMLInputElement>): void => {
                    console.log(e.target.value);
                    updateSetting?.(name, Number.parseInt(e.target.value, 10));
                }}
            />
        </div>
    );
}

export declare interface ENVEntryProps<
    T extends string | boolean | number | any = any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    TType extends HTMLInputTypeAttribute | 'numbool' = 'text',
    // prettier-ignore
    TElement = TType extends 'numbool' ? HTMLDivElement : T extends string ? HTMLInputElement : T extends boolean ? HTMLDivElement : T extends number ? HTMLInputElement : HTMLInputElement,
> extends IENVEntryProps<T, TElement, ENVEntryProps<T, TType, TElement>> {
    value?: T | undefined | null;
    tooltip?: string | undefined;
    labels?: string[] | undefined | null;
    limits?: T extends number ? RangeLimits | undefined | null : undefined | null;
    type?: TType | undefined;
}

export function ENVEntry<
    T extends string | boolean | number | any = any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    TType extends HTMLInputTypeAttribute | 'numbool' = 'text',
    // prettier-ignore
    TElement = TType extends 'numbool' ? HTMLDivElement : T extends string ? HTMLInputElement : T extends boolean ? HTMLDivElement : T extends number ? HTMLInputElement : HTMLInputElement,
>({
    name = null,
    value = null,
    onClick = (): void => {},
    updateSetting = (): void => {},
    defaults = {} as Ue4ssSettings,
    envdatas = {},
    tooltip = '',
    type = undefined,
    labels = null,
    noLabel = false,
    disabled = false,
    limits = null,
}: ENVEntryProps<T, TType, TElement>): ReactElement<ENVEntryProps<T, TType, TElement>> {
    // value = ensureEntryValueType(value);
    // console.log(`entry for ${name}:`, typeof value, {name, value})
    const { t: _t, tA } = useLocalization();

    // TODO: figure out the issue with this not returning the right type
    if (!labels) labels = tA('common.toggle');
    if (labels && labels.length === 1) labels.push(labels[0]!);

    if (type === 'numbool') value = (value === '1') as T;
    type PassthroughType = IENVEntryProps<T, TElement, ENVEntryProps<T, TType, TElement>> & {
        name: string;
        tooltip: string;
        onClick?: ((event: PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>) => void) | undefined;
    };
    const passthrough: PassthroughType = {
        name: name ?? '',
        onClick,
        updateSetting,
        defaults,
        envdatas,
        tooltip: tooltip ?? '',
        type,
        noLabel,
        labels,
        disabled,
        limits,
    };
    if (type === 'numbool')
        return (
            <ENVEntry_Bool
                {...passthrough}
                onClick={(event: PropsMouseEvent<ENVEntry_BoolProps, HTMLDivElement>): void =>
                    onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                }
                value={value as boolean}
                updateSetting={(name: string, value: boolean): void => updateSetting(name, value as T)}
                defaults={defaults}
            />
        );

    switch (typeof value) {
        case 'string':
            return (
                <ENVEntry_Input
                    {...passthrough}
                    onClick={(event: PropsMouseEvent<ENVEntry_InputProps, HTMLInputElement>): void =>
                        onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                    }
                    noLabel={noLabel ?? false}
                    value={value as string | readonly string[] | number | undefined}
                    updateSetting={(name: string, value: string | readonly string[] | number | undefined): void =>
                        updateSetting(name, value as T)
                    }
                    defaults={defaults}
                />
            );
        case 'boolean':
            return (
                <ENVEntry_Bool
                    {...passthrough}
                    onClick={(event: PropsMouseEvent<ENVEntry_BoolProps, HTMLDivElement>): void =>
                        onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                    }
                    noLabel={noLabel ?? false}
                    value={value as boolean}
                    updateSetting={(name: string, value: boolean): void => updateSetting(name, value as T)}
                    defaults={defaults}
                />
            );
        case 'number':
            return limits ? (
                <ENVEntry_Range
                    {...passthrough}
                    onClick={(event: PropsMouseEvent<ENVEntry_RangeProps, HTMLInputElement>): void =>
                        onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                    }
                    noLabel={noLabel ?? false}
                    value={value as number}
                    updateSetting={(name: string, value: number): void => updateSetting(name, value as T)}
                    defaults={defaults}
                    limits={limits}
                />
            ) : (
                <ENVEntry_Input
                    {...passthrough}
                    type="number"
                    onClick={(event: PropsMouseEvent<ENVEntry_InputProps, HTMLInputElement>): void =>
                        onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                    }
                    noLabel={noLabel ?? false}
                    value={value as number}
                    updateSetting={(name: string, value: string | readonly string[] | number | undefined): void =>
                        updateSetting(name, value as T)
                    }
                    defaults={defaults}
                />
            );
        default:
            return (
                <ENVEntry_Input
                    {...passthrough}
                    onClick={(event: PropsMouseEvent<ENVEntry_InputProps, HTMLInputElement>): void =>
                        onClick(event as unknown as PropsMouseEvent<ENVEntryProps<T, TType, TElement>, TElement>)
                    }
                    noLabel={noLabel ?? false}
                    value={value as string | readonly string[] | number | undefined}
                    updateSetting={(name: string, value: string | readonly string[] | number | undefined): void =>
                        updateSetting(name, value as T)
                    }
                    defaults={defaults}
                />
            );
    }
}
