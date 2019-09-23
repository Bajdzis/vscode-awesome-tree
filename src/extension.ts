import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInfoAboutPath, PathInfo } from './fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from './variableTemplate/renderVariableTemplate';
import { AwesomeTreeError } from './errors/AwesomeTreeError';
import { compareVariableTemplate } from './variableTemplate/compareVariableTemplate';
import { getExcludeWatchRegExp } from './settings/getExcludeWatchRegExp';
import { getRelativePath } from './fileSystem/getRelativePath';
import { getSiblingInfo, DirectoriesInfo } from './fileInfo/getSiblingInfo';
import { getPathTemplates } from './fileSystem/getPathTemplates';
import { getFilesContentAsTemplate } from './fileSystem/getFilesContentAsTemplate';

export function activate() {
    const settingProvider = vscode.workspace.getConfiguration('awesomeTree');
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*',false, true, true);
    const outputChannel = vscode.window.createOutputChannel('awesome tree');

    outputChannel.appendLine('Listening for file changes started!');

    fileSystemWatcher.onDidCreate(async(createdItemUri: vscode.Uri) => {
        try {
            
            if (getExcludeWatchRegExp(settingProvider).exec(createdItemUri.fsPath) !== null) {
                outputChannel.appendLine(`File '${createdItemUri.fsPath}' is exclude in setting! Check 'awesomeTree.excludeWatchRegExp' setting.`);
                return;
            }
            
            // when directory or file is not empty probably change name parent directory
            if (isEmptyDirectory(createdItemUri)) {
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
                    const content = createFileContent(filePathTemplate, infoAboutSiblingDirectories, [infoAboutNewDirectory]);
                    const textDocument = await createDocument(filePath, content);
        
                    vscode.window.showTextDocument(textDocument);
                });


            } else if(isFile(createdItemUri)) {
                const relativePath = getRelativePath(createdItemUri.fsPath);
                console.log(getInfoAboutPath(relativePath));
                // fill files
            }
        } catch (error) {
            const result = await vscode.window.showErrorMessage(
                `Something go wrong :( ${error.toString()}`,
                'Create issue od GitHub'
            );

            if (result === 'Create issue od GitHub') {
                createGithubIssue(error);
            }

        }
    });

    function createDocument(filePath: string, content: string): Promise<vscode.TextDocument> {
        return new Promise((resolve, reject) => {
            ensureDirectoryExistence(filePath);
            fs.writeFile(filePath, content, {}, async (err) => {
                if(err){
                    return reject(err);
                }
                vscode.workspace.openTextDocument(filePath).then(resolve);
            });
        });
    }

    function createGithubIssue(error: Error) {
        const MAX_CHARACTERS_IN_URI: number = 4000;
        let uri: string = `https://github.com/Bajdzis/vscode-awesome-tree/issues/new?title=${error.toString()}`;

        if (error instanceof AwesomeTreeError) {
            uri = `https://github.com/Bajdzis/vscode-awesome-tree/issues/new?title=${error.getTitle()}&body=${error.getBody()}`;
        }

        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(
            uri.substring(0, MAX_CHARACTERS_IN_URI)
        ));
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

    function ensureDirectoryExistence(filePath:string) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }

    function isDirectory(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isDirectory();
    }

    function isEmptyDirectory(uri: vscode.Uri): boolean {
        return isDirectory(uri) && !fs.readdirSync(uri.fsPath).length;
    }

    function isFile(uri: vscode.Uri): boolean  {
        return fs.lstatSync(uri.fsPath).isFile();
    }

}

export function deactivate() {}
