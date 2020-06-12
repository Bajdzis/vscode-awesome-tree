import * as redux from 'redux';
import * as vscode from 'vscode';
import { rootReducer } from './reducer';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './epic';
import { createDependency } from './dependencies';
import { loggerEpic } from './epic/logger/logger';

export const createStore = (context: vscode.ExtensionContext) => {
    const dependencies = createDependency(context);
    const epicMiddleware = createEpicMiddleware({ dependencies });
    const store = redux.createStore(rootReducer, redux.applyMiddleware(epicMiddleware));
    
    epicMiddleware.run(rootEpic as any);

    if (process.env.ENV_MODE !== 'production') {
        dependencies.outputChannel.appendLine('start debug mode');
        epicMiddleware.run(loggerEpic as any);
    }

    return { store, dependencies };
};
