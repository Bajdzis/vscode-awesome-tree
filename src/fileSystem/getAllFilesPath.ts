import * as fs from 'fs';
import * as path from 'path';

export function getAllFilesPath(dir: string): string[] {
    const list = fs.readdirSync(dir);
    let results: string[]  = [];
    list.forEach((file) => {
        const fullFilePath = path.resolve( dir, file);
        let stat = fs.statSync(fullFilePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(getAllFilesPath(fullFilePath));
        } else { 
            results.push(fullFilePath);
        }
    });
    return results;
}
