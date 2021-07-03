import * as fs from 'fs';
import { ofType } from 'redux-observable';
import { from, merge } from 'rxjs';
import { PathInfo } from 'awesome-tree-engine';
import { filter, mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import { RootEpic } from '..';
import { onDidChange, onRegisterWorkspace, OnRegisterWorkspaceParam, updateGitIgnoreFile } from '../../action/files/files';

type InputAction = Action<PathInfo> | Action<OnRegisterWorkspaceParam>;

export const gitIgnoreFilesEpic: RootEpic<InputAction> = (action$, state$, {config}) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<PathInfo>>(onDidChange.type),
            filter(() => config.shouldExcludeByGitIgnoreFile()),
            filter(({payload}: Action<PathInfo>) => payload.isFile() && payload.getName() === '.gitignore'),
            mergeMap(({payload}: Action<PathInfo>) => {
                return new Promise<string>((resolve, reject) => {
                    fs.readFile(payload.getPath(), (err, buffer) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(buffer.toString());
                    });
                }).then(content => updateGitIgnoreFile({
                    content,
                    path: payload
                }));
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<OnRegisterWorkspaceParam>>(onRegisterWorkspace.type),
            filter(() => config.shouldExcludeByGitIgnoreFile()),
            mergeMap(({payload}: Action<OnRegisterWorkspaceParam>) => {
                return payload.filePaths
                    .filter(path => path.isFile() && path.getName() === '.gitignore')
                    .map(path => from(new Promise<string>((resolve, reject) => {
                        fs.readFile(path.getPath(), (err, buffer) => {
                            if(err) {
                                return reject(err);
                            }
                            resolve((buffer.toString()));
                        });
                    }).then(content => updateGitIgnoreFile({
                        content,
                        path
                    }))));
            }),
            mergeMap(result => result),
        ),
    );
