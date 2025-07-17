/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import ActiveGameSelector from '@components/active-game-selector';
// import GradientBanner from '@components/core/gradient-banner';
import ColorfulGameSelector from '@components/colorful-game-selector';
import LoadListModal from '@components/modals/load-list';
import CheckModsModal from '@components/modals/mod-check';
import PlayVanillaModal from '@components/modals/play-vanilla';
import useActiveGame from '@hooks/use-active-game';
import useAppLogger from '@hooks/use-app-logger';
import type { GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import useLocalization, { type LocaleLeaves } from '@hooks/use-localization';
import type { PromiseVoidFunction } from '@typed/common';
import type { HTMLAttributes, ReactElement } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image';

export default function PlayPage() {
    const { t, tA } = useLocalization();
    const applog = useAppLogger('pages/play');
    const { refreshCommonDataWithRedirect, requiredModulesLoaded, commonAppData } = useCommonChecks();
    // const cache_dir: string | null = commonAppData?.cache;
    // const game_path: string | undefined = commonAppData?.selectedGame?.path;
    const game_data: GameInformation | undefined = commonAppData?.selectedGame;
    // const api_key: string | null = commonAppData?.apis?.nexus;

    const [showLoadListModal, setShowLoadListModal] = useState<boolean>(false);
    const [showCheckModsModal, setShowCheckModsModal] = useState<boolean>(false);
    const [showPlayVanillaModal, setShowPlayVanillaModal] = useState<boolean>(false);
    const { gamesArray: _gamesArray, activeGame, selectedGameID: _selectedGameID } = useActiveGame();
    const game = activeGame;

    const onClickCheckMods: VoidFunction = useCallback((): void => {
        if (!requiredModulesLoaded) return;
        setShowCheckModsModal(true);
    }, [requiredModulesLoaded]);

    const onClickLoadNewModlist: VoidFunction = useCallback((): void => {
        if (!requiredModulesLoaded) return;
        setShowLoadListModal(true);
    }, [requiredModulesLoaded]);

    const onClickPlayVanillaPalworld: VoidFunction = useCallback((): void => {
        if (!requiredModulesLoaded) return;
        setShowPlayVanillaModal(true);
    }, [requiredModulesLoaded]);

    const onRunGameExe: PromiseVoidFunction = useCallback(async (): Promise<void> => {
        if (!requiredModulesLoaded) return;
        if (!game_data?.has_exe) {
            void applog('error', 'game exe not found');
            return;
        }
        void applog('info', `Launching Game: ${game_data.exe_path}`);

        // const args = ['-steam', '-launch', '-appid', '1167190']
        // const env = { ...process.env, SteamAppId: '<AppID>', SteamGameId: '<AppID>' };
        // "E:/Program Files (x86)/Steam/Steam.exe"
        // steam://rungameid/2909400`

        // eslint-disable-next-line unicorn/prefer-ternary
        if (game_data.type === 'steam' && !!game_data.map_data.platforms.game?.steam?.url) {
            await window.ipc.invoke('open-external', `steam://rungameid/${game_data.map_data.platforms.game.steam.id}`);
            // window.open(`steam://rungameid/${game_data.map_data.platforms.game.steam.id}`, '_blank');
        } else {
            await window.palhub('launchExe', game_data.exe_path, []); //, {env: {SteamAppId: game_data.map_data.platforms.game.steam.id, SteamGameId: game_data.map_data.platforms.game.steam.id}});
        }
    }, [requiredModulesLoaded, game_data]);

    const onClickLaunchGame: VoidFunction = useCallback((): void => {
        if (!requiredModulesLoaded) return;
        void onRunGameExe();
    }, [requiredModulesLoaded, onRunGameExe]);

    useEffect((): void => {
        void refreshCommonDataWithRedirect();
    }, [refreshCommonDataWithRedirect]);

    console.log(game_data);

    // prettier-ignore
    return (
        <Fragment>
            <CheckModsModal show={showCheckModsModal} setShow={setShowCheckModsModal} />
            <LoadListModal show={showLoadListModal} setShow={setShowLoadListModal} />
            <PlayVanillaModal show={showPlayVanillaModal} setShow={setShowPlayVanillaModal} onRunGameExe={onRunGameExe} />

            <div className="container">
                <div className="mx-auto px-3 pt-5 pb-4">
                    <ColorfulGameSelector />

                    <div className="row mt-4">
                        <div className="col-12 card px-1">
                            <div className="card-body py-2 px-1">
                                <div className="row">
                                    <div className="d-lg-none col-lg-7">
                                        <Image
                                            src={`/img/${game?.id?.replace('-demo', '')}/game-logo.webp`}
                                            alt="Game Logo Image"
                                            rounded
                                            fluid
                                        />
                                    </div>
                                    <div className="col-12 col-lg-5 pt-4 px-5 pe-lg-2">
                                        <h1 className="font-bold mb-4">{t('/play.head', { game: game!.name })}</h1>
                                        {(tA(`games.${game?.id}.info` as LocaleLeaves) as unknown as string[]).map((line: string, idx: number): ReactElement<HTMLAttributes<HTMLParagraphElement>> => (
                                            <p key={idx} className="mb-4">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="d-none d-lg-block col-lg-7">
                                        <Image
                                            src={`/img/${game?.id.replace('-demo', '')}/game-logo.webp`}
                                            alt="Game Logo Image"
                                            rounded
                                            fluid
                                        />
                                    </div>
                                </div>

                                <div className="px-0">
                                    <button className="btn btn-success p-3 w-100 mt-3" onClick={onClickLaunchGame}>
                                        <strong>{t('/play.launch-main', { game: game!.name })}</strong>
                                        <small className="d-block">{t('/play.launch-info')}</small>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-12 col-md-4 mb-3">
                            <button className="btn btn-dark hover-primary p-3 w-100" onClick={onClickCheckMods}>
                                <strong>{t('/play.check-mods-main')}</strong>
                                <small className="d-block">{t('/play.check-mods-info')}</small>
                            </button>
                        </div>
                        <div className="col-12 col-md-4 mb-3">
                            <button className="btn btn-dark hover-warning p-3 w-100" onClick={onClickLoadNewModlist}>
                                <strong>{t('/play.load-mods-main')}</strong>
                                <small className="d-block">{t('/play.load-mods-info')}</small>
                            </button>
                        </div>
                        <div className="col-12 col-md-4 mb-3">
                            <button className="btn btn-dark hover-danger p-3 w-100" onClick={onClickPlayVanillaPalworld}>
                                <strong>{t('/play.vanilla-main', { game: game!.name })}</strong>
                                <small className="d-block">{t('/play.vanilla-info')}</small>
                            </button>
                        </div>
                    </div>

                    {/* <h1 className="font-bold mb-4">Suggested Servers</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div>

                <h1 className="font-bold mb-4">Suggested Mods</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div> */}
                </div>
            </div>
        </Fragment>
    );
}
