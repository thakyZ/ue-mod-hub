/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
returns true / false if the environment is development
*/
export default function isDevEnvironment(): boolean {
    return process && process.env['NODE_ENV'] === 'development';
}
