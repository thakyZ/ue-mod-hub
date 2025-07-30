// import assert from 'node:assert';

import type { AppLogger } from '@hooks/use-app-logger';
import useAppLogger from '@hooks/use-app-logger';
import type { PromiseVoidFunctionWithArgs } from '@typed/common';

type OpenFileLocationFunc = PromiseVoidFunctionWithArgs<[logPageID: number, app_log_path: string, ue4ss_log_path: string]>;

const OpenFileLocation: OpenFileLocationFunc = async (
    logPageID: number,
    app_log_path: string,
    ue4ss_log_path: string
): Promise<void> => {
    const applog: AppLogger = useAppLogger('OpenFileLocation');
    const logPath: string = logPageID === 0 ? app_log_path : ue4ss_log_path;
    try {
        void window.ipc.invoke('open-file-location', logPath);
    } catch (error: unknown) {
        let _error: unknown = error;
        if (!_error || _error === null) _error = 'Unknown Error';
        if (typeof _error === 'string') _error = new Error(_error);
        else if (_error instanceof Error) await applog('error', _error.message);
        else await applog('error', new Error(String(_error)));
    }
};

export default OpenFileLocation;
