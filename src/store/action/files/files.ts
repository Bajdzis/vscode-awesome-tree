import * as vscode from 'vscode';
import actionCreatorFactory from 'typescript-fsa';
import { TemplateInfo } from '../../../savedTemplates/getMatchingTemplate';
 
const filesActionCreator = actionCreatorFactory('FILES');

export interface WatchFileSystemParam {
    uri: vscode.Uri,
    type: 'file' | 'directory'
}

export const onDidCreate = filesActionCreator<WatchFileSystemParam>('ON_DID_CREATE');
export const onDidChange = filesActionCreator<WatchFileSystemParam>('ON_DID_CHANGE');
export const onDidDelete = filesActionCreator<vscode.Uri>('ON_DID_DELETE');

export interface OnRegisterWorkspaceParam {
    filePaths: string[];
    workspacePath: string;
}

export const onRegisterWorkspace = filesActionCreator<OnRegisterWorkspaceParam>('ON_REGISTER_WORKSPACE');

export interface RegisterTemplatesParam {
    templates: TemplateInfo[];
    workspacePath: string;
}
export const registerTemplates = filesActionCreator<RegisterTemplatesParam>('REGISTER_TEMPLATES');

export interface RegisterTemplateParam {
    templateId: string;
    content: string[];
}
export const registerTemplate = filesActionCreator<RegisterTemplateParam>('REGISTER_TEMPLATE');

export const fillFileContentStarted = filesActionCreator<vscode.Uri>('FILL_FILE_CONTENT_STARTED');
export const fillFileContentBySibling = filesActionCreator<vscode.Uri>('FILL_FILE_CONTENT_BY_SIBLING');

export interface CreateFileContentStartedParam {
    uri: vscode.Uri;
    content: string;
}
export const createFileContentStarted = filesActionCreator<CreateFileContentStartedParam>('CREATE_FILE_CONTENT_STARTED');
export const createFileContentCancel = filesActionCreator<vscode.Uri>('CREATE_FILE_CONTENT_CANCEL');
export const createFilesInNewDirectory = filesActionCreator<vscode.Uri>('CREATE_FILES_IN_NEW_DIRECTORY');
export const renameCopyDirectory = filesActionCreator<vscode.Uri>('RENAME_COPY_DIRECTORY');

export interface CreateNewTemplateParam {
    uri: vscode.Uri;
    workspacePath: string;
}

export interface CreateNewTemplateResult extends TemplateInfo {
    templateLines: string[];
}

export const createNewTemplate = filesActionCreator.async<CreateNewTemplateParam, CreateNewTemplateResult, Error>('CREATE_FILE_CONTENT_BY_SIBLING');

