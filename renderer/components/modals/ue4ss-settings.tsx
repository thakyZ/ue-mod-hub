/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DekChoice from '@components/core/dek-choice';
import DekDiv from '@components/core/dek-div';
import type { DekCommonAppModalProps } from '@components/core/modal';
import DekCommonAppModal from '@components/core/modal';
import { ensureEntryValueType, ENVEntry, ENVEntryLabel } from '@components/modals/common';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { UseScreenSizeReturn } from '@hooks/use-screen-size';
import useScreenSize from '@hooks/use-screen-size';
import type { Locale as Ue4ssLocale } from '@locales/*-ue4ss.json';
import type { Ue4ssSettings } from '@main/dek/game-map';
import type { TypeFunctionWithArgs } from '@typed/common';
import type { BooleanSet, UseStatePair } from '@typed/common';
import replaceUe4ssIniKeyValue from '@utils/replace-ini-key';
import { parse } from 'ini';
import type { Dispatch, HTMLInputTypeAttribute, MouseEvent, MouseEventHandler, ReactElement, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import type { ValueOf } from 'type-fest';

const UE4SS_NUMBOOLS: Set<string> = new Set([
    'EnableHotReloadSystem',
    'UseCache',
    'InvalidateCacheIfDLLDiffers',
    'LoadAllAssetsBeforeDumpingObjects',
    'DumpOffsetsAndSizes',
    'KeepMemoryLayout',
    'LoadAllAssetsBeforeGeneratingCXXHeaders',
    'IgnoreAllCoreEngineModules',
    'MakeAllFunctionsBlueprintCallable',
    'IgnoreEngineAndCoreUObject',
    'MakeAllPropertyBlueprintsReadWrite',
    'MakeEnumClassesBlueprintType',
    'MakeAllConfigsEngineConfig',
    'HookProcessInternal',
    'HookProcessLocalScriptFunction',
    'HookInitGameState',
    'HookCallFunctionByNameWithArguments',
    'HookBeginPlay',
    'HookLocalPlayerExec',
    'EnableDumping',
    'FullMemoryDump',
    'GUIUFunctionCaller',
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GuiConsoleFontScaling',
]);

const IGNORED_UE4SS_CONFIG: Set<string> = new Set([
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GraphicsAPI',
    'MajorVersion',
    'MinorVersion',
    'bUseUObjectArrayCache',
]);

export declare interface Ue4ssSettingsModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}

