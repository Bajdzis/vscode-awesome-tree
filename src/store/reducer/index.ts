import { combineReducers } from 'redux';
import { FilesState, filesReducer } from './files/files';
import { lockReducer, LockState } from './lock/lock';

export interface RootState {
    files: FilesState,
    lock: LockState
}

export const rootReducer = combineReducers({
    files: filesReducer,
    lock: lockReducer
});

