import * as fs from 'fs';
import * as parseGitignore from 'parse-gitignore';
import { ofType } from 'redux-observable';
import { from, merge } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { CreateFileContentStartedParam, onDidChange, onRegisterWorkspace, OnRegisterWorkspaceParam, updateGitIgnoreFile, WatchFileSystemParam } from '../../action/files/files';

type InputAction =
    Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam> | Action<OnRegisterWorkspaceParam>;

export const gitIgnoreFilesEpic: RootEpic<InputAction> = (action$, state$, { config }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<WatchFileSystemParam>>(onDidChange.type),
            filter(() => config.shouldExcludeByGitIgnoreFile()),
            filter(({payload}: Action<WatchFileSystemParam>) => payload.type === 'file' && !!payload.uri.path.match(/\.gitignore$/)),
            mergeMap(({payload}: Action<WatchFileSystemParam>) => {
                const path = `${payload.uri.fsPath}`;
                return new Promise<string[]>((resolve, reject) => {
                    fs.readFile(path, (err, buffer) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(parseGitignore(buffer.toString()));
                    });
                }).then(lines => updateGitIgnoreFile({
                    lines,
                    path 
                }));
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<OnRegisterWorkspaceParam>>(onRegisterWorkspace.type),
            filter(() => config.shouldExcludeByGitIgnoreFile()),
            mergeMap(({payload}: Action<OnRegisterWorkspaceParam>) => {
                return payload.filePaths.filter(path => !!path.match(/\.gitignore$/)).map(path => from(new Promise<string[]>((resolve, reject) => {
                    fs.readFile(path, (err, buffer) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(parseGitignore(buffer.toString()));
                    });
                }).then(lines => updateGitIgnoreFile({
                    lines,
                    path 
                }))));
            }),
            mergeMap(result => result),
        ),
    );
