
import * as fs from 'fs';
import * as path from 'path';
import { DIRECTORY_FOR_TEMPLATES, findWorkspacePath } from '../commands/saveAsTemplate';
import { getRelativePath } from '../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { compareVariableTemplate } from '../variableTemplate/compareVariableTemplate';

export function getMatchingTemplate (fileFsPath: string): null | string[] {

    const workspacePath = findWorkspacePath(fileFsPath);
    if (workspacePath === undefined) {
        return null;
    }
    const relativePath = getRelativePath(fileFsPath);
    const infoAboutNewFile = getInfoAboutPath(relativePath);
    const templatePath = createVariableTemplate(relativePath, [infoAboutNewFile]);
    const availableTemplates = getTemplatesDatabase(workspacePath);

    for (let i = 0; i < availableTemplates.length; i++) {
        const templateInfo = availableTemplates[i];
        for (let j = 0; j < templateInfo.pathsTemplate.length; j++) {
            const pathTemplate = templateInfo.pathsTemplate[j];
            if(compareVariableTemplate(pathTemplate, templatePath)){
                const templateId = templateInfo.templateId;
                const templatePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'templates', `template-${templateId}.json` );
                try {
                    return JSON.parse(fs.readFileSync(templatePath).toString()) as string[];
                } catch  {
                    return null;
                }
            }
        }
    }

    return null;
}

interface TemplateInfo {
    baseFilePath: string;
    pathsTemplate: string[];
    templateId: string;
}

function getTemplatesDatabase(workspacePath: string): TemplateInfo[] {

    const templateDatabasePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );
    try {
        return JSON.parse(fs.readFileSync(templateDatabasePath).toString()) as TemplateInfo[];
    } catch {   
        return [];
    }
}
