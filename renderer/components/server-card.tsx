/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// InputComponent.js
import type { ServerDetailsMods } from '@components/modals/server-details';
import type { CommonIcon } from '@config/common-icons';
import * as CommonIcons from '@config/common-icons';
import type { UseLocalizationReturn } from '@hooks/use-localization';
import useLocalization from '@hooks/use-localization';
import type { VoidFunctionWithArgs } from '@typed/common';
import DOMPurify from 'dompurify';
// import Image from 'next/image';
// import Link from 'next/link';
import type { ReactElement } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
// import { SphereSpinner } from 'react-spinners-kit';

export declare interface ServerListing {
    /*
     * Difficulty preset.
     */
    // TODO: Properly document this.
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'Custom';
    /*
     * Day time speed
     * Number type: float
     */
    dayTimeSpeedRate: number;
    /*
     * Night time speed
     * Number type: float
     */
    nightTimeSpeedRate: number;
    /*
     * EXP rate
     * Number type: float
     */
    expRate: number;
    /*
     * Pal capture rate
     * Number type: float
     */
    palCaptureRate: number;
    /*
     * Pal Appearance Rate
     * *Note: Affects game performance
     * Number type: float
     */
    palSpawnNumRate: number;
    /*
     * Damage from Pals Multiplier
     * Number type: float
     */
    palDamageRateAttack: number;
    /*
     * Damage to Pals Multiplier
     * Number type: float
     */
    palDamageRateDefense: number;
    /*
     * Damage from Player Multiplier
     * Number type: float
     */
    playerDamageRateAttack: number;
    /*
     * Damage to Player Multiplier
     * Number type: float
     */
    playerDamageRateDefense: number;
    /*
     * Player Hunger Depletion Rate
     * Number type: float
     */
    playerStomachDecreaceRate: number;
    /*
     * Player Stamina Reduction Rate
     * Number type: float
     */
    playerStaminaDecreaceRate: number;
    /*
     * Player Auto Health Regeneration Rate
     * Number type: float
     */
    playerAutoHPRegeneRate: number;
    /*
     * Player Sleep Health Regeneration Rate
     * Number type: float
     */
    playerAutoHpRegeneRateInSleep: number;
    /*
     * Pal Hunger Depletion Rate
     * Number type: float
     */
    palStomachDecreaceRate: number;
    /*
     * Pal Stamina Reduction Rate
     * Number type: float
     */
    palStaminaDecreaceRate: number;
    /*
     * Pal Auto Health Regeneration Rate
     * Number type: float
     */
    palAutoHPRegeneRate: number;
    /*
     * Pal Sleep Health Regeneration Rate (Health Regeneration Rate in Palbox)
     * Number type: float
     */
    palAutoHpRegeneRateInSleep: number;
    /*
     * Damage to Structure Multiplier
     * Number type: float
     */
    buildObjectDamageRate: number;
    /*
     * Structure Deterioration Rate
     * Number type: float
     */
    buildObjectDeteriorationDamageRate: number;
    /*
     * Gatherable Items Multiplier
     * Number type: float
     */
    collectionDropRate: number;
    /*
     * Gatherable Objects Health Multiplier
     * Number type: float
     */
    collectionObjectHpRate: number;
    /*
     * Gatherable Objects Respawn Interval
     * Number type: float
     */
    collectionObjectRespawnSpeedRate: number;
    /*
     * Dropped Items Multiplier
     * Number type: float
     */
    enemyDropItemRate: number;
    /*
     * Death Penalty
     * None : No drops
     * Item : Drop all items except equipment
     * ItemAndEquipment : Drop all items
     * All : Drop all items and all Pals on team
     */
    deathPenalty: 'None' | 'Item' | 'ItemAndEquipment' | 'All';
    /*
     * Enable PvP
     */
    bEnablePlayerToPlayerDamage: boolean;
    /*
     * Enable PvP amongst allies
     */
    bEnableFriendlyFire: boolean;
    /*
     * Enable Invader
     */
    bEnableInvaderEnemy: boolean;
    /*
     * Enable unknown feature
     */
    // TODO: Document this.
    bActiveUNKO: boolean;
    /*
     * Enable aim assisted pad for clients with controllers.
     */
    // TODO: Properly document this.
    bEnableAimAssistPad: boolean;
    /*
     * Enable aim assisted pad for clients with keyboards.
     */
    // TODO: Properly document this.
    bEnableAimAssistKeyboard: boolean;
    /*
     * Maximum amount of dropped items.
     * Number type: interger
     */
    // TODO: Properly document this.
    dropItemMaxNum: number;
    /*
     * Maximum amount of dropped items. Unknown
     * Number type: interger
     */
    // TODO: Properly document this.
    dropItemMaxNum_UNKO: number;
    /*
     * Maximum amount base camps
     * Number type: interger
     */
    // TODO: Properly document this.
    baseCampMaxNum: number;
    /*
     * Max pals per basecamp (<= 50)
     * Number type: interger
     * Larger value will increase system load
     */
    baseCampWorkerMaxNum: number;
    /*
     * Maximum amount of time dropped items will exist for.
     * Number type: interger
     */
    // TODO: Properly document this.
    dropItemAliveMaxHours: number;
    /*
     * Enable auto resetting a guild with no online players
     */
    // TODO: Properly document this.
    bAutoResetGuildNoOnlinePlayers: boolean;
    /*
     * Maximum amount of time to reset a guild with no online players.
     * Number type: interger
     */
    // TODO: Properly document this.
    autoResetGuildTimeNoOnlinePlayers: number;
    /*
     * Max Player Number of Guilds
     * Number type: interger
     */
    guildPlayerMaxNum: number;
    /*
     * Maximum amount base camps in a guild
     * Number type: interger
     * Default is 4 (<= 10)
     * Larger value will increase system load
     */
    baseCampMaxNumInGuild: number;
    /*
     * Time (h) to incubate Massive Egg.
     * Note: Other eggs also require time to incubate.
     * Number type: interger
     */
    palEggDefaultHatchingTime: number;
    /*
     * The workspeed rate of pals in a base.
     * Number type: float
     */
    // TODO: Properly document this.
    workSpeedRate: number;
    /*
     * The amount of time in minutes to auto save.
     * Number type: interger
     */
    // TODO: Properly document this.
    autoSaveSpan: number;
    /*
     * Enable cross platform users.
     */
    // TODO: Properly document this.
    bIsMultiplay: boolean;
    /*
     * Enable PvP
     */
    // TODO: Properly document this.
    bIsPvP: boolean;
    /*
     * Enable players to pickup other guild's dropped items/equipment.
     */
    // TODO: Properly document this.
    bCanPickupOtherGuildDeathPenaltyDrop: boolean;
    /*
     * Enable a penalty if players don't log in after some time.
     */
    // TODO: Properly document this.
    bEnableNonLoginPenalty: boolean;
    /*
     * Enable or disable fast travel
     */
    // TODO: Properly document this.
    bEnableFastTravel: boolean;
    /*
     * Enable or disable players to choose a starting location
     */
    // TODO: Properly document this.
    bIsStartLocationSelectByMap: boolean;
    /*
     * Enable or disable players to exist in the world after being logged out.
     */
    // TODO: Properly document this.
    bExistPlayerAfterLogout: boolean;
    /*
     * Enable or disable players to defend eachother's guild players
     */
    // TODO: Properly document this.
    bEnableDefenseOtherGuildPlayer: boolean;
    /*
     * Enable or disable players to not see other guild's base's area effects
     */
    // TODO: Properly document this.
    bInvisibleOtherGuildBaseCampAreaFX: boolean;
    /*
     * Maximum number of players that can join the co-op game.
     */
    // TODO: Properly document this.
    coopPlayerMaxNum: number;
    /*
     * Maximum number of players that can join the server
     */
    // TODO: Properly document this.
    serverPlayerMaxNum: number;
    /*
     * Server name
     */
    serverName: string;
    /*
     * Server description
     */
    serverDescription: string;
    /*
     * Password used to obtain administrative privileges on the server.
     */
    adminPassword: string;
    /*
     * Password required for server login
     */
    serverPassword: string;
    /*
     * Explicitly specify the external public port in the community server configuration.
     * *Note: This setting does not change the server's listen port.
     */
    publicPort: number;
    /*
     * Explicitly specify an external public IP in the community server settings
     */
    publicIP: string;
    /*
     * Enable RCON
     */
    rCONEnabled: boolean;
    /*
     * Port Number for RCON
     */
    rCONPort: number;
    /*
     * Region the server is in.
     */
    region: string;
    /*
     * Enable authentication to join the server
     */
    bUseAuth: boolean;
    /*
     * Url for list of banned users.
     */
    banListURL: string;
    /*
     * Enable REST API
     */
    rESTAPIEnabled: boolean;
    /*
     * Listen port for REST API
     */
    rESTAPIPort: number;
    /*
     * Enable player list when the press ESC key
     */
    bShowPlayerList: boolean;
    /*
     * Doesn't work with this version. Please use crossplayPlatforms
     */
    allowConnectPlatform: string;
    /*
     * Allowed platform to connect the server.
     * Default: (Steam,Xbox,PS5,Mac)
     */
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    crossplayPlatforms: string | 'Steam' | 'Xbox' | 'PS5' | 'Mac';
    /*
     * Enable world backup
     * Disk load will be increase when enabled.
     */
    bIsUseBackupSaveData: boolean;
    /*
     * Log format Text or Json
     */
    logFormatType: string;
    /*
     * Interval for supply drop (minutes)
     */
    supplyDropSpan: number;
    /*
     * Developer boolean.
     */
    DekitaWasHere: boolean;
    /*
     * The server version.
     */
    gameVersion: string;
    /*
     * Associated discord server's id.
     */
    discordServerID: string;
    /*
     * URL for the splash image of the server.
     */
    splashURL: string;
    /*
     * Count of the players on the server.
     */
    playerCount: number;
    /*
     * FPS of the server.
     */
    fps: number;
    /*
     * Mods of the server.
     */
    mods?: ServerDetailsMods;
    longServerDescription?: string;
    serverURL?: string;
    discordURL?: string;
    palhubServerURL?: string;
}

