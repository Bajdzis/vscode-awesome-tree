import * as fs from 'fs';
import * as vscode from 'vscode';
import { ensureDirectoryExistence } from './ensureDirectoryExistence';

export function createDocument(filePath: string, content: string): Promise<vscode.TextDocument> {
    return new Promise((resolve, reject) => {
        ensureDirectoryExistence(filePath);
        fs.writeFile(filePath, content, {}, async (err) => {
            if(err){
                return reject(err);
            }
            vscode.workspace.openTextDocument(filePath).then(resolve);
        });
    });
}
