import * as vscode from 'vscode';

const outputChanelMock = {
    appendLine:jest.fn()
} as {[key in keyof vscode.OutputChannel]: jest.Mock};

export const workspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn((key, def) => def)
    })),
    createFileSystemWatcher: jest.fn(),
} as {[key in keyof typeof vscode.workspace]: jest.Mock};

export const window = {
    createOutputChannel: jest.fn(() => outputChanelMock),
    showInformationMessage: jest.fn(),
} as {[key in keyof typeof vscode.window]: jest.Mock};
