import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WebView } from '../webView/webView';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { getRelativePath } from '../../../fileSystem/getRelativePath';


export type WebViewInfoAboutFiles = {
    content: string;
    filePath: string;
    filePathFrom: string;
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
        return (filePath: string): WebViewInfoAboutFiles => {

            const infoAboutNewName = getInfoAboutPath(newName);
            const fullPath = path.join(createdDirectoryUri.fsPath, filePath);
            const fileContent = fs.readFileSync(fullPath).toString();
            const templateLines = createVariableTemplate(fileContent, [infoAboutNameBaseDirectory]);
            const filePathTemplate = createVariableTemplate(filePath, [infoAboutNameBaseDirectory]);
            return ({
                content: renderVariableTemplate(templateLines, [infoAboutNewName]),
                filePath: getRelativePath(path.join(path.dirname(createdDirectoryUri.fsPath), newName, renderVariableTemplate(filePathTemplate, [infoAboutNewName]))),
                filePathFrom: getRelativePath(fullPath),
            });

        };
    }

    async showWebView(
        createdDirectoryUri: vscode.Uri,
        dirFiles: string[],
    ): Promise<vscode.WebviewPanel> {

        let chooseFilesPanel = await this.webView.showWebView(this.renameFilesTemplateWebView, 'Rename copy directory');

        const infoAboutNameBaseDirectory = getInfoAboutPath(path.basename(createdDirectoryUri.fsPath));
        const createdFolderName = path.basename(createdDirectoryUri.fsPath);
        const allSiblingHave: WebViewInfoAboutFiles[] = dirFiles.map(this.getFilesToRender(createdDirectoryUri, createdFolderName, infoAboutNameBaseDirectory));
        
        chooseFilesPanel.webview.postMessage({ 
            type: 'SET_DATA', 
            payload : {
                createdFolderName,
                allSiblingHave
            }
        });

        chooseFilesPanel.webview.onDidReceiveMessage((action) => {
            if (action.type === 'GENERATE_FILE') {
                const { filePath, content } = action.payload;
                console.log(filePath, content);
            } else if (action.type === 'CHANGE_NAME') {
                const { value } = action.payload;

                const allSiblingHave: WebViewInfoAboutFiles[] = dirFiles.map(this.getFilesToRender(createdDirectoryUri, value, infoAboutNameBaseDirectory));
                
                chooseFilesPanel.webview.postMessage({ 
                    type: 'SET_DATA', 
                    payload : {
                        createdFolderName : value,
                        allSiblingHave
                    }
                });

            }
            
        });

        return chooseFilesPanel;
    }
    
}
