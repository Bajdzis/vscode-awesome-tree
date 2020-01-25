import * as vscode from 'vscode';

export class Config {
    private outputChannel: vscode.OutputChannel;
    private settingProvider: vscode.WorkspaceConfiguration;

    constructor(settingProvider: vscode.WorkspaceConfiguration, outputChannel: vscode.OutputChannel){
        this.settingProvider = settingProvider;
        this.outputChannel = outputChannel;
    }

    getExcludeWatchRegExp(): RegExp {
        const defaultSettingValue = 'bower_components|node_modules|\\.git|\\.svn|\\.hg|\\.DS_Store';
        const settingValue = this.settingProvider.get<string>('excludeWatchRegExp', defaultSettingValue);
    
        return new RegExp(settingValue);
    }

    canUseThisFile(uri: vscode.Uri): boolean {
        if (this.getExcludeWatchRegExp().exec(uri.fsPath) !== null) {
            const msg = `File '${uri.fsPath}' is exclude in setting! Check 'awesomeTree.excludeWatchRegExp' setting.`;
            this.outputChannel.appendLine(msg);
            return false;
        }
        return true;
    }
}
