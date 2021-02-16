import { ignoreElements, tap } from 'rxjs/operators';
import { RootEpic } from '..';

export const loggerEpic: RootEpic = (action$, state$, { outputChannel }) =>{

    // if (process.env.ENV_MODE !== 'production') {
    //     webViewReact.showWebView('Debugger', 'reactViewsDebugger.js');
    // }
    
    return action$.pipe(
        tap(action => {
            outputChannel.appendLine('-----------------------');
            outputChannel.appendLine(`ACTION: ${action.type}`);
            outputChannel.appendLine(`PAYLOAD: ${JSON.stringify(action.payload, null, 4)}`);
            // outputChannel.appendLine('-----------------------');
            // outputChannel.appendLine(`STATE: ${JSON.stringify(state$.value)}`);
            // outputChannel.appendLine('=======================');
        }),
        ignoreElements()
    );
};
