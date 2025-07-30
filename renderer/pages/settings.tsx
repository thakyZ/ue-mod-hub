/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import assert from 'node:assert';

// import ActiveGameSelector from '@components/active-game-selector';
import ColorfulGameSelector from '@components/colorful-game-selector';
import BrandHeader from '@components/core/brand-header';
import DekCheckbox from '@components/core/dek-checkbox';
import DekChoice from '@components/core/dek-choice';
import type { DekItemProps } from '@components/core/dek-item';
import DekItem from '@components/core/dek-item';
import type { OnChangeCallback } from '@components/core/dek-select';
import DekSelect from '@components/core/dek-select';
import type { ThemeController } from '@components/core/layout';
import type { GameCardComponentProps } from '@components/game-card';
import GameCardComponent from '@components/game-card';
// import { PlatformIcon } from '@components/game-card';
import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
import GameConfigurationModal from '@components/modals/game-config';
import * as CommonIcons from '@config/common-icons';
import type { ActiveGame } from '@hooks/use-active-game';
import useActiveGame from '@hooks/use-active-game';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import type { GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { parseIntSafe } from '@hooks/use-common-checks';
import type { LocaleLeaves, Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { BackgroundOpacityConstraint, Themes } from '@hooks/use-theme-system';
import type { ConfigDataStore } from '@main/config';
import type { IValidateKeyResponse } from '@nexusmods/nexus-api';
import type { PropsMouseEvent, PropsMouseEventHandler, UseStatePair, VoidFunctionWithArgs } from '@typed/common';
import type { ValidateGamePathReturnType } from '@typed/palhub';
import checkIsDevEnvironment from '@utils/is-dev-env';
import wait from '@utils/wait';
import type { OpenDialogReturnValue } from 'electron';
import Link from 'next/link';
import type { Dispatch, HTMLAttributes, MouseEvent, ReactElement, ReactNode, SetStateAction, SVGAttributes } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

export declare type OptionNames =
    | 'show-api-key'
    | 'auto-boot'
    | 'auto-tiny'
    | 'tiny-tray'
    | 'theme-color'
    | 'theme-image'
    | 'theme-opacity'
    | 'language'
    | 'nxm-links'
    | 'allow-rpc'
    | 'do-update';

// prettier-ignore
export declare type SetUpPageNames =
    | 'ready'
    | 'need-cache'
    | 'need-ue4ss'
    | 'need-game'
    | 'need-apik'
    | 'invalid-game';

export declare interface SettingsPageProps {
    modals: unknown;
    ThemeController: ThemeController;
}

export declare interface CarouselOptions {
    interval: number | null;
    controls: boolean;
    indicators: boolean;
    className: string;
    activeIndex: number;
}

const COMMON_TIMEOUT_DURATION = 1000;

/* Main Component */
export default function SettingsPage({
    modals: _modals,
    ThemeController,
}: SettingsPageProps): ReactElement<SettingsPageProps> | null {
    const applog: AppLogger = useAppLogger('SettingsPage');
    const { t, tA, changeLanguage, language, VALID_LANGUAGES }: Localization = useLocalization();
    const { requiredModulesLoaded, commonAppData, handleError }: CommonChecks = useCommonChecks();
    const [showUE4SSInstall, setShowUE4SSInstall]: UseStatePair<boolean> = useState<boolean>(false);
    // const [showUE4SSSettings, setShowUE4SSSettings]: UseStatePair<boolean> = useState<boolean>(false);
    const [showGameConfig, setShowGameConfig]: UseStatePair<boolean> = useState<boolean>(false);
    const [settingsPageID, setSettingsPageID]: UseStatePair<number> = useState<number>(0);
    const [tempGame, setTempGame]: UseStatePair<GameInformation | null> = useState<GameInformation | null>(null);
    const isDevEnvironment: boolean = checkIsDevEnvironment();
    const [step, setStep]: UseStatePair<number> = useState<number>(0);

    const game: GameInformation | undefined = commonAppData?.selectedGame;

    const onClickHelp: VoidFunction = useCallback((): void => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'help').catch((error: unknown): void => handleError(error, applog));
    }, [applog, handleError]);

    const onClickSetup = useCallback((): void => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'setup').catch((error: unknown): void => handleError(error, applog));
    }, [applog, handleError]);

    const carouselOptions: CarouselOptions = useMemo(
        (): CarouselOptions => ({
            interval: null,
            controls: false,
            indicators: false,
            className: 'container-fluid pb-5',
            activeIndex: settingsPageID,
        }),
        [settingsPageID]
    );

    if (!requiredModulesLoaded) return null;
    return (
        <Fragment>
            <GameConfigurationModal
                show={showGameConfig}
                setShow={setShowGameConfig}
                tempGame={tempGame}
                setTempGame={setTempGame}
            />
            <BrandHeader
                type="altsmall"
                tagline={t('/settings.head')}
                words={tA('/settings.words' as LocaleLeaves, { game })}
                showImage={false}
            />
            <div className="container-fluid">
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">
                        <div className="row py-2">
                            <div className="col">
                                <DekChoice
                                    className="pb-1"
                                    disabled={step !== 0}
                                    active={settingsPageID}
                                    choices={tA('/settings.choices.page', 3)}
                                    onClick={(i: number, _value: string | number): void => setSettingsPageID(i)}
                                />
                            </div>
                            <div className="col-12 col-md-5">
                                <div className="row">
                                    <div className="col pe-1">
                                        <div className="btn btn-dark w-100" onClick={onClickHelp}>
                                            <strong>{t('/faq.name')}</strong>
                                        </div>
                                    </div>
                                    <div className="col ps-1">
                                        <div className="btn btn-dark w-100" onClick={onClickSetup}>
                                            <strong>{t('/setup.name')}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Carousel {...carouselOptions}>
                <Carousel.Item className="">
                    <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                        <div className="mx-auto px-3">
                            <SettingsPage_SetupStep {...{ showUE4SSInstall, setShowUE4SSInstall, step, setStep }} />

                            <SettingsPage_ApplicationRequirements {...{ setSettingsPageID }} />
                            {isDevEnvironment && (
                                <Fragment>
                                    <ENVEntryLabel
                                        name={t('/settings.options.language.name')}
                                        tooltip={t('/settings.options.language.desc')}
                                    />
                                    <DekChoice
                                        className="pb-3"
                                        choices={VALID_LANGUAGES as string[]}
                                        active={VALID_LANGUAGES.indexOf(language ?? 'en')}
                                        onClick={(_i: number, value: string | number): void =>
                                            changeLanguage(value as 'dev' | 'en')
                                        }
                                    />
                                </Fragment>
                            )}
                        </div>
                    </div>
                </Carousel.Item>
                <Carousel.Item className="">
                    <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                        <div className="mx-auto px-3">
                            <SettingsPage_Theme ThemeController={ThemeController} />
                            <SettingsPage_ApplicationCustomize />
                        </div>
                    </div>
                </Carousel.Item>
                <Carousel.Item className="">
                    <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                        <div className="mx-auto px-3">
                            <SettingsPage_Game {...{ showGameConfig, setShowGameConfig, tempGame, setTempGame }} />
                        </div>
                    </div>
                </Carousel.Item>
            </Carousel>
        </Fragment>
    );
}

