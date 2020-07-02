import * as vscode from 'vscode';
import * as path from 'path';
import { merge, Observable } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { delay, filter, tap, ignoreElements, mergeMap, map, bufferTime } from 'rxjs/operators';
import { RootEpic } from '..';
import { renameCopyDirectory, onDidCreate, fillFileContentStarted, createFilesInNewDirectory, fillFileContentBySibling, WatchFileSystemParam, createFileContentStarted, CreateFileContentStartedParam, createFileContentCancel } from '../../action/files/files';
import { reportBug } from '../../../errors/reportBug';
import { getMatchingTemplate } from '../../selectors/templates/templates';
import { createDocument } from '../../../fileSystem/createDocument';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getPathTemplates } from '../../../fileSystem/getPathTemplates';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { WebViewInfoAboutFiles } from '../../dependencies/files/files';
import { getSimilarDirectoryInfo, getFirstDirectoryWithSameFiles, getFilesInDirectory } from '../../selectors/files/files';
import { generateStarted, generateFinish } from '../../action/lock/lock';
import { WebViewInfoAboutRenameFiles } from '../../dependencies/directoryRename/directoryRename';
import { deleteDocument } from '../../../fileSystem/deleteDocument';

type InputAction =
    Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam>;

export const filesEpic: RootEpic<InputAction> = (action$, state$, { config, outputChannel, files, directoryRename }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(fillFileContentStarted.type),
            map(({ payload }: Action<vscode.Uri>) => {
                const baseTemplate = getMatchingTemplate(payload.fsPath)(state$.value);
                if (baseTemplate !== null) {
                    const content = files.generateFileContentByTemplate(payload, baseTemplate);
                    return createFileContentStarted({ uri: payload, content });
                }
                return fillFileContentBySibling(payload);
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(fillFileContentBySibling.type),
            map(({ payload }: Action<vscode.Uri>) => ({
                createPath: payload,
                content: files.getContentBySibling(payload)
            })),
            filter(({ content }) => !!content.length),
            mergeMap(async ({ createPath, content }) => {

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
                    return createFileContentStarted({ uri: createPath, content });
                }

                return createFileContentCancel(createPath);

            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateFileContentStartedParam>>(createFileContentStarted.type),
            tap(({ payload }: Action<CreateFileContentStartedParam>) => {
                createDocument(payload.uri.fsPath, payload.content).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFilesInNewDirectory.type),
            tap(async (
                { payload }: Action<vscode.Uri>
            ) => {

                const relativePath = getRelativePath(payload.fsPath);
                const infoAboutNewDirectory = getInfoAboutPath(relativePath);
                const similarDirectoriesInfo: DirectoriesInfo = getSimilarDirectoryInfo(payload.fsPath)(state$.value);
                const siblingTemplatePathFiles = getPathTemplates(similarDirectoriesInfo);

                if (siblingTemplatePathFiles.length === 0) {
                    outputChannel.appendLine('[FilesEpic] not found sibling template');
                    return [];
                }

                const uniquePathFiles = files.deleteSameTemplates(siblingTemplatePathFiles);

                const answersQuestion = [
                    'Yes, generate files',
                    'Yes, let me choose',
                    'No, thanks'
                ];

                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to create ${uniquePathFiles.length} file(s) in new "${path.basename(payload.fsPath)}" folder?`,
                    ...answersQuestion
                );

                if (resultQuestion === answersQuestion[2]) {
                    outputChannel.appendLine('[FilesEpic] abort by user');
                    return [];
                }

                const filesWithContent: WebViewInfoAboutFiles[] = uniquePathFiles.map((filePathTemplate) => {
                    const relativePathFile = renderVariableTemplate(filePathTemplate, [infoAboutNewDirectory]);
                    const filePath: string = path.join(payload.fsPath, relativePathFile);
                    const savedTemplate = getMatchingTemplate(filePath)(state$.value);

                    let content: string;
                    let fromTemplate: boolean = false;
                    if (savedTemplate === null) {
                        content = files.createFileContent(filePathTemplate, similarDirectoriesInfo, [infoAboutNewDirectory]);
                    } else {
                        fromTemplate = true;
                        content = savedTemplate.map(line =>
                            renderVariableTemplate(line, [infoAboutNewDirectory])
                        ).join('\n');
                    }

                    return {
                        filePath,
                        filePathTemplate,
                        content,
                        fromTemplate,
                        relativePath: path.join(relativePath, relativePathFile)
                    };

                });

                if (resultQuestion === answersQuestion[0]) {
                    filesWithContent.forEach(async ({ filePath, content }) => {
                        const textDocument = await createDocument(filePath, content);
                        vscode.window.showTextDocument(textDocument);
                    });
                } else {
                    files.showWebView(
                        payload,
                        filesWithContent,
                        similarDirectoriesInfo,
                        siblingTemplatePathFiles,
                        (filePath: string, content: string) => {
                            createDocument(filePath, content);
                        }
                    );
                }
            }),
            ignoreElements()
        ),
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
            map(({ payload }) => ({
                createFolder: payload,
                baseFolder: getFirstDirectoryWithSameFiles(payload.fsPath)(state$.value)
            })),
            filter(({ baseFolder }) => !!baseFolder),
            mergeMap(async ({ createFolder, baseFolder }) => {

                const dirFiles = getFilesInDirectory(baseFolder as string)(state$.value);
                const parentDir = path.dirname(createFolder.fsPath);
                const fileName = path.basename(createFolder.fsPath);

                const answersQuestion = [
                    'Yes, rename directory',
                    'No, thanks'
                ];

                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to rename directory '${fileName}' with content in folder "${parentDir}" base on ${path.basename(baseFolder as string)}?`,
                    ...answersQuestion
                );

                if (baseFolder !== null && resultQuestion === answersQuestion[0]) {
            
                    return await directoryRename.showWebView(createFolder, dirFiles);
                }

                return [] as WebViewInfoAboutRenameFiles[];

            }),
            mergeMap((files: WebViewInfoAboutRenameFiles[]) => new Observable<Action<any>>((observer) => {
                observer.next(generateStarted());
                const filesOperation = files.map(file => 
                    createDocument(file.filePath, file.content)
                        .then(() => deleteDocument(file.filePathFrom))
                );
                Promise.all(filesOperation).catch((err)=> {
                    observer.error(err);
                }).finally(() => {
                    setTimeout(() => {
                        observer.next(generateFinish());
                        observer.complete();
                    }, 1500);
                });
            }))
        ),


        action$.pipe(
            ofType<InputAction, Action<WatchFileSystemParam>>(onDidCreate.type),
            filter(({ payload }: Action<WatchFileSystemParam>) => config.canUseThisFile(payload.uri)),
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
        )
    );
