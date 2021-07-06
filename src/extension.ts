import { PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import * as path from 'path';
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
        isWholeLine: false,
        // borderWidth: '10px',
        // borderStyle: 'solid',
        // overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        // backgroundColor: 'yellow',
        light: {
            // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: {
            // this color will be used in dark color themes
            borderColor: 'lightblue'
        },
    //     before: {
    //         // contentText: 'Awesome Tree',
    //         // contentIconPath:  path.join(context.extensionPath, 'icons', 'awesome-template-light.svg'),
    //         backgroundColor: 'yellow',
    //         color: 'black',
    //     },
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

        const abc  = vscode.Uri.file(
            path.join(context.extensionPath, 'icons', 'awesome-template-tip.svg'));
        console.log({abc});

        const decoration: vscode.DecorationOptions = {
            range: new vscode.Range(startPos, endPos),
            // hoverMessage: 'Number **',

            renderOptions: {
                // contentText: 'Awesome Tree',
                before: {
                    contentText: 'Awesome Tree',
                    backgroundColor: 'yellow',
                    color: 'black',

                },
                after: {
                    margin: '20px 0 20px 0',

                    // contentText: '2222222',
                    contentIconPath: abc,
                    width: '371px',
                    height: '1em',
                    // backgroundColor: 'yellow',
                    color: 'black',

                }
            }};

        smallNumbers.push(decoration);


        activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);

        // smallNumberDecorationType.dispose();

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
