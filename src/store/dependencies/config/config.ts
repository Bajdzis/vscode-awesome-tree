import * as minimatch from 'minimatch';
import * as vscode from 'vscode';

export class Config {
    private outputChannel: vscode.OutputChannel;
    private settingProvider: vscode.WorkspaceConfiguration;

    constructor(settingProvider: vscode.WorkspaceConfiguration, outputChannel: vscode.OutputChannel){
        this.settingProvider = settingProvider;
        this.outputChannel = outputChannel;
    }

    shouldExcludeByGitIgnoreFile() : boolean {
        const defaultSettingValue = true;
        const settingValue = this.settingProvider.get<boolean>('excludeByGitIgnoreFile', defaultSettingValue);
    
        return settingValue;
    }

    getIgnorePathsGlob() : string[] {
        const defaultSettingValue = [
            'bower_components/**',
            'node_modules/**',
            '.git/**',
            '.svn',
            '.hg',
            '.DS_Store'
        ];
        const settingValue = this.settingProvider.get<string[]>('ignorePathsGlob', defaultSettingValue);
    
        return settingValue;
    }

    canUseThisFile(uri: vscode.Uri): boolean {
        const globs = this.getIgnorePathsGlob();
        for (let i = 0; i < globs.length; i++) {
            const glob = globs[i];
            if (minimatch(uri.fsPath, glob)) {
                const msg = `File '${uri.fsPath}' is exclude in setting! Check 'awesomeTree.ignorePathsGlob' setting. Exclude by glob '${glob}'`;
                this.outputChannel.appendLine(msg);
                return false;
            }
        }
        return true;
    }
}
