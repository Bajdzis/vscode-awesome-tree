import { PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import { ActionCreator } from 'typescript-fsa';
import * as vscode from 'vscode';
// import { showLineComparePercent } from './commands/showLineComparePercent';
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


    // create a decorator type that we use to decorate small numbers
    const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: '10px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,

        light: {
            // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: {
            // this color will be used in dark color themes
            borderColor: 'lightblue'
        },
        before: {
            contentText: 'wesome Tree33232',
            backgroundColor: 'yellow',
            color: 'black',
            textDecoration:''
        },
        after: {
            contentText: 'Awesome Tree\n33232',
            backgroundColor: 'yellow',
            color: 'black',
            textDecoration:''
        },
    });

    let activeEditor = vscode.window.activeTextEditor;

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        const text = activeEditor.document.getText();
        const smallNumbers: vscode.DecorationOptions[] = [];


        // const startPos = activeEditor.document.positionAt(match.index);
        const startPos = activeEditor.document.positionAt(0);
        const endPos = activeEditor.document.positionAt(text.length);
        const decoration: vscode.DecorationOptions = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: 'Number **',

            renderOptions: {
                after: {
                    contentText: 'hover ??',
                    margin: '0 0 20px 0'
                }
            }};

        smallNumbers.push(decoration);


        activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);

    }

    context.subscriptions.push(vscode.commands.registerCommand('extension.showLineComparePercent', (uri: vscode.Uri) => {
        // showLineComparePercent(new PathInfo(uri.fsPath), store, dependencies);
        if (vscode.window.activeTextEditor) {
            vscode.workspace.openTextDocument(uri).then(() => {

                updateDecorations();
            });
        }

    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.renameDirectory', (uri: vscode.Uri) => {
        store.dispatch(renameDirectory.started(new PathInfo(`${uri.fsPath}/`)));
    }));

}

export function deactivate() {}
