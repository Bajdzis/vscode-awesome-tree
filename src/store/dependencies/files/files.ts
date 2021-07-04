import { CompareFiles, FileContent, FileContentCreator, PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { generateFileAction, setDataAction } from '../../../reactViews/apps/chooseFiles/actions/action';
import { checkAction } from '../../../reactViews/hooks/useActionHandler';
import { WebViewReact } from '../webView/webViewReact';


export class Files {
    private webView: WebViewReact;

    constructor(webView: WebViewReact){
        this.webView = webView;
    }

    async showWebView(
        createFiles: FileContent[],
        generateDirectory: PathInfo,
        onHandleEvent: ((file: FileContent) => void)
    ): Promise<vscode.WebviewPanel> {

        let chooseFilesPanel = await this.webView.showWebView('Choose files to create', 'reactAppChooseFiles.js');

        chooseFilesPanel.webview.postMessage(setDataAction({
            createdFolderName: generateDirectory.getName(),
            files: createFiles.map((file) => ({
                content: file.getContent(),
                filePath: file.getPathInfo().getPath()
            }))
        }));

        chooseFilesPanel.webview.onDidReceiveMessage((action) => {
            if (checkAction(generateFileAction, action)) {
                const { filePath, content } = action.payload;
                onHandleEvent(new FileContent(new PathInfo(filePath), content));
            }
        });

        return chooseFilesPanel;
    }

    async getContentBySibling(generateFile: PathInfo, similarPaths: PathInfo[]): Promise<string> {
        const similarFiles: FileContent[] = similarPaths
            .map(path => {
                const content = fs.readFileSync(path.getPath()).toString();
                return new FileContent(path, content);
            });

        const comparer = new CompareFiles();

        similarFiles.forEach(file => {
            const contentCreator = new FileContentCreator(generateFile, file);
            const newFileContent = new FileContent(generateFile, contentCreator.createContent());

            comparer.addFile(newFileContent.getFileGraph());
        });

        return comparer.compare(0.7).getContent();
    }

    isDirectory(uri: vscode.Uri, outputChannel?: vscode.OutputChannel): boolean  {
        try {
            return fs.lstatSync(uri.fsPath).isDirectory();
        } catch {
            outputChannel && outputChannel.appendLine(`We have problem with check file ${uri.fsPath}`);
            return false;
        }
    }

    isEmptyDirectory(uri: vscode.Uri, outputChannel: vscode.OutputChannel): boolean {
        try {
            return this.isDirectory(uri) && !fs.readdirSync(uri.fsPath).length;
        } catch {
            outputChannel.appendLine(`We have problem with check file ${uri.fsPath}`);
            return false;
        }
    }

    isFile(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isFile();
    }

    isEmptyFile(uri: vscode.Uri, outputChannel: vscode.OutputChannel): boolean {
        try {
            return this.isFile(uri) && fs.readFileSync(uri.fsPath).toString().length === 0;
        } catch {
            outputChannel.appendLine(`We have problem with check file ${uri.fsPath}`);
            return false;
        }
    }
}
