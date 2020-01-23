import * as vscode from 'vscode';
import { saveAsTemplate } from './commands/saveAsTemplate';
import { createStore } from './store';
import { onDidCreate, onDidDelete, onDidChange, onRegisterWorkspace } from './store/action/files/files';
import { getAllFilesPath } from './fileSystem/getAllFilesPath';

export function activate(context: vscode.ExtensionContext) {

    const { store, dependencies } = createStore(context);
    const { outputChannel } = dependencies;
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    
    outputChannel.appendLine('Listening for file changes started!');
    
    fileSystemWatcher.onDidCreate((createdItemUri: vscode.Uri) => {
        store.dispatch(onDidCreate(createdItemUri));
    });

    fileSystemWatcher.onDidChange((createdItemUri: vscode.Uri) => {
        store.dispatch(onDidChange(createdItemUri));
    });

    fileSystemWatcher.onDidDelete((createdItemUri: vscode.Uri) => {
        store.dispatch(onDidDelete(createdItemUri));
    });

    const sendFilesPathsToStore = () => {
        const { workspaceFolders } = vscode.workspace;

        // TODO - filter register workspace
        workspaceFolders && workspaceFolders.forEach(element => {
            const workspacePath = element.uri.fsPath;
            // TODO - filter files like node_modules
            const filePaths = getAllFilesPath(workspacePath);

            store.dispatch(onRegisterWorkspace({
                filePaths,
                workspacePath
            }));
            
        });
    };

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        sendFilesPathsToStore();
    }));

    sendFilesPathsToStore();

    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsTemplate', saveAsTemplate));
}

export function deactivate() {}
