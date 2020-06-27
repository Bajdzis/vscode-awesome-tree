import * as path from 'path';
import { RootState } from '../../reducer';
import { getInfoAboutPath } from '../../../fileInfo/getInfoAboutPath';
import { DirectoriesInfo } from '../../../fileInfo/getSiblingInfo';
import { getRelativePath } from '../../../fileSystem/getRelativePath';

export function getAllFiles (state: RootState) {
    return Object.keys(state.files.pathToInfo);
}

export function getFilesInDirectory (directoryPath: string) {
    return (state: RootState) => getAllFiles(state)
        .filter(path => path.indexOf(directoryPath) === 0)
        .map(path => path.replace(directoryPath, ''));
}

export function getAllDirectory (state: RootState) {
    return getAllFiles(state)
        .map(filePath => path.dirname(filePath))
        .filter((value, index, self) => self.indexOf(value) === index);
}

export function getSimilarDirectory (searchPath: string) {
    const searchInfo = getInfoAboutPath(searchPath);
    return (state: RootState) => {
        
        const similarPathInfo = getAllDirectory(state)
            .map(value => getInfoAboutPath(value))
            .filter((directoryInfo) =>  directoryInfo.pathParts.length === searchInfo.pathParts.length);

        const siblingsPath = similarPathInfo.filter((directoryInfo) => {
            for (let i = 0; i < searchInfo.pathParts.length - 1; i++) {
                const search = searchInfo.pathParts[i];
                const directory = directoryInfo.pathParts[i];
                if (search.value !== directory.value) {
                    return false;
                }
            }
            return true;
        });

        if (siblingsPath.length) {
            return siblingsPath.map(info => info.path);
        }

        return similarPathInfo.filter((directoryInfo) => {
            const numberOfWordsNotMatching = directoryInfo.pathParts.reduce((counter, wordsInfo, index) => {
                const searchWordsInfo = searchInfo.pathParts[index];
                if(wordsInfo.textCase !== searchWordsInfo.textCase) {
                    return counter + 1;
                }
                if(wordsInfo.parts.length !== searchWordsInfo.parts.length) {
                    return counter + 1;
                }
                return counter;
            }, 0);
            return numberOfWordsNotMatching <= 1;
        }).map(info => info.path);
    };
}

export function getSimilarDirectoryInfo (searchPath: string) {
    return (state: RootState): DirectoriesInfo => {
        const searchInfo = getSimilarDirectory(searchPath)(state);
        return searchInfo.reduce((directoriesInfo: DirectoriesInfo, directoryPath: string) => {

            directoriesInfo[directoryPath] ={
                directoryInfo:getInfoAboutPath(getRelativePath(directoryPath)),
                filesPath: getFilesInDirectory(directoryPath)(state)
            };
    
            return directoriesInfo;
        }, {} as DirectoriesInfo);
    };
}