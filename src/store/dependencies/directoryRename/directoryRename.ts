import { FileContent, PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import { generateAllAction, GenerateAllParams, setDataAction } from '../../../reactViews/apps/renameFiles/actions/action';
import { WebViewReact } from '../webView/webViewReact';


export type WebViewInfoAboutRenameFiles = {
    content: string;
    filePath: string;
};

export class DirectoryRename {
    private webView: WebViewReact;

    constructor(webView: WebViewReact){
        this.webView = webView;
    }

    async showWebView(
        directoryToRenameUri: PathInfo,
        dirFiles: PathInfo[],
    ): Promise<GenerateAllParams> {

        let chooseFilesPanel = await this.webView.showWebView('Rename directory', 'reactAppRenameFiles.js');

        const files = dirFiles.map(path => new FileContent(path, fs.readFileSync(path.getPath()).toString()));

        chooseFilesPanel.webview.postMessage(setDataAction({
            createdFolderName: directoryToRenameUri.getPath(),
            allSiblingHave : files.map(file => ({
                content: file.getContent(),
                filePath: file.getPathInfo().getPath()
            }))
        }));

        return new Promise((resolve) => {
            chooseFilesPanel.webview.onDidReceiveMessage((action) => {
                if (action.type === generateAllAction.type) {
                    resolve( action.payload);
                }
            });
        });
    }
}
