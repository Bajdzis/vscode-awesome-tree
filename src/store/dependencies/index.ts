import * as vscode from 'vscode';
import { Config } from './config/config';
import { DirectoryRename } from './directoryRename/directoryRename';
import { Files } from './files/files';
import { WebView } from './webView/webView';
import { WebViewReact } from './webView/webViewReact';

export const createDependency = (context: vscode.ExtensionContext): RootDependency => {
    const outputChannel = vscode.window.createOutputChannel('Awesome tree');

    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const config = new Config(settingProvider, outputChannel);
    const webView = new WebView(context);
    const files = new Files(webView);
    const webViewReact = new WebViewReact(context);
    const directoryRename = new DirectoryRename(webViewReact);


    return {
        config,
        files,
        webView,
        directoryRename,
        outputChannel
    };
};

export interface RootDependency {
    config: Config;
    files: Files;
    webView: WebView;
    directoryRename: DirectoryRename;
    outputChannel: vscode.OutputChannel;
}