const DEFAULT_EXAMPLE_SERVER_LISTING: ServerListing = {
    difficulty: 'Normal',
    dayTimeSpeedRate: 1,
    nightTimeSpeedRate: 1,
    expRate: 1,
    palCaptureRate: 1,
    palSpawnNumRate: 1,
    palDamageRateAttack: 1,
    palDamageRateDefense: 1,
    playerDamageRateAttack: 1,
    playerDamageRateDefense: 1,
    playerStomachDecreaceRate: 1,
    playerStaminaDecreaceRate: 1,
    playerAutoHPRegeneRate: 1,
    playerAutoHpRegeneRateInSleep: 1,
    palStomachDecreaceRate: 1,
    palStaminaDecreaceRate: 1,
    palAutoHPRegeneRate: 1,
    palAutoHpRegeneRateInSleep: 1,
    buildObjectDamageRate: 1,
    buildObjectDeteriorationDamageRate: 1,
    collectionDropRate: 1,
    collectionObjectHpRate: 1,
    collectionObjectRespawnSpeedRate: 1,
    enemyDropItemRate: 1,
    deathPenalty: 'ItemAndEquipment',
    bEnablePlayerToPlayerDamage: false,
    bEnableFriendlyFire: false,
    bEnableInvaderEnemy: true,
    bActiveUNKO: false,
    bEnableAimAssistPad: true,
    bEnableAimAssistKeyboard: false,
    dropItemMaxNum: 3000,
    dropItemMaxNum_UNKO: 100,
    baseCampMaxNum: 128,
    baseCampWorkerMaxNum: 15,
    dropItemAliveMaxHours: 1,
    bAutoResetGuildNoOnlinePlayers: false,
    autoResetGuildTimeNoOnlinePlayers: 72,
    guildPlayerMaxNum: 20,
    baseCampMaxNumInGuild: 4,
    palEggDefaultHatchingTime: 72,
    workSpeedRate: 1,
    autoSaveSpan: 30,
    bIsMultiplay: false,
    bIsPvP: false,
    crossplayPlatforms: 'Steam,Xbox,PS5,Mac',
    bCanPickupOtherGuildDeathPenaltyDrop: false,
    bEnableNonLoginPenalty: true,
    bEnableFastTravel: true,
    bIsStartLocationSelectByMap: true,
    bExistPlayerAfterLogout: false,
    bEnableDefenseOtherGuildPlayer: false,
    bInvisibleOtherGuildBaseCampAreaFX: false,
    coopPlayerMaxNum: 4,
    serverPlayerMaxNum: 32,
    serverName: 'Default Palworld Server',
    serverDescription: '',
    adminPassword: false as unknown as string,
    serverPassword: false as unknown as string,
    publicPort: 8211,
    publicIP: '',
    rCONEnabled: false,
    rCONPort: 25575,
    region: '',
    bUseAuth: true,
    banListURL: 'https://api.palworldgame.com/api/banlist.txt',
    rESTAPIEnabled: false,
    rESTAPIPort: 8212,
    bShowPlayerList: false,
    allowConnectPlatform: 'Steam',
    bIsUseBackupSaveData: true,
    logFormatType: 'Text',
    supplyDropSpan: 180,
    DekitaWasHere: true,
    gameVersion: 'v0.3.4.56710',
    discordServerID: 'https://discord.gg/8Z8ZzZ8Z8Z',
    splashURL: 'https://staticdelivery.nexusmods.com/mods/6063/images/1313/1313-1712987634-744711640.png',
    playerCount: 0,
    fps: 60,
};

