import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { onRegisterWorkspace, onDidDelete, onDidCreate } from '../../action/files/files';

export interface FilesState {
    filesPath: string[];
}

const INITIAL_STATE: FilesState = {
    filesPath: []
};

export const filesReducer = reducerWithInitialState<FilesState>(INITIAL_STATE)
    .case(onRegisterWorkspace, (state: FilesState, payload): FilesState => ({
        ...state,
        filesPath: [...state.filesPath, ...payload.filePaths]
    }))
    .case(onDidDelete, (state: FilesState, payload): FilesState => ({
        ...state,
        filesPath:state.filesPath.filter(path => path !== payload.fsPath)
    }))
    .case(onDidCreate, (state: FilesState, payload): FilesState => {
        if (payload.type !== 'file') {
            return state;
        }
        return {
            ...state,
            filesPath: [...state.filesPath, payload.uri.fsPath]
        };
    });
