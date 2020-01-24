import * as fs from 'fs';
import * as path from 'path';

export function getAllFilesPath(dir: string, ignorePath?: RegExp): string[] {
    const list = fs.readdirSync(dir);
    let results: string[]  = [];
    list.forEach((file) => {
        const fullFilePath = path.join(dir, file);
        if (ignorePath && ignorePath.test(fullFilePath)) {
            return;
        }
        let stat = fs.statSync(fullFilePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(getAllFilesPath(fullFilePath, ignorePath));
        } else { 
            results.push(fullFilePath);
        }
    });
    return results;
}
