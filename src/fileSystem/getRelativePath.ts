import * as vscode from 'vscode';

export function getRelativePath(path: string) {
    const { workspaceFolders } = vscode.workspace;
    if(!workspaceFolders){
        return path;
    }
    for (let i = 0; i < workspaceFolders.length; i++) {
        const dirPath = workspaceFolders[i].uri.fsPath;
        path = path.replace(dirPath, '');
    }
    return path;
}
