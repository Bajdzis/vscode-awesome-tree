import { findWorkspacePath } from '../../../commands/saveAsTemplate';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { RootState } from '../../reducer';
import { compareVariableTemplate } from '../../../variableTemplate/compareVariableTemplate';

export function getMatchingTemplate (fileFsPath: string): (state: RootState) => null | string[] {
    return (state) => {
        const workspacePath = findWorkspacePath(fileFsPath);
        if (workspacePath === undefined) {
            return null;
        }
        const relativePath = getRelativePath(fileFsPath);
        const infoAboutNewFile = getInfoAboutPath(relativePath);
        const templatePath = createVariableTemplate(relativePath, [infoAboutNewFile]);
        const availableTemplates = state.templates.workspaces[workspacePath];
        
        for (let templateInfo of availableTemplates) {
            for (let pathTemplate of templateInfo.pathsTemplate) {
                if(compareVariableTemplate(pathTemplate, templatePath)){
                    const templateId = templateInfo.templateId;
                    const content = state.templates.contents[templateId];
                    return content || null;
                }
            }
        }
        return null;
    };
}
