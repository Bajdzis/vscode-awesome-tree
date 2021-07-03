import { PathInfo } from 'awesome-tree-engine';
import { ofType } from 'redux-observable';
import { delay, filter, mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { RootEpic } from '..';
import { createFilesInNewDirectory, fillFileContentStarted, onDidCreate, OnRegisterWorkspaceParam, renameCopyDirectory } from '../../action/files/files';
import {Ignore} from 'ignore';

type InputAction =  Action<vscode.Uri>  |  Action<PathInfo>  |  Action<OnRegisterWorkspaceParam>;

export const onDidCreateFilesEpic: RootEpic<InputAction> = (action$, state$, {outputChannel}) =>
    action$.pipe(
        ofType<InputAction, Action<PathInfo>>(onDidCreate.type),
        filter(({ payload }: Action<PathInfo>) => {
            const createPath = payload.getPath();
            const gitIgnoreDirectories = Object.keys(state$.value.files.gitIgnoreCache).filter(path => createPath.indexOf(path) ===0 );

            for (let j = 0; j < gitIgnoreDirectories.length; j++) {
                const gitIgnoreDirectory = gitIgnoreDirectories[j];
                const relativePath = createPath.replace(gitIgnoreDirectory, '');
                const ignore: Ignore = state$.value.files.gitIgnoreCache[gitIgnoreDirectory] ;

                if (ignore.ignores(relativePath)) {
                    const msg = `File '${createPath}' is exclude in setting! Check 'awesomeTree.excludeByGitIgnoreFile' setting. Exclude by '.gitignore' from directory : '${gitIgnoreDirectory}'`;
                    outputChannel.appendLine(msg);
                    return false;
                }
            }
            return true;
        }),
        filter(() => !state$.value.lock.locked),
        delay(10),
        mergeMap(({ payload }: Action<PathInfo>) => {
            if (payload.isDirectory()) {
                // when directory or file is not empty probably change name parent directory
                const isEmpty = !fs.readdirSync(payload.getPath()).length;

                if(payload.getName().match(/ copy[^\\//]*$/) && !isEmpty) {
                    return [renameCopyDirectory(payload)];
                } else if(isEmpty) {
                    return [createFilesInNewDirectory(payload)];
                }
            }

            if (payload.isFile() && fs.readFileSync(payload.getPath()).toString().length === 0) {
                return [fillFileContentStarted(payload)];
            }

            return [];
        }),
    );
