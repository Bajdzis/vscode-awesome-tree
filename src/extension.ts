import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInfoAboutPath, PathInfo } from './fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from './variableTemplate/renderVariableTemplate';
import { compareVariableTemplate } from './variableTemplate/compareVariableTemplate';
import { getExcludeWatchRegExp } from './settings/getExcludeWatchRegExp';
import { getRelativePath } from './fileSystem/getRelativePath';
import { getSiblingInfo, DirectoriesInfo } from './fileInfo/getSiblingInfo';
import { getPathTemplates } from './fileSystem/getPathTemplates';
import { getFilesContentAsTemplate } from './fileSystem/getFilesContentAsTemplate';
import { saveAsTemplate } from './commands/saveAsTemplate';
import { createDocument } from './fileSystem/createDocument';
import { getMatchingTemplate } from './savedTemplates/getMatchingTemplate';
import { reportBug } from './errors/reportBug';

export function activate(context: vscode.ExtensionContext) {
    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*',false, true, true);
    const outputChannel = vscode.window.createOutputChannel('Awesome tree');
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsTemplate', saveAsTemplate));
    outputChannel.appendLine('Listening for file changes started!');

    fileSystemWatcher.onDidCreate((createdItemUri: vscode.Uri) => {

        if (getExcludeWatchRegExp(settingProvider).exec(createdItemUri.fsPath) !== null) {
            outputChannel.appendLine(`File '${createdItemUri.fsPath}' is exclude in setting! Check 'awesomeTree.excludeWatchRegExp' setting.`);
            return;
        }
        
        // when directory or file is not empty probably change name parent directory
        if (isEmptyDirectory(createdItemUri, outputChannel)) {
            return tryCreateStructureForNewDirectory(createdItemUri).catch(reportBug);
        }

        if (isEmptyFile(createdItemUri, outputChannel)) {
            return tryCreateFileContentForNewFile(createdItemUri).catch(reportBug);
        }
    });

    async function tryCreateStructureForNewDirectory(createdItemUri: vscode.Uri) {
        const relativePath = getRelativePath(createdItemUri.fsPath);
        const infoAboutNewDirectory = getInfoAboutPath(relativePath);
        const infoAboutSiblingDirectories: DirectoriesInfo = getSiblingInfo(createdItemUri.fsPath);
        const siblingTemplatePathFiles = getPathTemplates(infoAboutSiblingDirectories);
        
        if (siblingTemplatePathFiles.length === 0) {
            return;
        }

        const uniquePathFiles = deleteSameTemplates(siblingTemplatePathFiles);

        const answersQuestion = [
            'Yes, generate files', 
            'No, thanks'
        ];

        const resultQuestion = await vscode.window.showInformationMessage(
            `Do you want to create ${uniquePathFiles.length} file(s) in new "${path.basename(createdItemUri.fsPath)}" folder?`,
            ...answersQuestion
        );

        if (resultQuestion !== answersQuestion[0]) {
            return;
        }

        uniquePathFiles.forEach(async (filePathTemplate) => {
            const filePath: string = path.join(createdItemUri.fsPath, renderVariableTemplate(filePathTemplate, [infoAboutNewDirectory]));
            const savedTemplate = getMatchingTemplate(filePath);
            
            let content: string;
            if (savedTemplate === null) {
                content = createFileContent(filePathTemplate, infoAboutSiblingDirectories, [infoAboutNewDirectory]);
            } else {
                content = savedTemplate.map(line => 
                    renderVariableTemplate(line, [infoAboutNewDirectory])
                ).join('\n');
            }
            
            const textDocument = await createDocument(filePath, content);

            vscode.window.showTextDocument(textDocument);
        });
    }

    async function tryCreateFileContentForNewFile(createdItemUri: vscode.Uri) {
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
                return fs.readFileSync(filePath).toString().split('\n');
            });

        if (contents.length < 2) {
            return;
        }

        const [baseFile, ...otherFiles] = contents;
        const lineToGenerate: string[] = [];

        baseFile.forEach(line => {
            const lineTemplate = renderVariableTemplate(line, [infoAboutNewFile]);
            if(allFilesIncludeThisLine(otherFiles, line)){
                lineToGenerate.push(lineTemplate);
            }
        });

        const content = lineToGenerate.join('\n');

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

    function createFileContent(templateStringPath:string, directories: DirectoriesInfo, variables: PathInfo[]): string {
        const contents: Array<string[]> = getFilesContentAsTemplate(directories, templateStringPath);

        if (contents.length === 0) {
            return '';
        }
		
        const [baseFile, ...otherFiles] = contents;
        const lineToGenerate: string[] = [];

        baseFile.forEach(line => {
            if(allFilesIncludeThisLine(otherFiles, line)){
                lineToGenerate.push(renderVariableTemplate(line, variables));
            }
        });

        return lineToGenerate.join('\n');
    }

    function allFilesIncludeThisLine(files: Array<string[]>, line: string): boolean{
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if(!includesThisTemplate(file, line)){
                return false;
            }
        }
        return true;
    }

    function includesThisTemplate (templates: string [], templateToFind: string) {
        for (let j = 0; j < templates.length; j++) {
            const fileLine = templates[j];
            if (compareVariableTemplate(fileLine, templateToFind)) {
                return true;
            }
        }
        return false;
    }

    function deleteSameTemplates(templates: string[]){
        return templates.reduce((uniqueTemplates, template) => {
            if(!includesThisTemplate(uniqueTemplates, template)){
                uniqueTemplates.push(template);
            }
            return uniqueTemplates;
        }, [] as string[]);
    }

    function isDirectory(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isDirectory();
    }

    function isEmptyDirectory(uri: vscode.Uri, outputChannel: vscode.OutputChannel): boolean {
        try {
            return isDirectory(uri) && !fs.readdirSync(uri.fsPath).length;
        } catch {
            outputChannel.appendLine(`We have problem with check file ${uri.fsPath}`);
            return false;
        }
    }

    function isFile(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isFile();
    }

    function isEmptyFile(uri: vscode.Uri, outputChannel: vscode.OutputChannel): boolean {
        try {
            return isFile(uri) && fs.readFileSync(uri.fsPath).toString().length === 0;
        } catch {
            outputChannel.appendLine(`We have problem with check file ${uri.fsPath}`);
            return false;
        }
    }

}

export function deactivate() {}
