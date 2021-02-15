/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* global require module __dirname */
//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: { // the bundle is stored in the 'out' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use:  'ts-loader'
        }]
    },
    optimization: {
        minimize: true, 
    }
};

/**@type {import('webpack').Configuration}*/
const configReactView = {
    target: 'web',

    entry: {
        reactViewsDebugger: './src/reactViews/apps/debugger/debugger.tsx',
        reactAppRenameFiles:'./src/reactViews/apps/renameFiles/renameFiles.tsx',
        reactAppChooseFiles:'./src/reactViews/apps/chooseFiles/chooseFiles.tsx',
        // shared: ['react', 'react-dom'], //, 'redux', 'react-redux'],
    },
    output: { 
        path: path.resolve(__dirname, 'out'),
        filename: '[name].js',
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use:  'ts-loader'
        },{
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        }]
    },
    optimization: {
        minimize: true, 
    }
};

module.exports = [config, configReactView];
