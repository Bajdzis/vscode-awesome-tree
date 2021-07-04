import { PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import { ActionCreator } from 'typescript-fsa';
import * as vscode from 'vscode';
import { showLineComparePercent } from './commands/showLineComparePercent';
import { getAllFilesPath } from './fileSystem/getAllFilesPath';
import { createStore } from './store';
import { onDidChange, onDidCreate, onDidDelete, onRegisterWorkspace, renameDirectory } from './store/action/files/files';

export function activate(context: vscode.ExtensionContext) {

    const { store, dependencies } = createStore(context);
    const { outputChannel, config } = dependencies;
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');

    outputChannel.appendLine('Listening for file changes started!');

    const dispatchFileSystemAction = (action: ActionCreator<PathInfo> ) => {
        return (uri: vscode.Uri) => {
            if (!config.canUseThisFile(uri)) {
                return;
            }

            if(vscode.workspace.workspaceFolders?.some(folder => folder.uri.fsPath.includes(uri.fsPath))) {
                outputChannel.appendLine(`The file "${uri.fsPath}" is outside the workspace directory`);
                return;
            }
            fs.lstat(uri.fsPath, (err, stats) => {
                if (err) {
                    outputChannel.appendLine(`Failed read ${uri.fsPath}`);
                    return;
                }
                const type = stats.isFile() ? 'file' : 'directory';
                const path = new PathInfo(type === 'file' ? uri.fsPath : `${uri.fsPath}/`);
                store.dispatch(action(path ));
            });
        };
    };

    fileSystemWatcher.onDidCreate(dispatchFileSystemAction(onDidCreate));
    fileSystemWatcher.onDidChange(dispatchFileSystemAction(onDidChange));
    fileSystemWatcher.onDidDelete((uri) => store.dispatch(onDidDelete(new PathInfo(uri.fsPath))));

    const sendFilesPathsToStore = () => {
        const { workspaceFolders } = vscode.workspace;
        workspaceFolders && workspaceFolders.forEach(({ uri }) => {
            const workspacePath = uri.fsPath;
            const filePaths = getAllFilesPath(workspacePath, config.getIgnorePathsGlob()).map(path => new PathInfo(path));

            store.dispatch(onRegisterWorkspace({
                filePaths,
                workspacePath
            }));

        });
    };

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(sendFilesPathsToStore));

    sendFilesPathsToStore();

    context.subscriptions.push(vscode.commands.registerCommand('extension.showLineComparePercent', (uri: vscode.Uri) => {
        showLineComparePercent(new PathInfo(uri.fsPath), store, dependencies);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.renameDirectory', (uri: vscode.Uri) => {
        store.dispatch(renameDirectory.started(new PathInfo(`${uri.fsPath}/`)));
    }));

}

export function deactivate() {}
