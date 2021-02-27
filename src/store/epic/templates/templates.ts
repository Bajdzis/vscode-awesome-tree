import * as path from 'path';
import { ofType } from 'redux-observable';
import { merge, Observable } from 'rxjs';
import { ignoreElements, mergeMap, tap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import { v4 as uuid } from 'uuid';
import * as vscode from 'vscode';
import { RootEpic } from '..';
import { DIRECTORY_FOR_TEMPLATES } from '../../../commands/saveAsTemplate';
import { addExtensionToRecommendations } from '../../../fileSystem/addExtensionToRecommendations';
import { createDocument } from '../../../fileSystem/createDocument';
import { getTemplateContent, getTemplatesDatabase } from '../../../savedTemplates/getMatchingTemplate';
import { createNewTemplate, CreateNewTemplateParam, CreateNewTemplateResult, onRegisterWorkspace, OnRegisterWorkspaceParam, registerTemplate, registerTemplates, RegisterTemplatesParam } from '../../action/files/files';

type InputAction = 
    Action<OnRegisterWorkspaceParam> | Action<CreateNewTemplateParam> | Action<RegisterTemplatesParam> | Action<{params: CreateNewTemplateParam, result: CreateNewTemplateResult}>;

export const templatesEpic: RootEpic<InputAction> = (action$, state$, { templateManager }) =>
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
            mergeMap(async ({payload}: Action<CreateNewTemplateParam>) => {
           
                // const newTemplate = getTemplateBaseOnFile(payload.uri.fsPath);
    
                const { templateContentLines, globs } = await templateManager.showWebView(payload.uri);
                const templateId = uuid();
                const templatePath = path.join(payload.workspacePath, DIRECTORY_FOR_TEMPLATES, 'templates', `template-${templateId}.json` );
                const templateDatabasePath = path.join(payload.workspacePath, DIRECTORY_FOR_TEMPLATES, 'database-awesome.json' );

                const currentSavedTemplates = [...(state$.value.templates.workspaces[payload.workspacePath] || [])];
                currentSavedTemplates.push({
                    globs, templateId
                });

                return await Promise.all([
                    createDocument(templatePath, JSON.stringify(templateContentLines, null, 4)),
                    createDocument(templateDatabasePath, JSON.stringify(currentSavedTemplates, null, 4))
                ]).then(() => createNewTemplate.done({
                    params: payload,
                    result: {
                        globs,
                        templateId,
                        templateLines :templateContentLines,
                    }
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
