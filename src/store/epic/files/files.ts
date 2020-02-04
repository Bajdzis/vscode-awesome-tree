import * as vscode from 'vscode';
import * as path from 'path';
import { merge } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { delay, filter, tap, ignoreElements, mergeMap, map } from 'rxjs/operators';
import { RootEpic } from '..';
import { onDidCreate, fillFileContentStarted, createFilesInNewDirectory, fillFileContentBySibling, WatchFileSystemParam, createFileContentStarted, CreateFileContentStartedParam, createFileContentCancel } from '../../action/files/files';
import { reportBug } from '../../../errors/reportBug';
import { getMatchingTemplate } from '../../selectors/templates/templates';
import { createDocument } from '../../../fileSystem/createDocument';
import { getRelativePath } from '../../../fileSystem/getRelativePath';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getPathTemplates } from '../../../fileSystem/getPathTemplates';
import { renderVariableTemplate } from '../../../variableTemplate/renderVariableTemplate';
import { WebViewInfoAboutFiles } from '../../dependencies/files/files';
import { getSimilarDirectoryInfo } from '../../selectors/files/files';

type InputAction = 
Action<WatchFileSystemParam> | Action<vscode.Uri> | Action<CreateFileContentStartedParam>;

export const filesEpic: RootEpic<InputAction> = (action$, state$, { config, outputChannel, files }) =>
    merge( 
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(fillFileContentStarted.type),
            map(({payload}: Action<vscode.Uri>) => {
                const baseTemplate = getMatchingTemplate(payload.fsPath)(state$.value);
                if (baseTemplate !== null) {
                    const content = files.generateFileContentByTemplate(payload, baseTemplate);
                    return createFileContentStarted({uri: payload, content});
                }
                return fillFileContentBySibling(payload);
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(fillFileContentBySibling.type),
            map(({payload}: Action<vscode.Uri>) => ({
                createPath: payload,
                content: files.getContentBySibling(payload)
            })),
            filter(({content}) => !!content.length),
            mergeMap(async ({createPath, content}) => {

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
                    return createFileContentStarted({uri: createPath,  content});
                }

                return createFileContentCancel(createPath);

            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateFileContentStartedParam>>(createFileContentStarted.type),
            tap(({payload}: Action<CreateFileContentStartedParam>) => {
                createDocument(payload.uri.fsPath, payload.content).catch(reportBug);
            }),
            ignoreElements()
        ),
        action$.pipe(
            ofType<InputAction, Action<vscode.Uri>>(createFilesInNewDirectory.type),
            tap(async (
                {payload}: Action<vscode.Uri>
            ) => {

                const relativePath = getRelativePath(payload.fsPath);
                const infoAboutNewDirectory = getInfoAboutPath(relativePath);
                const similarDirectoriesInfo: DirectoriesInfo = getSimilarDirectoryInfo(payload.fsPath)(state$.value);
                const siblingTemplatePathFiles = getPathTemplates(similarDirectoriesInfo);

                if (siblingTemplatePathFiles.length === 0) {
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
                    return [];
                }

                const filesWithContent: WebViewInfoAboutFiles[] = uniquePathFiles.map( (filePathTemplate) => {
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
                    filesWithContent.forEach(async({filePath, content}) => {
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
            ofType<InputAction, Action<WatchFileSystemParam>>(onDidCreate.type),
            filter(({payload}: Action<WatchFileSystemParam>) => config.canUseThisFile(payload.uri)),
            delay(10),
            mergeMap(({payload}: Action<WatchFileSystemParam>) => {
                // when directory or file is not empty probably change name parent directory
                if (files.isEmptyDirectory(payload.uri, outputChannel)) {
                    return [createFilesInNewDirectory(payload.uri)];
                }

                if (files.isEmptyFile(payload.uri, outputChannel)) {
                    return [fillFileContentStarted(payload.uri)];
                }

                return [];
            }),
        )
    );
