/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import GameCardComponent, { type GamePathDataExtra } from '@components/game-card';
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import { handleError } from '@hooks/use-common-checks';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { Games } from '@main/config';
import type { GamePlatformData, GamePlatforms } from '@main/dek/game-map';
import game_map from '@main/dek/game-map';
// import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

export default function AboutPage(): ReactElement {
    const applog: AppLogger = useAppLogger('AboutPage');
    const { t, tA }: UseLocalizationReturn = useLocalization();

    const gamesArray: Games[] = Object.keys(game_map)
        .filter((a: string): boolean => !a.includes('demo'))
        .sort((a: string, b: string): number => {
            const aName: string = t(`games.${a}.name` as `games.generic.name`);
            const bName: string = t(`games.${b}.name` as `games.generic.name`);
            return aName.localeCompare(bName);
        });

    const onClickChangelog: VoidFunction = useCallback((): void => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'changes').catch((error: unknown) => handleError(error, applog));
    }, []);

    return (
        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 py-5">
                    <h1 className="font-bold mb-4">{t('/about.head')}</h1>
                    <p className="mb-4">{t('/about.desc')}</p>
                    <div className="row">
                        <div className="col-12 col-xl-6">
                            <Link
                                href="https://discord.gg/WyTdramBkm"
                                target="_blank"
                                className="w-100 btn btn-dark hover-success py-3 px-4"
                            >
                                <CommonIcons.discord height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/about.discord')}</strong>
                            </Link>
                        </div>
                        <div className="col-12 col-xl-6">
                            <Link
                                href="https://www.patreon.com/dekitarpg"
                                target="_blank"
                                className="w-100 btn btn-info py-3 px-4 mb-2 mb-xl-0"
                            >
                                <CommonIcons.patreon height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/about.patreon')}</strong>
                            </Link>
                        </div>
                    </div>
                    <div className="alert alert-warning text-center mt-3">
                        <strong>{t('/about.notice')}</strong>
                    </div>
                    <div className="row">
                        <div className="col-12 col-xl-6">
                            <h2 className="font-bold">{t('/about.features.head')}</h2>
                            <ul className="px-0">
                                {tA('/about.features.list').map(
                                    (feature: string, idx: number): ReactElement => (
                                        <li key={idx}>{feature}</li>
                                    )
                                )}
                            </ul>
                            <div className="w-100 btn btn-secondary py-3 px-4 mb-2 mb-xl-0" onClick={onClickChangelog}>
                                <CommonIcons.info height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/about.changes')}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-xl-6 d-grid gap-2">
                            <Link href="/privacy" className="w-100 btn btn-dark hover-success py-3 px-4">
                                <CommonIcons.privacy height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/privacy.name')}</strong>
                            </Link>
                            <Link href="/terms" className="w-100 btn btn-dark hover-success py-3 px-4">
                                <CommonIcons.terms height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/terms.name')}</strong>
                            </Link>
                            <Link href="/faq" className="w-100 btn btn-dark hover-success py-3 px-4">
                                <CommonIcons.question height="2rem" fill="currentColor" style={{ opacity: 0.5 }} />
                                <strong className="ps-2">{t('/faq.name')}</strong>
                            </Link>
                        </div>

                        <h2 className="font-bold mt-3">{t('/about.supported-games')}</h2>
                        {/* align to center */}
                        <div className="col-12">
                            <div className="row justify-content-center">
                                {gamesArray.map((id: Games): ReactElement | null => {
                                    const key = `supported-game-card-${id}`;
                                    if (!game_map[id]?.platforms?.game) return null;
                                    const platforms: GamePlatforms[] = Object.keys(game_map[id]?.platforms?.game).filter(
                                        (k: keyof GamePlatformData): boolean => k != 'modloader'
                                    ) as GamePlatforms[];
                                    const initGameData: GamePathDataExtra = {
                                        name: t(`games.${id}.name`)!,
                                        map_data: game_map[id],
                                    };
                                    return (
                                        <GameCardComponent key={key} {...{ id, platforms, initGameData, small: true }} />
                                    );
                                })}
                            </div>
                        </div>
                        <small className="text-dark text-center">{t('/about.more-games-soon')}</small>
                    </div>
                </div>
            </div>
        </div>
    );
}
