/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
!?// EXAMPLE USAGE: 
!?// add raw-loader to project to load .md and .json files
yarn add raw-loader

!?// Add rules to next.config.js for raw loading md/json files
config.module.rules.push({
    test: /\.(?:[a-zA-Z0-9]+)?\.(md|json)$/, 
    use: 'raw-loader',
});

!?// import file from '@hooksuse-localization';
import useLocalization, { LocalizationProvider } from '@hooksuse-localization';

!?// wrap the app root component with the localization provider
!?// this ensures the localization context is available to all 
!?// child components that use the useLocalization hook
export default function RootApplicationComponent() {
    return <LocalizationProvider>
        <...OtherThingsHere />
    </LocalizationProvider>
}

!?// import the useLocalization hook in any component or page
!?// export page or component with localization support
export default PageOrComponent() {
    const { ready, t, tA, tO, language, changeLanguage, VALID_LANGUAGES } = useLocalization('optional-namespace);
    if (!ready) return <div>Loading...</div>;
    return <div>{t('key.string', {propname: "value"})}</div>;
}
*/
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { Locale } from '@locales/*-dektionary.json';
import type { Locale as Ue4ssLocale } from '@locales/*-ue4ss.json';
import type { PromiseVoidFunctionWithArgs, TypeFunctionWithArgs } from '@typed/common';
import wait from '@utils/wait';
import type { Context, HTMLAttributes, ReactElement } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Get, Paths } from 'type-fest';

const VALID_LANGUAGES = ['dev', 'en'] as const; //, 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];

export declare type ValidLanguages = (typeof VALID_LANGUAGES)[number];

const ARTIFICIAL_LOAD_DELAY: number = 1000;

const VALID_NAMESPACES = ['dektionary', 'ue4ss'] as const;

const DEFAULT_NAMESPACE: 'dektionary' = VALID_NAMESPACES[0];

export declare type ValidNamespaces = (typeof VALID_NAMESPACES)[number];

export declare type ValidNamespaceTypes = Locale | Ue4ssLocale;

export declare type LocaleLeaves<TNamespace extends ValidNamespaceTypes = Locale> = Paths<
    TNamespace,
    { leavesOnly: false }
>;

// type ComplexType<T> = T | T[] | { [key: string]: ComplexType<T> } | ComplexType<T>[];

export declare interface LocalizationContextType<TNamespace extends ValidNamespaceTypes> {
    ready: boolean;
    t: (
        keystring: string,
        replacers?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
        expectedArraySize?: number | null,
        bundle_override?: TNamespace
    ) => unknown;
    tA: (
        keystring: string,
        replacersOrSize?: Record<string, any> | number, // eslint-disable-line @typescript-eslint/no-explicit-any
        expectedSize?: number,
        bundle_override?: TNamespace
    ) => unknown;
    tO: (keystring: string, bundle_override?: TNamespace) => unknown;
    language: ValidLanguages | undefined;
    changeLanguage: (locale: ValidLanguages, namespace?: string) => void;
    VALID_LANGUAGES: readonly ValidLanguages[];
    tryLoadBundle: (
        locale: ValidLanguages | undefined,
        namespace?: string,
        loadDelay?: number
    ) => Promise<TNamespace | undefined>;
    innerM: (
        bundle_point?: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replacers?: Record<string, any>,
        bundle_override?: TNamespace
    ) => unknown;
}

export declare interface Localization<TNamespace extends ValidNamespaceTypes = Locale> {
    namespace: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tString: (instr: string, replacers?: Record<string, any>) => string;
    ready: boolean;
    t: <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
        keystring: TKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replacers?: Record<string, any>,
        expectedArraySize?: number | null,
        bundle_override?: TNamespace
    ) => Get<TNamespace, TKey>;
    tA: <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
        keystring: TKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replacersOrSize?: Record<string, any> | number,
        expectedSize?: number,
        bundle_override?: TNamespace
    ) => string[];
    tO: <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
        keystring: TKey,
        bundle_override?: TNamespace
    ) => Get<TNamespace, TKey> | null;
    language: ValidLanguages | undefined;
    changeLanguage: (locale: ValidLanguages, namespace?: string) => void;
    VALID_LANGUAGES: readonly ValidLanguages[];
    tryLoadBundle: (
        locale: ValidLanguages | undefined,
        namespace?: string,
        loadDelay?: number
    ) => Promise<TNamespace | undefined>;
}

