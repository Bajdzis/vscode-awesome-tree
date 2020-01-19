import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { compareVariableTemplate } from '../../../variableTemplate/compareVariableTemplate';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { getSiblingInfo, DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getPathTemplates } from '../../../fileSystem/getPathTemplates';
import { getFilesContentAsTemplate } from '../../../fileSystem/getFilesContentAsTemplate';
import { createDocument } from '../../../fileSystem/createDocument';
import { getMatchingTemplate } from '../../../savedTemplates/getMatchingTemplate';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { WebView } from '../webView/webView';
import { splitStringWithSplitter } from '../../../strings/splitStringWithSplitter';

export class Files {
    private chooseFilesTemplateWebView: string;
    private webView: WebView;

    constructor(webView: WebView){
        this.webView = webView;
        this.chooseFilesTemplateWebView = this.webView.getWebViewTemplate('chooseFiles');
    }

    async tryCreateStructureForNewDirectory(createdItemUri: vscode.Uri) {
        const relativePath = getRelativePath(createdItemUri.fsPath);
        const infoAboutNewDirectory = getInfoAboutPath(relativePath);
        const infoAboutSiblingDirectories: DirectoriesInfo = getSiblingInfo(createdItemUri.fsPath);
        const siblingTemplatePathFiles = getPathTemplates(infoAboutSiblingDirectories);
        
        if (siblingTemplatePathFiles.length === 0) {
            return;
        }

        const uniquePathFiles = this.deleteSameTemplates(siblingTemplatePathFiles);

        const answersQuestion = [
            'Yes, generate files',
            'Yes, let me choose', 
            'No, thanks'
        ];

        const resultQuestion = await vscode.window.showInformationMessage(
            `Do you want to create ${uniquePathFiles.length} file(s) in new "${path.basename(createdItemUri.fsPath)}" folder?`,
            ...answersQuestion
        );

        if (resultQuestion === answersQuestion[2]) {
            return;
        }

        let chooseFilesPanel: vscode.WebviewPanel | null = null;

        if (resultQuestion === answersQuestion[1]) {
            chooseFilesPanel = await this.webView.showWebView(this.chooseFilesTemplateWebView, 'Choose files to create');
        }

        const filesWithContent = uniquePathFiles.map( (filePathTemplate) => {
            const relativePathFile = renderVariableTemplate(filePathTemplate, [infoAboutNewDirectory]);
            const filePath: string = path.join(createdItemUri.fsPath, relativePathFile);
            const savedTemplate = getMatchingTemplate(filePath);
            
            let content: string;
            let fromTemplate: boolean = false;
            if (savedTemplate === null) {
                content = this.createFileContent(filePathTemplate, infoAboutSiblingDirectories, [infoAboutNewDirectory]);
            } else {
                fromTemplate = true;
                content = savedTemplate.map(line => 
                    renderVariableTemplate(line, [infoAboutNewDirectory])
                ).join('\n');
            }
            return { 
                filePath, 
                filePathTemplate, 
                content, 
                fromTemplate, 
                relativePath: path.join(relativePath, relativePathFile)
            };

        });

        if (resultQuestion === answersQuestion[0]) {
            filesWithContent.forEach(async({filePath, content}) => {
                const textDocument = await createDocument(filePath, content);
                vscode.window.showTextDocument(textDocument);
            });
        } else {
            type WebViewInfoAboutFiles = {
                content: string;
                filePath: string;
                relativePath: string;
                [key:string]: any;
            };
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

            chooseFilesPanel && chooseFilesPanel.webview.postMessage({ 
                type: 'SET_DATA', 
                payload : {
                    createdFolderName: path.basename(createdItemUri.fsPath),
                    allSiblingHave,
                    notAllSiblingHave,
                    fromTemplate
                }
            });
    
            chooseFilesPanel && chooseFilesPanel.webview.onDidReceiveMessage((action) => {
                if (action.type === 'GENERATE_FILE') {
                    const { filePath, content } = action.payload;
                    createDocument(filePath, content);
                }
            });
        }
    }

    async tryCreateFileContentForNewFile(createdItemUri: vscode.Uri) {
        const savedTemplate = getMatchingTemplate(createdItemUri.fsPath);
        const relativePath = getRelativePath(createdItemUri.fsPath);
        const infoAboutNewFile = getInfoAboutPath(relativePath);
        if (savedTemplate!==null) {
         
            const content = savedTemplate.map(line => 
                renderVariableTemplate(line, [infoAboutNewFile])
            ).join('\n');

            createDocument(createdItemUri.fsPath, content);
            return;
        }

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
            return;
        }

        const [baseFile, ...otherFiles] = contents;
        const linesToGenerate: string[] = baseFile
            .filter((line) => this.allFilesIncludeThisLine(otherFiles, line));

        const content = linesToGenerate.map(line => 
            renderVariableTemplate(line, [infoAboutNewFile])
        ).join('');

        if (content.length === 0) {
            return;
        }

        const answersQuestion = [
            'Yes, create content', 
            'No, thanks'
        ];

        const resultQuestion = await vscode.window.showInformationMessage(
            `Do you want to create content for new file '${fileToSkip}' in folder "${parentDir}"?`,
            ...answersQuestion
        );

        if (resultQuestion !== answersQuestion[0]) {
            return;
        }

        createDocument(createdItemUri.fsPath, content);
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
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if(!this.includesThisTemplate(file, line)){
                return false;
            }
        }
        return true;
    }

    includesThisTemplate (templates: string [], templateToFind: string) {
        for (let j = 0; j < templates.length; j++) {
            const fileLine = templates[j];
            if (compareVariableTemplate(fileLine, templateToFind)) {
                return true;
            }
        }
        return false;
    }

    countSameTemplates (templates: string [], templateToFind: string) {
        let counter = 0;
        for (let j = 0; j < templates.length; j++) {
            const template = templates[j];
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

    isDirectory(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isDirectory();
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
