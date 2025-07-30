import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { ConfigDataStoreGamesRecordLaunchTypes, Games } from '@main/config';
import type { GamePlatforms, LaunchTypes } from '@main/dek/game-map';
import { useMemo } from 'react';

export declare type GamesAarray = GameInformation[];

export declare interface ActiveGame {
    gamesArray: GamesAarray;
    activeGame: GameInformation | undefined;
    selectedGameID: number | undefined;
}

export default function useActiveGame(): ActiveGame {
    const { commonAppData }: CommonChecks = useCommonChecks();
    const { t }: Localization = useLocalization();

    const gamesArray: GamesAarray = useMemo((): GamesAarray => {
        const gamesArray: GamesAarray = [];
        const game: GameInformation | undefined = commonAppData?.selectedGame;
        if (!commonAppData) return gamesArray;

        for (const [id, data] of Object.entries(commonAppData.games)) {
            if (id === 'active' || !data) continue;
            const game_id: Games = id as Games;
            type DataType = [type: GamePlatforms, platform_data: ConfigDataStoreGamesRecordLaunchTypes];
            for (const [type, platform_data] of Object.entries(data) as DataType[]) {
                type PlatformDataType = [launch_type: LaunchTypes, path: string];
                for (const [launch_type, path] of Object.entries(platform_data) as PlatformDataType[]) {
                    const active: boolean = game?.id === id && game?.type === type && game?.launch_type === launch_type;
                    gamesArray.push({
                        id: game_id,
                        type,
                        launch_type,
                        path,
                        active,
                        name: t(`games.${id}.name` as `games.generic.name`),
                    } as GameInformation);
                }
            }
        }
        // console.log('refreshing memoized datas', gamesArray);
        return gamesArray;
    }, [commonAppData, t]);

    const activeGame: GameInformation | undefined = gamesArray.find((g: GameInformation): boolean => g.active);
    const selectedGameID: number | undefined = activeGame ? gamesArray.indexOf(activeGame) : undefined;

    return { gamesArray, activeGame, selectedGameID };
}
