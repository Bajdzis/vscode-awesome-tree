import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { registerTemplates, createNewTemplate } from '../../action/files/files';
import { TemplateInfo } from '../../../savedTemplates/getMatchingTemplate';

export interface TemplatesStateWorkspace {
    [workspacePath: string]: TemplateInfo[];
}

export interface TemplatesStateContents {
    [templateId: string]: string[];
}

export interface TemplatesState {
    workspaces: TemplatesStateWorkspace;
    contents: TemplatesStateContents;
}

const INITIAL_STATE: TemplatesState = {
    workspaces: {},
    contents: {}
};

export const templatesReducer = reducerWithInitialState<TemplatesState>(INITIAL_STATE)
    .case(registerTemplates, (state: TemplatesState, payload): TemplatesState => ({
        ...state,
        workspaces: {
            ...state.workspaces,
            [payload.workspacePath]: [...(state.workspaces[payload.workspacePath] || []), ...payload.templates]
        }
    }))
    .case(createNewTemplate.done, (state: TemplatesState, {params, result}): TemplatesState => ({
        ...state,
        contents: {
            ...state.contents,
            [result.templateId]: result.templateLines
        },
        workspaces: {
            ...state.workspaces,
            [params.workspacePath]: [
                ...state.workspaces[params.workspacePath], 
                {
                    baseFilePath: result.baseFilePath,
                    pathsTemplate: result.pathsTemplate,
                    templateId: result.templateId,
                }
            ]
        }
    }));
