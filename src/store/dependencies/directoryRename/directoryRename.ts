import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WebView } from '../webView/webView';
import { WebViewInfoAboutFiles } from '../files/files';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';

export class DirectoryRename {
    private renameFilesTemplateWebView: string;
    private webView: WebView;
    
    constructor(webView: WebView){

        this.webView = webView;
        this.renameFilesTemplateWebView = this.webView.getWebViewTemplate('renameFiles');
    }

    async showWebView(
        createdDirectoryUri: vscode.Uri,
        dirFiles: string[],
        baseFolder: string,
    ): Promise<vscode.WebviewPanel> {

        let chooseFilesPanel = await this.webView.showWebView(this.renameFilesTemplateWebView, 'Rename copy directory');

        const infoAboutNameBaseDirectory = getInfoAboutPath(baseFolder);
        const infoAboutNewName = getInfoAboutPath('testNewName');


        
        const a: WebViewInfoAboutFiles[] = [];
        dirFiles.forEach((filePath) => {

            const lines = fs.readFileSync(path.join(createdDirectoryUri.fsPath, filePath)).toString();
            const template = createVariableTemplate(lines, [infoAboutNameBaseDirectory]);
            const filePathTemplate = createVariableTemplate(filePath, [infoAboutNameBaseDirectory]);
            a.push({
                content: renderVariableTemplate(template, [infoAboutNewName]),
                filePath: renderVariableTemplate(filePathTemplate, [infoAboutNewName]),
                filePathTemplate,
                fromTemplate: false,
                relativePath: filePath
            });

        });


        console.log(baseFolder);
        
        chooseFilesPanel.webview.postMessage({ 
            type: 'SET_DATA', 
            payload : {
                createdFolderName: path.dirname(createdDirectoryUri.fsPath),
                allSiblingHave: []
            }
        });

        chooseFilesPanel.webview.onDidReceiveMessage((action) => {
            if (action.type === 'GENERATE_FILE') {
                const { filePath, content } = action.payload;
                console.log(filePath, content);
            }
        });

        return chooseFilesPanel;
    }
    
}
