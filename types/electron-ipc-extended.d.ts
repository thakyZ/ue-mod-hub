declare global {
    type MainActions = {
        events?: { [key: string]: unknown[] };
        calls?: { [key: string]: unknown[] };
        commands?: { [key: string]: { params: unknown[]; returnVal: unknown } };
    };
}
