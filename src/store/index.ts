import * as redux from 'redux';
import * as vscode from 'vscode';
//@ts-ignore
import devToolsEnhancer from 'remote-redux-devtools';

import { rootReducer } from './reducer';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './epic';
import { createDependency } from './dependencies';
import { loggerEpic } from './epic/logger/logger';

export const createStore = (context: vscode.ExtensionContext) => {
    const dependencies = createDependency(context);
    const epicMiddleware = createEpicMiddleware({ dependencies });

    const devToolMiddleware = devToolsEnhancer({
        realtime: true,
        name: 'Awesome Tree vscode',
        hostname: 'localhost',
        port: 8081 // the port your remotedev server is running at
    });
    

    const store = redux.createStore(rootReducer, devToolMiddleware);

    epicMiddleware.run(rootEpic as any);

    if (process.env.ENV_MODE !== 'production') {
        dependencies.outputChannel.appendLine('start debug mode');
        epicMiddleware.run(loggerEpic as any);
    }

    return { store, dependencies };
};
