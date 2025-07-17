/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import detectSteamGameInstallation from '@main/dek/detect-steam-game';
import type { PromiseTypeFunction } from '@typed/common';
// import detectXboxGameInstallation from "@main/dek/detectXboxGame";

/** @returns {Promise<string | null>} */
const _default: PromiseTypeFunction<string | null> = async (): Promise<string | null> => {
    // await detectXboxGameInstallation("palworld");
    return await detectSteamGameInstallation('1623730');
};

export default _default;
