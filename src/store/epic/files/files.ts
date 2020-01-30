import * as vscode from 'vscode';
import * as path from 'path';
import { merge } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { delay, filter, tap, ignoreElements, mergeMap, map } from 'rxjs/operators';
import { RootEpic } from '..';
import { onDidCreate, fillFileContentStarted, createFilesInNewDirectory, createFileContentByTemplate, createFileContentBySibling, CreateFileContentByTemplateParam, WatchFileSystemParam, createFileContentStarted, CreateFileContentStartedParam, createFileContentCancel } from '../../action/files/files';
import { reportBug } from '../../../errors/reportBug';
import { getMatchingTemplate } from '../../selectors/templates/templates';
import { createDocument } from '../../../fileSystem/createDocument';

type InputAction = 
Action<CreateFileContentByTemplateParam> | Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam>;

export const filesEpic: RootEpic<InputAction> = (action$, state$, { config, outputChannel, files }) =>
    merge( 
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(fillFileContentStarted.type),
            map(({payload}: Action<vscode.Uri>) => {
                const baseTemplate = getMatchingTemplate(payload.fsPath)(state$.value);
                if (baseTemplate !== null) {
                    return createFileContentByTemplate({
                        createUri: payload,
                        baseTemplate
                    });
                }
                return createFileContentBySibling(payload);
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFileContentBySibling.type),
            map(({payload}: Action<vscode.Uri>) => ({
                createPath: payload,
                content: files.getContentBySibling(payload)
            })),
            filter(({content}) => !!content.length),
            mergeMap(async ({createPath, content}) => {

                const parentDir = path.dirname(createPath.fsPath);
                const fileName = path.basename(createPath.fsPath);

                const answersQuestion = [
                    'Yes, create content', 
                    'No, thanks'
                ];
        
                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to create content for new file '${fileName}' in folder "${parentDir}"?`,
                    ...answersQuestion
                );
        
                if (resultQuestion === answersQuestion[0]) {
                    return createFileContentStarted({uri: createPath,  content});//createDocument(createPath.fsPath, content).then(() => {}).catch(reportBug);
                }

                return createFileContentCancel(createPath);

            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateFileContentByTemplateParam>>(createFileContentByTemplate.type),
            tap(({payload}: Action<CreateFileContentByTemplateParam>) => {
                files.createFileByTemplate(payload.createUri, payload.baseTemplate).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateFileContentStartedParam>>(createFileContentStarted.type),
            tap(({payload}: Action<CreateFileContentStartedParam>) => {
                createDocument(payload.uri.fsPath, payload.content).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFilesInNewDirectory.type),
            tap(({payload}: Action<vscode.Uri>) => {
                files.tryCreateStructureForNewDirectory(payload).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<WatchFileSystemParam>>(onDidCreate.type),
            filter(({payload}: Action<WatchFileSystemParam>) => config.canUseThisFile(payload.uri)),
            delay(10),
            mergeMap(({payload}: Action<WatchFileSystemParam>) => {
                // when directory or file is not empty probably change name parent directory
                if (files.isEmptyDirectory(payload.uri, outputChannel)) {
                    return [createFilesInNewDirectory(payload.uri)];
                }

                if (files.isEmptyFile(payload.uri, outputChannel)) {
                    return [fillFileContentStarted(payload.uri)];
                }

                return [];
            }),
        )
    );
