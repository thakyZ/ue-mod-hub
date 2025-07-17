/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
* Handles zip/rar archives
*/
// import { app } from "electron";
import { EventEmitter } from 'node:events';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Stream } from 'node:stream';

// import SevenZip from '7zip-min';
import type { SevenZipEntry } from '@main/dek/7zip-min-override';
import SevenZip from '@main/dek/7zip-min-override';
import DEAP from '@main/dek/deap';
import type { PromiseReject, PromiseResolve, PromiseTypeFunction } from '@typed/common';
import type { IZipEntry } from 'adm-zip';
import AdmZip from 'adm-zip'; // for de-zip
import type { ArcFile, ArcFiles, Extractor } from 'node-unrar-js';
import { createExtractorFromData } from 'node-unrar-js'; // for de-rar

export declare type ArchiveEntryData =
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
    | Stream;
export declare interface ArchiveEntry {
    entryName: string;
    outputPath?: string;
    isDirectory: boolean;
    size: number;
    getData: PromiseTypeFunction<Awaited<ArchiveEntryData>>;
}

// eslint-disable-next-line unicorn/prefer-event-target
class ArchiveHandler extends EventEmitter {
    /** @type {string} */
    filePath: string;
    /** @type {string} */
    extension: string;
    /** @type {ArchiveEntry[]} */
    entries: ArchiveEntry[];

    /** @param {string} filePath */
    constructor(filePath: string) {
        super();
        /** @type {string} */
        this.filePath = filePath;
        /** @type {string} */
        this.extension = path.extname(filePath).toLowerCase();
        /** @type {ArchiveEntry[]} */
        this.entries = [];
    }

