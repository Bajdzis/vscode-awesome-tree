import * as path from 'path';
import { ofType } from 'redux-observable';
import { merge } from 'rxjs';
import { filter, ignoreElements, map, mergeMap, tap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { reportBug } from '../../../errors/reportBug';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { createDocument } from '../../../fileSystem/createDocument';
import { getPathTemplates } from '../../../fileSystem/getPathTemplates';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { createContentInputAction } from '../../../workers/createContentForFile/action';
import { createFileContentCancel, createFileContentStarted, CreateFileContentStartedParam, createFilesInNewDirectory, fillFileContentBySibling, fillFileContentStarted, OnRegisterWorkspaceParam, WatchFileSystemParam } from '../../action/files/files';
import { WebViewInfoAboutFiles } from '../../dependencies/files/files';
import { getSimilarDirectoryInfo } from '../../selectors/files/files';
import { getMatchingTemplate } from '../../selectors/templates/templates';

type InputAction =
    Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam> | Action<OnRegisterWorkspaceParam>;

export const fillFilesEpic: RootEpic<InputAction> = (action$, state$, { outputChannel, files, workerRunner }) =>
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
            mergeMap(async ({ payload }: Action<vscode.Uri>) => {


                return ({
                    createPath: payload,
                    content: await workerRunner.run(
                        `Analyzing the sibling files of '${getRelativePath(payload.fsPath)}'`,
                        'createContentForFileWorker.js',
                        createContentInputAction({
                            filePath: payload.fsPath
                        })
                    )
                });
            }),
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
                        relativePath: path.join(relativePath, relativePathFile),
                        generated: false
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

    );
