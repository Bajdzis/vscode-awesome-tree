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
    const webViewReact = new WebViewReact(context);
    const files = new Files(webViewReact);
    const directoryRename = new DirectoryRename(webViewReact);


    return {
        config,
        files,
        webView,
        webViewReact,
        directoryRename,
        outputChannel
    };
};

export interface RootDependency {
    config: Config;
    files: Files;
    webView: WebView;
    webViewReact: WebViewReact;
    directoryRename: DirectoryRename;
    outputChannel: vscode.OutputChannel;
}