    /** @returns {Promise<void>} */
    async _loadEntries(): Promise<void> {
        try {
            switch (this.extension) {
                case '.zip':
                    this._loadZipEntries();
                    break;
                case '.rar':
                    await this._loadRarEntries();
                    break;
                case '.7z':
                    await this._load7zEntries();
                    break;
                default:
                    throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error(error);
        }
    }

    /** @returns {void} */
    _loadZipEntries(): void {
        /** @type {AdmZip} */
        const zip: AdmZip = new AdmZip(this.filePath);
        // this.entries = zip.getEntries().map(entry => ({
        //     entryName: entry.entryName,
        //     isDirectory: entry.isDirectory,
        //     size: entry.header.size,
        //     getData: () => entry.getData(),
        // }));

        // Initialize a set to track all directories
        /** @type {Set<string>} */
        const directories: Set<string> = new Set();

        // Map entries and infer directories from file paths
        this.entries = zip.getEntries().map((entry: IZipEntry): ArchiveEntry => {
            /** @type {string} */
            const entryName: string = entry.entryName;

            // Add parent directories for each entry
            /** @type {string[]} */
            const parts: string[] = entryName.split('/');
            for (let i: number = 1; i < parts.length; i++) {
                directories.add(parts.slice(0, i).join('/') + '/');
            }

            return {
                entryName: entryName,
                isDirectory: entry.isDirectory,
                size: entry.header.size,
                // eslint-disable-next-line @typescript-eslint/require-await
                getData: async (): Promise<Buffer<ArrayBufferLike>> => entry.getData(),
            };
        });

        // Add explicit directory entries
        for (const dir of directories) {
            if (this.entries.some((e: ArchiveEntry): boolean => e.entryName === dir)) continue;
            this.entries.push({
                entryName: dir,
                isDirectory: true,
                size: 0,
                // eslint-disable-next-line @typescript-eslint/require-await
                getData: async (): Promise<Buffer<ArrayBuffer>> => Buffer.alloc(0), // Empty data for directories
            });
        }

        // Sort entries for consistent order (optional)
        this.entries.sort((a: ArchiveEntry, b: ArchiveEntry): number => a.entryName.localeCompare(b.entryName));
    }

    // https://www.npmjs.com/package/node-unrar-js
    /** @returns {Promise<void>} */
    async _loadRarEntries(): Promise<void> {
        /** @type {Buffer<ArrayBufferLike>} */
        const filedata: Buffer<ArrayBufferLike> = await readFile(this.filePath);
        /** @type {ArrayBuffer} */
        const buffer: ArrayBuffer = Uint8Array.from(filedata).buffer;
        /** @type {Extractor<Uint8Array>} */
        const extractor: Extractor<Uint8Array> = await createExtractorFromData({ data: buffer });
        // const list = extractor.getFileList();
        // const listArcHeader = list.arcHeader; // archive header
        // const fileHeaders = [...list.fileHeaders]; // load the file headers
        /** @type {ArcFiles<Uint8Array<ArrayBufferLike>>} */
        const extracted: ArcFiles<Uint8Array<ArrayBufferLike>> = extractor.extract();
        /** @type {ArcFile<Uint8Array<ArrayBufferLike>>[]} */
        const files: ArcFile<Uint8Array<ArrayBufferLike>>[] = [...extracted.files]; //load the files

        this.entries = files.map(
            (entry: ArcFile<Uint8Array<ArrayBufferLike>>): ArchiveEntry => ({
                entryName: entry.fileHeader.name,
                isDirectory: entry.fileHeader.flags.directory,
                size: entry.fileHeader.unpSize,
                // eslint-disable-next-line @typescript-eslint/require-await
                getData: async (): Promise<Uint8Array<ArrayBufferLike>> => {
                    if (!entry.extraction) throw new Error('No extraction data found.');
                    return entry.extraction;
                },
            })
        );
    }

    /** @returns {Promise<void>} */
    async _load7zEntries(): Promise<void> {
        return new Promise<void>((resolve: PromiseResolve<void>, reject: PromiseReject): void => {
            /** @type {ArchiveEntry[]} */
            const entries: ArchiveEntry[] = [];
            SevenZip.list(this.filePath, (err: Error | null, result: SevenZipEntry[] | null | undefined): void => {
                if (err) return reject(err);
                if (!result) return reject(new Error('No results found.'));

                for (const entry of result) {
                    entries.push({
                        entryName: entry.attr.includes('D') ? `${entry.name}/` : entry.name,
                        isDirectory: entry.attr.includes('D'),
                        size: Number.parseInt(entry.size, 10),
                        getData: async (): Promise<Buffer<ArrayBufferLike>> => await this._extract7zEntry(entry.name),
                    });
                }

                this.entries = entries;
                resolve();
            });
        });
    }

    /**
     * @param {string} entryName
     * @returns {Promise<Buffer<ArrayBufferLike>>}
     */
    async _extract7zEntry(entryName: string): Promise<Buffer<ArrayBufferLike>> {
        return new Promise<Buffer<ArrayBufferLike>>(
            (resolve: PromiseResolve<Buffer<ArrayBufferLike>>, reject: PromiseReject): void => {
                /** @type {string} */
                const tempOutputDir: string = path.join(DEAP.app.getPath('userData'), 'TempExtract');
                /** @type {string} */
                const tempFilePath: string = path.join(tempOutputDir, entryName);

                SevenZip.unpack(this.filePath, tempOutputDir, (err: Error | null): void => {
                    if (err) {
                        void DEAP.logger?.error('Error extracting 7z entry:', err);
                        return reject(err);
                    }

                    readFile(tempFilePath)
                        .then((buffer: Buffer<ArrayBufferLike>): void => {
                            resolve(buffer);
                            // Optionally clean up temp files here if needed
                            void unlink(tempFilePath);
                        })
                        .catch(reject);
                });
            }
        );
    }

    /** @returns {Promise<ArchiveEntry[]>} */
    async getEntries(): Promise<ArchiveEntry[]> {
        if (this.entries.length === 0) {
            await this._loadEntries();
        }
        return this.entries;
    }

    /**
     * @param {ArchiveEntry} entry
     * @param {string} outputPath
     * @returns {Promise<void>}
     */
    async extractEntry(entry: ArchiveEntry, outputPath: string): Promise<void> {
        // if (!!!entry.outputPath) return;

        /** @type {string} */
        const outputFilePath: string = path.join(outputPath, entry.outputPath ?? entry.entryName);
        console.log('extracting:', entry.entryName, 'to:', outputFilePath);

        this.emit('extracting', {
            entry: entry.entryName,
            outputPath: outputFilePath,
        });

        if (entry.isDirectory) {
            await mkdir(outputFilePath, { recursive: true });
        } else {
            await mkdir(path.dirname(outputFilePath), { recursive: true });
            await writeFile(outputFilePath, await entry.getData());
        }
    }

    /**
     * @param {string} outputPath
     * @param {boolean} [_overwrite=true]
     * @param {string[]} [ignores=[]]
     * @returns {Promise<void>}
     */
    async extractAllTo(outputPath: string, _overwrite: boolean = true, ignores: string[] = []): Promise<void> {
        console.log('extracting to:', outputPath);
        /** @type {ArchiveEntry[]} */
        const entries: ArchiveEntry[] = await this.getEntries();
        // console.log('got entries:', entries);
        for (const entry of entries) {
            if (ignores.includes(entry.entryName)) {
                console.log('ignoring:', entry.entryName);
                continue;
            }
            await this.extractEntry(entry, outputPath);
        }
    }
}

export default ArchiveHandler;
