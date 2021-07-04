import { PathInfo } from 'awesome-tree-engine';
import { RootState } from '../../reducer';

export function getAllFiles (state: RootState) {
    return Object.keys(state.files.pathToInfo);
}

export function getSimilarPaths (basePath: PathInfo) {
    return (state: RootState) => {
        const allSimilar = Object.values(state.files.pathToInfo)
            .filter(file => file.isSimilar(basePath));

        if(allSimilar.length === 0) {
            return [];
        }
        let baseParentPath = basePath.getParent();
        let sameParent: PathInfo[] = [];
        while (sameParent.length === 0) {
            baseParentPath = baseParentPath.getParent();
            sameParent = allSimilar.filter(file => file.includes(baseParentPath));
        }

        return sameParent;
    };
}

export function getIncludePaths (basePath: PathInfo) {
    return (state: RootState) => {
        const allSimilar = Object.values(state.files.pathToInfo)
            .filter(file => file.includes(basePath));

        return allSimilar;
    };
}
