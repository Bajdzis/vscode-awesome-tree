import * as vscode from 'vscode';

export class Config {
    private settingProvider: vscode.WorkspaceConfiguration;

    constructor(settingProvider: vscode.WorkspaceConfiguration){
        this.settingProvider = settingProvider;
    }

    getExcludeWatchRegExp(): RegExp {
        const defaultSettingValue = 'bower_components|node_modules|\\.git|\\.svn|\\.hg|\\.DS_Store';
        const settingValue = this.settingProvider.get<string>('excludeWatchRegExp', defaultSettingValue);
    
        return new RegExp(settingValue);
    }
}
