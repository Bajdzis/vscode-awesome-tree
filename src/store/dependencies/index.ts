import * as vscode from 'vscode';
import { Config } from './config/config';
import { DirectoryRename } from './directoryRename/directoryRename';
import { Files } from './files/files';
import { TemplateManager } from './templateManager/templateManager';
import { WebViewReact } from './webView/webViewReact';

export const createDependency = (context: vscode.ExtensionContext): RootDependency => {
    const outputChannel = vscode.window.createOutputChannel('Awesome tree');

    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const config = new Config(settingProvider, outputChannel);
    const webViewReact = new WebViewReact(context);
    const files = new Files(webViewReact);
    const directoryRename = new DirectoryRename(webViewReact);
    const templateManager = new TemplateManager(webViewReact);


    return {
        config,
        files,
        webViewReact,
        directoryRename,
        outputChannel,
        templateManager
    };
};

export interface RootDependency {
    config: Config;
    files: Files;
    webViewReact: WebViewReact;
    directoryRename: DirectoryRename;
    templateManager: TemplateManager;
    outputChannel: vscode.OutputChannel;
}
