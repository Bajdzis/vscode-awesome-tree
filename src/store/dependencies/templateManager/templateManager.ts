import * as fs from 'fs';
import * as vscode from 'vscode';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { generateTemplateAction, setDataAction } from '../../../reactViews/apps/newTemplate/actions/action';
import { WebViewReact } from '../webView/webViewReact';

export type WebViewInfoAboutManagerFiles = {
    globs: string[];
    templateContentLines: string[];
};

export class TemplateManager {
    private webView: WebViewReact;
    
    constructor(webView: WebViewReact){
        this.webView = webView;
    }

    async showWebView(
        baseFile: vscode.Uri
    ): Promise<WebViewInfoAboutManagerFiles> {

        let chooseFilesPanel = await this.webView.showWebView('New template', 'reactAppNewTemplate.js');

        const fileRelativePath = getRelativePath(baseFile.fsPath);
        const fileContent = fs.readFileSync(baseFile.fsPath).toString();

        chooseFilesPanel.webview.postMessage(setDataAction({
            fileRelativePath,
            fileContent
        }));

        return new Promise((resolve) => {
            chooseFilesPanel.webview.onDidReceiveMessage((action) => {
                if (action.type === generateTemplateAction.type) {
                    resolve({
                        globs: action.payload.globs,
                        templateContentLines: action.payload.templateContent
                    });
                }
            });
        });
    }
}
