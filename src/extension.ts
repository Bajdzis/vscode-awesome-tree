import * as vscode from 'vscode';
import * as fs from 'fs';
import { saveAsTemplate } from './commands/saveAsTemplate';
import { createStore } from './store';
import { onDidCreate, onDidDelete, onDidChange, onRegisterWorkspace, WatchFileSystemParam } from './store/action/files/files';
import { getAllFilesPath } from './fileSystem/getAllFilesPath';
import { reportBug } from './errors/reportBug';
import { ActionCreator } from 'typescript-fsa';

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
                    reportBug(err);
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
    fileSystemWatcher.onDidDelete((uri: vscode.Uri) => {
        if (config.canUseThisFile(uri)) {
            store.dispatch(onDidDelete(uri));
        }
    });

    const sendFilesPathsToStore = () => {
        const { workspaceFolders } = vscode.workspace;

        workspaceFolders && workspaceFolders.forEach(element => {
            const workspacePath = element.uri.fsPath;
            const filePaths = getAllFilesPath(workspacePath, config.getExcludeWatchRegExp());

            store.dispatch(onRegisterWorkspace({
                filePaths,
                workspacePath
            }));
            
        });
    };

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(sendFilesPathsToStore));

    sendFilesPathsToStore();

    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsTemplate', saveAsTemplate));
}

export function deactivate() {}
