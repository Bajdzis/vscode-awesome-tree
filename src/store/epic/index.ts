import { Epic, combineEpics } from 'redux-observable';
import { RootState } from '../reducer';
import { RootDependency } from '../dependencies';
import { filesEpic } from './files/files';
import { catchError, tap } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import { reportBug } from '../../errors/reportBug';

export const rootEpic: RootEpic = (action$, store$, dependencies) =>
    combineEpics(filesEpic)(action$, store$, dependencies).pipe(
        tap(action => dependencies.outputChannel.appendLine(`ACTION: ${action.type}`)),
        catchError((error, source) => {
            console.error(error);
            reportBug(error);
            return source;
        })
    );

// @ts-ignore
export type RootEpic<I = Action<any>, O = Action<any>> = Epic<I, O, RootState, RootDependency>;