export declare interface SettingsPage_SetupStepProps {
    showUE4SSInstall: boolean;
    setShowUE4SSInstall: Dispatch<SetStateAction<boolean>>;
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
}

/* Page Specific Components */
function SettingsPage_SetupStep({
    showUE4SSInstall: _showUE4SSInstall,
    setShowUE4SSInstall,
    step,
    setStep,
}: SettingsPage_SetupStepProps): ReactElement<SettingsPage_SetupStepProps> | null {
    const applog: AppLogger = useAppLogger('SettingsPage_SetupStep');
    const { t, tA }: Localization = useLocalization();
    const { requiredModulesLoaded, commonAppData, handleError }: CommonChecks = useCommonChecks();
    const cache_dir: string | null = useMemo((): string | null => commonAppData?.cache, [commonAppData?.cache]);
    const game_path: string | undefined = useMemo(
        (): string | undefined => commonAppData?.selectedGame?.path,
        [commonAppData.selectedGame?.path]
    );
    const api_key: string | undefined = useMemo((): string => {
        console.log('api_key', commonAppData?.apis?.nexus);
        return commonAppData?.apis?.nexus ?? '';
    }, [commonAppData]);
    const game: GameInformation | undefined = useMemo(
        (): GameInformation | undefined => commonAppData?.selectedGame,
        [commonAppData]
    );

    const handleUE4SSInstall: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded) return;
            if (!cache_dir || !game_path || !game) return;
            setShowUE4SSInstall(true);
            await window.palhub('downloadAndInstallUE4SS', cache_dir, game_path);
            // prettier-ignore
            const maybe_data: ValidateGamePathReturnType = await window.palhub('validateGamePath', game_path);
            // if (maybe_data.type === '{invalid-path}' || maybe_data.type === '{UNKNOWN}') return;
            if (maybe_data.type === '{invalid-path}')
                throw new Error(`Failed to validate game path at ${game_path}, got ${maybe_data.type}`, {
                    cause: maybe_data,
                });
            if (maybe_data.type === '{UNKNOWN}')
                throw new Error(`Failed to validate game path at ${game_path}, got ${maybe_data.type}`, {
                    cause: maybe_data,
                });
            if (maybe_data && 'has_exe' in maybe_data && maybe_data.has_exe === true) {
                for (const prop of Object.keys(maybe_data)) {
                    if (!Object.hasOwn(game, prop)) continue;
                    (game[prop] as unknown) = maybe_data[prop];
                }
            }
            await wait(COMMON_TIMEOUT_DURATION); // small delay to allow the process to finish
            setShowUE4SSInstall(false);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [requiredModulesLoaded, cache_dir, game_path, game, setShowUE4SSInstall, handleError, applog]);

    // determine the current setup step

    const pClasses: string = 'px-3 px-xl-5 mb-0';
    const dangerCard: string = 'card bg-danger border-danger2 border my-4 p-3 text-center';
    // const successCard: string = 'card bg-success border-success2 border my-4 p-3 text-center';

    useEffect((): void => {
        (async (): Promise<void> => {
            let newstep: number = 0;
            // if (!game_path) newstep = 1;
            if (!api_key) newstep = 2;
            if (!cache_dir) newstep = 3;
            // if (game_path && !game?.has_exe) newstep = 4;
            // if (game?.has_exe && !game?.has_ue4ss) newstep = 5;
            if (api_key && !(await window.nexus(api_key, 'validateKey', api_key))) {
                newstep = 2;
            }
            if (!!cache_dir && !(await window.palhub('checkIsValidFolderPath', cache_dir))) {
                newstep = 3;
            }
            console.log('newstep', newstep);
            setStep(newstep);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [game, game_path, api_key, cache_dir, setStep, handleError, applog]);

    // console.log(game)
    // console.log(t(`games.${game.id}.name`))

    switch (step) {
        case 0:
            // return (
            //     <div className={successCard}>
            //         <h4 className="mb-0">
            //             <strong>{t('/settings.setup.ready.head', { game })}</strong>
            //         </h4>
            //         {tA('/settings.setup.ready.body' as LocaleLeaves, { game }).map(
            //             (text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
            //                 <p key={i} className={pClasses}>
            //                     {text}
            //                 </p>
            //             )
            //         )}
            //         <div className="row gap-2 px-3 mt-3">
            //             <Link href="/play" className="col btn btn-dark p-3">
            //                 <strong>{t('/settings.buttons.play-game', { game })}</strong>
            //             </Link>
            //             <Link href="/mods" className="col btn btn-dark p-3">
            //                 <strong>{t('/settings.buttons.add-mods', { game })}</strong>
            //             </Link>
            //         </div>
            //     </div>
            // );
            return null;
        case 1:
            // prettier-ignore
            return (
                <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.need-game.head', { game })}</strong>
                    </h4>
                    {tA('/settings.setup.need-game.body', { game }).map((text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                        <p key={i} className={pClasses}>
                            {text}
                        </p>
                    ))}
                </div>
            );
        case 2:
            // prettier-ignore
            return (
                <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.need-apik.head', { game })}</strong>
                    </h4>
                    {tA('/settings.setup.need-apik.body', { game }).map((text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                        <p key={i} className={pClasses}>
                            {text}
                        </p>
                    ))}
                </div>
            );
        case 3:
            return (
                <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.need-cache.head', { game })}</strong>
                    </h4>
                    {tA('/settings.setup.need-cache.body', { game }).map(
                        (text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                            <p key={i} className={pClasses}>
                                {text}
                            </p>
                        )
                    )}
                </div>
            );
        case 4:
            return (
                <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.invalid-game.head', { game })}</strong>
                    </h4>
                    {tA('/settings.setup.invalid-game.body', { game }).map(
                        (text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                            <p key={i} className={pClasses}>
                                {text}
                            </p>
                        )
                    )}
                </div>
            );
        case 5:
            return (
                <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.need-ue4ss.head', { game })}</strong>
                    </h4>
                    {tA('/settings.setup.need-ue4ss.body', { game }).map(
                        (text: string, i: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                            <p key={i} className={pClasses}>
                                {text}
                            </p>
                        )
                    )}
                    <button className="btn btn-warning p-3 w-100 mt-3" onClick={handleUE4SSInstall}>
                        <strong>{t('/settings.buttons.download-ue4ss', { game })}</strong>
                    </button>
                </div>
            );
    }
    return null;
}

export declare interface SettingsPage_ApplicationRequirementsProps {
    setSettingsPageID: Dispatch<SetStateAction<number>>;
}

function SettingsPage_ApplicationRequirements({
    setSettingsPageID,
}: SettingsPage_ApplicationRequirementsProps): ReactElement<SettingsPage_ApplicationRequirementsProps> | null {
    const {
        requiredModulesLoaded,
        commonAppData,
        updateCachePath,
        updateNexusApiKey,
        refreshCommonDataWithRedirect,
        handleError,
    }: CommonChecks = useCommonChecks();
    const applog: AppLogger = useAppLogger('SettingsPage_ApplicationRequirements');
    const [cacheDirectory, setCacheDirectory]: UseStatePair<string | null> = useState<string | null>(commonAppData?.cache);
    // const [cacheIsValid, setCacheIsValid]: UseStatePair<boolean> = useState<boolean>(false);
    const [nexusApiKey, setNexusApiKey]: UseStatePair<string | null> = useState<string | null>(commonAppData?.apis?.nexus);
    const [nexusKeyIsValid, setNexusKeyIsValid]: UseStatePair<boolean> = useState<boolean>(false);
    const [nexusKeyIsPremium, setNexusKeyIsPremium]: UseStatePair<boolean> = useState<boolean>(false);
    // nexus api key related handlers
    const [nexusApiKeyHandler, setNexusApiKeyHandler]: UseStatePair<NodeJS.Timeout | null> =
        useState<NodeJS.Timeout | null>(null);
    const [showNexusKey, setShowNexusKey]: UseStatePair<boolean> = useState<boolean>(false);
    const { t }: Localization = useLocalization();

    const onUpdateCacheDirectory: VoidFunctionWithArgs<[name: string | null, new_value: string]> = useCallback(
        (_name: string | null, new_value: string): void => {
            (async (): Promise<void> => {
                await updateCachePath(new_value);
                // TODO: Double check if this is then-able.
                setCacheDirectory(new_value);
                await refreshCommonDataWithRedirect();
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [updateCachePath, refreshCommonDataWithRedirect, handleError, applog]
    );
    // open file dialog to select cache directory
    const onClickPathInput: PropsMouseEventHandler<unknown, Element> = useCallback(
        (_event: PropsMouseEvent<unknown, Element>): void => {
            (async (): Promise<void> => {
                // TODO: Double check if this is then-able.
                const result: OpenDialogReturnValue = await window.ipc.invoke('open-file-dialog', {
                    title: t('/settings.inputs.app-cache-dir.open'),
                    properties: ['openDirectory'],
                });
                if (!result.canceled && !!result.filePaths[0]) {
                    onUpdateCacheDirectory(null, result.filePaths[0]);
                }
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [onUpdateCacheDirectory, t, handleError, applog]
    );

    // updates the nexus api key when the input changes and sets a timeout to save it
    const onUpdateNexusApiKey: VoidFunctionWithArgs<[name: string, new_value: string]> = useCallback(
        (_name: string, new_value: string): void => {
            (async (): Promise<void> => {
                new_value = new_value.trim();
                // ensure new value has only ascii printable characters;
                new_value = new_value.replaceAll(/[^\u0020-\u007E]/g, '');

                await updateNexusApiKey(new_value, async (valid_key_user: IValidateKeyResponse): Promise<void> => {
                    setNexusKeyIsValid(valid_key_user !== null);
                    if (valid_key_user !== null) {
                        setSettingsPageID(2);
                    }
                    await Promise.resolve();
                });
                await refreshCommonDataWithRedirect();
                setNexusApiKey(new_value);
                setShowNexusKey(true);
                if (nexusApiKeyHandler) clearTimeout(nexusApiKeyHandler);
                setNexusApiKeyHandler(setTimeout((): void => setShowNexusKey(false), COMMON_TIMEOUT_DURATION));
                const validation_result: IValidateKeyResponse = await window.nexus(new_value, 'getValidationResult');
                setNexusKeyIsPremium(validation_result?.is_premium ?? false);
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [
            updateNexusApiKey,
            refreshCommonDataWithRedirect,
            nexusApiKeyHandler,
            setSettingsPageID,
            handleError,
            applog,
            // COMMON_TIMEOUT_DURATION,
        ]
    );
    // toggles the visibility of the nexus api key
    const onToggleShowNexusKey: VoidFunction = useCallback((): void => {
        setShowNexusKey((current: boolean): boolean => !current);
    }, []);

    useEffect((): void => {
        if (!requiredModulesLoaded) return;
        if (!nexusApiKey) return;
        // setCacheDirectory(commonAppData?.cache);
        // setNexusApiKey(commonAppData?.apis?.nexus);
        updateNexusApiKey(nexusApiKey, async (valid_key_user: IValidateKeyResponse): Promise<void> => {
            setNexusKeyIsValid(valid_key_user !== null);
            const validation_result: IValidateKeyResponse = await window.nexus(nexusApiKey, 'getValidationResult');
            setNexusKeyIsPremium(validation_result?.is_premium ?? false);
        }).catch((error: unknown): void => handleError(error, applog));
    }, [handleError, nexusApiKey, requiredModulesLoaded, updateNexusApiKey, applog]);

    useEffect((): void => {
        if (cacheDirectory) return;
        (async (): Promise<void> => {
            const path: string = await window.ipc.invoke('get-path', 'documents');
            const newpath: string = await window.palhub('joinPath', path, 'ModHubCache');
            onUpdateCacheDirectory(null, newpath);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [cacheDirectory, handleError, onUpdateCacheDirectory, applog]);

    if (!requiredModulesLoaded) return null;
    return (
        <Fragment>
            <ENVEntry
                value={cacheDirectory}
                onClick={onClickPathInput}
                updateSetting={onUpdateCacheDirectory}
                name={t('/settings.inputs.app-cache-dir.name')}
                tooltip={t('/settings.inputs.app-cache-dir.desc')}
            />
            <ENVEntry
                value={nexusApiKey}
                updateSetting={onUpdateNexusApiKey}
                type={showNexusKey ? 'text' : 'password'}
                name={t('/settings.inputs.nexus-api-key.name')}
                tooltip={t('/settings.inputs.nexus-api-key.desc')}
            />

            <div className="row mb-1">
                <div className="col-auto px-3">
                    <DekCheckbox
                        inline={true}
                        // iconPos='left'
                        text={t('/settings.options.show-api-key.name')}
                        checked={showNexusKey}
                        onClick={onToggleShowNexusKey}
                    />
                </div>
                <div className="col-auto px-3">
                    <SimpleCheckbox checked={nexusKeyIsValid} text={t('common.nexusKeyIsValid')} />
                </div>
                <div className="col-auto px-3">
                    <SimpleCheckbox checked={nexusKeyIsPremium} text={t('common.nexusKeyIsPremium')} />
                </div>

                <div className="col text-end px-3">
                    <Link
                        target="_blank"
                        href="https://next.nexusmods.com/settings/api-keys"
                        className="hover-dark text-warning"
                        style={{ width: 256 }}
                    >
                        <strong>{t('/settings.buttons.get-api-key')}</strong>
                    </Link>
                </div>
            </div>

            <SettingsPage_UseNexusDeepLinks />
        </Fragment>
    );
}

function SettingsPage_UseNexusDeepLinks(): ReactElement {
    const applog: AppLogger = useAppLogger('SettingsPage_SetupStep');
    const { t }: Localization = useLocalization();
    const { requiredModulesLoaded, handleError }: CommonChecks = useCommonChecks();

    type ConfigDataStorePartial = Pick<ConfigDataStore, 'nxm-links'>;
    // app options implemented by DEAP <3
    const [settings, setSettings] = useState<ConfigDataStorePartial>({
        'nxm-links': false,
    });
    const updateConfig: VoidFunctionWithArgs<
        [key: keyof ConfigDataStorePartial, value: ConfigDataStorePartial[keyof ConfigDataStorePartial]]
    > = useCallback(
        (key: keyof ConfigDataStorePartial, value: ConfigDataStorePartial[keyof ConfigDataStorePartial]): void => {
            (async (): Promise<void> => {
                if (!requiredModulesLoaded) return;
                console.log('updating config', key, value);
                await window.ipc.invoke('set-config', key, value);
                setSettings((current: ConfigDataStorePartial): ConfigDataStorePartial => ({ ...current, [key]: value }));
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [applog, handleError, requiredModulesLoaded]
    );

    // load initial settings from store
    useEffect((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded) return;
            setSettings({
                'nxm-links': await window.uStore.get('nxm-links', false),
            } as ConfigDataStore);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [applog, handleError, requiredModulesLoaded]);

    return (
        <ENVEntry
            value={settings['nxm-links']}
            updateSetting={(_name: string, value: boolean): void => updateConfig('nxm-links', value)}
            name={t('/settings.options.nxm-links.name')}
            tooltip={t('/settings.options.nxm-links.desc')}
        />
    );
}

function SettingsPage_ApplicationCustomize(): ReactElement {
    const applog: AppLogger = useAppLogger('SettingsPage_ApplicationCustomize');
    const { t }: Localization = useLocalization();
    const { requiredModulesLoaded, handleError }: CommonChecks = useCommonChecks();

    type ConfigDataStorePartial = Pick<
        ConfigDataStore,
        'auto-boot' | 'auto-play' | 'auto-tiny' | 'tiny-tray' | 'allow-rpc' | 'do-update'
    >;
    // app options implemented by DEAP <3
    const [settings, setSettings]: UseStatePair<ConfigDataStorePartial> = useState<ConfigDataStorePartial>({
        'auto-boot': false,
        'auto-play': false,
        'auto-tiny': false,
        'tiny-tray': false,
        'allow-rpc': false,
        'do-update': false,
    });
    const updateConfig: VoidFunctionWithArgs<
        [key: keyof ConfigDataStorePartial, value: ConfigDataStorePartial[keyof ConfigDataStorePartial]]
    > = useCallback(
        (key: keyof ConfigDataStorePartial, value: ConfigDataStorePartial[keyof ConfigDataStorePartial]): void => {
            (async (): Promise<void> => {
                if (!requiredModulesLoaded) return;
                console.log('updating config', key, value);
                await window.ipc.invoke('set-config', key, value);
                setSettings((current: ConfigDataStorePartial): ConfigDataStorePartial => ({ ...current, [key]: value }));
            })().catch((error: unknown): void => handleError(error, applog));
        },
        [applog, handleError, requiredModulesLoaded]
    );

    // load initial settings from store
    useEffect((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded) return;
            setSettings({
                'auto-boot': await window.uStore.get('auto-boot', false),
                'auto-play': await window.uStore.get('auto-play', false),
                'auto-tiny': await window.uStore.get('auto-tiny', false),
                'tiny-tray': await window.uStore.get('tiny-tray', false),
                'allow-rpc': await window.uStore.get('allow-rpc', false),
                'do-update': await window.uStore.get('do-update', false),
            });
        })().catch((error: unknown): void => handleError(error, applog));
    }, [applog, handleError, requiredModulesLoaded]);

    return (
        <Fragment>
            <div className="row mb-2">
                <div className="col-12 col-lg-6">
                    <ENVEntry
                        value={settings['auto-boot']}
                        updateSetting={(_name: string, value: boolean): void => updateConfig('auto-boot', value)}
                        name={t('/settings.options.auto-boot.name')}
                        tooltip={t('/settings.options.auto-boot.desc')}
                    />
                </div>
                <div className="col-12 col-lg-6">
                    <ENVEntry
                        value={settings['auto-tiny']}
                        updateSetting={(_name: string, value: boolean): void => updateConfig('auto-tiny', value)}
                        name={t('/settings.options.auto-tiny.name')}
                        tooltip={t('/settings.options.auto-tiny.desc')}
                    />
                </div>
                <div className="col-12 col-lg-6">
                    <ENVEntry
                        value={settings['allow-rpc']}
                        updateSetting={(_name: string, value: boolean): void => updateConfig('allow-rpc', value)}
                        name={t('/settings.options.allow-rpc.name')}
                        tooltip={t('/settings.options.allow-rpc.desc')}
                    />
                </div>
                <div className="col-12 col-lg-6">
                    <ENVEntry
                        value={settings['tiny-tray']}
                        updateSetting={(_name: string, value: boolean): void => updateConfig('tiny-tray', value)}
                        name={t('/settings.options.tiny-tray.name')}
                        tooltip={t('/settings.options.tiny-tray.desc')}
                    />
                </div>
                <div className="col-12 col-lg-6">
                    <ENVEntry
                        value={settings['do-update']}
                        updateSetting={(_name: string, value: boolean): void => updateConfig('do-update', value)}
                        name={t('/settings.options.do-update.name')}
                        tooltip={t('/settings.options.do-update.desc')}
                    />
                </div>
            </div>
        </Fragment>
    );
}

export declare interface SettingsPage_ThemeProps {
    ThemeController: ThemeController;
}

function SettingsPage_Theme({ ThemeController }: SettingsPage_ThemeProps): ReactElement<SettingsPage_ThemeProps> | null {
    const { requiredModulesLoaded /* , commonAppData */ }: CommonChecks = useCommonChecks();
    // const game_id: Games | undefined = commonAppData?.selectedGame?.id;
    const { t, tA }: Localization = useLocalization();

    // console.log('ThemeController', ThemeController.bg_opac);

    const OnChangeTheme: OnChangeCallback = useCallback(
        (e: MouseEvent<HTMLLIElement>, v: ReactNode, iText: string | null, i: number): void => {
            console.log('ThemeController.setThemeID', { e, v, iText, i });
            if (!iText) return;
            ThemeController.setThemeID(iText as Themes);
        },
        [ThemeController]
    );

    if (!requiredModulesLoaded) return null;

    return (
        <Fragment>
            <div className="row">
                <div className="col">
                    <ENVEntryLabel
                        name={t('/settings.options.theme-color.name')}
                        tooltip={t('/settings.options.theme-color.desc')}
                    />
                    <DekSelect active_id={parseIntSafe(ThemeController.theme_id)} onChange={OnChangeTheme}>
                        {ThemeController.themes.map((theme: Themes, i: number): ReactElement<DekItemProps> => {
                            return <DekItem key={i} text={theme} active={ThemeController.theme_id === i} />;
                        })}
                    </DekSelect>
                </div>

                <div className="col">
                    <ENVEntryLabel
                        name={t('/settings.options.theme-image.name')}
                        tooltip={t('/settings.options.theme-image.desc')}
                    />
                    <DekChoice
                        className="pb-1"
                        disabled={false}
                        active={parseIntSafe(ThemeController.bg_id)!}
                        choices={[1, 2, 3]}
                        //tA(`games.${game_id}.theme-images`)}
                        onClick={(i: number, _value: string | number): void => void ThemeController.setBgID(i)}
                    />
                </div>
                <div className="col">
                    <ENVEntryLabel
                        name={t('/settings.options.theme-opacity.name')}
                        tooltip={t('/settings.options.theme-opacity.desc')}
                    />
                    <DekChoice
                        className="pb-1"
                        disabled={false}
                        active={parseIntSafe(ThemeController.bg_opac)!}
                        choices={tA(`games.generic.theme-opacities`, 3)}
                        onClick={(i: number, _value: string | number): void =>
                            void ThemeController.setBgOpac(i as BackgroundOpacityConstraint)
                        }
                    />
                </div>
            </div>
            {/* <ENVEntryLabel
            name={t('/settings.options.theme-color.name')}
            tooltip={t('/settings.options.theme-color.desc')}
        />
        <DekChoice
            className="pb-3 mt-1"
            choices={ThemeController.themes}
            active={parseIntSafe(ThemeController.theme_id)!}
            onClick={(_i: number, value: string | number) => void ThemeController.setThemeID(parseIntSafe(value) as Themes)}
        /> */}
        </Fragment>
    );
}

export declare interface SettingsPage_GameProps {
    showGameConfig: boolean;
    setShowGameConfig: Dispatch<SetStateAction<boolean>>;
    tempGame: GameInformation | null;
    setTempGame: Dispatch<SetStateAction<GameInformation | null>>;
}

function SettingsPage_Game({
    /* showGameConfig, */
    setShowGameConfig,
    tempGame,
    setTempGame,
}: SettingsPage_GameProps): ReactElement<SettingsPage_GameProps> | null {
    const {
        requiredModulesLoaded,
        // commonAppData,
        // updateSelectedGame,
        // refreshCommonDataWithRedirect,
    }: CommonChecks = useCommonChecks();
    // const api_key: string | null = commonAppData?.apis?.nexus;

    const {
        gamesArray,
        // activeGame,
        // selectedGameID,
    }: ActiveGame = useActiveGame();

    // const [knownGamePath, setKnownGamePath]: UseStatePair<string | undefined> = useState<string | undefined>(game?.path);
    const { t /* , tA */ }: Localization = useLocalization();

    // const handleGamePathChange: VoidFunctionWithArgs<[name: Games, new_value: string]> = useCallback((name: Games, new_value: string): void => {
    //     updateSelectedGamePath(game.id, new_value);
    //     setKnownGamePath(new_value);
    // }, [game]);

    const onClick: PropsMouseEventHandler<GameInformation, HTMLElement> = useCallback(
        (event: PropsMouseEvent<GameInformation, HTMLElement> | null): void => {
            setTempGame(event?.props ?? null);
            setShowGameConfig(true);
        },
        [setShowGameConfig, setTempGame]
    );

    if (!requiredModulesLoaded) return null;
    return (
        <Fragment>
            <div className="row mt-3">
                <div className="px-4 mb-3">
                    <ColorfulGameSelector />
                </div>
                {/* Game selection component */}

                {/* <ActiveGameSelector {...{selectedGameID, gamesArray}} /> */}

                {/* Add new game to be managed */}
                <div className="col-12 col-md-6 col-lg-6 col-xl-4 mb-2">
                    <div className="card theme-border chartcard cursor-pointer" onClick={() => onClick(null!)}>
                        <div className="card-body text-start p-0">
                            <div className="card-title p-1 mb-0 bg-warning">
                                <div className="ratio ratio-16x9 theme-bg rounded">
                                    <CommonIcons.plus fill="currentColor" className="bg-dark p-3" />
                                </div>
                            </div>
                            <div className="anal-cavity px-2 mb-2 pt-2">
                                <strong className="text-warning">{t('/settings.manage-game.head')}</strong>
                                <small className="text-dark">{t('/settings.manage-game.info')}</small>
                                <span>{t('/settings.manage-game.span')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* list existing managed games */}
                {gamesArray.map(
                    ({ id, type, launch_type, path }: GameInformation): ReactElement<GameCardComponentProps> => {
                        // console.log('entry', {game_id, type, launch_type, path});
                        const key: string = `card-${id}-${type}-${launch_type}`;
                        return <GameCardComponent key={key} {...{ id, path, onClick, tempGame }} />;
                    }
                )}
            </div>
        </Fragment>
    );
}

export declare interface SimpleCheckboxProps {
    checked?: boolean;
    text?: string;
}

function SimpleCheckbox({ checked = false, text = 'Checkbox' }: SimpleCheckboxProps): ReactElement<SimpleCheckboxProps> {
    const common: SVGAttributes<SVGElement> = { fill: 'currentColor', height: '1rem' };
    return (
        <div className="px-1 text-dark">
            {checked && <CommonIcons.check_square {...common} />}
            {!checked && <CommonIcons.close {...common} />}
            <small className="px-2">{text}</small>
        </div>
    );
}
