import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WebView } from '../webView/webView';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';


export type WebViewInfoAboutFiles = {
    content: string;
    filePath: string;
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
        infoAboutNewName: PathInfo,
        infoAboutNameBaseDirectory: PathInfo,
    ) {
        return (filePath: string): WebViewInfoAboutFiles => {

            const fileContent = fs.readFileSync(path.join(createdDirectoryUri.fsPath, filePath)).toString();
            const templateLines = createVariableTemplate(fileContent, [infoAboutNameBaseDirectory]);
            const filePathTemplate = createVariableTemplate(filePath, [infoAboutNameBaseDirectory]);
            return ({
                content: renderVariableTemplate(templateLines, [infoAboutNewName]),
                filePath: renderVariableTemplate(filePathTemplate, [infoAboutNewName]),
            });

        };
    }

    async showWebView(
        createdDirectoryUri: vscode.Uri,
        dirFiles: string[],
        baseFolder: string,
    ): Promise<vscode.WebviewPanel> {

        let chooseFilesPanel = await this.webView.showWebView(this.renameFilesTemplateWebView, 'Rename copy directory');

        const infoAboutNameBaseDirectory = getInfoAboutPath(path.basename(createdDirectoryUri.fsPath));
        const createdFolderName = path.basename(baseFolder);
        const infoAboutNewName = getInfoAboutPath(createdFolderName);
        const allSiblingHave: WebViewInfoAboutFiles[] = dirFiles.map(this.getFilesToRender(createdDirectoryUri, infoAboutNewName, infoAboutNameBaseDirectory));
        
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

                const infoAboutNewName = getInfoAboutPath(value);
                const allSiblingHave: WebViewInfoAboutFiles[] = dirFiles.map(this.getFilesToRender(createdDirectoryUri, infoAboutNewName, infoAboutNameBaseDirectory));
                
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
