import { CompareFiles, FileContent, FileContentCreator, PathInfo } from 'awesome-tree-engine';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { generateFileAction, setDataAction } from '../../../reactViews/apps/chooseFiles/actions/action';
import { compareVariableTemplate } from '../../../variableTemplate/compareVariableTemplate';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { WebViewReact } from '../webView/webViewReact';

export type WebViewInfoAboutFiles = {
    content: string;
    filePath: string;
    filePathTemplate: string;
    relativePath: string;
    fromTemplate: boolean;
    generated: boolean;
};

export class Files {
    private webView: WebViewReact;

    constructor(webView: WebViewReact){
        this.webView = webView;
    }

    async showWebView(
        createdItemUri: vscode.Uri,
        filesWithContent:WebViewInfoAboutFiles[],
        infoAboutSiblingDirectories: DirectoriesInfo,
        siblingTemplatePathFiles: string[],
        onHandleEvent: ((filePath: string, content: string) => void)
    ): Promise<vscode.WebviewPanel> {

        let chooseFilesPanel = await this.webView.showWebView('Choose files to create', 'reactAppChooseFiles.js');

        const countSiblingDirectories = Object.keys(infoAboutSiblingDirectories).length;
        const allSiblingHave: WebViewInfoAboutFiles[] = [];
        const notAllSiblingHave: WebViewInfoAboutFiles[] = [];
        const fromTemplate: WebViewInfoAboutFiles[] = [];

        filesWithContent.forEach(async(fileInfo) => {
            if (fileInfo.fromTemplate) {
                fromTemplate.push(fileInfo);
            } else if (this.countSameTemplates(siblingTemplatePathFiles, fileInfo.filePathTemplate) === countSiblingDirectories) {
                allSiblingHave.push(fileInfo);
            } else {
                notAllSiblingHave.push(fileInfo);
            }
        });

        chooseFilesPanel.webview.postMessage(setDataAction({
            createdFolderName: path.basename(createdItemUri.fsPath),
            allSiblingHave,
            notAllSiblingHave,
            fromTemplate
        }));

        chooseFilesPanel.webview.onDidReceiveMessage((action) => {
            if (action.type === generateFileAction.type) {
                const { filePath, content } = action.payload;
                onHandleEvent(filePath, content);
            }
        });

        return chooseFilesPanel;
    }

    generateFileContentByTemplate(createdItemUri: vscode.Uri, savedTemplate: string[]): string{
        const relativePath = getRelativePath(createdItemUri.fsPath);
        const infoAboutNewFile = getInfoAboutPath(relativePath);
        const content = savedTemplate.map(line =>
            renderVariableTemplate(line, [infoAboutNewFile])
        ).join('\n');

        return content;
    }

    async getContentBySibling(generateFile: PathInfo, workspacePaths: PathInfo[]): Promise<string> {


        const similarFiles: FileContent[] = workspacePaths.filter(path => generateFile.isSimilar(path)).map(path => {
            const content = fs.readFileSync(path.getPath()).toString();
            return new FileContent(path, content);
        });

        expect(similarFiles).toHaveLength(2);

        const comparer = new CompareFiles();

        similarFiles.forEach(file => {
            const contentCreator = new FileContentCreator(generateFile, file);
            const newFileContent = new FileContent(generateFile, contentCreator.createContent());

            comparer.addFile(newFileContent.getFileGraph());
        });

        return comparer.compare(0.75).getContent();
    }

    createFileContent(): string {
        // const contents: Array<string[]> = getFilesContentAsTemplate(directories, templateStringPath);

        // if (contents.length === 0) {
        return '';
        // }

        // const [baseFile, ...otherFiles] = contents;
        // const lineToGenerate: string[] = [];

        // baseFile.forEach(line => {
        //     if(this.allFilesIncludeThisLine(otherFiles, line)){
        //         lineToGenerate.push(renderVariableTemplate(line, variables));
        //     }
        // });

        // return lineToGenerate.join('');
    }

    allFilesIncludeThisLine(files: Array<string[]>, line: string): boolean {
        for (let file of files) {
            if(!this.includesThisTemplate(file, line)){
                return false;
            }
        }
        return true;
    }

    includesThisTemplate (templates: string [], templateToFind: string) {
        for (let fileLine of templates) {
            if (compareVariableTemplate(fileLine, templateToFind)) {
                return true;
            }
        }
        return false;
    }

    countSameTemplates (templates: string [], templateToFind: string) {
        let counter = 0;
        for (let template of templates) {
            if (compareVariableTemplate(template, templateToFind)) {
                counter++;
            }
        }
        return counter;
    }

    deleteSameTemplates(templates: string[]){
        return templates.reduce((uniqueTemplates, template) => {
            if(!this.includesThisTemplate(uniqueTemplates, template)){
                uniqueTemplates.push(template);
            }
            return uniqueTemplates;
        }, [] as string[]);
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
