import { combineReducers } from 'redux';
import { FilesState, filesReducer } from './files/files';
// import { templatesReducer, TemplatesState } from './templates/templates';
import { lockReducer, LockState } from './lock/lock';

export interface RootState {
    files: FilesState,
    // templates: TemplatesState,
    lock: LockState
}

export const rootReducer = combineReducers({
    files: filesReducer,
    // templates: templatesReducer,
    lock: lockReducer
});

export type RootReducer = typeof rootReducer;
