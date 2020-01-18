import { combineReducers } from 'redux';
import { FilesState, filesReducer } from './files/files';

export interface RootState {
    files: FilesState,
}

export const rootReducer = combineReducers({
    goals: filesReducer,
});

export type RootReducer = typeof rootReducer;
