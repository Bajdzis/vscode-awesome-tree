import * as vscode from 'vscode';
import actionCreatorFactory from 'typescript-fsa';
import { PathInfo, FileContent } from 'awesome-tree-engine';

const filesActionCreator = actionCreatorFactory('FILES');

export const onDidCreate = filesActionCreator<PathInfo>('ON_DID_CREATE');
export const onDidChange = filesActionCreator<PathInfo>('ON_DID_CHANGE');
export const onDidDelete = filesActionCreator<PathInfo>('ON_DID_DELETE');

export interface OnRegisterWorkspaceParam {
    filePaths: string[];
    workspacePath: string;
}

export const onRegisterWorkspace = filesActionCreator<OnRegisterWorkspaceParam>('ON_REGISTER_WORKSPACE');

// export interface RegisterTemplatesParam {
//     templates: TemplateInfo[];
//     workspacePath: string;
// }
// export const registerTemplates = filesActionCreator<RegisterTemplatesParam>('REGISTER_TEMPLATES');

// export interface RegisterTemplateParam {
//     templateId: string;
//     content: string[];
// }
// export const registerTemplate = filesActionCreator<RegisterTemplateParam>('REGISTER_TEMPLATE');

export const fillFileContentStarted = filesActionCreator<PathInfo>('FILL_FILE_CONTENT_STARTED');
// export const fillFileContentBySibling = filesActionCreator<vscode.Uri>('FILL_FILE_CONTENT_BY_SIBLING');

export const createFileContentStarted = filesActionCreator<FileContent>('CREATE_FILE_CONTENT_STARTED');
export const createFileContentCancel = filesActionCreator<PathInfo>('CREATE_FILE_CONTENT_CANCEL');
export const createFilesInNewDirectory = filesActionCreator<vscode.Uri>('CREATE_FILES_IN_NEW_DIRECTORY');
export const renameCopyDirectory = filesActionCreator<vscode.Uri>('RENAME_COPY_DIRECTORY');

export interface CreateNewTemplateParam {
    uri: vscode.Uri;
    workspacePath: string;
}

// export interface CreateNewTemplateResult extends TemplateInfo {
//     templateLines: string[];
// }

// export const createNewTemplate = filesActionCreator.async<CreateNewTemplateParam, CreateNewTemplateResult, Error>('CREATE_FILE_CONTENT_BY_SIBLING');

export const renameDirectory = filesActionCreator.async<vscode.Uri, void, Error>('RENAME_DIRECTORY');

export interface UpdateGitIgnoreFileParam {
    path: string;
    lines: string[];
}

export const updateGitIgnoreFile = filesActionCreator<UpdateGitIgnoreFileParam>('UPDATE_GIT_IGNORE_FILE');
