/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import DAPI from '@main/dek/api';
import DEAP from '@main/dek/deap';
import type { PromiseTypeFunction } from '@typed/common';

/** @returns {Promise<number  | null>} */
const _default: PromiseTypeFunction<number | null> = async (): Promise<number | null> => {
    // if (!DEAP.app.isPackaged) return 0;
    return await DAPI.getUserCount({
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uuid: DEAP.datastore?.get('uuid'),
        version: DEAP.version,
    });
};

export default _default;
