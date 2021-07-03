import ignore, {Ignore} from 'ignore';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { onRegisterWorkspace, onDidDelete, onDidCreate, updateGitIgnoreFile } from '../../action/files/files';
import { PathInfo } from 'awesome-tree-engine';

export interface FilesState {
    pathToInfo: { [filePath: string]: PathInfo }
    gitIgnoreCache: {[directoryPath: string]: Ignore}
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
                return {...state,[fsPath.getPath()]:fsPath };
            }, {})
        }
    }))
    .case(onDidDelete, (state: FilesState, payload): FilesState => ({
        ...state,
        pathToInfo: Object.entries(state.pathToInfo).reduce((pathToInfo, [key, value]) => {
            if(key.indexOf(payload.getPath()) !== 0) {
                pathToInfo[key] = value;
            }
            return pathToInfo;
        }, {} as { [key: string]: PathInfo })
    }))
    .case(onDidCreate, (state: FilesState, payload): FilesState => {
        if (payload.isDirectory()) {
            return state;
        }

        return {
            ...state,
            pathToInfo: {
                ...state.pathToInfo,
                [payload.getPath()]: payload
            }
        };
    })
    .case(updateGitIgnoreFile, (state: FilesState, payload): FilesState  => {
        return {
            ...state,
            gitIgnoreCache: {
                ...state.gitIgnoreCache,
                [payload.path.getParent().getPath()]: ignore().add(payload.content)
            }
        };
    });
