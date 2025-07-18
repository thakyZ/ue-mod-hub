import ActiveGameSelector from '@components/active-game-selector';
import GradientBanner from '@components/core/gradient-banner';
import type { ActiveGame } from '@hooks/use-active-game';
import useActiveGame from '@hooks/use-active-game';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { ReactElement } from 'react';
import React from 'react';

export default function ColorfulGameSelector(): ReactElement {
    const { t }: UseLocalizationReturn = useLocalization();
    const { gamesArray, selectedGameID }: ActiveGame = useActiveGame();

    return (
        <GradientBanner height={72}>
            <div className="row">
                <div className="col-auto py-3">
                    <p className="font-bold mb-0">{t('common.select-game')}</p>
                </div>
                <div className="col">
                    <ActiveGameSelector {...{ selectedGameID, gamesArray, className: 'py-2' }} />
                </div>
            </div>
        </GradientBanner>
    );
}
