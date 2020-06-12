import * as fs from 'fs';
import * as path from 'path';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { compareVariableTemplate } from '../variableTemplate/compareVariableTemplate';
import { DirectoriesInfo } from '../fileInfo/getSiblingInfo';
import { splitStringWithSplitter } from '../strings/splitStringWithSplitter';

export function getFilesContentAsTemplate(directoriesInfo: DirectoriesInfo, templateStringPath: string): Array<string[]> {
    const contents: Array<string[]> = [];

    Object.keys(directoriesInfo).forEach(directoryPath => {
        const directory = directoriesInfo[directoryPath];
        directory.filesPath.forEach((fileRelativePath) => {
            const pathTemplate = createVariableTemplate(fileRelativePath, [directory.directoryInfo]);
            if (compareVariableTemplate(pathTemplate, templateStringPath)) {
                const filePath = path.join(directoryPath, fileRelativePath);
                let lines: string[];
                try {
                    lines = splitStringWithSplitter(fs.readFileSync(filePath).toString(), '\n ,');
                } catch (error) {
                    lines = [];
                }
                if (lines.length !== 0) {
                    const templateLines = lines.map(line => createVariableTemplate(line,[directory.directoryInfo]));
                    contents.push(templateLines);
                }
            }
        });
    });

    return contents;
}
