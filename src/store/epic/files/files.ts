import * as vscode from 'vscode';
import { merge } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { delay, filter, tap, ignoreElements, mergeMap } from 'rxjs/operators';
import { RootEpic } from '..';
import { onDidCreate, createFileContentStarted, createFilesInNewDirectory } from '../../action/files/files';
import { reportBug } from '../../../errors/reportBug';

export const filesEpic: RootEpic<Action<vscode.Uri>> = (action$, state$, { config, outputChannel, files }) =>
    merge( 
        action$.pipe(
            ofType(createFileContentStarted.type),
            tap(({payload}: Action<vscode.Uri>) => {
                files.tryCreateFileContentForNewFile(payload).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType(createFilesInNewDirectory.type),
            tap(({payload}: Action<vscode.Uri>) => {
                files.tryCreateStructureForNewDirectory(payload).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType(onDidCreate.type),
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
