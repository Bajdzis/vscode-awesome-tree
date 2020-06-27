import * as vscode from 'vscode';
import * as path from 'path';
import { merge, Observable } from 'rxjs';
import { Action } from 'typescript-fsa';
import { ofType } from 'redux-observable';
import { mergeMap, ignoreElements, tap } from 'rxjs/operators';
import { RootEpic } from '..';
import { onRegisterWorkspace, OnRegisterWorkspaceParam, registerTemplates, createNewTemplate, CreateNewTemplateParam, CreateNewTemplateResult, RegisterTemplatesParam, registerTemplate } from '../../action/files/files';
import { getTemplatesDatabase, getTemplateContent } from '../../../savedTemplates/getMatchingTemplate';
import { addExtensionToRecommendations } from '../../../fileSystem/addExtensionToRecommendations';
import { getTemplateBaseOnFile, DIRECTORY_FOR_TEMPLATES } from '../../../commands/saveAsTemplate';
import { createDocument } from '../../../fileSystem/createDocument';

type InputAction = 
    Action<OnRegisterWorkspaceParam> | Action<CreateNewTemplateParam> | Action<RegisterTemplatesParam> | Action<{params: CreateNewTemplateParam, result: CreateNewTemplateResult}>;

export const templatesEpic: RootEpic<InputAction> = (action$, state$) =>
    merge(
        action$.pipe(
            ofType<InputAction, Action<OnRegisterWorkspaceParam>>(onRegisterWorkspace.type),
            mergeMap(({payload}: Action<OnRegisterWorkspaceParam>) => 
                getTemplatesDatabase(payload.workspacePath).then((baseTemplate) => 
                    registerTemplates({
                        templates: baseTemplate,
                        workspacePath: payload.workspacePath
                    })
                )
            ),
        ),
        action$.pipe(
            ofType<InputAction, Action<RegisterTemplatesParam>>(registerTemplates.type),
            mergeMap(({payload}: Action<RegisterTemplatesParam>) => {
                return new Observable<Action<any>>(function subscribe(subscriber) {
                    Promise.all(payload.templates.map((template) => {
                        return getTemplateContent(payload.workspacePath, template.templateId)
                            .then((content) => {
                                subscriber.next(
                                    registerTemplate({
                                        content,
                                        templateId: template.templateId,
                                    })
                                );
                            })
                            .catch(subscriber.error);
                    })).then(() => subscriber.complete());
                });
            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<CreateNewTemplateParam>>(createNewTemplate.started.type),
            mergeMap(({payload}: Action<CreateNewTemplateParam>) => {
           
                const newTemplate = getTemplateBaseOnFile(payload.uri.fsPath);
                const templatePath = path.join(payload.workspacePath, DIRECTORY_FOR_TEMPLATES, 'templates', `template-${newTemplate.templateId}.json` );
                const templateDatabasePath = path.join(payload.workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );

                const currentSavedTemplates = [...(state$.value.templates.workspaces[payload.workspacePath] || [])];
                currentSavedTemplates.push({
                    baseFilePath: newTemplate.baseFilePath,
                    pathsTemplate: newTemplate.pathsTemplate,
                    templateId: newTemplate.templateId
                });

                return Promise.all([
                    createDocument(templatePath, JSON.stringify(newTemplate.templateLines, null, 4)),
                    createDocument(templateDatabasePath, JSON.stringify(currentSavedTemplates, null, 4))
                ]).then(() => createNewTemplate.done({
                    params: payload,
                    result: newTemplate
                })).catch((error) => createNewTemplate.failed({
                    params: payload,
                    error, 
                }));

            }),
        ),
        action$.pipe(
            ofType<InputAction, Action<{params: CreateNewTemplateParam, result: CreateNewTemplateResult}>>(createNewTemplate.done.type),
            tap(({payload}: Action<{params: CreateNewTemplateParam, result: CreateNewTemplateResult}>) => {
                vscode.window.showInformationMessage('Saved success!');
                addExtensionToRecommendations(payload.params.workspacePath);
            }),
            ignoreElements()
        )
    );
