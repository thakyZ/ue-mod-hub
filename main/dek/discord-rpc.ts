import { existsSync } from 'node:fs';
import { env, platform } from 'node:process';

import localization from '@locales/en-dektionary.json';
import type { Locale, LocaleGameNameKeyPair } from '@locales/en-dektionary.json';
import DEAP from '@main/dek/deap';
import DiscordRPC from 'discord-rpc';
import type { ValueOf } from 'type-fest';

// const path = require('path');
// const { app } = require('electron');
// import {config} from 'dotenv';
// config({ path: path.join(app.getAppPath(), '.env') });

export declare interface DiscordRpc {
    started: boolean;
    paused: boolean;
    handle: NodeJS.Timeout | undefined;
    isset: boolean;
    available(): boolean;
    start(): void;
    stop(): void;
    pause(): void;
    unpause(): void;
    update(): Promise<void>;
}

// Including your Discord App ID in a public repo is safe as long as you
// do not include your client secret, bot token, or any sensitive keys.

/** @type {string} */
const clientId: string = '1330098254653816842';

// Only needed if using spectate, join, or ask to join
// DiscordRPC.register(clientId);

/** @type {DiscordRPC.Client} */
const rpc: DiscordRPC.Client = new DiscordRPC.Client({ transport: 'ipc' });

/** @type {string} */
const nexusBaseURL: string = 'https://www.nexusmods.com';
/** @type {Record<string, number>} */
const gameToAppModID: Record<string, number> = {
    palworld: 2017,
    ff7rebirth: 69,
    'stellar-blade': 206,
};

/** @type {number} 30,000 */
const UPDATE_FREQ: number = 30e3; //15e3;
/** @type {number} 900,000 */
const REATTEMPT_FREQ: number = 15 * 60e3; // every 15 minutes:

/** @type {Date | undefined} */
let startTimestamp: Date | undefined;

/** @type {DiscordRpc} */
export default {
    started: false,
    paused: false,
    handle: undefined,
    isset: false,
    available(): boolean {
        /** @type {string} */
        let ipcPath: string = `\\\\?\\pipe\\discord-ipc-0`;
        if (platform !== 'win32') {
            ipcPath = `${env['XDG_RUNTIME_DIR'] || '/tmp'}/discord-ipc-0`;
        }
        return existsSync(ipcPath);
    },
    start(): void {
        // const available = this.available();
        // console.log('Starting Discord RPC:', available);
        // if (!available) return;
        rpc.login({ clientId })
            .then(() => {
                console.log('Discord RPC connected');
                startTimestamp = new Date();
                this.started = true;
                this.paused = false;
                this.handle = setInterval((): void => {
                    void this.update();
                }, UPDATE_FREQ);
                void this.update();
            })
            .catch((error?: unknown): void => {
                console.error('Discord RPC error:', error);
                setTimeout((): void => this.start(), REATTEMPT_FREQ); // re-attempt connection
            });
    },
    stop(): void {
        if (!this.started) return;
        if (!this.handle) return;
        clearInterval(this.handle);
        this.started = false;
        this.paused = false;
        void rpc.destroy();
    },
    pause(): void {
        if (!this.started) return;
        if (this.paused) return;
        this.paused = true;
        void rpc.clearActivity();
        console.log('Paused Discord RPC');
    },
    unpause(): void {
        if (!this.paused) return;
        if (!this.started) this.start();
        startTimestamp = new Date();
        this.paused = false;
        // this.update();
        console.log('Unpaused Discord RPC');
    },
    async update(): Promise<void> {
        if (!rpc) return;
        if (!this.started) return;
        if (this.paused) return;

        /** @type {boolean} */
        const allowRPC: boolean = DEAP.datastore?.get('allow-rpc') === true;
        if (!allowRPC && this.isset) return void rpc.clearActivity();
        if (!allowRPC) return;

        // console.log('Updating Discord RPC');

        // const playtime = new Date() - startTimestamp;
        // const minutes = Math.floor(playtime / 60000);
        /** @type {number} */
        const maxLen: number = 23;
        /** @type {string | undefined} */
        const gameData: string | undefined = DEAP.datastore?.get('games.active');
        type KeyOfLocalizationGames = keyof ValueOf<Locale, 'games'>;
        /** @type {keyof Locale['games']} */
        const gameName: KeyOfLocalizationGames = (
            gameData ? gameData.split('.')?.[0] || 'unknown' : 'unknown'
        ) as KeyOfLocalizationGames;
        // prettier-ignore
        type LocalGameName = keyof LocaleGameNameKeyPair | KeyOfLocalizationGames; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        /** @type {string} */
        const localGameName: LocalGameName = (localization.games?.[gameName]?.name || gameName) as LocalGameName;
        /** @type {number} */
        const nameLen: number = localGameName.length;
        /** @type {string} */
        const details: string = nameLen > maxLen ? `Managing Game Mods For:` : `Managing Mods`;
        /** @type {string} */
        const state: string = nameLen > maxLen ? localGameName : `For: ${localGameName}`;
        /** @type {string} */
        const largeImageText: string = `Mod Hub: The ultimate mod manager for Unreal Engine games!`;
        /** @type {string} */
        const largeImageKey: string = 'app-icon';

        /** @type {[{ label: string; url: string }] | undefined} */
        let buttons: [{ label: string; url: string }] | undefined = undefined;
        /** @type {number | undefined} */
        const nexusAppModID: number | undefined = gameToAppModID[gameName];
        if (nexusAppModID) {
            /** @type {string} */
            const url: string = `${nexusBaseURL}/${gameName}/mods/${nexusAppModID}`;
            buttons = [{ label: 'Get The Mod Hub App', url }];
        }

        // NOTE: need to have any used image assets uploaded to
        // https://discord.com/developers/applications/<application_id>/rich-presence/assets
        await rpc.setActivity({
            details,
            state,
            startTimestamp,
            largeImageKey,
            largeImageText,
            instance: true,
            buttons,
            // state?: string | undefined;
            // details?: string | undefined;
            // startTimestamp?: number | Date | undefined;
            // endTimestamp?: number | Date | undefined;
            // largeImageKey?: string | undefined;
            // largeImageText?: string | undefined;
            // smallImageKey?: string | undefined;
            // smallImageText?: string | undefined;
            // instance?: boolean | undefined;
            // partyId?: string | undefined;
            // partySize?: number | undefined;
            // partyMax?: number | undefined;
            // matchSecret?: string | undefined;
            // spectateSecret?: string | undefined;
            // joinSecret?: string | undefined;
            // buttons?: Array<{ label: string; url: string }> | undefined;
        });
        this.isset = true;
    },
} as DiscordRpc;
