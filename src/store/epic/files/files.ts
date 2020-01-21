import * as vscode from 'vscode';
import * as path from 'path';
import { merge } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { delay, filter, tap, ignoreElements, mergeMap, map } from 'rxjs/operators';
import { RootEpic } from '..';
import { onDidCreate, createFileContentStarted, createFilesInNewDirectory, createFileContentByTemplate, createFileContentBySibling, CreateFileContentByTemplateParam } from '../../action/files/files';
import { reportBug } from '../../../errors/reportBug';
import { getMatchingTemplate } from '../../../savedTemplates/getMatchingTemplate';
import { createDocument } from '../../../fileSystem/createDocument';

type InputAction = 
Action<CreateFileContentByTemplateParam> | Action<vscode.Uri>;

export const filesEpic: RootEpic<InputAction> = (action$, state$, { config, outputChannel, files }) =>
    merge( 
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFileContentStarted.type),
            map(({payload}: Action<vscode.Uri>) => {
                const baseTemplate = getMatchingTemplate(payload.fsPath);
                if (baseTemplate !== null) {
                    return createFileContentByTemplate({
                        createPath: payload,
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
            tap(async ({createPath, content}) => {

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
                    createDocument(createPath.fsPath, content).catch(reportBug);
                }

            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateFileContentByTemplateParam>>(createFileContentByTemplate.type),
            tap(({payload}: Action<CreateFileContentByTemplateParam>) => {
                files.createFileByTemplate(payload.createPath, payload.baseTemplate).catch(reportBug);
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
            ofType<InputAction, Action<vscode.Uri>>(onDidCreate.type),
            filter(({payload}: Action<vscode.Uri>) => {
                if (config.getExcludeWatchRegExp().exec(payload.fsPath) !== null) {
                    outputChannel.appendLine(`File '${payload.fsPath}' is exclude in setting! Check 'awesomeTree.excludeWatchRegExp' setting.`);
                    return false;
                }
                return true;
            }),
            delay(10),
            mergeMap(({payload}: Action<vscode.Uri>) => {
                // when directory or file is not empty probably change name parent directory
                if (files.isEmptyDirectory(payload, outputChannel)) {
                    return [createFilesInNewDirectory(payload)];
                }

                if (files.isEmptyFile(payload, outputChannel)) {
                    return [createFileContentStarted(payload)];
                }

                return [];
            }),
        )
    );
