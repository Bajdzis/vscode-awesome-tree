import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { onRegisterWorkspace, onDidDelete, onDidCreate, updateGitIgnoreFile } from '../../action/files/files';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { getRelativePath } from '../../../fileSystem/getRelativePath';

export interface FilesState {
    pathToInfo: { [key: string]: PathInfo }
    gitIgnoreCache: {[patch: string]: string[]}
}

const INITIAL_STATE: FilesState = {
    pathToInfo: {},
    gitIgnoreCache: {}
};

export const filesReducer = reducerWithInitialState<FilesState>(INITIAL_STATE)
    .case(onRegisterWorkspace, (state: FilesState, payload): FilesState => ({
        ...state,
        pathToInfo: {
            ...state.pathToInfo,
            ...payload.filePaths.reduce((state, fsPath) => {
                const relativePath = getRelativePath(fsPath);
                const info = getInfoAboutPath(relativePath);
                return {...state,[fsPath]:info };
            }, {})
        }
    }))
    .case(onDidDelete, (state: FilesState, payload): FilesState => ({
        ...state,
        pathToInfo: Object.entries(state.pathToInfo).reduce((pathToInfo, [key, value]) => {
            if(key.indexOf(payload.fsPath) !== 0) {
                pathToInfo[key] = value;
            }
            return pathToInfo;
        }, {} as { [key: string]: PathInfo })
    }))
    .case(onDidCreate, (state: FilesState, payload): FilesState => {
        if (payload.type !== 'file') {
            return state;
        }

        const relativePath = getRelativePath(payload.uri.fsPath);
        const info = getInfoAboutPath(relativePath);

        return {
            ...state,
            pathToInfo: {
                ...state.pathToInfo,
                [payload.uri.fsPath]: info
            }
        };
    })
    .case(updateGitIgnoreFile, (state: FilesState, payload): FilesState  => {
        return {
            ...state,
            gitIgnoreCache: {
                ...state.gitIgnoreCache,
                [payload.path]: payload.lines
            }
        };
    });
