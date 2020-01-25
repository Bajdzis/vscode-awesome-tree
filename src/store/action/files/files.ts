import * as vscode from 'vscode';
import actionCreatorFactory from 'typescript-fsa';
 
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

export const createFileContentStarted = filesActionCreator<vscode.Uri>('CREATE_FILE_CONTENT_STARTED');
export const createFilesInNewDirectory = filesActionCreator<vscode.Uri>('CREATE_FILES_IN_NEW_DIRECTORY');

export interface CreateFileContentByTemplateParam {
    createPath: vscode.Uri;
    baseTemplate: string[];
}

export const createFileContentByTemplate = filesActionCreator<CreateFileContentByTemplateParam>('CREATE_FILE_CONTENT_BY_TEMPLATE');
export const createFileContentBySibling = filesActionCreator<vscode.Uri>('CREATE_FILE_CONTENT_BY_SIBLING');