export declare type LocalizationProviderProperties = Pick<HTMLAttributes<HTMLDivElement>, 'children'>;

// format("Hi name!", {name: 'DekitaRPG}); // Hi DekitaRPG!
// function format(base_string: string, replacers: Record<string, string> = {}) {
//     const regstr: string = Object.keys(replacers).join('|');
//     const regexp: RegExp = new RegExp(regstr, 'gi');
//     return base_string.replace(regexp, (matched: string): string => {
//         return replacers[matched.toLowerCase()] ?? matched;
//     });
// }

// Context for Localization
const LocalizationContext: Context<LocalizationContextType<ValidNamespaceTypes>> = createContext<
    LocalizationContextType<ValidNamespaceTypes>
>({} as LocalizationContextType<ValidNamespaceTypes>);

// Localization Provider Component
export function LocalizationProvider<TNamespace extends ValidNamespaceTypes>({
    children,
}: LocalizationProviderProperties): ReactElement<LocalizationProviderProperties> {
    const { handleError }: CommonChecks = useCommonChecks();
    const applog: AppLogger = useAppLogger('LocalizationProvider');
    const hasWindow: boolean = window !== undefined;
    const [bundle, setBundle] = useState<TNamespace | undefined>();
    const [ready, setReady] = useState<boolean>(false);
    const [loadDelay, setLoadDelay] = useState<number | undefined>();
    const [language, setLanguage] = useState<ValidLanguages | undefined>();

    // translate to string (inner function ~ not directly exposed)
    const innerT: TypeFunctionWithArgs<[pointkey: string, bundle_override?: TNamespace | undefined], unknown> =
        useCallback(
            function (pointkey: string, bundle_override: TNamespace | undefined = undefined): unknown {
                if (!bundle) return pointkey;
                // if (bundle_override) {
                //     console.log('bundle_override:', bundle_override);
                // }
                // TODO: check this for the other localization files as well.
                const bundle_point: TNamespace = bundle_override ?? bundle;
                let point_found: unknown;
                for (const key of pointkey.split('.') as (keyof typeof bundle_point)[]) {
                    if (!bundle_point[key]) continue;
                    point_found = bundle_point[key];
                }
                if (Array.isArray(point_found)) return point_found as string[];
                if (typeof point_found !== 'string') return pointkey;
                return point_found; // ?? pointkey;
            },
            [bundle]
        );

    // translate to string with replacers (inner function ~ not directly exposed)
    const innerM: LocalizationContextType<TNamespace>['innerM'] = useCallback(
        (
            bundle_point: string = '',
            replacers: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
            bundle_override: TNamespace | undefined = undefined
        ): unknown => {
            const matches: string[] = bundle_point.match(/{{(.*?)}}/g) ?? ([] as string[]);
            const mapped_matches: string[] = matches.map((key: string): string => key.replaceAll(/[{}]/g, ''));
            if (!('length' in matches)) return bundle_point;

            let point_found: unknown = undefined;
            for (const match of mapped_matches) {
                const data: unknown = innerT(match, bundle_override);
                if (typeof data !== 'string' || match === data) continue;
                point_found = bundle_point.replaceAll(`{{${match}}}`, data);
            }

            if (!point_found) return bundle_point;
            if (typeof point_found !== 'string') return point_found;

            // check for matches in the string and replace them with the replacers
            point_found = matches.reduce((accumulator: string, match: string): string => {
                const data: Record<string, string> = replacers; //JSON.parse(JSON.stringify(replacers));
                let found: string = match;
                for (const key of match.split('.')) {
                    if (data?.[key]) found = data[key];
                }
                return accumulator.replaceAll(`{{${match}}}`, found);
            }, point_found);

            if (!point_found) return bundle_point;

            return point_found;
        },
        [innerT]
    );

    // translate to string based on keystring
    // fairly similar to react-i18next's useTranslation hook in functionality
    const t: LocalizationContextType<TNamespace>['t'] = useCallback(
        (
            keystring: string,
            replacers: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
            expectedArraySize: number | null = null,
            bundle_override: TNamespace | undefined = undefined
        ): unknown => {
            const bundle_point: string[] | string = innerT(keystring, bundle_override) as string[] | string;
            if (Array.isArray(bundle_point)) {
                // handle array of strings
                try {
                    return bundle_point
                        .map<string>((value: string): string => innerT(value) as string)
                        .map<unknown>((e: string): unknown => innerM(e, replacers, bundle_override));
                } catch (error: unknown) {
                    console.error(error);
                }
                return [] as unknown[];
            }
            // handle single strings
            const finalized: unknown = innerM(bundle_point, replacers, bundle_override); // finalized string
            // create array of expected size with finalized elements in each
            if (expectedArraySize) return Array.from({ length: expectedArraySize }).fill(finalized);
            return finalized;
        },
        [/* bundle, */ innerT, innerM]
    );

    // translate to array of strings based on keystring
    const tA: LocalizationContextType<TNamespace>['tA'] = useCallback(
        (
            keystring: string,
            replacersOrSize: Record<string, any> | number = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
            expectedSize: number = 1,
            bundle_override: TNamespace | undefined = undefined
        ): unknown => {
            const replacers: Record<string, any> = typeof replacersOrSize === 'object' ? replacersOrSize : {}; // eslint-disable-line @typescript-eslint/no-explicit-any
            if (typeof replacersOrSize === 'number') expectedSize = replacersOrSize;
            return t(keystring, replacers, expectedSize, bundle_override);
        },
        [t]
    );

    // translate to raw object/array/string based on keystring
    const tO: LocalizationContextType<TNamespace>['tO'] = useCallback(
        function (keystring: string, bundle_override: TNamespace | undefined = undefined): unknown {
            const result: unknown = innerT(keystring, bundle_override);
            if (result === keystring) return null;
            return result;
        },
        [innerT]
    );

    // try to load the language bundle for the selected locale
    const tryLoadBundle: LocalizationContextType<TNamespace>['tryLoadBundle'] = useCallback(
        async (
            locale: ValidLanguages | undefined,
            namespace: string = DEFAULT_NAMESPACE,
            loadDelay: number = ARTIFICIAL_LOAD_DELAY
        ): Promise<TNamespace | undefined> => {
            try {
                setLoadDelay(loadDelay);
                return ((await import(`@locales/${locale}-${namespace}.json`)) as { default: TNamespace }).default;
            } catch (error: unknown) {
                console.error(error);
            }
            return undefined;
        },
        [setLoadDelay]
    );

    // updates selected language bundle with fallback to english
    const onUpdateLanguage: PromiseVoidFunctionWithArgs<[locale: ValidLanguages, namespace?: string]> = useCallback(
        async (locale: ValidLanguages, namespace?: string): Promise<void> => {
            if (!hasWindow || !window.ipc) return;
            let newBundle: TNamespace | undefined = await tryLoadBundle(locale, namespace);
            if (!newBundle) newBundle = await tryLoadBundle('en', namespace);
            void window.ipc.invoke('set-config', 'locale', locale);
            setBundle(newBundle);
            setLanguage(locale);
            // setReady(newBundle && Object.keys(newBundle).length > 0);
            setReady(true);
        },
        [hasWindow, tryLoadBundle]
    );

    const changeLanguage: LocalizationContextType<TNamespace>['changeLanguage'] = useCallback(
        (locale: ValidLanguages, namespace: string | undefined = undefined): void => {
            void onUpdateLanguage(locale, namespace);
        },
        [onUpdateLanguage]
    );

    // setup the language bundle on mount
    useEffect((): void => {
        if (!hasWindow || !window.ipc) return;
        // if (loadDelay === undefined) return;
        if (!language)
            (async (): Promise<void> => {
                const locale: ValidLanguages = (await window.ipc.invoke('get-config', 'locale', 'en')) as ValidLanguages;
                await wait(loadDelay); // artificial delay to show load screen
                await onUpdateLanguage(locale);
            })().catch((error: unknown): void => handleError(error, applog));
    }, [hasWindow, language, loadDelay, onUpdateLanguage, handleError, applog]);

    const exposed: LocalizationContextType<ValidNamespaceTypes> = {
        ready,
        t,
        tA,
        tO,
        language,
        changeLanguage,
        VALID_LANGUAGES,
        tryLoadBundle,
        innerM,
    } as LocalizationContextType<ValidNamespaceTypes>;

    return <LocalizationContext.Provider value={exposed}>{children}</LocalizationContext.Provider>;
}

