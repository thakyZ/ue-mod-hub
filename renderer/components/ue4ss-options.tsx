/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DekChoice from '@components/core/dek-choice';
import { ensureEntryValueType, ENVEntry, ENVEntryLabel } from '@components/modals/common';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { Locale as Ue4ssLocale } from '@locales/*-ue4ss.json';
import type { Ue4ssSettings } from '@main/dek/game-map';
import type { TypeFunctionWithArgs, UseStatePair, ValueType, VoidFunctionWithArgs } from '@typed/common';
import replaceUe4ssIniKeyValue from '@utils/replace-ini-key';
import { parse /* , stringify */ } from 'ini';
import type { MouseEvent, MouseEventHandler, ReactElement } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
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

export declare interface Ue4ssConfiguratorProps {
    game: GameInformation | null;
}

export default function Ue4ssConfigurator({ game }: Ue4ssConfiguratorProps): ReactElement<Ue4ssConfiguratorProps> {
    const applog: AppLogger = useAppLogger('Ue4ssConfigurator');
    const { requiredModulesLoaded }: CommonChecks = useCommonChecks();
    const [showAdvanced, setShowAdvanced]: UseStatePair<boolean> = useState<boolean>(false);
    const [hasChanges, setHasChanges]: UseStatePair<boolean> = useState<boolean>(false);
    const [settings, setSettings]: UseStatePair<Ue4ssSettings | null> = useState<Ue4ssSettings | null>(null);
    const [rawINI, setRawINI]: UseStatePair<string> = useState<string>('');
    const { t, tA }: UseLocalizationReturn<Ue4ssLocale> = useLocalization('ue4ss');

    type UpdateSettingType = VoidFunctionWithArgs<[key: string, value: TypeFunctionWithArgs<[data: Ue4ssSettings | null], string | boolean | number> | string | boolean | number]>; // eslint-disable-line prettier/prettier
    // function to call for updating individual setting
    const updateSetting: UpdateSettingType = useCallback(
        // eslint-disable-next-line prettier/prettier
        (key: string, value: TypeFunctionWithArgs<[data: Ue4ssSettings | null], string | boolean | number> | string | boolean | number): void => {
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
                } as Ue4ssSettings;
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
            (async (): Promise<void> => {
                if (!requiredModulesLoaded || !game || !settings) return;
                console.log('saving ini:..');
                let updated_ini: string = `${rawINI}`;
                for (const category of Object.keys(settings)) {
                    if (!settings[category]) continue;
                    type KeyData = [key: keyof Ue4ssSettings, data: string | number | boolean | bigint];
                    for (const [key, data] of Object.entries(settings[category]) as KeyData[]) {
                        if (['MajorVersion', 'MinorVersion'].includes(key)) continue;
                        updated_ini = replaceUe4ssIniKeyValue(updated_ini, category, key, data);
                        console.log('updated:', key, data);
                    }
                }
                // const new_ini_string = stringify(settings);
                let ini_path: string = await window.palhub('joinPath', game.ue4ss_root, 'UE4SS-settings.ini');
                let path_valid: boolean = await window.palhub('checkIsValidFolderPath', ini_path);
                if (!path_valid) {
                    ini_path = await window.palhub('joinPath', game.ue4ss_root, 'ue4ss/UE4SS-settings.ini');
                    path_valid = await window.palhub('checkIsValidFolderPath', ini_path);
                }
                if (!path_valid) {
                    console.error('Invalid path for UE4SS settings:', ini_path);
                    return;
                }
                await window.palhub('writeFile', ini_path, updated_ini, { encoding: 'utf8' });
                setHasChanges(false);
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [requiredModulesLoaded, game, settings, rawINI]
    );

    useEffect((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded) return;
            if (!game?.has_exe || !game?.has_ue4ss) return;
            let ini_path: string = await window.palhub('joinPath', game.ue4ss_root, 'UE4SS-settings.ini');
            let path_valid: boolean = await window.palhub('checkIsValidFolderPath', ini_path);
            if (!path_valid) {
                ini_path = await window.palhub('joinPath', game.ue4ss_root, 'ue4ss/UE4SS-settings.ini');
                path_valid = await window.palhub('checkIsValidFolderPath', ini_path);
            }
            if (!path_valid) {
                console.error('Invalid path for UE4SS settings:', ini_path);
                return;
            }
            const ini_string = await window.palhub('readFile', ini_path, { encoding: 'utf8' });
            setSettings(parse(ini_string as string) as Ue4ssSettings);
            setRawINI(ini_string as string);
        })().catch((error: unknown) => handleError(error, applog));
    }, [requiredModulesLoaded, game]);

    // if (settings) console.log(settings);

    return (
        <Fragment>
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
                active={settings?.Debug?.ConsoleEnabled === '1' ? 1 : settings?.Debug?.GuiConsoleEnabled === '1' ? 2 : 0}
                onClick={(_i: number, value: string | number): void => {
                    const isGui = value === 'GUI';
                    const isConsole = value === 'Console';
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
                    updateSetting('Debug.GraphicsAPI', ['dx11', 'd3d11', 'opengl'][i]!)
                }
            />
            <div className="row">
                <div className="col">
                    <ENVEntry
                        name="bUseUObjectArrayCache" //{t('General.bUseUObjectArrayCache.name')}
                        value={settings?.General?.bUseUObjectArrayCache}
                        updateSetting={(_name: string, value: '0' | '1'): void =>
                            updateSetting(`General.bUseUObjectArrayCache`, !!value)
                        }
                        tooltip={t('General.bUseUObjectArrayCache.desc')}
                    />
                </div>
                <div className="col">
                    <ENVEntry
                        name={t('modal.show-all-settings')}
                        value={showAdvanced}
                        updateSetting={(_name: string, value: boolean): void => setShowAdvanced(value)}
                        tooltip={t('modal.show-all-help')}
                    />
                </div>
            </div>
            <Collapse in={showAdvanced}>
                <div className="row">
                    <hr className="text-secondary border-4 mt-4" />
                    {!!settings &&
                        Object.keys(settings).map((key: keyof Ue4ssSettings): (ReactElement | null)[] => {
                            return Object.keys(settings[key]).map(
                                (name: keyof ValueOf<Ue4ssSettings>, index: number): ReactElement | null => {
                                    if (IGNORED_UE4SS_CONFIG.has(name as string)) return null;
                                    const value: ValueOf<ValueOf<Ue4ssSettings>> = settings[key][name];
                                    const type: ValueType = UE4SS_NUMBOOLS.has(name as string)
                                        ? 'numbool'
                                        : ensureEntryValueType(value);
                                    const updater = (
                                        name_inner: keyof ValueOf<ValueOf<Ue4ssSettings>>,
                                        value: ValueOf<ValueOf<Ue4ssSettings>>
                                    ) =>
                                        updateSetting(`${key}.${name_inner as string}`, (): number | boolean | string => {
                                            return type === 'numbool'
                                                ? value
                                                    ? '1'
                                                    : '0'
                                                : (value as number | boolean | string);
                                        });
                                    const tooltip: string = t(
                                        `${key}.${name as string}.desc` as `Overrides.ModsFolderPath.desc`
                                    );
                                    return (
                                        <div className="col-12 col-md-6" key={index}>
                                            <ENVEntry
                                                {...{
                                                    name: name as string,
                                                    value: value as null | undefined,
                                                    type,
                                                    // eslint-disable-next-line prettier/prettier
                                                    updateSetting: updater as VoidFunctionWithArgs<[name: string, value: never]>,
                                                    defaults: settings,
                                                    tooltip,
                                                }}
                                            />
                                        </div>
                                    );
                                }
                            );
                        })}
                </div>
            </Collapse>
        </Fragment>
    );
}
