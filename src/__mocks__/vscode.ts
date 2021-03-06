import * as vscode from 'vscode';

const outputChanelMock = {
    appendLine:jest.fn()
} as {[key in keyof vscode.OutputChannel]: jest.Mock};

const folder: vscode.WorkspaceFolder = {
    index: 0,
    name: 'site',
    uri: {
        authority: 'file',
        fsPath: 'C:/site',
    } as vscode.Uri
};

export const workspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn((key, def) => def)
    })),
    createFileSystemWatcher: jest.fn(),
    onDidChangeWorkspaceFolders: jest.fn(),
    openTextDocument: jest.fn(() => new Promise(() => {})),
    workspaceFolders: [
        folder
    ]
} as {[key in keyof typeof vscode.workspace]: jest.Mock | vscode.WorkspaceFolder[]};

export function DocumentSymbol() {}

export function SymbolInformation() {}

export const ProgressLocation = {
    Notification: 15
};

export const window = {
    createOutputChannel: jest.fn(() => outputChanelMock),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    withProgress: jest.fn(),
} as {[key in keyof typeof vscode.window]: jest.Mock};

export const commands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
} as {[key in keyof typeof vscode.commands]: jest.Mock};

export const Uri = {
    file: jest.fn((data: string) => ({
        authority:'',
        fragment: '',
        fsPath: data,
        path: data,
        query: '',
        scheme: '',
        toJSON: jest.fn(),
        toString: jest.fn(),
        with: jest.fn(() => '')
    })),
    parse: jest.fn((data: string): vscode.Uri => ({
        authority:'',
        fragment: '',
        fsPath: data,
        path: data,
        query: '',
        scheme: '',
        toJSON: jest.fn(),
        toString: jest.fn(),
        with: jest.fn()
    }))
};
