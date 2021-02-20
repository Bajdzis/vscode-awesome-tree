import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { changeNameAction, generateAllAction, setDataAction } from '../../../reactViews/apps/renameFiles/actions/action';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { WebViewReact } from '../webView/webViewReact';


export type WebViewInfoAboutRenameFiles = {
    content: string;
    filePath: string;
    filePathFrom: string;
    filePathRelative: string;
    filePathFromRelative: string;
};

export class DirectoryRename {
    private webView: WebViewReact;
    
    constructor(webView: WebViewReact){
        this.webView = webView;
    }

    getFilesToRender(
        createdDirectoryUri: vscode.Uri,
        newName: string,
        infoAboutNameBaseDirectory: PathInfo,
    ) {
        return (filePathFromFull: string): WebViewInfoAboutRenameFiles => {

            const infoAboutNewName = getInfoAboutPath(newName);
            const filePathFrom = path.join(createdDirectoryUri.fsPath, filePathFromFull);
            const fileContent = fs.readFileSync(filePathFrom).toString();
            const templateLines = createVariableTemplate(fileContent, [infoAboutNameBaseDirectory]);
            const filePathTemplate = createVariableTemplate(filePathFromFull, [infoAboutNameBaseDirectory]);
            const filePath = path.join(path.dirname(createdDirectoryUri.fsPath), newName, renderVariableTemplate(filePathTemplate, [infoAboutNewName]));

            return ({
                content: renderVariableTemplate(templateLines, [infoAboutNewName]),
                filePath,
                filePathRelative: getRelativePath(filePath),
                filePathFrom,
                filePathFromRelative: getRelativePath(filePathFrom),
            });

        };
    }

    async showWebView(
        directoryToRenameUri: vscode.Uri,
        dirFiles: string[],
    ): Promise<WebViewInfoAboutRenameFiles[]> {

        let chooseFilesPanel = await this.webView.showWebView('Rename directory', 'reactAppRenameFiles.js');

        const infoAboutNameBaseDirectory = getInfoAboutPath(path.basename(directoryToRenameUri.fsPath));
        const createdFolderName = path.basename(directoryToRenameUri.fsPath);
        let allSiblingHave: WebViewInfoAboutRenameFiles[] = dirFiles.map(this.getFilesToRender(directoryToRenameUri, createdFolderName, infoAboutNameBaseDirectory));

        chooseFilesPanel.webview.postMessage(setDataAction({
            createdFolderName,
            allSiblingHave
        }));

        return new Promise((resolve) => {
            chooseFilesPanel.webview.onDidReceiveMessage((action) => {
                if (action.type === generateAllAction.type) {
                    resolve(
                        allSiblingHave
                    );
                } else if (action.type === changeNameAction.type) {
                    const { value } = action.payload;
    
                    allSiblingHave = dirFiles.map(this.getFilesToRender(directoryToRenameUri, value, infoAboutNameBaseDirectory));
                    
                    chooseFilesPanel.webview.postMessage(setDataAction({
                        createdFolderName,
                        allSiblingHave
                    }));
                }
            });
        });
    }
}
