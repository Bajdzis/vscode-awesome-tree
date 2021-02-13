import * as minimatch from 'minimatch';
import * as path from 'path';
import { ofType } from 'redux-observable';
import { delay, filter, mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { changeToUnixSlashes } from '../../../strings/changeToUnixSlashes';
import { CreateFileContentStartedParam, createFilesInNewDirectory, fillFileContentStarted, onDidCreate, OnRegisterWorkspaceParam, renameCopyDirectory, WatchFileSystemParam } from '../../action/files/files';
import { findGitIgnoreFileBySomeFilePathInRepo } from '../../selectors/files/files';

type InputAction =
    Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam> | Action<OnRegisterWorkspaceParam>;

export const onDidCreateFilesEpic: RootEpic<InputAction> = (action$, state$, { outputChannel, files }) =>
    action$.pipe(
        ofType<InputAction, Action<WatchFileSystemParam>>(onDidCreate.type),
        filter(({ payload }: Action<WatchFileSystemParam>) => {
            const gitIgnorePath = findGitIgnoreFileBySomeFilePathInRepo(payload.uri.fsPath)(state$.value);
            
            if(gitIgnorePath === null) {
                return true;
            }
            
            const relativePath = changeToUnixSlashes(payload.uri.fsPath).replace(path.dirname(gitIgnorePath), '');
            const globs = state$.value.files.gitIgnoreCache[gitIgnorePath] || [];
            for (let i = 0; i < globs.length; i++) {
                const glob = globs[i];
                if (minimatch(relativePath, glob)) {
                    const msg = `File '${payload.uri.fsPath}' is exclude in setting! Check 'awesomeTree.excludeByGitIgnoreFile' setting. Exclude by '.gitignore' line : '${glob}'`;
                    outputChannel.appendLine(msg);
                    return false;
                }
            }
            return true;
        }),
        filter(() => !state$.value.lock.locked),
        delay(10),
        mergeMap(({ payload }: Action<WatchFileSystemParam>) => {
            // when directory or file is not empty probably change name parent directory
            if (files.isEmptyDirectory(payload.uri, outputChannel)) {
                return [createFilesInNewDirectory(payload.uri)];
            }

            if (files.isEmptyFile(payload.uri, outputChannel)) {
                return [fillFileContentStarted(payload.uri)];
            }

            if (files.isDirectory(payload.uri, outputChannel)) {
                return [renameCopyDirectory(payload.uri)];
            }

            return [];
        }),
    );
