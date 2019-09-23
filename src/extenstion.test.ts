jest.mock('fs');
jest.mock('path');
import * as vscode from 'vscode';
import { activate } from './extension';

describe('extenstion', () => {
    
    let mockWatcher: {
        [key in keyof vscode.FileSystemWatcher]?: jest.Mock
    };

    beforeEach(() => {
        mockWatcher = {
            onDidCreate: jest.fn()
        };
        const createSystemWatcher = vscode.workspace.createFileSystemWatcher as jest.Mock;
        createSystemWatcher.mockReturnValueOnce(mockWatcher);
    });

    it('should start listen for create file', () => {
        expect(vscode.workspace.createFileSystemWatcher).not.toHaveBeenCalled();
        activate();

        expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalled();
        expect(mockWatcher.onDidCreate).toHaveBeenCalled();
    });

});
