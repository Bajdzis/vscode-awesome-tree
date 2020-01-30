import * as vscode from 'vscode';

export function getRelativePath(path: string) {
    const { workspaceFolders } = vscode.workspace;
    if (!workspaceFolders) {
        return path;
    }
    for (let workspaceFolder of workspaceFolders) {
        const dirPath = workspaceFolder.uri.fsPath;
        path = path.replace(dirPath, '');
    }
    return path;
}
