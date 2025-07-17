import DekItem from '@components/core/dek-item';
import DekSelect from '@components/core/dek-select';
import { PlatformIcon } from '@components/game-card';
import type { GamesAarray } from '@hooks/use-active-game';
import useAppLogger from '@hooks/use-app-logger';
// import GameCardComponent from '@components/game-card';
import type { GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
import type { Dispatch, HTMLAttributes, MouseEvent, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useCallback, useEffect } from 'react';

export declare interface ActiveGameSelectorProps extends Pick<HTMLAttributes<HTMLElement>, 'className'> {
    gamesArray: GamesAarray;
    selectedGameID?: number | undefined;
    setTempGame?: Dispatch<SetStateAction<GameInformation>> | null;
}

export default function ActiveGameSelector({
    gamesArray,
    selectedGameID,
    setTempGame = null,
    className = 'col-12 pb-3',
}: ActiveGameSelectorProps): ReactElement<ActiveGameSelectorProps> {
    const applog = useAppLogger('ActiveGameSelector');
    const { commonAppData, updateSelectedGame } = useCommonChecks();
    const api_key: string | null = commonAppData?.apis?.nexus;

    const onChangeSelectedGame = useCallback(
        (
            _event: MouseEvent<HTMLLIElement>,
            _selected_text: ReactNode | ReactNode[] | string | undefined,
            _innerText: string | null,
            index: number
        ): void => {
            if (!api_key) return;
            updateSelectedGame(gamesArray[index], async (game: GameInformation | null): Promise<void> => {
                if (!game) return;
                const slug: string = game.map_data.providers.nexus;
                await window.nexus(api_key, 'setGame', slug);
                if (setTempGame) setTempGame(game);
            }).catch((error: unknown): void => handleError(error, applog));
        },
        [updateSelectedGame, gamesArray]
    );

    useEffect((): void => {
        if (selectedGameID === -1 && gamesArray.length > 0) {
            updateSelectedGame(gamesArray[0]).catch((error: unknown): void => handleError(error));
        }
    }, [selectedGameID, gamesArray]);

    const { t } = useLocalization();
    const iconOptions = { height: '1.8rem', style: { marginTop: -4 } };
    return (
        <div className={className}>
            <DekSelect active_id={selectedGameID} onChange={onChangeSelectedGame}>
                {gamesArray.map(({ id, type, launch_type, path: _path, active: _active }) => {
                    return (
                        <DekItem key={`selector-${id}-${type}-${launch_type}`} text="hi">
                            <PlatformIcon type={type} options={iconOptions} />
                            {`${t(`games.${id}.name` as `games.generic.name`)} `}
                            {launch_type !== 'game' && t(`common.app-types.${launch_type}`)}
                            {/* {` - ${path}`} */}
                        </DekItem>
                    );
                })}
            </DekSelect>
        </div>
    );
}
