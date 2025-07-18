// Description: This script compresses all PNG images in a specified folder and its subfolders.
// It uses the sharp library to compress the images and save them in the same folder structure.
// The script can be run with Node.js and requires the sharp library to be installed.
//
// The main purpose of this script is to reduce the size of PNG images in a project.
// Author: dekitarpg.@gmail.com (GPT assist)
// Modified by: thakyZ (950594+thakyZ@users.noreply.github.com) <https://github.com/thakyZ> (No assist)
//
import type { Dirent } from 'node:fs';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import type { Compilation, Compiler } from 'webpack';

/**
 * Mirror reference of the webpack class {@link WebpackLogger}
 */
type WebpackLogger = ReturnType<Compiler['getInfrastructureLogger']>;

/**
 * Mirror reference of the webpack class {@link CompilationParams}
 */
type CompilationParams = Compilation['params'];

export declare interface Options {
    /**
     * Force the re-compression of images.
     */
    force?: boolean;

    /**
     * Input folder path
     */
    inputFolder?: string;

    /**
     * Converted file output folder path
     */
    outputFolder?: string;

    /**
     * The type of conversion.
     * Must be "png" or "webp"
     */
    conversionType?: 'webp' | 'png';
}

/**
 * A webpack plugin to compress images into webp format.
 */
export default class CompressPublicImages {
    /**
     * Force the re-compression of images.
     */
    private force: boolean;

    /**
     * Input folder path
     */
    private inputFolder: string;

    /**
     * Converted file output folder path
     */
    private outputFolder: string;

    /**
     * The type of conversion.
     * Must be "png" or "webp"
     */
    private conversionType: 'webp' | 'png';

    /**
     * Logger of the webpack plugin.
     */
    private logger: WebpackLogger | typeof console;

    /**
     * Creates a new instance of the {@link CompressPublicImages} class
     * @param {Options} options Options for the plugin.
     */
    constructor(options: Options) {
        this.logger = console;
        this.force = options.force ?? false;
        this.inputFolder = options.inputFolder ?? path.resolve('resources/uncompressed-public-images');
        this.outputFolder = options.outputFolder ?? path.resolve('renderer/public/img');
        this.conversionType = options.conversionType ?? 'webp';
    }

    /**
     * Applies the class to the webpack plugin
     * @param {Compiler} compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void {
        this.logger = compiler.getInfrastructureLogger(CompressPublicImages.name);
        compiler.hooks.beforeCompile.tapPromise(
            'CompressPublicImages',
            async (_compilation: CompilationParams): Promise<void> => {
                switch (this.conversionType) {
                    case 'png':
                        await this.compressAllPngs(this.inputFolder, this.outputFolder);
                        break;
                    case 'webp':
                        await this.compressAllPngsToWebP(this.inputFolder, this.outputFolder);
                        break;
                    default:
                        this.logger.error("Invalid conversion type. Please specify 'png' or 'webp'.");
                }
            }
        );
    }

    /**
     * A typeguarded version of `instanceof Error` for NodeJS.
     * @author Joseph JDBar Barron
     * @link https://dev.to/jdbar
     * @see https://dev.to/jdbar/the-problem-with-handling-node-js-errors-in-typescript-and-the-workaround-m64
     * @template {new (message?: string, options?: ErrorOptions) => Error} T
     * @param {Error} value
     * @param {T} errorType
     * @returns {value is InstanceType<T> & NodeJS.ErrnoException}
     * @static
     */
    static instanceOfNodeError<T extends new (message?: string, options?: ErrorOptions) => Error>(
        value: Error,
        errorType: T
    ): value is InstanceType<T> & NodeJS.ErrnoException {
        return value instanceof errorType;
    }

