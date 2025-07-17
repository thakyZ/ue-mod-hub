// import assert from 'node:assert';

import useAppLogger from '@hooks/use-app-logger';

const openFileLocation = async (logPageID: number, app_log_path: string, ue4ss_log_path: string): Promise<void> => {
    const applog = useAppLogger('OpenFileLocation');
    const logPath: string = logPageID === 0 ? app_log_path : ue4ss_log_path;
    try {
        void window.ipc.invoke('open-file-location', logPath);
    } catch (error) {
        /** @type {unknown} */
        let _error: unknown = error;
        if (!_error || _error === null) _error = 'Unknown Error';
        if (typeof _error === 'string') _error = new Error(_error);
        else if (_error instanceof Error) await applog('error', _error.message);
        else await applog('error', new Error(String(_error)));
    }
};

export default openFileLocation;
