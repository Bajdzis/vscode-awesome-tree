import * as vscode from 'vscode';
import { AwesomeTreeError } from './AwesomeTreeError';

const MAX_CHARACTERS_IN_URI: number = 4000;

export function createGithubIssue(error: Error) {
    let uri: string = 'https://github.com/Bajdzis/vscode-awesome-tree/issues/new';

    if (error instanceof AwesomeTreeError) {
        uri += `?title=${error.getTitle()}&body=${error.getBody()}`;
    } else if (error instanceof Error) {
        uri += `?title=${error.toString()}&body=\`\`\`${error.stack}\`\`\``;
    } 
    
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(
        uri.substring(0, MAX_CHARACTERS_IN_URI)
    ));
}
