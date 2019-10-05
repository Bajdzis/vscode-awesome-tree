import * as fs from 'fs';
import * as path from 'path';

export function ensureDirectoryExistence(filePath:string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
