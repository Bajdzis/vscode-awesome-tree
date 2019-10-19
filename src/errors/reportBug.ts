import * as vscode from 'vscode';
import { createGithubIssue } from './createGithubIssue';

export async function reportBug(error: any) {

    const result = await vscode.window.showErrorMessage(
        `Something go wrong :( ${error.toString()}`,
        'Create issue on GitHub'
    );

    if (result === 'Create issue on GitHub') {
        createGithubIssue(error);
    }
}
