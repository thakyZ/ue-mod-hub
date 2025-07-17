declare module 'globals' {
    /** cSpell:words prototypejs */
    export declare type GlobalConf = boolean | 'off' | 'readable' | 'readonly' | 'writable' | 'writeable';
    export declare interface GlobalsRecord {
        [name: string]: GlobalConf;
    }
    type Globals = {
        amd: GlobalsRecord;
        applescript: GlobalsRecord;
        atomtest: GlobalsRecord;
        browser: GlobalsRecord;
        builtin: GlobalsRecord;
        chai: GlobalsRecord;
        commonjs: GlobalsRecord;
        couch: GlobalsRecord;
        devtools: GlobalsRecord;
        embertest: GlobalsRecord;
        es2015: GlobalsRecord;
        es2016: GlobalsRecord;
        es2017: GlobalsRecord;
        es2018: GlobalsRecord;
        es2019: GlobalsRecord;
        es2020: GlobalsRecord;
        es2021: GlobalsRecord;
        es2022: GlobalsRecord;
        es2023: GlobalsRecord;
        es2024: GlobalsRecord;
        es2025: GlobalsRecord;
        es2026: GlobalsRecord;
        es3: GlobalsRecord;
        es5: GlobalsRecord;
        greasemonkey: GlobalsRecord;
        jasmine: GlobalsRecord;
        jest: GlobalsRecord;
        jquery: GlobalsRecord;
        meteor: GlobalsRecord;
        mocha: GlobalsRecord;
        mongo: GlobalsRecord;
        nashorn: GlobalsRecord;
        node: GlobalsRecord;
        nodeBuiltin: GlobalsRecord;
        phantomjs: GlobalsRecord;
        prototypejs: GlobalsRecord;
        protractor: GlobalsRecord;
        qunit: GlobalsRecord;
        rhino: GlobalsRecord;
        serviceworker: GlobalsRecord;
        'shared-node-browser': GlobalsRecord;
        shelljs: GlobalsRecord;
        vitest: GlobalsRecord;
        webextensions: GlobalsRecord;
        worker: GlobalsRecord;
        wsh: GlobalsRecord;
        yui: GlobalsRecord;
    };
    const GLOBALS: Globals;
    export default GLOBALS;
}
