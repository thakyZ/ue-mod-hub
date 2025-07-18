/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import assert from 'node:assert';

import type { AppLogger } from '@hooks/use-app-logger';
// import useAppLogger from '@hooks/use-app-logger';
import type { DeepLinkNXMType, DeepLinkType } from '@hooks/use-deep-link-listener';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
// import useSelectedGame from '@hooks/useSelectedGame';
import type { ConfigDataStoreApiKeys, ConfigDataStoreGames, ConfigDataStorePath, ErroredGames, Games } from '@main/config';
import type { GamePathData, GamePlatforms, LaunchTypes } from '@main/dek/game-map';
import type { IValidateKeyResponse } from '@nexusmods/nexus-api';
import type {
    PromiseResolve,
    PromiseTypeFunctionWithArgs,
    PromiseVoidFunction,
    PromiseVoidFunctionWithArgs,
    UseStatePair,
} from '@typed/common';
import type { VoidFunctionWithArgs } from '@typed/common';
import type { ValidateGamePathReturnType } from '@typed/palhub';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Context, Dispatch, HTMLAttributes, ReactElement, SetStateAction } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export function isArray(value: unknown): value is unknown[] {
    return typeof value === 'object' && Array.isArray(value);
}

export function isArrayFrozen(value: unknown): value is readonly unknown[] {
    return isArray(value) && Object.isFrozen(value);
}

export function isArrayT<T>(value: unknown, type: T): value is T[] {
    return isArray(value)
        ? value.length > 0
            ? value.every((entry: unknown): boolean => typeof entry === typeof type)
            : true
        : false;
}

export function isArrayFrozenT<T>(value: unknown, type: T): value is readonly T[] {
    return isArrayT<T>(value, type) && isArrayFrozen(value);
}

export function isObject(value: unknown): value is object {
    return typeof value === 'object';
}

export function isDeepLink(value: unknown): value is DeepLinkType {
    return (
        isObject(value) &&
        value !== null &&
        'segments' in value &&
        isArrayT<string>(value.segments, '') &&
        'params' in value &&
        typeof value.params === 'object' &&
        value.params !== null
    );
}

export function isEmptyString(value: string): value is '' {
    return typeof value === 'string' && value === '';
}

export function assertIsType<T>(value: unknown): value is T {
    return true;
}

export function hardAssertIsType<T>(value: unknown): asserts value is T {
    console.log('asserted value is of T');
}

export function ensureError(error: unknown): Error {
    return !error || error === null
        ? new Error('Unknown Error')
        : typeof error === 'string'
          ? new Error(error)
          : error instanceof Error
            ? error
            : new Error(error.toString()); // eslint-disable-line @typescript-eslint/no-base-to-string
}

export function isNXMDeepLink(value: unknown): value is DeepLinkNXMType {
    // game_slug: string;
    // mod_id: number;
    // file_id: number;
    // expires: number;
    // key: string;
    return (
        isDeepLink(value) &&
        'game_slug' in value &&
        typeof value.game_slug === 'string' &&
        !isEmptyString(value.game_slug) &&
        'mod_id' in value &&
        typeof value.mod_id === 'number' &&
        Number.isInteger(value.mod_id) &&
        'file_id' in value &&
        typeof value.file_id === 'number' &&
        Number.isInteger(value.file_id) &&
        'expires' in value &&
        typeof value.expires === 'number' &&
        Number.isInteger(value.expires) &&
        'key' in value &&
        typeof value.key === 'string' &&
        !isEmptyString(value.key)
    );
}

export declare interface GameInformation extends GamePathData {
    active: boolean;
    name: string;
}

export declare interface CommonAppDataDataType {
    games: ConfigDataStoreGames;
    selectedGame?: GameInformation;
    apis: ConfigDataStoreApiKeys;
    cache: string | null;
}

export declare type IsValidCallback = (is_valid: boolean) => Promise<void>;

export declare type KeyUserCallback = (key_user: IValidateKeyResponse) => Promise<void>;

export declare type SelectedGameCallback = (selectedGame: GameInformation | null) => Promise<void>;

export declare type UpdateSelectedGamePathCallback = (selectedGame: GameInformation) => Promise<void>;

