import * as vscode from 'vscode';
import actionCreatorFactory from 'typescript-fsa';
 
const filesActionCreator = actionCreatorFactory('FILES');

export const updateFileList = filesActionCreator<string[]>('UPDATE_FILE_LIST');
export const onDidCreate = filesActionCreator<vscode.Uri>('ON_DID_CREATE');
export const createFileContentStarted = filesActionCreator<vscode.Uri>('CREATE_FILE_CONTENT_STARTED');
export const createFilesInNewDirectory = filesActionCreator<vscode.Uri>('CREATE_FILES_IN_NEW_DIRECTORY');
