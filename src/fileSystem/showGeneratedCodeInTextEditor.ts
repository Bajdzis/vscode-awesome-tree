import { FileContent } from 'awesome-tree-engine';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function showGeneratedCodeInTextEditor(context: vscode.ExtensionContext, file: FileContent) {
    await sleep(100);
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return Promise.reject('no active editor');
    }
    const document = activeEditor.document;
    const text = document.getText();

    if(text.trim().length !== 0) {
        return Promise.reject('no empty file');
    }

    if(document.uri.fsPath !== file.getPathInfo().getPath()) {
        return Promise.reject('active editor open other file');
    }

    if(document.isDirty) {
        return  Promise.reject('file not saved');
    }

    const generateCodeDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: false,
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: { id:'awesomeTree.generatedCodeBackground'},
        after:{
            contentIconPath: vscode.Uri.file(
                path.join(context.extensionPath, 'icons', 'awesome-template-tip.svg')
            ),
            width: '371px',
            height: '1em',
        }
    });
    return new Promise<void>((resolve, reject) => {
        const content = file.getContent();
        const waitForPasteValues = vscode.workspace.onDidChangeTextDocument(() => {

            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }
            const text = document.getText();
            if(content !== text) {
                return;
            }
            const startPos = document.positionAt(0);
            const endPos = document.positionAt(text.length);
            const range = new vscode.Range(startPos, endPos);

            const decorators: vscode.DecorationOptions[] = [{
                range,
                hoverMessage: 'Code generate by vscode-awesome-tree extension!',
            }];

            activeEditor.setDecorations(generateCodeDecorationType, decorators);
            resolve();
            setTimeout(() => {
                const waitForUserAction = vscode.workspace.onDidChangeTextDocument(() => {
                    generateCodeDecorationType.dispose();
                    waitForUserAction.dispose();
                }, true);
            }, 1000);

            waitForPasteValues.dispose();
        }, true);

        fs.writeFile(document.uri.fsPath, file.getContent(), (err) => {
            if (err) {
                reject(err);
                return;
            }
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                reject('no active editor');
                return;
            }
            if (document !== activeEditor.document) {
                reject('active editor open other file');
                return;
            }
        });
    });

}
