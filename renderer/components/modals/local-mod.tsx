/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

// import DekCheckbox from '@components/core/dek-checkbox';
// import DekChoice from '@components/core/dek-choice';
import DekDiv from '@components/core/dek-div';
import type { FileTreeEntry } from '@components/core/dek-filetree';
import DekFileTree from '@components/core/dek-filetree';
import DekItem from '@components/core/dek-item';
import DekSelect from '@components/core/dek-select';
import DekCommonAppModal, { type DekCommonAppModalProps } from '@components/core/modal';
import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
import useActiveGame from '@hooks/use-active-game';
import useAppLogger from '@hooks/use-app-logger';
import type { GameInformation } from '@hooks/use-common-checks';
import useCommonChecks, { handleError } from '@hooks/use-common-checks';
import useLocalization from '@hooks/use-localization';
import type { ArchiveEntry } from '@main/dek/archive-handler';
import type { TypeFunctionWithArgs } from '@typed/common';
import type { FileInfo, IModInfoWithSavedConfig, LocalModConfig, ModConfig } from '@typed/palhub';
// import { webUtils } from 'electron';
import type {
    ChangeEvent,
    Dispatch,
    DragEvent,
    DragEventHandler,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    ReactNode,
    SetStateAction,
} from 'react';
import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

function buildFileTree(entries: ArchiveEntry[]): FileTreeEntry {
    const root: FileTreeEntry = { name: 'root', path: '', type: 'directory', children: [] as FileTreeEntry[] };

    for (const entry of entries) {
        if (entry.outputPath) {
            const parts: string[] = entry.outputPath.split('/').filter(Boolean); // Split and remove empty parts
            let currentNode: FileTreeEntry = root;

            for (const [index, part] of parts.map((value: string, index: number): [index: number, part: string] => [
                index,
                value,
            ])) {
                let childNode: FileTreeEntry | undefined = currentNode.children?.find(
                    (child: FileTreeEntry): boolean => child.name === part
                );

                if (!childNode) {
                    childNode = {
                        name: part,
                        type: index === parts.length - 1 && !entry.isDirectory ? 'file' : 'directory',
                    } as FileTreeEntry;

                    if (childNode.type === 'file') {
                        childNode.size = entry.size;
                    } else {
                        childNode.children = [];
                    }

                    currentNode.children?.push(childNode);
                }

                currentNode = childNode;
            }
        }
    }

    return root;
}

// switch (installType) {
//     case 0: forcedRoot = `${commonAppData?.selectedGame?.unreal_root}/`; break;
//     case 1: forcedRoot = `Binaries/`; break;
//     case 2: forcedRoot = `Mods/`; break;
//     case 3: forcedRoot = `Content/`; break;
//     case 4: forcedRoot = `Paks/`; break;
//     case 5: forcedRoot = `LogicMods/`; break;
//     case 6: forcedRoot = `~mods/`; break;
// }
function getInstallTypeFromRoot(root: string): number {
    switch (root) {
        case 'Binaries/':
            return 1;
        case 'Mods/':
            return 2;
        case 'Content/':
            return 3;
        case 'Paks/':
            return 4;
        case 'LogicMods/':
            return 5;
        case '~mods/':
            return 6;
        default:
            return 0;
    }
}

type AddLocalModModalPropsModType = Pick<
    IModInfoWithSavedConfig,
    | 'root'
    | 'version'
    | 'file_id'
    | 'file_name'
    | 'entries'
    | 'local'
    | 'author'
    | 'description'
    | 'thumbnail'
    | 'name'
    | 'mod_id'
>;

export declare interface AddLocalModModalProps {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>> | TypeFunctionWithArgs<[show: boolean], boolean>;
    refreshModList: VoidFunction;
    initialModData?: AddLocalModModalPropsModType | null | undefined;
}