// Export actual hook to useLocalization
export default function useLocalization<
    TLocaleType extends ValidNamespaces = typeof DEFAULT_NAMESPACE,
    // prettier-ignore
    TNamespace extends TLocaleType extends 'ue4ss' ? Ue4ssLocale : Locale = TLocaleType extends 'ue4ss' ? Ue4ssLocale : Locale,
>(namespace: TLocaleType | null = null, loadDelay: number = ARTIFICIAL_LOAD_DELAY): Localization<TNamespace> {
    const { handleError }: CommonChecks = useCommonChecks();
    const applog: AppLogger = useAppLogger('LocalizationProvider');
    const context: LocalizationContextType<TNamespace> = useContext<LocalizationContextType<TNamespace>>(
        LocalizationContext as unknown as Context<LocalizationContextType<TNamespace>>
    );
    // bundle override for namespace specific translations
    const [bundle, setBundle] = useState<TNamespace | undefined>();

    useEffect((): void => {
        if (namespace)
            (async (): Promise<void> => {
                setBundle(await context.tryLoadBundle(context.language, namespace, loadDelay));
            })().catch((error: unknown): void => handleError(error, applog));
    }, [context, loadDelay, namespace, handleError, applog]);

    // Localized translation function to override global translations with namespace ones
    const t: Localization<TNamespace>['t'] = useCallback(
        function <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
            key: TKey,
            replacers: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
            expectedArraySize: number | null = null
        ): Get<TNamespace, TKey> {
            return context.t(key, replacers, expectedArraySize, bundle) as Get<TNamespace, TKey>;
        },
        [context, bundle]
    );

    const tA: Localization<TNamespace>['tA'] = useCallback(
        function <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
            key: TKey,
            replacersOrSize: Record<string, any> | number = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
            expectedSize: number = 1
        ): string[] {
            return context.tA(key, replacersOrSize, expectedSize, bundle) as string[];
        },
        [context, bundle]
    );

    const tO: Localization<TNamespace>['tO'] = useCallback(
        function <TKey extends LocaleLeaves<TNamespace> = LocaleLeaves<TNamespace>>(
            key: TKey
        ): Get<TNamespace, TKey> | null {
            return context.tO(key, bundle) as Get<TNamespace, TKey> | null;
        },
        [context, bundle]
    );

    const tString: Localization<TNamespace>['tString'] = useCallback(
        function (
            instr: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            replacers: Record<string, any> = {}
        ): string {
            return context.innerM(instr, replacers, bundle) as string;
        },
        [context, bundle]
    );

    return { ...context, namespace, t, tA, tO, tString };
}

// dekitarpg@gmail.com
