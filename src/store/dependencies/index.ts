import * as vscode from 'vscode';
import { Config } from './config/config';
import { Files } from './files/files';
import { WebView } from './webView/webView';

export const createDependency = (context: vscode.ExtensionContext): RootDependency => {
    const outputChannel = vscode.window.createOutputChannel('Awesome tree');

    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const config = new Config(settingProvider, outputChannel);
    const webView = new WebView(context);
    const files = new Files(webView);

    return {
        config,
        files,
        webView,
        outputChannel
    };
};

export interface RootDependency {
    config: Config;
    files: Files;
    webView: WebView;
    outputChannel: vscode.OutputChannel;
}