export default function Ue4ssSettingsModal({
    show,
    setShow,
}: Ue4ssSettingsModalProps): ReactElement<Ue4ssSettingsModalProps> {
    const applog: AppLogger = useAppLogger('Ue4ssSettingsModal');
    const { isDesktop }: UseScreenSizeReturn = useScreenSize();
    const fullscreen: boolean = !isDesktop;
    const { requiredModulesLoaded, commonAppData }: CommonChecks = useCommonChecks();
    const game: GameInformation | undefined = commonAppData?.selectedGame;
    const { t, tA }: UseLocalizationReturn<Ue4ssLocale> = useLocalization('ue4ss');

    // const height: string = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const height: string = fullscreen ? 'calc(100vh - 96px)' : 'calc(100vh / 4 * 2 + 26px)';

    const [showAdvanced, setShowAdvanced]: UseStatePair<BooleanSet> = useState<BooleanSet>(false);
    const [hasChanges, setHasChanges]: UseStatePair<BooleanSet> = useState<BooleanSet>(false);
    const [settings, setSettings]: UseStatePair<Ue4ssSettings | null> = useState<Ue4ssSettings | null>(null);
    const [rawINI, setRawINI]: UseStatePair<string> = useState<string>('');

    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        setTimeout((): void => {
            setHasChanges(false);
            setShowAdvanced(false);
        }, 250);
    }, [setShow]);

    // function to call for updating individual setting
    const updateSetting = useCallback(
        (
            key: string,
            value:
                | TypeFunctionWithArgs<[data: Ue4ssSettings | null], string | boolean | number>
                | string
                | boolean
                | number
        ): void => {
            const keys: string[] = key.split('.');
            setSettings((data: Ue4ssSettings | null): Ue4ssSettings | null => {
                if (!data) return data;
                // if value is function, call it passing data and use return value as new value
                if (typeof value === 'function') value = value(data);
                // update the data using key and value
                const updated_data: Ue4ssSettings = {
                    ...data,
                    [keys[0] as keyof Ue4ssSettings]: {
                        ...data[keys[0] as keyof Ue4ssSettings],
                        [keys[1] as keyof ValueOf<Ue4ssSettings, keyof Ue4ssSettings>]: value,
                    } as ValueOf<Ue4ssSettings, keyof Ue4ssSettings>,
                };
                // return updated data
                return updated_data;
            });
            setHasChanges(true);
            console.log('updated setting:', key, value);
        },
        [setSettings, setHasChanges]
    );

    const onApply: MouseEventHandler<HTMLDivElement> = useCallback(
        (_event: MouseEvent<HTMLDivElement>): void => {
            (async (
                requiredModulesLoaded: boolean,
                _game: GameInformation | undefined,
                settings: Ue4ssSettings | null,
                rawINI: string
            ): Promise<void> => {
                if (!requiredModulesLoaded || !game || !settings || !rawINI) return;
                console.log('saving ini:..');
                let updated_ini = `${rawINI}`;
                for (const category of Object.keys(settings)) {
                    if (!settings[category]) continue;
                    for (const [key, data] of Object.entries(settings[category])) {
                        if (['MajorVersion', 'MinorVersion'].includes(key)) continue;
                        updated_ini = replaceUe4ssIniKeyValue(updated_ini, category, key, data);
                        console.log('updated:', key, data);
                    }
                }
                const ini_path: string = await window.palhub('joinPath', game.ue4ss_root, 'UE4SS-settings.ini');
                // const new_ini_string = stringify(settings);
                await window.palhub('writeFile', ini_path, updated_ini, { encoding: 'utf8' });
                setHasChanges(false);
            })(requiredModulesLoaded, game, settings, rawINI).catch((error: unknown) => handleError(error, applog));
        },
        [requiredModulesLoaded, game, settings, rawINI]
    );

    useEffect((): void => {
        (async (requiredModulesLoaded: boolean, _game: GameInformation | undefined, show: boolean): Promise<void> => {
            if (!requiredModulesLoaded || !show) return;
            if (!game?.has_exe || !game?.has_ue4ss) return;
            const ini_path: string = await window.palhub('joinPath', game.ue4ss_root, 'UE4SS-settings.ini');
            const ini_string: string = (await window.palhub('readFile', ini_path, { encoding: 'utf8' })) as string;
            setSettings(parse(ini_string) as Ue4ssSettings);
            setRawINI(ini_string);
        })(requiredModulesLoaded, game, show).catch((error: unknown) => handleError(error, applog));
    }, [requiredModulesLoaded, game, show]);

    // if (settings) console.log(settings);

    const headerText: string = t('modal.header');
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: true };
    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-block overflow-y-auto p-3" style={{ height }}>
                {hasChanges && (
                    <div className="mb-3">
                        <div className="btn btn-danger w-100 p-3" onClick={onApply}>
                            <strong>{t('modal.save-changes')}</strong>
                        </div>
                    </div>
                )}
                <ENVEntryLabel name={t('modal.show-console-name')} tooltip={t('modal.show-console-help')} />
                <DekChoice
                    className="pb-3"
                    choices={tA('modal.console-choices', 3)}
                    active={
                        settings?.Debug?.ConsoleEnabled === '1' ? 1 : settings?.Debug?.GuiConsoleEnabled === '1' ? 2 : 0
                    }
                    onClick={(_i: number, value: string | number): void => {
                        const isGui: boolean = value === 'GUI';
                        const isConsole: boolean = value === 'Console';
                        updateSetting('Debug.ConsoleEnabled', isConsole ? '1' : '0');
                        updateSetting('Debug.GuiConsoleEnabled', isGui ? '1' : '0');
                        updateSetting('Debug.GuiConsoleVisible', isGui ? '1' : '0');
                    }}
                />
                <ENVEntryLabel name={t('modal.graphics-api-name')} tooltip={t('modal.graphics-api-help')} />
                <DekChoice
                    className="pb-3"
                    choices={tA('modal.guiconsole-choices', 3)}
                    disabled={settings?.Debug?.GuiConsoleEnabled !== '1'}
                    active={settings?.Debug?.GraphicsAPI === 'dx11' ? 0 : settings?.Debug?.GraphicsAPI === 'd3d11' ? 1 : 2}
                    onClick={(i: number, _value: string | number): void =>
                        updateSetting('Debug.GraphicsAPI', ['dx11', 'd3d11', 'opengl'][i] ?? 'opengl')
                    }
                />
                <div className="row">
                    <div className="col">
                        <ENVEntry
                            name="bUseUObjectArrayCache" //{t('General.bUseUObjectArrayCache.name')}
                            value={settings?.General?.bUseUObjectArrayCache}
                            updateSetting={(_name: string, value: '1' | '0'): void =>
                                updateSetting(`General.bUseUObjectArrayCache`, !!value)
                            }
                            tooltip={t('General.bUseUObjectArrayCache.desc')}
                        />
                    </div>
                    <div className="col">
                        <ENVEntry
                            name={t('modal.show-all-settings')}
                            value={showAdvanced === true || showAdvanced === '1' ? '1' : '0'}
                            updateSetting={(_name: string, value: '1' | '0'): void => setShowAdvanced(value === '1')}
                            tooltip={t('modal.show-all-help')}
                        />
                    </div>
                </div>
                <Collapse in={showAdvanced === true || showAdvanced === '1' ? true : false}>
                    <div className="row">
                        <hr className="text-secondary border-4 mt-4" />
                        {!!settings &&
                            Object.keys(settings).map(
                                <
                                    TKey1 extends keyof Ue4ssSettings = keyof Ue4ssSettings,
                                    TValue1 extends ValueOf<Ue4ssSettings, TKey1> = ValueOf<Ue4ssSettings, TKey1>,
                                >(
                                    key: TKey1
                                ): (ReactElement | null)[] => {
                                    return Object.keys(settings[key]).map(
                                        <
                                            TKey2 extends keyof TValue1 = keyof TValue1,
                                            TValue2 extends ValueOf<TValue1, TKey2> = ValueOf<TValue1, TKey2>,
                                        >(
                                            name: TKey2,
                                            index: number
                                        ): ReactElement | null => {
                                            if (IGNORED_UE4SS_CONFIG.has(name.toString())) return null;
                                            const value: TValue2 =
                                                settings[key][name as keyof ValueOf<Ue4ssSettings, keyof Ue4ssSettings>];
                                            const type: HTMLInputTypeAttribute | 'numbool' = UE4SS_NUMBOOLS.has(
                                                name as string
                                            )
                                                ? 'numbool'
                                                : (ensureEntryValueType(value) as HTMLInputTypeAttribute);
                                            const updater = (_name: string, value: TValue2): void =>
                                                updateSetting(`${key}.${_name}`, (): string | number | boolean => {
                                                    return type === 'numbool'
                                                        ? value
                                                            ? '1'
                                                            : '0'
                                                        : (value as string | number | boolean);
                                                });
                                            const tooltip = t(
                                                `${key}.${name as string}.desc` as `Overrides.ModsFolderPath.desc`
                                            );
                                            return (
                                                <div className="col-12 col-md-6" key={index}>
                                                    <ENVEntry
                                                        {...{
                                                            name: name.toString(),
                                                            value,
                                                            type,
                                                            updateSetting: updater,
                                                            defaults: settings,
                                                            tooltip,
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }
                                    );
                                }
                            )}
                    </div>
                </Collapse>
            </DekDiv>
        </DekCommonAppModal>
    );
}
