import { combineReducers } from 'redux';
import { FilesState, filesReducer } from './files/files';
import { templatesReducer, TemplatesState } from './templates/templates';

export interface RootState {
    files: FilesState,
    templates: TemplatesState,
}

export const rootReducer = combineReducers({
    files: filesReducer,
    templates: templatesReducer
});

export type RootReducer = typeof rootReducer;
