import * as vscode from 'vscode';
import { saveAsTemplate } from './commands/saveAsTemplate';
import { createStore } from './store';
import { onDidCreate } from './store/action/files/files';

export function activate(context: vscode.ExtensionContext) {

    const { store, dependencies } = createStore(context);
    const { outputChannel } = dependencies;
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*',false, true, true);
    
    outputChannel.appendLine('Listening for file changes started!');
    
    fileSystemWatcher.onDidCreate((createdItemUri: vscode.Uri) => {
        store.dispatch(onDidCreate(createdItemUri));
    });

    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsTemplate', saveAsTemplate));
}

export function deactivate() {}
