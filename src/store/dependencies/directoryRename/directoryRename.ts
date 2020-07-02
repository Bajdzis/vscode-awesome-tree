import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WebView } from '../webView/webView';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { getRelativePath } from '../../../fileSystem/getRelativePath';


export type WebViewInfoAboutRenameFiles = {
    content: string;
    filePath: string;
    filePathFrom: string;
    filePathRelative: string;
    filePathFromRelative: string;
};

export class DirectoryRename {
    private renameFilesTemplateWebView: string;
    private webView: WebView;
    
    constructor(webView: WebView){

        this.webView = webView;
        this.renameFilesTemplateWebView = this.webView.getWebViewTemplate('renameFiles');
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
                filePathRelative: getRelativePath(filePathFromFull),
                filePathFrom,
                filePathFromRelative: getRelativePath(filePathFrom),
            });

        };
    }

    async showWebView(
        createdDirectoryUri: vscode.Uri,
        dirFiles: string[],
    ): Promise<WebViewInfoAboutRenameFiles[]> {

        let chooseFilesPanel = await this.webView.showWebView(this.renameFilesTemplateWebView, 'Rename copy directory');

        const infoAboutNameBaseDirectory = getInfoAboutPath(path.basename(createdDirectoryUri.fsPath));
        const createdFolderName = path.basename(createdDirectoryUri.fsPath);
        let allSiblingHave: WebViewInfoAboutRenameFiles[] = dirFiles.map(this.getFilesToRender(createdDirectoryUri, createdFolderName, infoAboutNameBaseDirectory));


        chooseFilesPanel.webview.postMessage({ 
            type: 'SET_DATA', 
            payload : {
                createdFolderName,
                allSiblingHave
            }
        });
        return new Promise((resolve) => {
            chooseFilesPanel.webview.onDidReceiveMessage((action) => {
                if (action.type === 'GENERATE_ALL') {
                 
                    resolve(
                        allSiblingHave
                    );
                } else if (action.type === 'CHANGE_NAME') {
                    const { value } = action.payload;
    
                    allSiblingHave = dirFiles.map(this.getFilesToRender(createdDirectoryUri, value, infoAboutNameBaseDirectory));
                    
                    chooseFilesPanel.webview.postMessage({ 
                        type: 'SET_DATA', 
                        payload : {
                            createdFolderName : value,
                            allSiblingHave
                        }
                    });
    
                }
                
            });
        });
    }
    
}
