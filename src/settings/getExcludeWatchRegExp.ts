import * as vscode from 'vscode';

export function getExcludeWatchRegExp(settingProvider: vscode.WorkspaceConfiguration): RegExp {
    const defaultSettingValue = 'bower_components|node_modules|\\.git|\\.svn|\\.hg|\\.DS_Store';
    const settingValue = settingProvider.get<string>('excludeWatchRegExp', defaultSettingValue);

    return new RegExp(settingValue);
}
