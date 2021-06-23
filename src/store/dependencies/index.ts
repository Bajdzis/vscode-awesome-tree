import * as vscode from 'vscode';
import { Config } from './config/config';
import { DirectoryRename } from './directoryRename/directoryRename';
import { Files } from './files/files';
import { WebViewReact } from './webView/webViewReact';
import { WorkerRunner } from './workerRunner/workerRunner';

export const createDependency = (context: vscode.ExtensionContext): RootDependency => {
    const outputChannel = vscode.window.createOutputChannel('Awesome tree');

    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const config = new Config(settingProvider, outputChannel);
    const webViewReact = new WebViewReact(context);
    const files = new Files(webViewReact);
    const directoryRename = new DirectoryRename(webViewReact);
    const workerRunner = new WorkerRunner(context);


    return {
        config,
        files,
        webViewReact,
        directoryRename,
        outputChannel,
        workerRunner
    };
};

export interface RootDependency {
    config: Config;
    files: Files;
    webViewReact: WebViewReact;
    directoryRename: DirectoryRename;
    outputChannel: vscode.OutputChannel;
    workerRunner: WorkerRunner;
}
