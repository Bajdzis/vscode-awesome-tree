import * as vscode from 'vscode';
import actionCreatorFactory from 'typescript-fsa';

const createContentForFileActionCreator = actionCreatorFactory('CREATE_CONTENT_FOR_FILE_WORKER');

export interface CreateContentInputParams {
    filePath: vscode.Uri
}
export const createContentInputAction = createContentForFileActionCreator<CreateContentInputParams>('INPUT');

export interface CreateContentResultParams {
    content: string | null
}

export const createContentResultAction = createContentForFileActionCreator<CreateContentResultParams>('RESULT');
