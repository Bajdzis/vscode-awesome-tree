import { RootState } from '../../reducer';

export function getAllFiles (state: RootState) {
    return Object.keys(state.files.pathToInfo);
}

