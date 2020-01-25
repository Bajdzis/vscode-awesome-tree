import * as fs from 'fs';
import * as vscode from 'vscode';
import * as uuid from 'uuid/v4';
import { getRelativePath } from '../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';

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

export function getTemplateBaseOnFile(file: vscode.Uri) {

    const relativePath = getRelativePath(file.fsPath);
    const templateId = uuid();
    const infoAboutNewFile = getInfoAboutPath(relativePath);
    const lines = fs.readFileSync(file.fsPath).toString().split('\n');
    const templateLines = lines.map(line => createVariableTemplate(line, [infoAboutNewFile]));
    
    return {
        baseFilePath: relativePath,
        pathsTemplate: [
            createVariableTemplate(relativePath, [infoAboutNewFile])
        ],
        templateId,
        templateLines
    };
}
