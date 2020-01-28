
import * as fs from 'fs';
import * as path from 'path';
import { DIRECTORY_FOR_TEMPLATES, findWorkspacePath } from '../commands/saveAsTemplate';
import { getRelativePath } from '../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { compareVariableTemplate } from '../variableTemplate/compareVariableTemplate';

// TODO - delete (currently use only for generate structure)
export function getMatchingTemplate (fileFsPath: string): null | string[] {

    const workspacePath = findWorkspacePath(fileFsPath);
    if (workspacePath === undefined) {
        return null;
    }
    const relativePath = getRelativePath(fileFsPath);
    const infoAboutNewFile = getInfoAboutPath(relativePath);
    const templatePath = createVariableTemplate(relativePath, [infoAboutNewFile]);
    const availableTemplates = getTemplatesDatabase_toDelete(workspacePath);

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

export interface TemplateInfo {
    baseFilePath: string;
    pathsTemplate: string[];
    templateId: string;
}

export function getTemplateContent (workspacePath: string, templateId: string): Promise<string[]> {
    const templatePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'templates', `template-${templateId}.json` );
    return new Promise((resolve, reject) => {
        fs.readFile(templatePath, (err, buffer) => {
            if(err) {
                return reject(err);
            }
            const template = JSON.parse(buffer.toString()) as string[];
            if (Array.isArray(template)) {
                return resolve(template);
            } 
            reject(`Invalid data in template: ${templateId}`);
        });
    });
}

function getTemplatesDatabase_toDelete(workspacePath: string): TemplateInfo[] {

    const templateDatabasePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );
    try {
        return JSON.parse(fs.readFileSync(templateDatabasePath).toString()) as TemplateInfo[];
    } catch {   
        return [];
    }
}

export function getTemplatesDatabase(workspacePath: string): Promise<TemplateInfo[]> {
    return new Promise((resolve) => {
        const templateDatabasePath = path.join(workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );
        fs.readFile(templateDatabasePath, (err, buffer) => {
            if (err) {
                // TODO - show error in output chanel
                return resolve([]);
            }
            let data: Partial<TemplateInfo>[] = JSON.parse(buffer.toString());
            if (!Array.isArray(data)) {
                // TODO - show error in output chanel
                return resolve([]);
            }

            resolve(data
                .map((partialTemplate: Partial<TemplateInfo>): TemplateInfo => ({
                    baseFilePath: partialTemplate.baseFilePath || '',
                    pathsTemplate: partialTemplate.pathsTemplate || [],
                    templateId: partialTemplate.templateId || '',
                }))
                .filter((template: TemplateInfo) => template)
            );
        });

    });

}
