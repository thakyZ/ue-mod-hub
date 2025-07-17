/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import BBCodeRenderer from '@components/core/bbcode';
// import DekCheckbox from '@components/core/dek-checkbox';
import DekChoice from '@components/core/dek-choice';
// import DekSelect from '@components/core/dek-select';
import ModCardComponent, { type ModCardComponentProps, type ModCardComponentPropsMod } from '@components/mod-card';
// import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
import AddLocalModModal from '@components/modals/local-mod';
import CheckModsModal from '@components/modals/mod-check';
import ModDetailsModal from '@components/modals/mod-details';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
// import ModListModal from '@components/modals/mod-list';
// import * as CommonIcons from '@config/common-icons';
import type { CommonAppDataContextType, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError, parseIntSafe } from '@hooks/use-common-checks';
import type { LocaleLeaves, UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { Games } from '@main/config';
import type {
    IModInfoWithSavedConfig,
    PalHubCacheConfig,
    PalHubCacheModConfig,
    PalHubConfig,
} from '@main/dek/palhub-types';
import type { IModInfo as NexusIModInfo } from '@nexusmods/nexus-api';
import type {
    PromiseTypeFunctionWithArgs,
    PropsMouseEvent,
    TypeFunctionWithArgs,
    VoidFunctionWithArgs,
} from '@typed/common';
// import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import type { MouseEvent, MutableRefObject, ReactElement } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import type { CarouselItemProps } from 'react-bootstrap/CarouselItem';
import type { ButtonVariant } from 'react-bootstrap/esm/types';
import Image from 'react-bootstrap/Image';

/**
 * {
 *     "name": "Quivern Rainbowdragon",
 *     "summary": "New look with colorful feathers for the Quivern :D",
 *     "description": "[center][size=4]This mod is a commission together with the Chillet, and its goal was to redesign the Quivern based on an existing character. The mod adds ears, colorful feathers, horns, and paws[/size]\n<br />\n<br />[size=5]Installation[/size]\n<br />\n<br />[size=3]Unpack the zip and drop on \"...Palworld&#92;Content&#92;Pal&#92;Content&#92;Paks\" or \"~Mods\" folder. [/size]\n<br />\n<br />[url=https://www.nexusmods.com/palworld/search/?gsearch=ddarckwolf&amp;gsearchtype=authors&amp;tab=mods]\n<br />\n<br />[size=6][u]My Other Mods :D\n<br />[/u][/size][/url]\n<br />\n<br />[url=https://ko-fi.com/ddarckwolf]\n<br />[img]https://ko-fi.com/img/githubbutton_sm.svg[/img]\n<br />\n<br />\n<br />[/url]\n<br />[url=https://www.buymeacoffee.com/ddarckwolf][img]https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png[/img]\n<br />[/url][/center]",
 *     "picture_url": "https://staticdelivery.nexusmods.com/mods/6063/images/1678/1678-1720655960-891455967.png",
 *     "mod_downloads": 0,
 *     "mod_unique_downloads": 0,
 *     "uid": 26040386717326,
 *     "mod_id": 1678,
 *     "game_id": 6063,
 *     "allow_rating": true,
 *     "domain_name": "palworld",
 *     "category_id": 10,
 *     "version": "v1.0",
 *     "endorsement_count": 0,
 *     "created_timestamp": 1720656865,
 *     "created_time": "2024-07-11T00:14:25.000+00:00",
 *     "updated_timestamp": 1720656865,
 *     "updated_time": "2024-07-11T00:14:25.000+00:00",
 *     "author": "Ddarckwolf",
 *     "uploaded_by": "Ddwolf11",
 *     "uploaded_users_profile_url": "https://www.nexusmods.com/users/72870268",
 *     "contains_adult_content": false,
 *     "status": "published",
 *     "available": true,
 *     "user": {
 *         "member_id": 72870268,
 *         "member_group_id": 27,
 *         "name": "Ddwolf11"
 *     },
 *     "endorsement": undefined
 * }
 */

const BANNED_MODS: number[] = [];

function determineAdvertizedMods(slug: Games): number[] {
    switch (slug) {
        case 'palworld':
            return [577, 703, 1204, 146, 489]; //1650, 487, 577, 489]//, 1204];//, 1314, 1650, 1640];
        case 'hogwarts-legacy':
            return [1260, 1261, 1275, 1179];
        case 'stellar-blade':
            return [340, 488, 489, 531, 546, 630];
    }
    return [];
}

type ModsPageModType = ModCardComponentPropsMod & Pick<IModInfoWithSavedConfig, 'installed' | 'ad'>;

export default function ModsPage(): ReactElement {
    // const router = useRouter();
    const applog: AppLogger = useAppLogger('ModsPage');
    const { t, tA }: UseLocalizationReturn = useLocalization();
    const { requiredModulesLoaded, commonAppData }: CommonAppDataContextType = useCommonChecks();
    const cache_dir: string | null = commonAppData?.cache;
    const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const game_data: GameInformation | undefined = commonAppData?.selectedGame;
    const api_key: string | null = commonAppData?.apis?.nexus;
    const slug: string | undefined = game_data?.map_data?.providers?.nexus;

    const [needsRefreshed, setNeedsRefreshed] = useState<boolean>(false);
    const [showAddLocalMod, setShowAddLocalMod] = useState<boolean>(false);
    const [showModDetails, setShowModDetails] = useState<boolean>(false);
    const [showModList, setShowModList] = useState<boolean>(false);
    const [activeMod, setActiveMod] = useState<ModsPageModType | null>(null);
    const [localMod, setLocalMod] = useState<ModsPageModType | null>(null);
    const [modlistID, setModlistID] = useState<number>(0);
    const [mods, setMods] = useState<ModsPageModType[]>([]);
    const [localMods, setLocalMods] = useState<ModsPageModType[]>([]);
    const [ads, setAds] = useState<ModsPageModType[]>([]);
    const modlistTypes: string[] = (tA('/mods.tabs' as LocaleLeaves, 5) as unknown as string[]) ?? [];
    const modSearchRef: MutableRefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

    const showSaveModList: boolean = modlistID === 0;
    // https://www.nexusmods.com/palworld/mods/1204
    const advertised_mods: number[] = commonAppData?.selectedGame?.id
        ? determineAdvertizedMods(commonAppData?.selectedGame?.id)
        : [];

    // useEffect(() => {
    //     if (!requiredModulesLoaded) return;
    //     redirectIfNeedConfigured();
    // }, [requiredModulesLoaded]);

    const getInstalledMods: PromiseTypeFunctionWithArgs<[api_key: string, game_path: string], ModsPageModType[]> = async (
        api_key: string,
        game_path: string
    ): Promise<ModsPageModType[]> => {
        const config: PalHubConfig = (await window.palhub('readJSON', game_path)) as PalHubConfig;
        if (!config || (!config.mods && !config.local_mods)) return [];
        const mod_ids: number[] = Object.keys((config.mods ??= {})).map((mod_id: string): number => parseIntSafe(mod_id)!);
        const mods_from_nexus: ModsPageModType[] = await Promise.all(
            mod_ids.map(async (mod_id: number): Promise<ModsPageModType> => {
                const nexus_data: ModsPageModType = await window.nexus(api_key, 'getModInfo', mod_id, slug);
                nexus_data.saved_config = config.mods[mod_id];
                nexus_data.installed = true;
                return nexus_data;
            })
        );

        console.log('config.mods:', config.mods);
        if (!config.local_mods) return mods_from_nexus;
        const local_mods: ModsPageModType[] = Object.values(config.local_mods).filter((mod) => mod.local);
        console.log('local_mods:', local_mods);
        return [...mods_from_nexus, ...local_mods];
    };

    const getDownloadedMods: PromiseTypeFunctionWithArgs<[api_key: string, cache_dir: string], ModsPageModType[]> =
        useCallback(
            async (api_key: string, cache_dir: string): Promise<ModsPageModType[]> => {
                if (!slug) return [];
                console.log('cache_dir:', cache_dir, slug);
                // const install_config = await window.palhub('readJSON', game_path);
                const config: PalHubCacheConfig = (await window.palhub('readJSON', cache_dir)) as PalHubCacheConfig;
                const mod_ids: number[] = Object.keys((config[slug] ??= {})).map((mod_id: string): number =>
                    Number.parseInt(mod_id, 10)
                );
                return await Promise.all(
                    mod_ids.map(async (mod_id: number): Promise<ModsPageModType> => {
                        const nexus_data: ModsPageModType = await window.nexus(api_key, 'getModInfo', mod_id, slug);
                        console.log('setting nexus_data:', config[slug]![mod_id]);
                        const saved_keys: (keyof PalHubCacheModConfig)[] = Object.keys((config[slug]![mod_id] ??= {}));
                        if (saved_keys.length > 0 && !!saved_keys[0] && !!config[slug]?.[mod_id][saved_keys[0]])
                            nexus_data.saved_config = {
                                file_id: parseIntSafe(saved_keys[0])!,
                                file_name: config[slug][mod_id][saved_keys[0]]!.zip,
                                mod_id: mod_id,
                            };
                        // nexus_data.saved_config = install_config.mods[mod_id];
                        // nexus_data.installed = nexus_data.saved_config ? true : false;
                        return nexus_data;
                    })
                );
            },
            [game_path, cache_dir, commonAppData?.selectedGame?.id, slug]
        );

    // load initial settings from store
    useEffect((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !api_key || !cache_dir || !game_path) return;
            let new_mods: ModsPageModType[] | undefined = undefined;
            // // const api_key: string | null = await getApiKey();
            // // const game_path: string | undefined = await getGamePath();
            // // const cache_dir: string | null = await getCacheDir();
            // const cache_dir: string | null = commonAppData?.cache;
            // const game_path: string | undefined = commonAppData?.selectedGame?.game?.path;
            // const game_data = commonAppData?.selectedGame?.data;
            // const api_key: string | null = commonAppData?.apis?.nexus;

            switch (modlistID) {
                case 0:
                    new_mods = await getInstalledMods(api_key, game_path);
                    break;
                case 1:
                    new_mods = await getDownloadedMods(api_key, cache_dir);
                    break;
                case 2:
                    new_mods = await window.nexus(api_key, 'getLatestAdded', slug);
                    break;
                case 3:
                    new_mods = await window.nexus(api_key, 'getTrending', slug);
                    break;
                case 4:
                    new_mods = await window.nexus(api_key, 'getLatestUpdated', slug);
                    break;
                case 5:
                    new_mods = await window.nexus(api_key, 'getTrackedMods');
                    break;
            }
            if (new_mods) {
                let new_ads: ModsPageModType[] = await Promise.all(
                    advertised_mods.map(async (mod_id: number): Promise<ModsPageModType> => {
                        return await window.nexus(api_key, 'getModInfo', mod_id, slug);
                    })
                );

                const nexusValidationFilter: TypeFunctionWithArgs<[mod: ModsPageModType], boolean> = (
                    mod: ModsPageModType
                ): boolean => {
                    // console.log('nexusValidationFilter:', mod);
                    // return true;
                    if (!('status' in mod) || !mod.status) return false;
                    return mod.status === 'published' && !!mod.available;
                };

                new_ads = new_ads
                    .filter((mod: ModsPageModType): boolean => nexusValidationFilter(mod))
                    .map((mod: ModsPageModType): ModsPageModType => {
                        mod.ad = true;
                        return mod;
                    });

                const new_locals: ModsPageModType[] = new_mods.filter(
                    (mod: ModsPageModType): boolean => 'local' in mod && !!mod.local && mod.local
                );
                if (modlistID > 1) {
                    new_mods = new_mods.filter((mod: ModsPageModType): boolean => nexusValidationFilter(mod));
                }
                console.log({ new_mods });

                if (![0, 1].includes(modlistID)) {
                    if (new_mods.length >= 8) new_mods = new_mods.slice(0, 8);
                    else if (new_mods.length > 4) new_mods = new_mods.slice(0, 4);
                }
                setAds(new_ads);
                setMods(new_mods);
                setLocalMods(new_locals);
                setNeedsRefreshed(false);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [modlistID, requiredModulesLoaded, needsRefreshed]);

    const onClickModCard: VoidFunctionWithArgs<[mod: ModsPageModType]> = (mod: ModsPageModType): void => {
        console.log('clicked mod:', mod);
        setActiveMod(mod);
        setShowModDetails(true);
    };
    const onClickLocalModCard: VoidFunctionWithArgs<[mod: ModsPageModType]> = (mod: ModsPageModType): void => {
        console.log('clicked local mod:', mod);
        setLocalMod(mod);
        setShowAddLocalMod(true);
    };
    const onToggleShowLocalModCard: TypeFunctionWithArgs<[show: boolean], boolean> = (show: boolean): boolean => {
        setShowAddLocalMod(show);
        if (show) return show;
        setTimeout((): void => {
            setLocalMod(null);
        }, 500);
        return show;
    };

    const onFindSpecificMod: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!api_key) return;
            const value: string | undefined = modSearchRef.current?.value;
            let mod_id: number | undefined = undefined;
            if (!value) return;
            // if value is valid number then it is considered as mod id:
            mod_id = parseIntSafe(value, 10);
            // if value is https://www.nexusmods.com/palworld/mods/MOD_ID then get the mod_id using regex
            if (!Number.isInteger(mod_id) && value.includes('nexusmods.com')) {
                const match: RegExpMatchArray | null = value.match(/mods\/(\d+)/);
                if (match && match.length > 1) mod_id = parseIntSafe(match[1], 10);
            }
            // console.log('finding specific mod:', mod_id);
            if (!mod_id) throw new Error('Invalid mod id or url');
            if (!window.uStore) throw new Error('uStore not loaded');
            if (!window.nexus) throw new Error('nexus not loaded');
            // const cache_dir: string | null = commonAppData?.cache;
            // const game_path: string | undefined = commonAppData?.selectedGame?.game?.path;
            // const game_data: GameInformation | undefined = commonAppData?.selectedGame?.data;
            // const api_key: string | null = commonAppData?.apis?.nexus;

            // const api_key: string | null = await getApiKey();
            const mod: NexusIModInfo = await window.nexus(api_key, 'getModInfo', mod_id, slug);
            onClickModCard(mod);
        })().catch((error: unknown): void => handleError(error, applog));
    }, [modSearchRef, commonAppData?.selectedGame?.id]);

    const refreshModList: VoidFunction = useCallback((): void => {
        setNeedsRefreshed(true);
    }, []);

    const gold_mod: boolean = false;
    const banner_height: number = 256;
    const color_a: ButtonVariant = gold_mod ? 'danger' : 'info';
    const color_b: ButtonVariant = gold_mod ? 'warning' : 'primary';
    const gradient_a: string = `bg-gradient-${color_a}-to-${color_b} border-${color_a}`;
    const gradient_b: string = `bg-${color_b} border-${color_a}`;
    const gradient_c: string = `bg-gradient-${color_b}-to-${color_a} border-${color_a}`;

    return (
        <Fragment>
            <CheckModsModal show={showModList} setShow={setShowModList} />
            {/* <ModListModal show={showModList} setShow={setShowModList} mods={mods} /> */}
            <ModDetailsModal
                mod={activeMod}
                show={showModDetails}
                setShow={setShowModDetails}
                refreshModList={refreshModList}
            />
            <AddLocalModModal
                show={showAddLocalMod}
                setShow={(prevState: boolean): boolean => onToggleShowLocalModCard(prevState)}
                initialModData={localMod}
                refreshModList={refreshModList}
            />

            <div className="container">
                <div className="mx-auto px-3 py-5">
                    {ads && ads.length > 0 && (
                        <div className="position-relative">
                            {/* main gradient background elements */}
                            <div className="row mb-2" style={{ height: banner_height }}>
                                <div
                                    className={`col transition-all border border-4 border-end-0 p-5 radius9 no-radius-end ${gradient_a}`}
                                ></div>
                                <div
                                    className={`col transition-all border border-4 border-start-0 border-end-0 p-5 ${gradient_b}`}
                                ></div>
                                <div
                                    className={`col transition-all border border-4 border-start-0 p-5 radius9 no-radius-start ${gradient_c}`}
                                ></div>
                            </div>
                            {/* actual content elements */}
                            <div className="position-absolute top-0 w-100 pt-3">
                                <div className="d-flex text-center">
                                    {/* create carousel with each ad as the items */}
                                    <Carousel interval={6900} className="w-100" indicators={true} style={{ height: 234 }}>
                                        {ads.map((mod: ModsPageModType, i: number): ReactElement<CarouselItemProps> => {
                                            return (
                                                <Carousel.Item key={i} className="h-100">
                                                    <div className="container-fluid h-100">
                                                        <div
                                                            className="row mx-auto bg-dark cursor-pointer radius6 h-100"
                                                            style={{ maxWidth: 800 }}
                                                            onClick={() => onClickModCard(mod)}
                                                        >
                                                            <div className="col-12 col-lg-6 ps-lg-0 text-center">
                                                                <div className="position-relative h-100">
                                                                    {/* <div className='d-flex justify-content-center align-items-center'> */}
                                                                    <Image
                                                                        src={mod.picture_url}
                                                                        alt={mod.name}
                                                                        fluid
                                                                        className="bg-transparent position-absolute top-50 start-50 ps-3"
                                                                        style={{
                                                                            maxHeight: banner_height - 56,
                                                                            transform: 'translate(-50%, -50%)',
                                                                        }}
                                                                    />
                                                                    {/* </div> */}
                                                                    {/* <div className='d-lg-none py-3 text-center w-100 position-absolute top-0'>
                                                            <h2 className='text-white bg-dark'>{mod.name}</h2>
                                                        </div> */}
                                                                </div>
                                                            </div>
                                                            <div className="d-none d-lg-block col-12 col-lg-6 ps-lg-0 h-100 py-3 text-start">
                                                                <h3 className="text-white mb-0">
                                                                    <strong>{mod.name}</strong>
                                                                </h3>
                                                                <small className="text-white">
                                                                    <strong>by {mod.author}</strong>
                                                                </small>
                                                                <hr className="my-3" />
                                                                <BBCodeRenderer bbcodeText={mod.summary ?? ''} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Carousel.Item>
                                            );
                                        })}
                                    </Carousel>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row">
                        <div className="col text-end d-flex flex-column px-3">
                            <small>
                                {t('/mods.powered')}{' '}
                                <Link href="https://nexusmods.com" target="_blank" className="hover-dark text-warning">
                                    {t('common.nexus')}
                                </Link>
                            </small>
                        </div>
                    </div>

                    <div className="row pt-2">
                        {showSaveModList && (
                            <div className="col-3 pe-0">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={(_event: MouseEvent<HTMLButtonElement>): void => setShowModList(true)}
                                >
                                    {t('/mods.save-list')}
                                </button>
                            </div>
                        )}
                        <div className="col-3">
                            <button
                                className="btn btn-info w-100"
                                onClick={(_event: MouseEvent<HTMLButtonElement>): void => setShowAddLocalMod(true)}
                            >
                                {t('/mods.add-local')}
                            </button>
                        </div>
                        <div className="col ps-0">
                            {/* <ENVEntryLabel name="View mod by id or url" tooltip="Enter a nexus mods url or nexus mod id to view a specific mod." /> */}
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder={t('/mods.search-placeholder')}
                                    className="form-control form-primary no-radius-end"
                                    autoComplete="off"
                                    ref={modSearchRef}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-primary no-radius-start px-4"
                                        type="button"
                                        onClick={onFindSpecificMod}
                                    >
                                        <strong>{t('/mods.search-button')}</strong>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DekChoice
                        className="py-3"
                        // disabled={true}
                        choices={modlistTypes}
                        active={modlistID}
                        onClick={(i: number, value: string | number): void => {
                            console.log(`Setting Page: ${value}`);
                            setModlistID(i);
                        }}
                    />

                    <div className="row mt-3">
                        {mods &&
                            mods.map(
                                (mod: ModsPageModType, i: number): ReactElement<ModCardComponentProps> => (
                                    <ModCardComponent
                                        key={i}
                                        {...{ mod, modlistID, refreshModList }}
                                        onClick={(event: PropsMouseEvent<ModCardComponentPropsMod, HTMLElement>): void =>
                                            onClickModCard(event.props)
                                        }
                                    />
                                )
                            )}
                    </div>
                    {localMods.length > 0 && (
                        <div className="row mt-3">
                            <h4 className="text-start">{t('/mods.manual-mods')}</h4>
                            {localMods.map(
                                (mod: ModsPageModType, i: number): ReactElement<ModCardComponentProps> => (
                                    <ModCardComponent
                                        key={i}
                                        mod={mod}
                                        onClick={(event: PropsMouseEvent<ModCardComponentPropsMod, HTMLElement>): void =>
                                            onClickLocalModCard(event.props)
                                        }
                                        local={true}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}