export declare interface CommonChecks {
    requiredModulesLoaded: boolean;
    commonAppData: CommonAppDataDataType;
    refreshApis: PromiseVoidFunction;
    refreshCache: PromiseVoidFunction;
    refreshGames: PromiseTypeFunctionWithArgs<[ignoreRequired?: boolean], ConfigDataStoreGames | undefined>;
    updateCachePath: PromiseVoidFunctionWithArgs<[new_value: string]>;
    updateNexusApiKey: PromiseVoidFunctionWithArgs<[new_value: string, validate?: KeyUserCallback]>;
    refreshCommonDataWithRedirect: PromiseVoidFunction;
    updateSelectedGame: PromiseVoidFunctionWithArgs<
        [tempGame?: GameInformation | null, callmemaybe?: SelectedGameCallback]
    >;
    updateSelectedGamePath: PromiseVoidFunctionWithArgs<
        [tempGame: GameInformation, new_path: string, callmemaybe?: UpdateSelectedGamePathCallback]
    >;
    forgetGame: PromiseVoidFunctionWithArgs<[tempGame: GameInformation, callmemaybe?: PromiseVoidFunction]>;
    handleError: VoidFunctionWithArgs<
        [
            error: unknown,
            logger: AppLogger | VoidFunctionWithArgs<[message: string]> | Dispatch<SetStateAction<string>>,
            type?: 0 | 1 | 2,
        ]
    >;
}

export function parseIntSafe(value: string | number | undefined, radix: number = 10): number | undefined {
    return typeof value === 'string' ? Number.parseInt(value, radix) : value;
}

export function parseIntSafeArray(values: string[] | number[] | undefined, radix: number = 10): number[] | undefined {
    return values?.map((value: string | number) => (typeof value === 'string' ? Number.parseInt(value, radix) : value));
}

export declare type CommonAppDataProviderProps = Pick<HTMLAttributes<HTMLDivElement>, 'children'>;

// Context for Localization
const CommonAppDataContext: Context<CommonChecks> = createContext<CommonChecks>(undefined!);

