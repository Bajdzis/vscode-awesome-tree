import { omit } from 'lodash';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { onRegisterWorkspace, onDidDelete, onDidCreate } from '../../action/files/files';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { getRelativePath } from '../../../fileSystem/getRelativePath';

export interface FilesState {
    pathToInfo: { [key: string]: PathInfo }
}

const INITIAL_STATE: FilesState = {
    pathToInfo: {}
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
        pathToInfo: omit(state.pathToInfo, [payload.fsPath])
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
    });
