import * as fs from 'fs';
import * as minimatch from 'minimatch';
import * as path from 'path';
import { changeToUnixSlashes } from './changeToUnixSlashes';
import { getRelativePath } from './getRelativePath';

export function getAllFilesPath(dir: string, ignoreGlobs?: string[]): string[] {
    const list = fs.readdirSync(dir);
    let results: string[]  = [];
    list.forEach((file) => {
        const fullFilePath = path.join(dir, file);
        if (ignoreGlobs) {
            const relativePath = changeToUnixSlashes(getRelativePath(fullFilePath)).replace(/^\//g, '');
            for (let i = 0; i < ignoreGlobs.length; i++) {
                const glob = ignoreGlobs[i];
                if (minimatch(relativePath, glob)) {
                    return;
                }
            }
        }
        let stat = fs.statSync(fullFilePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesPath(fullFilePath, ignoreGlobs));
        } else {
            results.push(fullFilePath);
        }
    });
    return results;
}
