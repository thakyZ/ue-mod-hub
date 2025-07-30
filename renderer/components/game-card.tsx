/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import assert from 'node:assert';

// InputComponent.js
// import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { CommonChecks, GameInformation } from '@hooks/use-common-checks';
import useCommonChecks from '@hooks/use-common-checks';
import type { Localization } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { GamePathData, GamePlatforms, LaunchTypes } from '@main/dek/game-map';
import type { ValidateGamePathReturnType } from '@main/dek/palhub-types';
import type { PropsMouseEventHandler, UseStatePair } from '@typed/common';
import isDevEnvironment from '@utils/is-dev-env';
// import Image from 'next/image';
// import Link from 'next/link';
import type { MouseEvent, MouseEventHandler, ReactElement, SVGProps } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
// import { SphereSpinner } from 'react-spinners-kit';

export declare type GamePathDataExtra = Pick<GamePathData, 'map_data'> & {
    name: string;
    type?: GamePlatforms;
    launch_type?: LaunchTypes;
};

export declare interface GameCardComponentProps {
    id: string;
    path?: string;
    onClick?: PropsMouseEventHandler<GamePathDataExtra, HTMLElement> | undefined;
    tempGame?: GameInformation | undefined | null;
    small?: boolean | undefined;
    platforms?: GamePlatforms[] | undefined | null;
    initGameData?: GamePathDataExtra | undefined | null;
}

export default function GameCardComponent({
    id,
    path,
    onClick = (): void => {},
    tempGame = null,
    small = false,
    platforms = null,
    initGameData = null,
}: GameCardComponentProps): ReactElement<GameCardComponentProps> | null {
    const applog: AppLogger = useAppLogger('GameCardComponent');
    const {
        requiredModulesLoaded,
        handleError,
        // commonAppData,
        // updateSelectedGame,
    }: CommonChecks = useCommonChecks();
    const [gameData, setGameData]: UseStatePair<GamePathDataExtra | null> = useState<GamePathDataExtra | null>(
        initGameData
    );
    // const IconComponent: CommonIcon = CommonIcons.star;
    const { t /* tA */ }: Localization = useLocalization();

    const realOnClick: MouseEventHandler<HTMLElement> = useCallback(
        (event: MouseEvent<HTMLElement>): void => {
            if (gameData) onClick({ props: gameData, ...event });
        },
        [gameData, onClick]
    );

    // const games = commonAppData?.games;
    // const game = games[id];

    useEffect((): void => {
        if (!requiredModulesLoaded || !path) return;
        (async (): Promise<void> => {
            try {
                const data: ValidateGamePathReturnType = await window.palhub('validateGamePath', path);
                // if (data.type === '{invalid-path}' || data.type === '{UNKNOWN}' || !('id' in data)) return;
                if (data.type === '{invalid-path}')
                    throw new Error(`Failed to validate game path at ${path}, got ${data.type}`, { cause: data });
                if (data.type === '{UNKNOWN}')
                    throw new Error(`Failed to validate game path at ${path}, got ${data.type}`, { cause: data });
                if (!('id' in data))
                    throw new Error(
                        `Failed to validate game path at ${path}, invalid type (Property 'id' does not exist in data)`,
                        { cause: data }
                    );
                setGameData({ name: t(`games.${id}.name` as `games.palworld.name`)!, ...data });
                // console.log('gameData:', data);
            } catch (error: unknown) {
                console.error(error);
            }
        })().catch((error: unknown): void => handleError(error, applog));
    }, [applog, id, tempGame?.id, handleError, tempGame?.has_ue4ss, path, requiredModulesLoaded, t]);

    // console.log({id, game, ta: tA(`/games.${id}.info`)})

    // if (!path) return null;

    // console.log('gameData:', gameData);

    // when not dev environment and game is hidden, return null
    if (!isDevEnvironment() && gameData?.map_data?.is_hidden) return null;

    return (
        <Col xs={12} md={6} lg={6} xl={4} className="mb-2" onClick={realOnClick}>
            {/* return <Col xs={12} md={6} lg={4} xl={3} className='mb-2' onClick={realOnClick}> */}
            <Card className={`theme-border chartcard ${small ? '' : 'cursor-pointer'}`}>
                <Card.Body className="text-start p-0">
                    <Card.Title className="p-1">
                        <div className="ratio ratio-16x9">
                            <Image
                                src={`/img/${id.replace('-demo', '')}/game-logo.webp`}
                                alt="Game Logo Image"
                                fluid
                                thumbnail
                            />
                        </div>
                        <div className="modcard set-topleft p-1 bg-info">
                            {!!platforms && (
                                <div className="d-flex gap-1">
                                    {platforms.map<GamePlatforms, ReactElement<PlatformIconProps>>(
                                        (platform: GamePlatforms, idx: number): ReactElement<PlatformIconProps> => (
                                            <PlatformIcon key={idx} type={platform} />
                                        )
                                    )}
                                </div>
                            )}
                            {gameData?.type && <PlatformIcon type={gameData?.type} />}
                            {gameData?.launch_type === 'server' && (
                                <div className="d-inline-block">
                                    <strong className="px-1 py-0">
                                        <small>{t(`common.app-types.${gameData?.launch_type}`)}</small>
                                    </strong>
                                </div>
                            )}
                        </div>
                    </Card.Title>
                    <div className={`anal-cavity ${small ? 'small' : ''} large px-2 pb-2`}>
                        <div className="text-white">
                            {/* {tA(`games.${id}.info`).map((line, idx) => <p key={idx} className="mb-0">{line}</p>)} */}
                            {small ? t(`games.${id}.name` as `games.generic.name`) : t(`games.${id}.info.0` as `games.generic.info.0`)/* eslint-disable-line prettier/prettier */}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
}

export declare interface PlatformIconProps {
    type: GamePlatforms;
    options?: SVGProps<SVGElement> | undefined;
}

export function PlatformIcon({ type, options = {} }: PlatformIconProps): ReactElement<PlatformIconProps> | null {
    options = { fill: 'currentColor', className: 'text-white p-1', height: '2rem', width: '2rem', ...options };
    switch (type) {
        case 'xbox':
            return <CommonIcons.xbox {...options} />;
        case 'steam':
            return <CommonIcons.steam {...options} />;
        case 'epic':
            return <CommonIcons.epic {...options} className="text-white p-0" />; // no padding for this one <3
        // case 'gog': return <CommonIcons.gog {...options} />
        // case 'uplay': return <CommonIcons.uplay {...options} />
        // case 'origin': return <CommonIcons.origin {...options} />
        // case 'battle': return <CommonIcons.battle {...options} />
        // case 'rockstar': return <CommonIcons.rockstar {...options} />
        // case 'bethesda': return <CommonIcons.bethesda {...options} />
        // case 'microsoft': return <CommonIcons.microsoft {...options} />
        default:
            return null;
    }
}