export declare interface ServerCardComponentProps {
    server: ServerListing;
    onClick?: VoidFunctionWithArgs<[server: ServerListing]>;
    ad?: boolean;
}

export default function ServerCardComponent({
    server,
    onClick = (): void => {},
    ad = false,
}: ServerCardComponentProps): ReactElement<ServerCardComponentProps> {
    if (!server) server = DEFAULT_EXAMPLE_SERVER_LISTING;

    const { t /* , tA */ }: UseLocalizationReturn = useLocalization();
    const IconComponent: CommonIcon = CommonIcons.star;
    const realOnClick: VoidFunction = (): void => onClick(server);

    return (
        <Col xs={12} md={6} lg={4} xl={3} className="mb-2" onClick={realOnClick}>
            <Card className="theme-border chartcard cursor-pointer">
                <Card.Body className="text-start p-0">
                    <Card.Title className="p-1">
                        <div className="ratio ratio-16x9">
                            <Image src={server.splashURL} alt={server.serverName} fluid thumbnail />
                        </div>
                        {/* {(
                            <div className="modcard">
                                <div className="p-0">
                                    <span className="alert bg-info px-1 py-0">{server.allowConnectPlatform}</span>
                                </div>
                            </div>
                        )} */}
                        {ad && (
                            <div className="modcard">
                                <IconComponent fill="currentColor" className="modicon" />
                            </div>
                        )}
                    </Card.Title>

                    <div className="anal-cavity px-2">
                        <p className="text-secondary mb-0 font-bold truncate">{server.serverName ?? 'n/a'}</p>
                        <small className="text-dark">
                            <small>
                                <div className="d-flex">
                                    <div className="col">{server.gameVersion}</div>
                                    <div className="col text-center">{server.allowConnectPlatform.toUpperCase()}</div>
                                    <div className="col text-end">
                                        {/* <CommonIcons.account fill='currentColor' height="0.9rem" /> */}
                                        <span className="ps-1">{t('/servers.players', { server })}</span>
                                    </div>
                                </div>
                            </small>
                        </small>

                        {/* <Link href={server.uploaded_users_profile_url} target='_blank' className='hover-dark'>{server.uploaded_by}</Link> */}
                        <div
                            className="text-white"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(server.serverDescription) }}
                        ></div>
                        {/* <div className='badge bg-info m-1'>{server.allowConnectPlatform}</div> */}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );

    // return (
    //     <div className="col-3">
    //         <div className="flex items-center">
    //             <Image src={mod.picture} alt={mod.name} fluid />
    //         </div>
    //         <div className="ml-4">
    //             <h2 className="text-xl font-semibold text-gray-800">{mod.name}</h2>
    //             <p className="text-gray-500">{mod.author}</p>
    //         </div>
    //         <p className="text-gray-600 mt-2">{mod.summary}</p>
    //         <div className="mt-4">
    //             <a href="#" className="text-blue-600 hover:underline">
    //                 Read More
    //             </a>
    //         </div>
    //     </div>
    // );
}
