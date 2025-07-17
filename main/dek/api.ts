/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
* API class handles interactions with my own api to keep 
* track of user counts, and the version being used. 
*/

import type { RequestBody, RequestFunction, ValidResponse } from 'bent';
import bent from 'bent';
import Dekache from 'dekache';

export declare interface DekApiRpcPingReturn {
    success: boolean;
    counter?: number;
}

const ApiCache: Dekache = new Dekache({ name: 'api-cache', mins: 10 });
const DekAPI: RequestFunction<ValidResponse> = bent('https://dekitarpg.com/', 'POST', 'json', 200);

export default class API {
    /**
     * get user counts from the given post data object.
     * this function is called from the main.js file.
     * @param {RequestBody} post_data
     * @returns {Promise<number | null>}
     */
    static async getUserCount(post_data: RequestBody): Promise<number | null> {
        // check the cache for data, if doesn't exist, create.
        return await ApiCache.get('user-count', async (): Promise<number | null> => {
            // get data from the api using the given post_data
            /** @type {DekApiRpcPingReturn} */
            const result: DekApiRpcPingReturn = (await DekAPI('rpc-ping', post_data)) as DekApiRpcPingReturn; //! make palhub-ping
            // if api ping was successful, return the counter
            return result.success ? result.counter || 0 : null;
        });
    }
}
