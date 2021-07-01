import { PathInfo } from 'awesome-tree-engine';
import { ofType } from 'redux-observable';
import { mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { fillFileContentStarted, onDidCreate, OnRegisterWorkspaceParam } from '../../action/files/files';

type InputAction =  Action<vscode.Uri>  |  Action<PathInfo>  |  Action<OnRegisterWorkspaceParam>;

export const onDidCreateFilesEpic: RootEpic<InputAction> = (action$) =>
    action$.pipe(
        ofType<InputAction, Action<PathInfo>>(onDidCreate.type),
        // filter(({ payload }: Action<PathInfo>) => {
        //     const gitIgnorePath = findGitIgnoreFileBySomeFilePathInRepo(payload.uri.fsPath)(state$.value);

        //     if(gitIgnorePath === null) {
        //         return true;
        //     }

        //     const relativePath = changeToUnixSlashes(payload.uri.fsPath).replace(path.dirname(gitIgnorePath), '');
        //     const globs = state$.value.files.gitIgnoreCache[gitIgnorePath] || [];
        //     for (let i = 0; i < globs.length; i++) {
        //         const glob = globs[i];
        //         if (minimatch(relativePath, glob)) {
        //             const msg = `File '${payload.uri.fsPath}' is exclude in setting! Check 'awesomeTree.excludeByGitIgnoreFile' setting. Exclude by '.gitignore' line : '${glob}'`;
        //             outputChannel.appendLine(msg);
        //             return false;
        //         }
        //     }
        //     return true;
        // }),
        // filter(() => !state$.value.lock.locked),
        // delay(10),
        mergeMap(({ payload }: Action<PathInfo>) => {
            // when directory or file is not empty probably change name parent directory
            // if (files.isEmptyDirectory(payload.getPath(), outputChannel)) {
            //     return [createFilesInNewDirectory(payload.uri)];
            // }

            // if (files.isEmptyFile(payload.uri, outputChannel)) {
            if (payload.isFile()) {
                return [fillFileContentStarted(payload)];
            }

            // if (files.isDirectory(payload.uri, outputChannel)) {
            //     return [renameCopyDirectory(payload.uri)];
            // }

            console.log(payload);

            return [];
        }),
    );
