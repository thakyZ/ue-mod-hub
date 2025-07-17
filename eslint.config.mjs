// @ts-check
import * as console from 'node:console';

import * as electron from '@electron-toolkit/eslint-config';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import * as js from '@eslint/js';
import * as importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import * as prettier from 'eslint-plugin-prettier/recommended';
import * as reactCompiler from 'eslint-plugin-react-compiler';
import * as simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import * as globals from 'globals';
import ts from 'typescript-eslint';

/**
 * Helper function to filter globals with whitespace issues
 * @template {{ [name: string]: boolean | 'off' | 'readable' | 'readonly' | 'writable' | 'writeable'; }} T
 * @param {T} globalSet
 * @returns {T}
 */
function filterGlobals(globalSet) {
    /** @type {Partial<T>} */
    const filtered = {};
    for (const key in globalSet) {
        if (key.trim() === key) {
            filtered[key] = globalSet[key];
        } else {
            console.warn(`ESLint Config: Filtering out global '${key}' due to leading/trailing whitespace.`);
        }
    }
    // @ts-expect-error --- should not be partial at all.
    return filtered;
}

/** @type {string} */ // @ts-expect-error --- import.meta is safe here.
const dirname = import.meta.dirname;

// Create a compatibility layer for traditional config format
/** @type {FlatCompat} */
const compat = new FlatCompat({ baseDirectory: dirname });

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = ts.config([
    {
        name: 'ignores_and_files',
        ignores: ['**/*.json', 'node_modules', '.next'],
        files: ['**/*.{ts,tsx,mjs,js}'],
    },
    fixupConfigRules(compat.extends('plugin:@next/next/core-web-vitals')),
    compat.extends('plugin:typescript-paths/recommended'),
    compat.config({
        extends: ['next/typescript'],
        settings: {
            next: {
                rootDir: 'renderer',
            },
        },
    }),
    importPlugin.flatConfigs.react,
    importPlugin.flatConfigs.typescript,
    importPlugin.flatConfigs.electron,
    importPlugin.flatConfigs.errors,
    unicorn.configs.recommended,
    js.configs.recommended,
    electron,
    ts.configs.recommendedTypeChecked,
    prettier,
    reactCompiler.configs.recommended,
    jsdoc.configs['flat/stylistic-typescript-flavor'],
    {
        name: 'typescript_constaints',
        languageOptions: {
            parserOptions: {
                project: ['tsconfig.json', 'tsconfig.javascript.json'],
                tsconfigRootDir: dirname,
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
            'react-compiler/react-compiler': 'error',
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
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`

                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)

                    // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json or <root>/jsconfig.json by default

                    // Use <root>/path/to/folder/tsconfig.json or <root>/path/to/folder/jsconfig.json
                    project: [
                        'tsconfig.json',
                    ],
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
