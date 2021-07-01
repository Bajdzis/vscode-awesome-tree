import * as path from 'path';
import { ofType } from 'redux-observable';
import { merge, Observable } from 'rxjs';
import { bufferTime, filter, map, mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { createDocument } from '../../../fileSystem/createDocument';
import { deleteDocument } from '../../../fileSystem/deleteDocument';
import { OnRegisterWorkspaceParam, renameCopyDirectory, renameDirectory } from '../../action/files/files';
import { generateFinish, generateStarted } from '../../action/lock/lock';
import { WebViewInfoAboutRenameFiles } from '../../dependencies/directoryRename/directoryRename';
import { getFilesInDirectory, getFirstDirectoryWithSameFiles } from '../../selectors/files/files';

type InputAction = Action<vscode.Uri> | Action<OnRegisterWorkspaceParam>;

export const renameDirectoryEpic: RootEpic<InputAction> = (action$, state$, { directoryRename }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(renameCopyDirectory.type),
            bufferTime(300),
            filter(events => !!events.length),
            map((actions) => actions.reduce((acc, next) => {
                if(acc.payload.fsPath.length > next.payload.fsPath.length) {
                    return next;
                }
                return acc;
            }, actions[0])),
            filter(({ payload }) => !!getFirstDirectoryWithSameFiles(payload.fsPath)(state$.value)),
            mergeMap(async ({ payload }) => {

                const parentDir = path.dirname(payload.fsPath);
                const fileName = path.basename(payload.fsPath);

                const answersQuestion = [
                    'Yes, rename directory',
                    'No, thanks'
                ];

                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to rename directory '${fileName}' from "${parentDir}"?`,
                    ...answersQuestion
                );

                if (resultQuestion === answersQuestion[0]) {
                    return renameDirectory.started(payload);
                }

                return renameDirectory.failed({
                    error: new Error('abort by user'),
                    params: payload
                });

            })
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(renameDirectory.started.type),
            mergeMap(async ({payload}) => {
                const dirFiles = getFilesInDirectory(payload.fsPath)(state$.value);
                renameDirectory.started(payload);
                return await directoryRename.showWebView(payload, dirFiles);
            }),
            mergeMap((files: WebViewInfoAboutRenameFiles[]) => new Observable<Action<any>>((observer) => {
                observer.next(generateStarted());

                const filesOperation = async () => {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        await createDocument(file.filePath, file.content).then(() => deleteDocument(file.filePathFrom));
                    }
                };

                filesOperation().catch((err)=> {
                    observer.error(err);
                }).finally(() => {
                    setTimeout(() => {
                        observer.next(generateFinish());
                        observer.complete();
                    }, 1500);
                });
            }))
        ),
    );
