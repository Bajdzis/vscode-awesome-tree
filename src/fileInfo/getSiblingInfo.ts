import * as fs from 'fs';
import * as path from 'path';
import { PathInfo, getInfoAboutPath } from './getInfoAboutPath';
import { getAllFilesPath } from '../fileSystem/getAllFilesPath';
import { getRelativePath } from '../fileSystem/getRelativePath';

export type DirectoriesInfo = {
	[path: string]: {
        directoryInfo: PathInfo;
		filesPath: string[];
	}
};

export function getSiblingInfo(directory: string): DirectoriesInfo {
    const parentDir = path.dirname(directory);
    const nameDirectoryToSkip = path.basename(directory);
    const result: DirectoriesInfo = {};
    const directoryNames = fs.readdirSync(parentDir);
    directoryNames.forEach(subDirectoryOrFiles => {
        const subDirectoryOrFilesPath = path.resolve(parentDir, subDirectoryOrFiles);
        if (fs.lstatSync(subDirectoryOrFilesPath).isDirectory() && nameDirectoryToSkip !== subDirectoryOrFiles) {
            const files = getAllFilesPath(subDirectoryOrFilesPath);
            const directoryInfo = getInfoAboutPath(getRelativePath(subDirectoryOrFilesPath));
            result[subDirectoryOrFilesPath] = {
                directoryInfo,
                filesPath: files.map((filePath) => filePath.replace(subDirectoryOrFilesPath, ''))
            };
        }
    });

    return result;
}
