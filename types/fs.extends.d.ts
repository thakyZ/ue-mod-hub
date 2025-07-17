declare module '@typed/fs.extends';
import { FileHandle } from 'node:fs/promises';
export declare interface StreamOptions {
    flags?: string | undefined;
    encoding?: BufferEncoding | undefined;
    fd?: number | FileHandle | undefined;
    mode?: number | undefined;
    autoClose?: boolean | undefined;
    emitClose?: boolean | undefined;
    start?: number | undefined;
    signal?: AbortSignal | null | undefined;
    highWaterMark?: number | undefined;
}
interface CreateWriteStreamFSImplementation extends FSImplementation {
    write: (...args: uknown[]) => uknown;
    writev?: (...args: uknown[]) => uknown;
}
export declare interface WriteStreamOptions extends StreamOptions {
    fs?: CreateWriteStreamFSImplementation | null | undefined;
    flush?: boolean | undefined;
}
