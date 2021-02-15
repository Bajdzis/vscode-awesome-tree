import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getFilesContentAsTemplate } from '../../../fileSystem/getFilesContentAsTemplate';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { generateFileAction, setDataAction } from '../../../reactViews/apps/chooseFiles/actions/action';
import { splitStringWithSplitter } from '../../../strings/splitStringWithSplitter';
import { compareVariableTemplate } from '../../../variableTemplate/compareVariableTemplate';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { WebViewReact } from '../webView/webViewReact';

export type WebViewInfoAboutFiles = {
    content: string;
    filePath: string;
    filePathTemplate: string;
    relativePath: string;
    fromTemplate: boolean;
};

export class Files {
    // private chooseFilesTemplateWebView: string;
    private webView: WebViewReact;

    constructor(webView: WebViewReact){
        this.webView = webView;
        // this.chooseFilesTemplateWebView = this.webView.getWebViewTemplate('chooseFiles');
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

    getContentBySibling(createdItemUri: vscode.Uri): string {
        const relativePath = getRelativePath(createdItemUri.fsPath);
        const infoAboutNewFile = getInfoAboutPath(relativePath);
        const parentDir = path.dirname(createdItemUri.fsPath);

        const fileToSkip = path.basename(createdItemUri.fsPath);
        const contents = fs.readdirSync(parentDir)
            .filter(siblingFile => fs.lstatSync(path.join(parentDir, siblingFile)).isFile() && siblingFile !== fileToSkip)
            .map(siblingFile => {
                const filePath = path.join(parentDir, siblingFile);
                const infoAboutFilePath = getInfoAboutPath(getRelativePath(filePath));
                const lines = splitStringWithSplitter(fs.readFileSync(filePath).toString(), '\n{} ,()');
                return lines.map(line => createVariableTemplate(line, [infoAboutFilePath]));
            });

        if (contents.length < 2) {
            return '';
        }

        const [baseFile, ...otherFiles] = contents;
        const linesToGenerate: string[] = baseFile
            .filter((line) => this.allFilesIncludeThisLine(otherFiles, line));

        const content = linesToGenerate.map(line => 
            renderVariableTemplate(line, [infoAboutNewFile])
        ).join('');

        return content;
    }

    createFileContent(templateStringPath:string, directories: DirectoriesInfo, variables: PathInfo[]): string {
        const contents: Array<string[]> = getFilesContentAsTemplate(directories, templateStringPath);

        if (contents.length === 0) {
            return '';
        }
		
        const [baseFile, ...otherFiles] = contents;
        const lineToGenerate: string[] = [];

        baseFile.forEach(line => {
            if(this.allFilesIncludeThisLine(otherFiles, line)){
                lineToGenerate.push(renderVariableTemplate(line, variables));
            }
        });

        return lineToGenerate.join('');
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
