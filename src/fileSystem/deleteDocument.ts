import * as fs from 'fs';
import * as path from 'path';

async function deleteDirectoryRecursive(dirPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        fs.rmdir(dirPath, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });

    const parentDirectory = path.dirname(dirPath);
    let list: string[];

    try {
        list = fs.readdirSync(parentDirectory);
    } catch (error) {
        list = [];
    }
    
    if (list.length === 0) {
        await deleteDirectoryRecursive(parentDirectory);
    }
}

export async function deleteDocument(filePath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });

    const directory = path.dirname(filePath);
    let list: string[];

    try {
        list = fs.readdirSync(directory);
    } catch (error) {
        list = [];
    }

    if (list.length === 0) {
        await deleteDirectoryRecursive(directory);
    }

}
