import { CompareFiles, FileContent, FileContentCreator, PathInfo } from 'awesome-tree-engine';
import { ofType } from 'redux-observable';
import { merge } from 'rxjs';
import { filter, ignoreElements, mergeMap, tap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { RootEpic } from '..';
import { reportBug } from '../../../errors/reportBug';
import { createDocument } from '../../../fileSystem/createDocument';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { createFileContentCancel, createFileContentStarted, createFilesInNewDirectory, fillFileContentStarted, OnRegisterWorkspaceParam } from '../../action/files/files';
import { getIncludePaths, getSimilarPaths } from '../../selectors/files/files';
import { showGeneratedCodeInTextEditor } from '../../../fileSystem/showGeneratedCodeInTextEditor';
import { generateFinish } from '../../action/lock/lock';

type InputAction =
    Action<FileContent> | Action<vscode.Uri> | Action<PathInfo> | Action<OnRegisterWorkspaceParam>;

export const fillFilesEpic: RootEpic<InputAction> = (action$, state$, { outputChannel, files, context }) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<PathInfo>>(fillFileContentStarted.type),
            mergeMap(async ({ payload }: Action<PathInfo>) => {

                const similarPaths = getSimilarPaths(payload)(state$.value)
                    .filter(path => payload.getPath() !== path.getPath());

                const contentPromise = files.getContentBySibling(payload, similarPaths);

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
            filter(({ content }) => !!content.trim().length),
            mergeMap(async ({ createPath, content }) => {
                const generateFile = new FileContent(createPath, content);

                try {
                    await showGeneratedCodeInTextEditor(context, generateFile);

                    return generateFinish();
                } catch (error) {

                    const fileName = createPath.getName();
                    const parentDir = createPath.getParent().getPath();

                    const answersQuestion = [
                        'Yes, create content',
                        'No, thanks'
                    ];

                    const resultQuestion = await vscode.window.showInformationMessage(
                        `Do you want to create content for new file '${fileName}' in folder "${parentDir}"?`,
                        ...answersQuestion
                    );

                    if (resultQuestion === answersQuestion[0]) {
                        return createFileContentStarted(generateFile);
                    }

                    return createFileContentCancel(createPath);
                }

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
            ofType<InputAction, Action<PathInfo>>(createFilesInNewDirectory.type),
            tap(async (
                { payload }: Action<PathInfo>
            ) => {

                const generateDirectory = payload;
                const parentGenerateDirectory = generateDirectory.getParent();

                const similarPaths = getIncludePaths(parentGenerateDirectory)(state$.value);

                if (similarPaths.length === 0) {
                    outputChannel.appendLine(`[FilesEpic] Not found similar paths for (${parentGenerateDirectory.getPath()}) `);
                    return [];
                }

                const similarPathGrouped = similarPaths.reduce<PathInfo[][]>((arr,path) => {
                    for (let i = 0; i < arr.length; i++) {
                        const [element] = arr[i];
                        if(element.isSimilar(path)){
                            arr[i].push(path);
                            return arr;
                        }
                    }
                    arr.push([path]);
                    return arr;
                }, []).filter(group => group.length > 1);


                if (similarPaths.length === 0) {
                    outputChannel.appendLine(`[FilesEpic] Not enough files to compare for new directory ${generateDirectory.getName()}`);
                    return [];
                }

                if (similarPathGrouped.length > 8) {
                    outputChannel.appendLine(`[FilesEpic] Too many similar files! (${similarPaths.length}) `);
                    return [];
                }

                const groupedFiles = similarPathGrouped
                    .map(paths => paths
                        .map(path => new FileContent(path, fs.readFileSync(path.getPath()).toString())
                        )
                    );

                const createFiles = groupedFiles.map((files) => {
                    const newContent = new FileContentCreator(generateDirectory, files[0]);

                    const generateFilePath = newContent.createPath();

                    const comparer = new CompareFiles();

                    files.forEach(file => {
                        const contentCreator = new FileContentCreator(generateFilePath, file);
                        const newFileContent = new FileContent(generateFilePath, contentCreator.createContent());

                        comparer.addFile(newFileContent.getFileGraph());
                    });

                    return new FileContent(generateFilePath, comparer.compare(0.7).getContent());
                });


                const answersQuestion = [
                    'Yes, generate files',
                    'Yes, let me choose',
                    'No, thanks'
                ];

                const resultQuestion = await vscode.window.showInformationMessage(
                    `Do you want to create ${createFiles.length} file(s) in new "${payload.getName()}" folder?`,
                    ...answersQuestion
                );

                if (resultQuestion === answersQuestion[2]) {
                    outputChannel.appendLine('[FilesEpic] abort by user');
                    return [];
                }

                if (resultQuestion === answersQuestion[0]) {
                    createFiles.forEach(async (file) => {
                        const textDocument = await createDocument(file.getPathInfo().getPath(), file.getContent());
                        vscode.window.showTextDocument(textDocument);
                    });
                } else {
                    files.showWebView(
                        createFiles,
                        generateDirectory,
                        (file: FileContent) => {
                            createDocument(file.getPathInfo().getPath(), file.getContent());
                        }
                    );
                }
            }),
            ignoreElements()
        ),

    );
