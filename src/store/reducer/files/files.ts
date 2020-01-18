import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { updateFileList } from '../../action/files/files';

export interface FilesState {
    filesPath: string[];
}

const INITIAL_STATE: FilesState = {
    filesPath: []
};

export const filesReducer = reducerWithInitialState<FilesState>(INITIAL_STATE)
    .case(updateFileList, (state, filesPath) => ({
        ...state,
        filesPath
    }));
