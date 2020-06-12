import { tap, ignoreElements } from 'rxjs/operators';
import { RootEpic } from '..';

export const loggerEpic: RootEpic = (action$, state$, { outputChannel }) =>
    action$.pipe(
        tap(action => {
            outputChannel.appendLine('-----------------------');
            outputChannel.appendLine(`ACTION: ${action.type}`);
            outputChannel.appendLine(`PAYLOAD: ${JSON.stringify(action.payload, null, 4)}`);
            outputChannel.appendLine('-----------------------');
            outputChannel.appendLine(`STATE: ${JSON.stringify(state$.value)}`);
            outputChannel.appendLine('=======================');
        }),
        ignoreElements()
    );
