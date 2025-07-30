// @ts-check
import * as console from 'node:console';

import electron from '@electron-toolkit/eslint-config';
// import { fixupConfigRules } from '@eslint/compat';
import * as js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import type { SharedConfig } from '@typescript-eslint/utils/dist/ts-eslint/Config';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-plugin-prettier/recommended';
import * as reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import type { ConfigArray } from 'typescript-eslint';
import ts from 'typescript-eslint';

/**
 * Helper function to filter globals with whitespace issues
 * @template {typeof (import('globals').amd)} T
 * @param {T} globalSet
 * @returns {T}
 */
function filterGlobals<T extends typeof globals.amd>(globalSet: T): T {
    const filtered: T = {} as T;
    for (const key of Object.keys(globalSet)) {
        if (key.toString().trim() === key.toString()) {
            filtered[key] = globalSet[key];
        } else {
            console.warn(`ESLint Config: Filtering out global '${key.toString()}' due to leading/trailing whitespace.`);
        }
    }
    return filtered;
}

const __dirname: string = import.meta.dirname;

// Create a compatibility layer for traditional config format
// const compat: FlatCompat = new FlatCompat({ baseDirectory: __dirname });

const config: ConfigArray = ts.config([
    js.configs.recommended,
    ts.configs.recommendedTypeChecked,
    unicorn.configs.recommended,
    electron,
    prettier,
    reactHooks.configs['recommended-latest'],
    reactCompiler.configs.recommended,
    jsdoc.configs['flat/stylistic-typescript-flavor'],
    importPlugin.flatConfigs.react,
    importPlugin.flatConfigs.typescript,
    importPlugin.flatConfigs.electron,
    importPlugin.flatConfigs.errors,
    // compat.extends('plugin:typescript-paths/recommended'),
    {
        name: 'ignores_and_files',
        ignores: ['**/*.json', 'node_modules', '**/.next'],
        files: ['**/*.{ts,tsx,mjs,js}'],
    },
    {
        name: 'eslint/next',
        plugins: {
            '@next/next': next,
        },
        rules: {
            ...(next.configs.recommended.rules as Partial<SharedConfig.RulesRecord>),
            ...(next.configs['core-web-vitals'].rules as Partial<SharedConfig.RulesRecord>),
        },
        settings: {
            next: {
                rootDir: 'renderer',
            },
        },
    },
    {
        name: 'typescript_constaints',
        languageOptions: {
            parserOptions: {
                project: ['tsconfig.json', 'tsconfig.javascript.json'],
                tsconfigRootDir: __dirname,
            },
        },
    },
    {
        name: 'main_options',
        languageOptions: {
            ecmaVersion: 2018,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            sourceType: 'module',
            globals: {
                NodeJS: true,
                ...filterGlobals(globals.browser),
                ...filterGlobals(globals.node),
                ...filterGlobals(globals.es2021),
                ...filterGlobals(globals.es2022),
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'prettier/prettier': 'error',
            '@next/next/no-html-link-for-pages': ['error', 'renderer/pages/'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '(^_)',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '(^_)',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'sort-imports': 'off',
            'simple-import-sort/imports': 'warn',
            'simple-import-sort/exports': 'warn',
            'jsdoc/require-description': 'off',
            'jsdoc/require-description-complete-sentence': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-returns-description': 'off',
            'unicorn/no-null': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/consistent-assert': 'error',
            'unicorn/no-static-only-class': 'off',
            'unicorn/switch-case-braces': 'off',
            'unicorn/prefer-global-this': 'off',
            'unicorn/consistent-function-scoping': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
        },
    },
    {
        name: 'non_react_settings',
        ignores: ['renderer'],
        rules: {
            'react-compiler/react-compiler': 'off',
            'react-hooks/rules-of-hooks': 'off',
        },
    },
    {
        name: 'react_settings',
        files: ['renderer'],
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react-compiler/react-compiler': 'error',
        },
    },
    {
        name: 'import_settings',
        settings: {
            'import/resolver': {
                typescript: {
                    typescript: true, // Enables resolving TypeScript paths
                    node: true, // Enables resolving Node.js modules
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`

                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)

                    // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json or <root>/jsconfig.json by default

                    // Use <root>/path/to/folder/tsconfig.json or <root>/path/to/folder/jsconfig.json
                    project: ['tsconfig.json'],
                },
            },
        },
    },
    {
        name: 'typescript_only_rules',
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/typedef': [
                'off',
                {
                    variableDeclaration: true,
                    arrayDestructuring: true,
                    arrowParameter: true,
                    memberVariableDeclaration: true,
                    objectDestructuring: true,
                    parameter: true,
                    propertyDeclaration: true,
                    variableDeclarationIgnoreFunction: false,
                },
            ],
        },
    },
]);

export default config;