export default function AddLocalModModal({
    show,
    setShow,
    refreshModList,
    initialModData = {
        root: '',
        mod_id: '',
        version: '',
        file_id: 'local',
        file_name: '',
        entries: [],
        local: true,
        author: '',
        description: '',
        thumbnail: '',
    },
}: AddLocalModModalProps): ReactElement<AddLocalModModalProps> {
    console.log('initialModData:', initialModData);
    const applog = useAppLogger('AddLocalModModal');
    const onCancel: VoidFunction = useCallback((): void => {
        setShow(false);
        refreshModList();
    }, [setShow, refreshModList]);
    const { requiredModulesLoaded: _requiredModulesLoaded, commonAppData } = useCommonChecks();
    const [modName, setModName] = useState<string>('');
    const [modVersion, setModVersion] = useState<string>('');
    const [modAuthor, setModAuthor] = useState<string>('');
    const [modDescription, setModDescription] = useState<string>('');
    const [modThumbnail, setModThumbnail] = useState<string>('');
    const [fileID, setFileID] = useState<string | number>('local');
    const [modID, setModID] = useState<string>('');
    const [installType, setInstallType] = useState<number>(0);

    // const api_key = commonAppData?.apis?.nexus;
    const game_path: string | undefined = commonAppData?.selectedGame?.path;

    const { activeGame } = useActiveGame();
    const { t, tA: _tA } = useLocalization();
    const game: GameInformation | undefined = activeGame;
    // const game = commonAppData?.selectedGame;

    const [filetree, setFiletree] = useState<FileTreeEntry | null>(null);
    const [droppedFile, setDroppedFile] = useState<FileInfo | null>(null);

    const handleDragOver: DragEventHandler<HTMLDivElement> = useCallback((e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop: DragEventHandler<HTMLDivElement> = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            if (!game_path) return;
            (async () => {
                const files: FileList = e.dataTransfer.files;
                if (files.length > 0) {
                    const newDroppedfile: FileInfo | undefined = files[0] as FileInfo | undefined; // Handle the first dropped file only
                    if (!newDroppedfile) return;
                    const filepath: string = window.ipc.getPathForFile(newDroppedfile);

                    const entries: ArchiveEntry[] = JSON.parse(
                        await window.palhub('getArchiveEntriesAsJSON', filepath)
                    ) as ArchiveEntry[];
                    const [install_path, ignored_files, entries2] = await window.palhub(
                        'determineInstallPath',
                        game_path,
                        entries
                    );
                    // format entries array to expected filetree structure;
                    const filetree: FileTreeEntry = buildFileTree(entries2);

                    console.log('Dropped file:', {
                        newDroppedfile,
                        filepath,
                        entries,
                        install_path,
                        ignored_files,
                        entries2,
                    });

                    newDroppedfile.install_path = install_path;
                    newDroppedfile.ignored_files = ignored_files;
                    newDroppedfile.path = filepath;
                    setDroppedFile(newDroppedfile);
                    setFiletree(filetree);
                    setModName(newDroppedfile.name);

                    let selectedInstallType = 0;
                    if (install_path === game_path) selectedInstallType = 0;
                    if (install_path.endsWith('Binaries')) selectedInstallType = 1;
                    if (install_path.endsWith('Win64')) selectedInstallType = 2;
                    if (install_path.endsWith('WinGDK')) selectedInstallType = 2;
                    if (install_path.endsWith('Content')) selectedInstallType = 3;
                    if (install_path.endsWith('Paks')) selectedInstallType = 4;
                    if (install_path.endsWith('LogicMods')) selectedInstallType = 5;
                    if (install_path.endsWith('~mods')) selectedInstallType = 6;
                    console.log('selectedInstallType:', selectedInstallType, install_path);
                    setInstallType(selectedInstallType);
                }
            })().catch((error: unknown) => handleError(error, applog));
        },
        [game_path]
    );

    const handleInstall: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e: MouseEvent<HTMLButtonElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            if (!droppedFile || !game_path) return;
            (async () => {
                // installMod(cache_path, game_path, mod, file)
                const filename: string | undefined = droppedFile.path.split(/[\\/]/).pop();
                if (!filename) return;
                const cachePath: string = droppedFile.path.replace(filename, '');
                const mod: Pick<IModInfoWithSavedConfig, 'version' | 'name' | 'mod_id'> = {
                    version: 'local',
                    name: modName,
                };
                const file: Pick<IModInfoWithSavedConfig, 'version' | 'file_name' | 'file_id'> = {
                    file_name: filename,
                    file_id: 'local',
                    version: modVersion,
                };

                let forcedRoot: string | undefined;
                switch (installType) {
                    case 0:
                        forcedRoot = `${commonAppData?.selectedGame?.unreal_root}/`;
                        break;
                    case 1:
                        forcedRoot = `Binaries/`;
                        break;
                    case 2:
                        forcedRoot = `Mods/`;
                        break;
                    case 3:
                        forcedRoot = `Content/`;
                        break;
                    case 4:
                        forcedRoot = `Paks/`;
                        break;
                    case 5:
                        forcedRoot = `LogicMods/`;
                        break;
                    case 6:
                        forcedRoot = `~mods/`;
                        break;
                }

                const extraJsonProps: Partial<LocalModConfig> = {
                    local: true,
                    author: modAuthor,
                    description: modDescription,
                    thumbnail: modThumbnail,
                };

                console.log('Installing mod:', { cachePath, filename, droppedFile, game_path, mod, file });
                await window.palhub(
                    'installMod',
                    cachePath,
                    game_path,
                    mod,
                    file,
                    true,
                    forcedRoot,
                    extraJsonProps as unknown as Partial<ModConfig>
                );
                onCancel();
            })().catch((error: unknown) => handleError(error, applog));
        },
        [
            droppedFile,
            game_path,
            modName,
            modVersion,
            modAuthor,
            modDescription,
            modID,
            fileID,
            installType,
            modThumbnail,
            onCancel,
        ]
    );

    const handleUnInstall: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e: MouseEvent<HTMLButtonElement>): void => {
            e.preventDefault();
            e.stopPropagation();
            if (!game_path || !initialModData) return;
            console.log('Uninstalling mod:', { game_path, initialModData });
            (async (): Promise<void> => {
                await window.palhub('uninstallMod', game_path, initialModData, undefined, true);
                onCancel();
            })().catch((error: unknown) => handleError(error, applog));
        },
        [game_path, initialModData]
    );

    useEffect((): void => {
        if (show && initialModData) {
            setModName(initialModData?.file_name || '');
            setModVersion(initialModData?.version || '');
            setModAuthor(initialModData?.author || '');
            setModDescription(initialModData?.description || '');
            setModThumbnail(initialModData?.thumbnail || '');
            setFileID(initialModData?.file_id || 'local');
            setModID(initialModData?.mod_id?.toString() || '');
            setInstallType(getInstallTypeFromRoot(initialModData?.root || ''));
        } else {
            setModName('');
            setModVersion('');
            setModAuthor('');
            setModDescription('');
            setModThumbnail('');
            setFileID('local');
            setModID('');
            setInstallType(0);
            setDroppedFile(null);
            setFiletree(null);
        }
    }, [show]);

    const headerText: string = t('modals.local-mod.head', { game });
    const modalOptions: DekCommonAppModalProps = { show, setShow, onCancel, headerText, showX: true };

    const canInstall: boolean = !!droppedFile && !!modName && !!modVersion && !!modAuthor && !!modDescription; // && modID && fileID
    const canUnInstall: boolean = !!initialModData?.root;
    const hasFileData: boolean = !!droppedFile || !!modName;

    return (
        <DekCommonAppModal {...modalOptions}>
            <DekDiv type="DekBody" className="d-grid p-3 px-4 text-center" onDragOver={handleDragOver} onDrop={handleDrop}>
                {
                    <div
                        className="overflow-y-auto"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                            width: '100%',
                            height: '240px',
                            border: '2px dashed var(--dek-info-normal)',
                            display: 'flex',
                            justifyContent: droppedFile ? 'flex-start' : 'center',
                            alignItems: droppedFile ? 'flex-start' : 'center',
                        }}
                    >
                        {droppedFile && (
                            <div className="text-start w-100 px-3 py-2">
                                <p className="mb-0">{t('common.filetree', { droppedFile })}</p>
                                <DekFileTree data={filetree} />
                            </div>
                        )}

                        {!droppedFile && (
                            <div>
                                <p>{t('/mods.drop-zip')}</p>
                            </div>
                        )}
                    </div>
                }

                {hasFileData && (
                    <div className="text-start">
                        <div className="row">
                            <div className="col-6">
                                <ENVEntry
                                    disabled={!!initialModData?.file_name}
                                    value={modName}
                                    onClick={(): void => {}}
                                    updateSetting={(_name: string, value: string): void => setModName(value)}
                                    name={t('/mods.mod_name')}
                                    tooltip={t('/mods.mod_name')}
                                />
                            </div>
                            <div className="col-6 pt-2">
                                <ENVEntryLabel name={t('/mods.mod_type')} tooltip={t('/mods.mod_type')} />
                                <DekSelect
                                    active_id={installType}
                                    onChange={(
                                        _event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>,
                                        _nodes: ReactNode | ReactNode[] | string | undefined,
                                        _text: string | null,
                                        index: number
                                    ): void => setInstallType(index)}
                                    disableInput={!!initialModData?.root}
                                >
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Binaries`} />
                                    <DekItem
                                        text={`${commonAppData?.selectedGame?.unreal_root}/Binaries/Win64 {WinGDK for GamePass}`}
                                    />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks/LogicMods`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks/~mods`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Movies`} />
                                    <DekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Splash`} />
                                </DekSelect>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-3">
                                <ENVEntry
                                    disabled={!!initialModData?.version}
                                    value={modVersion}
                                    onClick={() => {}}
                                    updateSetting={(_name: string, value: string): void => setModVersion(value)}
                                    name={t('/mods.mod_version')}
                                    tooltip={t('/mods.mod_version')}
                                />
                            </div>
                            {/* <div className="col-3">
                        <ENVEntry
                            value={modID}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModID(value)}
                            name={t('/mods.mod_id')}
                            tooltip={t('/mods.mod_id')}
                        />
                    </div>
                    <div className="col-3">
                        <ENVEntry
                            value={fileID}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setFileID(value)}
                            name={t('/mods.file_id')}
                            tooltip={t('/mods.file_id')}
                        />
                    </div> */}
                            <div className="col-3">
                                <ENVEntry
                                    disabled={!!initialModData?.author}
                                    value={modAuthor}
                                    onClick={(): void => {}}
                                    updateSetting={(_name: string, value: string): void => setModAuthor(value)}
                                    name={t('/mods.mod_author')}
                                    tooltip={t('/mods.mod_author')}
                                />
                            </div>
                            <div className="col-6">
                                <ENVEntry
                                    disabled={!!initialModData?.thumbnail}
                                    value={modThumbnail}
                                    onClick={(): void => {}}
                                    updateSetting={(_name: string, value: string): void => setModThumbnail(value)}
                                    name={t('/mods.thumbnail')}
                                    tooltip={t('/mods.thumbnail')}
                                />
                            </div>
                        </div>

                        <ENVEntryLabel name={t('/mods.mod_desc')} tooltip={t('/mods.mod_desc')} />
                        <textarea
                            disabled={!!initialModData?.description}
                            className="form-control form-control-sm form-secondary mb-3"
                            value={modDescription}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                                setModDescription(event.target.value)
                            }
                            // disabled={pinConnected}
                            style={{
                                minHeight: '5rem',
                                // resize: 'none'
                            }}
                        />

                        {initialModData?.root && (
                            <Button variant="danger" className="w-100" disabled={!canUnInstall} onClick={handleUnInstall}>
                                <strong>{t('modals.mod-details.uninstall')}</strong>
                            </Button>
                        )}

                        {!initialModData?.root && (
                            <Button variant="success" className="w-100" disabled={!canInstall} onClick={handleInstall}>
                                <strong>{t('/mods.install-zip')}</strong>
                            </Button>
                        )}
                    </div>
                )}
            </DekDiv>
            {/* <div type="DekFoot" className='d-flex w-100 gap-3'>
            <Button
                variant='danger'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCancel}>
                <strong>{t('common.cancel')}</strong>
            </Button>
            <Button
                variant='success'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCancel}>
                <strong>{t('common.confirm')}</strong>
            </Button>
        </div> */}
        </DekCommonAppModal>
    );
}
