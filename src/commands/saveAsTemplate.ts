import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as uuid from 'uuid/v4';
import { getRelativePath } from '../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { createDocument } from '../fileSystem/createDocument';
import { addExtensionToRecommendations } from '../fileSystem/addExtensionToRecommendations';

export const DIRECTORY_FOR_TEMPLATES = 'awesome-tree-templates';

export function findWorkspacePath(searchFsPath:string): string | undefined {
    const { workspaceFolders } = vscode.workspace;
    if(!workspaceFolders){
        return;
    }
    for (let i = 0; i < workspaceFolders.length; i++) {
        const {fsPath} = workspaceFolders[i].uri;
        if(searchFsPath.indexOf(fsPath) === 0){
            return fsPath;
        }
    }
}

export function saveAsTemplate(file: vscode.Uri) {
    const workspacePath = findWorkspacePath(file.fsPath);
    if (workspacePath === undefined) {
        vscode.window.showWarningMessage(`Can't find workspace directory for file: '${file.fsPath}'`);
        return;
    }

    const relativePath = getRelativePath(file.fsPath);
    const templateId = uuid();
    const templatePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'templates', `template-${templateId}.json` );
    const templateDatabasePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );
    const infoAboutNewFile = getInfoAboutPath(relativePath);
    const lines = fs.readFileSync(file.fsPath).toString().split('\n');
    const templateLines = lines.map(line => createVariableTemplate(line, [infoAboutNewFile]));
    
    const template = {
        baseFilePath: relativePath,
        pathsTemplate: [
            createVariableTemplate(relativePath, [infoAboutNewFile])
        ],
        templateId
    };

    let currentSavedTemplates: Array<any>;

    try {
        currentSavedTemplates = JSON.parse(fs.readFileSync(templateDatabasePath).toString());
    } catch (error) {
        currentSavedTemplates = [];
    }

    currentSavedTemplates.push(template);

    Promise.all([
        createDocument(templatePath, JSON.stringify(templateLines, null, 4)),
        createDocument(templateDatabasePath, JSON.stringify(currentSavedTemplates, null, 4))
    ]).then(() => {
        vscode.window.showInformationMessage('Saved success!');
        addExtensionToRecommendations(workspacePath);
    });
}
