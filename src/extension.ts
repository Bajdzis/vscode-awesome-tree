import * as fs from 'fs';
import { ActionCreator } from 'typescript-fsa';
import * as vscode from 'vscode';
import { findWorkspacePath } from './commands/saveAsTemplate';
import { getAllFilesPath } from './fileSystem/getAllFilesPath';
import { createStore } from './store';
import { createNewTemplate, onDidChange, onDidCreate, onDidDelete, onRegisterWorkspace, renameDirectory, WatchFileSystemParam } from './store/action/files/files';

export function activate(context: vscode.ExtensionContext) {

    const { store, dependencies } = createStore(context);
    const { outputChannel, config } = dependencies;
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    
    outputChannel.appendLine('Listening for file changes started!');
    
    const dispatchFileSystemAction = (action: ActionCreator<WatchFileSystemParam> ) => {
        return (uri: vscode.Uri) => {
            if (!config.canUseThisFile(uri)) {
                return;
            }
            fs.lstat(uri.fsPath, (err, stats) => {
                if (err) {
                    outputChannel.appendLine(`Failed read ${uri.fsPath}`);
                    return;
                }
                const type = stats.isFile() ? 'file' : 'directory';
                store.dispatch(action({
                    type,
                    uri,
                }));
            });
        };
    };

    fileSystemWatcher.onDidCreate(dispatchFileSystemAction(onDidCreate));
    fileSystemWatcher.onDidChange(dispatchFileSystemAction(onDidChange));
    fileSystemWatcher.onDidDelete((uri) => store.dispatch(onDidDelete(uri)));

    const sendFilesPathsToStore = () => {
        const { workspaceFolders } = vscode.workspace;
        workspaceFolders && workspaceFolders.forEach(({ uri }) => {
            const workspacePath = uri.fsPath;
            const filePaths = getAllFilesPath(workspacePath, config.getIgnorePathsGlob());

            store.dispatch(onRegisterWorkspace({
                filePaths,
                workspacePath
            }));
            
        });
    };

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(sendFilesPathsToStore));

    sendFilesPathsToStore();

    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsTemplate', (uri: vscode.Uri) => {
        const workspacePath = findWorkspacePath(uri.fsPath);

        if (workspacePath === undefined) {
            vscode.window.showWarningMessage(`Can't find workspace directory for file: '${uri.fsPath}'`);
            return;
        }

        store.dispatch(createNewTemplate.started({
            uri,
            workspacePath
        }));
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.renameDirectory', (uri: vscode.Uri) => {
        store.dispatch(renameDirectory.started(uri));
    }));

}

export function deactivate() {}
