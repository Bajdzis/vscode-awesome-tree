
import { merge } from 'rxjs';
import { RootEpic } from '..';
import { fillFilesEpic } from './fillFiles';
import { gitIgnoreFilesEpic } from './gitIgnoreFiles';
import { onDidCreateFilesEpic } from './onDidCreateFiles';
import { renameDirectoryEpic } from './renameDirectoryEpic';

export const filesEpic: RootEpic<any> = (action$, state$, dependencies) =>
    merge(
        fillFilesEpic(action$, state$, dependencies),
        onDidCreateFilesEpic(action$, state$, dependencies),
        gitIgnoreFilesEpic(action$, state$, dependencies),
        renameDirectoryEpic(action$, state$, dependencies)
    );
