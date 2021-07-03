import { ignoreElements, tap } from 'rxjs/operators';
import { WebviewPanel } from 'vscode';
import { RootEpic } from '..';
import { dispatchAction } from '../../../reactViews/apps/debugger/actions/actions';

export const loggerEpic: RootEpic = (action$, state$, { outputChannel, webViewReact }) =>{
    let panel: Promise<WebviewPanel> = new Promise(() => {});
    if (process.env.ENV_MODE !== 'production') {
        panel = webViewReact.showWebView('Debugger', 'reactViewsDebugger.js');
    }

    return action$.pipe(
        tap(action => {
            outputChannel.appendLine('-----------------------');
            outputChannel.appendLine(`ACTION: ${action.type}`);
            // outputChannel.appendLine(`PAYLOAD: ${JSON.stringify(action.payload, null, 4)}`);
            outputChannel.appendLine('-----------------------');
            // outputChannel.appendLine(`STATE: ${JSON.stringify(state$.value)}`);
            // outputChannel.appendLine('=======================');
            panel.then(panel => {
                panel.webview.postMessage(

                    dispatchAction({
                        action,
                        state: state$.value
                    })
                );
            });
        }),
        ignoreElements()
    );
};