// CommonAppData Provider Component
export const CommonAppDataProvider = ({
    children,
}: CommonAppDataProviderProps): ReactElement<CommonAppDataProviderProps> => {
    const { t, /* tA, */ ready }: UseLocalizationReturn = useLocalization();
    // const applog: AppLogger = useAppLogger('hooks/use-common-checks');
    const [requiredModulesLoaded, setRequiredModulesLoaded]: UseStatePair<boolean> = useState<boolean>(false);
    const [commonAppData, setCommonAppData] = useState<CommonAppDataDataType | null>(null);
    const router: NextRouter = useRouter();

    const updateCommonAppData: VoidFunctionWithArgs<
        [key: keyof CommonAppDataDataType, value: Partial<CommonAppDataDataType[keyof CommonAppDataDataType]>]
    > = useCallback(
        <TKey extends keyof CommonAppDataDataType, TValue extends CommonAppDataDataType[TKey]>(
            key: TKey,
            value: Partial<TValue>
        ): void => {
            setCommonAppData(
                (prev: CommonAppDataDataType | null): CommonAppDataDataType | null =>
                    ({
                        ...prev,
                        [key]: value,
                    }) as CommonAppDataDataType
            );
        },
        []
    );

    const handleError: CommonChecks['handleError'] = useCallback(
        (
            error: unknown,
            logger: AppLogger | VoidFunctionWithArgs<[message: string]> | Dispatch<SetStateAction<string>>,
            type: 0 | 1 | 2 = 0
        ): void => {
            // if (!logger) {
            //     logger = useAppLogger('HandleErrorBackup');
            //     type = 0;
            // }
            error = ensureError(error);
            hardAssertIsType<Error>(error);
            if (type === 0) void logger('error', error);
            else if (type === 1) {
                hardAssertIsType<VoidFunctionWithArgs<[message: string]>>(logger);
                void logger(error.stack ?? `${error.name} ${error.message}`);
            } else {
                hardAssertIsType<Dispatch<SetStateAction<string>>>(logger);
                void logger(error.stack ?? `${error.name} ${error.message}`);
            }
        },
        []
    );

    const refreshApis: CommonChecks['refreshApis'] = useCallback(async (): Promise<void> => {
        if (!requiredModulesLoaded) return;
        const apis: ConfigDataStoreApiKeys = await window.uStore.get('api-keys');
        updateCommonAppData('apis', apis);
    }, [requiredModulesLoaded, updateCommonAppData]);

    const refreshCache: CommonChecks['refreshCache'] = useCallback(async (): Promise<void> => {
        if (!requiredModulesLoaded) return;
        const cache: string | null | undefined = await window.uStore.get('app-cache');
        if (cache !== undefined) updateCommonAppData('cache', cache);
    }, [requiredModulesLoaded, updateCommonAppData]);

    const refreshGames: CommonChecks['refreshGames'] = useCallback(
        async (ignoreRequired: boolean = false): Promise<ConfigDataStoreGames | undefined> => {
            if (!ignoreRequired && !requiredModulesLoaded) return;
            const games: ConfigDataStoreGames = await window.uStore.get('games');
            // remove all empty (games that no longer seem to exist at path) games just in case;
            let changed: boolean = false;
            for (const a of Object.keys(games)) {
                // if (!Object.prototype.hasOwnProperty.call(games, key)) continue;
                if (a === 'active') continue;
                const game_id: Games = a as Games;
                if (!games[game_id]) {
                    delete games[game_id];
                    changed = true;
                }
                for (const b in games[game_id]) {
                    if (b === '{UNKNOWN}') {
                        delete games[game_id][b as GamePlatforms];
                        changed = true;
                    }
                    for (const c in games[game_id]?.[b as GamePlatforms]) {
                        if (c === 'undefined') {
                            // delete games[game_id]?.[b as GamePlatforms]?.[c as LaunchTypes];
                            // changed = true;
                        }
                    }
                }
            }
            type ActiveGamesTuple = [a: Games, b?: Games | ErroredGames, c?: Games | ErroredGames];
            const [a, b, c]: ActiveGamesTuple | undefined = games?.active?.split('.') as ActiveGamesTuple;
            if (b === '{UNKNOWN}' || c === 'undefined') {
                games.active = null;
                delete games[a];
                changed = true;
            }
            if (changed) {
                await window.uStore.set('games', games);
                // TODO: Test if await is required, the original code ignored the promise.
                void router.push('/settings');
            }
            updateCommonAppData('games', games);
            return games;
        },
        [requiredModulesLoaded, router, updateCommonAppData]
    );

    type GetStoreIDType = <
        TPrefixGames extends boolean = boolean,
        TReturn extends string = TPrefixGames extends true
            ? `${Games}.${GamePlatforms}.${LaunchTypes}`
            : `games.${Games}.${GamePlatforms}.${LaunchTypes}`,
    >(
        game_id: string,
        tempGame?: GameInformation | null,
        prefixGames?: TPrefixGames
    ) => TReturn;

    const getStoreID: GetStoreIDType = useCallback(
        <
            TPrefixGames extends boolean = boolean,
            TReturn extends string = TPrefixGames extends true
                ? `${Games}.${GamePlatforms}.${LaunchTypes}`
                : `games.${Games}.${GamePlatforms}.${LaunchTypes}`,
        >(
            game_id: string,
            tempGame: GameInformation | null = null,
            prefixGames: TPrefixGames = true as TPrefixGames
        ): TReturn => {
            const prefix: string = prefixGames ? 'games.' : '';
            let store_id: TReturn = `${prefix}${game_id}` as TReturn;
            if (tempGame && game_id !== 'undefined') {
                store_id = `${prefix}${tempGame.id}.${tempGame.type}.${tempGame.launch_type}` as TReturn;
            }
            return store_id;
        },
        []
    );

    const updateCachePath: CommonChecks['updateCachePath'] = useCallback(
        async (new_path: string, callmemaybe: IsValidCallback = async (): Promise<void> => {}): Promise<void> => {
            const is_valid: boolean = await window.palhub('checkIsValidFolderPath', new_path);
            await window.uStore.set('app-cache', new_path);
            await refreshCache();
            await callmemaybe(is_valid);
        },
        [refreshCache]
    );

    const updateNexusApiKey: CommonChecks['updateNexusApiKey'] = useCallback(
        async (new_key: string, callmemaybe: KeyUserCallback = async (): Promise<void> => {}): Promise<void> => {
            const key_user: IValidateKeyResponse = await window.nexus(new_key, 'setKey', new_key);
            await window.uStore.set<string>('api-keys.nexus', new_key);
            await refreshApis();
            await callmemaybe(key_user);
        },
        [refreshApis]
    );
    const updateSelectedGame: CommonChecks['updateSelectedGame'] = useCallback(
        async (
            tempGame: GameInformation | null = null,
            callmemaybe: SelectedGameCallback = async (): Promise<void> => {}
        ): Promise<void> => {
            const game_id: string = tempGame?.id ?? 'undefined';
            const store_id: `games.${Games}.${GamePlatforms}.${LaunchTypes}` = getStoreID(game_id, tempGame, true);
            console.log('updating selected game:', store_id);
            const path: string = (await window.uStore.get(store_id)) ?? '';
            const data: ValidateGamePathReturnType = await window.palhub('validateGamePath', path);
            if (data.type === '{invalid-path}')
                throw new Error(`Failed to validate game path at ${path}, got ${data.type}`, { cause: data });
            if (data.type === '{UNKNOWN}')
                throw new Error(`Failed to validate game path at ${path}, got ${data.type}`, { cause: data });
            if (!('id' in data))
                throw new Error(
                    `Failed to validate game path at ${path}, invalid type (Property 'id' does not exist in data)`,
                    { cause: data }
                );
            const idname = { id: game_id, name: t(`games.${data.id}.name` as `games.generic.name`), active: true };
            const selectedGame: GameInformation = { ...idname, ...data };
            updateCommonAppData('selectedGame', selectedGame);

            const active_id: `${Games}.${GamePlatforms}.${LaunchTypes}` = getStoreID(selectedGame.id, selectedGame, false);
            await window.uStore.set<`${Games}.${GamePlatforms}.${LaunchTypes}` | null>('games.active', active_id);
            // call the callback function when the game id is updated

            await callmemaybe(selectedGame);
        },
        [t, getStoreID, updateCommonAppData]
    );
    const updateSelectedGamePath: CommonChecks['updateSelectedGamePath'] = useCallback(
        async (
            tempGame: GameInformation,
            new_path: string,
            callmemaybe: UpdateSelectedGamePathCallback = async (): Promise<void> => {}
        ): Promise<void> => {
            const game_id: Games | ErroredGames = tempGame.id ?? 'undefined';

            // update the game path stored in the uStore
            const store_id: Games = getStoreID(game_id, tempGame);
            console.log('updating path:', store_id, new_path);
            await window.uStore.set<string>(`games.${store_id}` as ConfigDataStorePath, new_path);

            // validate the new path and update the selected game data
            const data: ValidateGamePathReturnType = await window.palhub('validateGamePath', new_path);
            if (data.type === '{invalid-path}')
                throw new Error(`Failed to validate game path at ${new_path}, got ${data.type}`, { cause: data });
            if (data.type === '{UNKNOWN}')
                throw new Error(`Failed to validate game path at ${new_path}, got ${data.type}`, { cause: data });
            if (!('id' in data))
                throw new Error(
                    `Failed to validate game path at ${new_path}, invalid type (Property 'id' does not exist in data)`,
                    { cause: data }
                );
            const selectedGame: GameInformation = {
                ...data,
                name: t(`games.${data.id}.name` as `games.generic.name`),
                active: true,
            };
            updateCommonAppData('selectedGame', selectedGame);
            // use selectedGame.id as id may change from data returned via
            // validating the path. game_id is 'undefined' when a new/unknown game is
            // being added. the validation step will return the correct id.
            // as long as the game is supported.
            const active_id: `${Games}.${GamePlatforms}.${LaunchTypes}` = getStoreID(selectedGame.id, selectedGame, false);
            await window.uStore.set<`${Games}.${GamePlatforms}.${LaunchTypes}`>('games.active', active_id);

            if (/* game_id === 'undefined' && */ selectedGame.id !== game_id) {
                // if selected game.id is different from the game_id,
                // then its safe to use data.is as the new game id to update the store
                await window.uStore.set<string>(getStoreID(selectedGame.id, selectedGame), new_path);
                // remove the undefined datas
                await window.uStore.delete(`games.undefined` as ConfigDataStorePath);
                // call the callback function when the game id is updated
                await callmemaybe(selectedGame);
                console.log('updated selected game:', selectedGame);
                // refresh the games list to include the new game
                await refreshGames();
            }
        },
        [t, /* commonAppData?.games?.active, */ refreshGames, getStoreID, updateCommonAppData]
    );

    const forgetGame: CommonChecks['forgetGame'] = useCallback(
        async (
            tempGame: GameInformation,
            callmemaybe: PromiseVoidFunction = async (): Promise<void> => {}
        ): Promise<void> => {
            const game_id: Games | ErroredGames = tempGame?.id ?? 'undefined';
            const store_id: `games.${Games}.${GamePlatforms}.${LaunchTypes}` = getStoreID(game_id, tempGame);
            await window.uStore.delete(store_id);
            await callmemaybe();
            await refreshGames();
        },
        [refreshGames, getStoreID]
    );

    //
    // function to redirect to settings if required modules are loaded
    //
    const refreshCommonDataWithRedirect: CommonChecks['refreshCommonDataWithRedirect'] =
        useCallback(async (): Promise<void> => {
            await new Promise<void>((r: PromiseResolve<void>): NodeJS.Timeout => setTimeout(r, 250));
            // get the api keys, cache, and games
            const apis: ConfigDataStoreApiKeys = await window.uStore.get('api-keys');
            const cache: string | null = await window.uStore.get('app-cache');
            const games: ConfigDataStoreGames = await window.uStore.get('games');
            // const games = refreshGames(true);

            // if no api keys are set, redirect to settings
            if (Object.values(apis).includes(null)) void router.push('/settings');
            // if no cache is set, redirect to settings
            if (!cache) void router.push('/settings');

            // check if the selected game is valid and set the data if it is
            let selectedGame: Partial<GameInformation> | null = null;
            if (games?.active) {
                try {
                    const game_path: string = await window.uStore.get<string>(`games.${games.active}`);
                    // const game_path = games[games.active];
                    const data: ValidateGamePathReturnType = await window.palhub('validateGamePath', game_path);

                    if (data.type === '{invalid-path}')
                        throw new Error(`Failed to validate game path at ${game_path}, got ${data.type}`, { cause: data });
                    if (data.type === '{UNKNOWN}')
                        throw new Error(`Failed to validate game path at ${game_path}, got ${data.type}`, { cause: data });
                    if (!('id' in data))
                        throw new Error(
                            `Failed to validate game path at ${game_path}, invalid type (Property 'id' does not exist in data)`,
                            { cause: data }
                        );
                    selectedGame = { ...data, name: t(`games.${games.active}.name` as `games.generic.name`) };
                    // initialize the nexus api with the selected game's slug
                    const slug: string = selectedGame.map_data!.providers.nexus;
                    if (apis.nexus) await window.nexus(apis.nexus, 'setGame', slug);
                    // set the commonly used app datas
                    setCommonAppData(
                        (_prev: CommonAppDataDataType | null): CommonAppDataDataType =>
                            ({ apis, cache, games, selectedGame }) as CommonAppDataDataType
                    );
                } catch (error) {
                    console.error(error);
                }
            } else {
                void router.push('/settings');
            }
            // selectedGame = null;
            setCommonAppData(
                (_prev: CommonAppDataDataType | null): CommonAppDataDataType =>
                    ({ apis, cache, games, selectedGame }) as CommonAppDataDataType
            );
            // selectedGame === null && router.push('/settings');

            setRequiredModulesLoaded(true);
        }, [/* ready, */ router, t]);

    // ensures that all required modules are fully loaded
    useEffect((): void => {
        if (typeof window === 'undefined') return;
        const REQUIRED_MODULES = ['uStore', 'palhub', 'nexus', 'logger', 'ipc'];
        if (REQUIRED_MODULES.some((module: string): boolean => !window[module as keyof Window])) return;
        void refreshCommonDataWithRedirect();
    }, [ready, refreshCommonDataWithRedirect]);

    return (
        <CommonAppDataContext.Provider
            value={{
                requiredModulesLoaded,
                commonAppData: commonAppData!,
                refreshApis,
                refreshCache,
                refreshGames,
                updateCachePath,
                updateNexusApiKey,
                updateSelectedGame,
                updateSelectedGamePath,
                forgetGame,
                refreshCommonDataWithRedirect,
                handleError,
            }}
        >
            {children}
        </CommonAppDataContext.Provider>
    );
};

// Export actual hook to useLocalization
export default function useCommonChecks(): CommonChecks {
    return useContext<CommonChecks>(CommonAppDataContext);
}