    /**
     * Function to recursively find all PNG files in a folder and its subfolders
     * @param {string} dir
     * @returns {Promise<string[]>}
     * @async
     */
    async findPngFiles(dir: string): Promise<string[]> {
        const entries: Dirent[] = await readdir(dir, { withFileTypes: true });
        const pngFiles: string[] = [];
        const imageTypes: Set<string> = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']);

        for (const entry of entries) {
            const fullPath: string = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                /** @type {string[]} */
                const subfolderPngs: string[] = await this.findPngFiles(fullPath);
                pngFiles.push(...subfolderPngs);
            } else if (entry.isFile() && imageTypes.has(path.extname(entry.name).toLowerCase())) {
                pngFiles.push(fullPath);
            }
        }

        return pngFiles;
    }

    /**
     * Function to compress a PNG file
     * @param {string} filePath
     * @param {string} outputPath
     * @returns {Promise<void>}
     * @async
     */
    async compressPng(filePath: string, outputPath: string): Promise<void> {
        try {
            await sharp(filePath).png({ quality: 80, compressionLevel: 9 }).toFile(outputPath);
            this.logger.log(`Compressed: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to compress ${filePath}:`, error);
        }
    }

    /**
     * Function to compress and convert PNG to WebP
     * @param {string} filePath
     * @param {string} outputPath
     * @returns {Promise<void>}
     * @async
     */
    async convertToWebP(filePath: string, outputPath: string): Promise<void> {
        try {
            // regexp checks for all image types
            const webpPath = outputPath.replace(/\.(png|jpg|jpeg|gif|bmp|tiff|webp)$/i, '.webp');
            if (existsSync(webpPath) && this.force)
                await sharp(filePath)
                    .webp({ quality: 80, lossless: false }) // Adjust quality for lossy or use lossless: true
                    .toFile(webpPath);
            this.logger.log(`Converted: ${filePath} -> ${webpPath}`);
        } catch (error) {
            this.logger.error(`Failed to convert ${filePath}:`, error);
        }
    }

    /**
     * Ensure directory existence (custom implementation)
     * @param {string} dir
     * @returns {Promise<void>}
     * @async
     */
    async ensureDir(dir: string): Promise<void> {
        try {
            await mkdir(dir, { recursive: true });
        } catch (error) {
            // Ignore error if the directory exists, otherwise throw.
            if (
                error instanceof Error &&
                CompressPublicImages.instanceOfNodeError(error, TypeError) &&
                error.code !== 'EEXIST'
            ) {
                throw error;
            }
        }
    }

    /**
     * Main functions
     * @param {string} inputFolder
     * @param {string} outputFolder
     * @returns {Promise<void>}
     * @async
     */
    async compressAllPngs(inputFolder: string, outputFolder: string): Promise<void> {
        try {
            // Find all PNG files
            const pngFiles: string[] = await this.findPngFiles(inputFolder);

            // Compress each PNG
            for (const filePath of pngFiles) {
                const relativePath: string = path.relative(inputFolder, filePath);
                const outputPath: string = path.join(outputFolder, relativePath);

                // Ensure the output subfolder exists
                await this.ensureDir(path.dirname(outputPath));

                await this.compressPng(filePath, outputPath);
            }

            this.logger.log('Compression complete!');
        } catch (error) {
            this.logger.error('Error:', error);
        }
    }

    /**
     * Main functions
     * @param {string} inputFolder
     * @param {string} outputFolder
     * @returns {Promise<void>}
     * @async
     */
    async compressAllPngsToWebP(inputFolder: string, outputFolder: string): Promise<void> {
        try {
            // Find all PNG files
            const pngFiles: string[] = await this.findPngFiles(inputFolder);

            // Convert each PNG to WebP
            for (const filePath of pngFiles) {
                const relativePath: string = path.relative(inputFolder, filePath);
                const outputPath: string = path.join(outputFolder, relativePath);

                // Ensure the output subfolder exists
                await this.ensureDir(path.dirname(outputPath));

                await this.convertToWebP(filePath, outputPath);
            }

            this.logger.log('Conversion to WebP complete!');
        } catch (error) {
            this.logger.error('Error:', error);
        }
    }
}
