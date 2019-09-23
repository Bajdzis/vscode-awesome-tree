import * as fs from 'fs';
import * as path from 'path';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { compareVariableTemplate } from '../variableTemplate/compareVariableTemplate';
import { DirectoriesInfo } from '../fileInfo/getSiblingInfo';

export function getFilesContentAsTemplate(directoriesInfo: DirectoriesInfo, templateStringPath: string): Array<string[]> {
    const contents: Array<string[]> = [];

    Object.keys(directoriesInfo).forEach(directoryPath => {
        const directory = directoriesInfo[directoryPath];
        directory.filesPath.forEach((fileRelativePath) => {
            const pathTemplate = createVariableTemplate(fileRelativePath, [directory.directoryInfo]);
            if (compareVariableTemplate(pathTemplate, templateStringPath)) {
                const filePath = path.join(directoryPath, fileRelativePath);
                const lines = fs.readFileSync(filePath).toString().split('\n');
                const templateLines = lines.map(line => createVariableTemplate(line,[directory.directoryInfo]));
                contents.push(templateLines);
            }
        });
    });

    return contents;
}
