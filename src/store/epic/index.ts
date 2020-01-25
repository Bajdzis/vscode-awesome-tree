import { Epic, combineEpics } from 'redux-observable';
import { RootState } from '../reducer';
import { RootDependency } from '../dependencies';
import { filesEpic } from './files/files';
import { catchError } from 'rxjs/operators';
import { Action } from 'typescript-fsa';
import { reportBug } from '../../errors/reportBug';
import { templatesEpic } from './templates/templates';

export const rootEpic: RootEpic = (action$, store$, dependencies) =>
    combineEpics(filesEpic, templatesEpic)(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error);
            reportBug(error);
            return source;
        })
    );

// @ts-ignore
export type RootEpic<I = Action<any>, O = Action<any>> = Epic<I, O, RootState, RootDependency>;
