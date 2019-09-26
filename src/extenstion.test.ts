jest.mock('fs');
jest.mock('path');
jest.mock('vscode');
import * as fs from 'fs';
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

    it('should create files when directory is created', (done) => {
        const createdItemUri: Partial<vscode.Uri> = {
            fsPath:'C:/site/new',
        };
        const fsWriteFile = fs.writeFile as any as jest.Mock;
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Yes, generate files');

        expect.assertions(5);

        mockWatcher.onDidCreate = jest.fn((callback) => {
            callback(createdItemUri).then(() => {
                expect(fsWriteFile).toHaveBeenCalledTimes(2);
                expect(fsWriteFile.mock.calls[0][0]).toStrictEqual('C:/site/new/new.js');
                expect(fsWriteFile.mock.calls[0][1]).toStrictEqual('function NewComponent () {');
                expect(fsWriteFile.mock.calls[1][0]).toStrictEqual('C:/site/new/new.css');
                expect(fsWriteFile.mock.calls[1][1]).toStrictEqual('.new { margin:5px; }');
                done();
            });
        });

        activate();
    });

});
