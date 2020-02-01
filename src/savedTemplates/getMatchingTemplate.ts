
import * as fs from 'fs';
import * as path from 'path';
import { DIRECTORY_FOR_TEMPLATES } from '../commands/saveAsTemplate';

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
