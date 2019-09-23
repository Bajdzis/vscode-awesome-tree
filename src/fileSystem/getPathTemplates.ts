import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { DirectoriesInfo } from '../fileInfo/getSiblingInfo';

export function getPathTemplates(directoriesInfo: DirectoriesInfo): string[]{
    const pathTemplates: string[] = [];
    Object.keys(directoriesInfo).forEach((path) => {
        const {directoryInfo, filesPath} = directoriesInfo[path];

        filesPath.forEach((fileName) => {
            const pathTemplate = createVariableTemplate(fileName, [directoryInfo]);
            pathTemplates.push(pathTemplate);
        });

    });
    return pathTemplates;
}

