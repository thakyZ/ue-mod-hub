/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// InputComponent.js
import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import type { IModInfoWithSavedConfig } from '@main/dek/palhub-types';
import type { PropsMouseEventHandler } from '@typed/common';
import DOMPurify from 'dompurify';
// import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent, MouseEventHandler, ReactElement } from 'react';
import { useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

export declare type ModCardComponentPropsMod = Pick<
    IModInfoWithSavedConfig,
    | 'local'
    | 'saved_config'
    | 'thumbnail'
    | 'file_name'
    | 'picture'
    | 'mod_id'
    | 'available'
    | 'name'
    | 'author'
    | 'picture_url'
    | 'uploaded_users_profile_url'
    | 'uploaded_by'
    | 'description'
    | 'summary'
    | 'status'
>;

export declare interface ModCardComponentProps {
    mod: ModCardComponentPropsMod | undefined;
    onClick?: PropsMouseEventHandler<ModCardComponentPropsMod, HTMLElement> | undefined;
    ad?: boolean | undefined;
    refreshModList?: VoidFunction | undefined;
    local?: boolean | undefined;
    modlistID?: number | undefined;
}

const DEFAULT_EXAMPLE_MOD_LISTING: ModCardComponentPropsMod = {
    name: 'Quivern Rainbowdragon',
    summary: 'New look with colorful feathers for the Quivern :D',
    description:
        '[center][size=4]This mod is a commission together with the Chillet, and its goal was to redesign the Quivern based on an existing character. The mod adds ears, colorful feathers, horns, and paws[/size]\n<br />\n<br />[size=5]Installation[/size]\n<br />\n<br />[size=3]Unpack the zip and drop on  "...Palworld&#92;Content&#92;Pal&#92;Content&#92;Paks" or "~Mods" folder. [/size]\n<br />\n<br />[url=https://www.nexusmods.com/palworld/search/?gsearch=ddarckwolf&amp;gsearchtype=authors&amp;tab=mods]\n<br />\n<br />[size=6][u]My Other Mods :D\n<br />[/u][/size][/url]\n<br />\n<br />[url=https://ko-fi.com/ddarckwolf]\n<br />[img]https://ko-fi.com/img/githubbutton_sm.svg[/img]\n<br />\n<br />\n<br />[/url]\n<br />[url=https://www.buymeacoffee.com/ddarckwolf][img]https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png[/img]\n<br />[/url][/center]',
    picture_url: 'https://staticdelivery.nexusmods.com/mods/6063/images/1678/1678-1720655960-891455967.png',
    mod_downloads: 0,
    mod_unique_downloads: 0,
    uid: '26040386717326',
    mod_id: 1678,
    game_id: 6063,
    allow_rating: true,
    domain_name: 'palworld',
    category_id: 10,
    version: 'v1.0',
    endorsement_count: 0,
    created_timestamp: 1720656865,
    created_time: '2024-07-11T00:14:25.000+00:00',
    updated_timestamp: 1720656865,
    updated_time: '2024-07-11T00:14:25.000+00:00',
    author: 'Ddarckwolf',
    uploaded_by: 'Ddwolf11',
    uploaded_users_profile_url: 'https://www.nexusmods.com/users/72870268',
    contains_adult_content: false,
    status: 'published',
    available: true,
    user: {
        member_id: 72870268,
        member_group_id: 27,
        name: 'Ddwolf11',
    },
    endorsement: null!,
} as unknown as ModCardComponentPropsMod;

export default function ModCardComponent({
    mod,
    onClick = (): void => {},
    ad = false,
    refreshModList = (): void => {},
    modlistID = 0,
    local = true,
}: ModCardComponentProps): ReactElement<ModCardComponentProps> {
    if (!mod) mod = DEFAULT_EXAMPLE_MOD_LISTING;

    const applog: AppLogger = useAppLogger('ModCardComponent');
    const IconComponent: CommonIcon = CommonIcons.star;
    const realOnClick: MouseEventHandler<HTMLElement> = useCallback(
        (event: MouseEvent<HTMLElement>): void => {
            if (('available' in mod && mod.available) || mod.local) onClick({ props: mod, ...event });
        },
        [onClick, mod]
    );

    const { requiredModulesLoaded, commonAppData }: CommonChecks = useCommonChecks();
    const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const cache_dir: string | null = commonAppData?.cache;

    const onUninstallModFiles: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !game_path) return;
            console.log('uninstalling mod:', mod);
            try {
                const result: boolean = await window.palhub('uninstallMod', game_path, mod);
                console.log({ result });
                refreshModList();
            } catch (error: unknown) {
                console.error('error uninstalling mod:', error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [mod, requiredModulesLoaded, game_path, refreshModList]);

    const onUninstallModCache: VoidFunction = useCallback((): void => {
        (async (): Promise<void> => {
            if (!requiredModulesLoaded || !cache_dir || !mod.saved_config) return;
            console.log('uninstalling from cache:', mod);
            try {
                await window.palhub('uninstallFilesFromCache', cache_dir, mod, mod.saved_config);
                refreshModList();
            } catch (error: unknown) {
                console.error('error uninstalling from cache:', error);
            }
            // handleCancel();
        })().catch((error: unknown): void => handleError(error, applog));
    }, [mod, requiredModulesLoaded, cache_dir, refreshModList]);

    const onClickRemoveDeleteFiles: VoidFunction = useCallback((): void => {
        if (mod.available) {
            alert('This mod is available, you cannot remove it.');
            return;
        }
        switch (modlistID) {
            case 0:
                onUninstallModFiles();
                break;
            case 1:
                onUninstallModCache();
                break;
        }
    }, [mod, onUninstallModFiles, modlistID]);

    if (local || mod.local) {
        return (
            <Col xs={12} md={6} lg={4} xl={3} className="mb-2" onClick={realOnClick}>
                <Card className="theme-border chartcard cursor-pointer">
                    <Card.Body className="text-start p-0">
                        <Card.Title className="p-1">
                            <div className="ratio ratio-16x9">
                                <Image src={mod.thumbnail} alt={mod.name} fluid thumbnail />
                            </div>
                            {ad && (
                                <div className="modcard">
                                    <IconComponent fill="currentColor" className="modicon" />
                                </div>
                            )}
                        </Card.Title>

                        <div className="anal-cavity px-2">
                            <p className="text-secondary mb-0 truncate font-bold">{mod.file_name ?? 'n/a'}</p>
                            <small>
                                <small className="text-dark">{mod.author ?? '??'}</small>
                            </small>
                            <div
                                className="text-white"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mod.description ?? '') }}
                            ></div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        );
    }

    return (
        <Col xs={12} md={6} lg={4} xl={3} className="mb-2" onClick={realOnClick}>
            <Card className="theme-border chartcard cursor-pointer">
                <Card.Body className="text-start p-0">
                    <Card.Title className="p-1">
                        <div className="ratio ratio-16x9">
                            <Image src={mod.picture_url ?? '/img/mod-unavailable.webp'} alt={mod.name} fluid thumbnail />
                        </div>
                        {ad && (
                            <div className="modcard">
                                <IconComponent fill="currentColor" className="modicon" />
                            </div>
                        )}
                    </Card.Title>

                    <div className="anal-cavity px-2">
                        <p className="text-secondary mb-0 truncate font-bold">
                            {mod.name ?? mod.saved_config?.file_name ?? 'n/a'}
                        </p>
                        <small>
                            <small>
                                <Link href={mod.uploaded_users_profile_url ?? '#'} target="_blank" className="hover-dark">
                                    {mod.uploaded_by}
                                </Link>
                            </small>
                        </small>
                        {mod.available && (
                            <div
                                className="text-white"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mod.summary ?? '') }}
                            ></div>
                        )}
                        {!mod.available && mod.saved_config && (
                            <div className="text-center text-white">
                                <p className="m-0">This mod is {mod.status}!</p>
                                <button className="btn btn-danger mt-2" onClick={onClickRemoveDeleteFiles}>
                                    Remove Mod
                                </button>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <div className="col-3">
            <div className="flex items-center">
                {mod?.picture ? <Image src={mod?.picture} alt={mod?.name} fluid /> : undefined}
            </div>
            <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{mod?.name}</h2>
                <p className="text-gray-500">{mod?.author}</p>
            </div>
            <p className="text-gray-600 mt-2">{mod?.summary}</p>
            <div className="mt-4">
                <a href="#" className="text-blue-600 hover:underline">
                    Read More
                </a>
            </div>
        </div>
    );
}
