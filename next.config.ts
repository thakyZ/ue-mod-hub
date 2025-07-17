import path from 'node:path';
import { env } from 'node:process';

import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import type { Configuration, RuleSetRule } from 'webpack';
import CompressPublicImages from './scripts/compressPublicImages';

const nextConfig: NextConfig = {
    output: 'export',
    reactStrictMode: true,
    trailingSlash: true,
    distDir: env['NODE_ENV'] === 'production' ? './app' : '.next',
    images: {
        unoptimized: true,
    },
    productionBrowserSourceMaps: true,
    typescript: {
        ignoreBuildErrors: false,
        tsconfigPath: path.relative(path.join(__dirname, 'renderer'), path.join(__dirname, 'tsconfig.json'))
    },
    webpack: (config: Configuration, context: WebpackConfigContext): Configuration => {
        config.devtool = 'source-map'; // Needed for better renderer debugging
        config.module ??= {};
        config.module.rules ??= [];

        const fileLoaderRule: RuleSetRule | undefined = config.module.rules.find((rule: false | "" | 0 | RuleSetRule | "..." | null | undefined): boolean =>
            !!rule && typeof rule !== 'boolean' && typeof rule !== 'string' && typeof rule !== 'number' && !!rule.test && typeof rule.test !== 'string' && (rule.test instanceof RegExp) && rule.test.test('.svg'),
        ) as RuleSetRule | undefined;
        

        // Add support for importing SVG files using @svgr/webpack
        if (fileLoaderRule && fileLoaderRule.issuer && fileLoaderRule.resourceQuery && typeof fileLoaderRule.resourceQuery !== 'string' && !(fileLoaderRule.resourceQuery instanceof RegExp) && typeof fileLoaderRule.resourceQuery !== 'function' && !Array.isArray(fileLoaderRule.resourceQuery) && fileLoaderRule.resourceQuery.not && typeof fileLoaderRule.resourceQuery.not !== 'string' && !(fileLoaderRule.resourceQuery.not instanceof RegExp) && typeof fileLoaderRule.resourceQuery.not !== 'function' && Array.isArray(fileLoaderRule.resourceQuery.not)) {
            config.module.rules.push(
                // Reapply the existing rule, but only for svg imports ending in ?url
                {
                    ...fileLoaderRule,
                    test: /\.svg$/i,
                    resourceQuery: /url/, // *.svg?url
                },
                // Convert all other *.svg imports to React components
                {
                    test: /\.svg$/i,
                    issuer: fileLoaderRule.issuer,
                    resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                    use: ['@svgr/webpack'],
                },
            );
        } else {
            config.module.rules.push(
                // Convert all other *.svg imports to React components
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: ['@svgr/webpack'],
                },
            );
        }

        config.module.rules.push(
            {
                test: /\.(?:[a-zA-Z0-9]+)?\.(md|json)$/,
                use: 'raw-loader',
            },
            {
                test: /\.(ts|js)x?$/,
                use: [
                    context.defaultLoaders.babel,
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                            onlyCompileBundledFiles: true,
                        }
                    }
                ]
            }
        );
        
        config.plugins ??= [];
        config.plugins.push(new CompressPublicImages({ force: env['NODE_ENV'] !== 'production' }))
        
        return config;
    },
    // ignore key checks blah blah blah
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
