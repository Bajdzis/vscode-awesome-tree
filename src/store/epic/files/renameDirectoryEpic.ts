import { PathInfo } from 'awesome-tree-engine';
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
import { getIncludePaths } from '../../selectors/files/files';

type InputAction = Action<vscode.Uri> | Action<PathInfo> | Action<OnRegisterWorkspaceParam>;

export const renameDirectoryEpic: RootEpic<InputAction> = (action$, state$, { directoryRename }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<PathInfo>>(renameCopyDirectory.type),
            bufferTime(300),
            filter(events => !!events.length),
            map((actions) => actions.reduce((acc, next) => {
                if(acc.payload.getPath().length > next.payload.getPath().length) {
                    return next;
                }
                return acc;
            }, actions[0])),
            mergeMap(async ({ payload }) => {

                const parentDir = payload.getParent().getPath();
                const fileName = path.basename(payload.getPath());

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
            ofType<InputAction, Action<PathInfo>>(renameDirectory.started.type),
            mergeMap(async ({payload}) => {
                const childrenFiles = getIncludePaths(payload)(state$.value);

                return await directoryRename.showWebView(payload, childrenFiles);
            }),
            mergeMap(({files}) => new Observable<Action<any>>((observer) => {
                observer.next(generateStarted());

                const filesOperation = async () => {
                    for (let i = 0; i < files.length; i++) {
                        const {currentFile, newFile} = files[i];
                        await createDocument(newFile.filePath, newFile.content).then(() => deleteDocument(currentFile.filePath));
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
