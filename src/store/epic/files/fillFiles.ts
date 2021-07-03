import { FileContent, PathInfo } from 'awesome-tree-engine';
import * as path from 'path';
import { ofType } from 'redux-observable';
import { merge } from 'rxjs';
import { filter, ignoreElements, mergeMap, tap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { reportBug } from '../../../errors/reportBug';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { createDocument } from '../../../fileSystem/createDocument';
import { getPathTemplates } from '../../../fileSystem/getPathTemplates';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { createFileContentCancel, createFileContentStarted, createFilesInNewDirectory, fillFileContentStarted, OnRegisterWorkspaceParam } from '../../action/files/files';
import { WebViewInfoAboutFiles } from '../../dependencies/files/files';
import { getSimilarDirectoryInfo } from '../../selectors/files/files';

type InputAction =
    Action<FileContent> | Action<vscode.Uri> | Action<PathInfo> | Action<OnRegisterWorkspaceParam>;

export const fillFilesEpic: RootEpic<InputAction> = (action$, state$, { outputChannel, files }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<PathInfo>>(fillFileContentStarted.type),
            mergeMap(async ({ payload }: Action<PathInfo>) => {
                const paths = Object.values(state$.value.files.pathToInfo);
                const contentPromise = files.getContentBySibling(payload, paths);

                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Analyzing the sibling files of '${getRelativePath(payload.getPath())}'`,
                    cancellable: false
                }, () => contentPromise);

                return ({
                    createPath: payload,
                    content: await contentPromise
                });
            }),
            filter(({ content }) => !!content.length),
            mergeMap(async ({ createPath, content }) => {

                const parentDir = path.dirname(createPath.getPath());
                const fileName = path.basename(createPath.getPath());

                const answersQuestion = [
                    'Yes, create content',
                    'No, thanks'
                ];

                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to create content for new file '${fileName}' in folder "${parentDir}"?`,
                    ...answersQuestion
                );

                if (resultQuestion === answersQuestion[0]) {
                    return createFileContentStarted(new FileContent(createPath, content));
                }

                return createFileContentCancel(createPath);

            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<FileContent>>(createFileContentStarted.type),
            tap(({ payload }: Action<FileContent>) => {
                createDocument(payload.getPathInfo().getPath(), payload.getContent()).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFilesInNewDirectory.type),
            tap(async (
                { payload }: Action<vscode.Uri>
            ) => {

                // const relativePath = getRelativePath(payload.fsPath);
                // const infoAboutNewDirectory = getInfoAboutPath(relativePath);
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

                const filesWithContent: WebViewInfoAboutFiles[] = [];
                // uniquePathFiles.map((filePathTemplate) => {
                //     const relativePathFile = renderVariableTemplate(filePathTemplate, [infoAboutNewDirectory]);
                //     const filePath: string = path.join(payload.fsPath, relativePathFile);


                //     let content: string= files.getContentBySibling(filePathTemplate, similarDirectoriesInfo, [infoAboutNewDirectory]);
                //     let fromTemplate: boolean = false;

                //     return {
                //         filePath,
                //         filePathTemplate,
                //         content,
                //         fromTemplate,
                //         relativePath: path.join(relativePath, relativePathFile),
                //         generated: false
                //     };

                // });

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
