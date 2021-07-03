jest.mock('fs');
jest.mock('path');
jest.mock('vscode');
jest.mock('./symbolInformation/getFileSymbols');
import * as fs from 'fs';
import * as vscode from 'vscode';
import { activate } from './extension';
import * as mockedGetFileSymbols from './symbolInformation/getFileSymbols';

describe('extenstion', () => {

    let mockWatcher: {
        [key in keyof vscode.FileSystemWatcher]?: jest.Mock
    };
    let mockContext: vscode.ExtensionContext;
    const fsWriteFile = fs.writeFile as any as jest.Mock;

    beforeEach(() => {
        mockWatcher = {
            onDidCreate: jest.fn(),
            onDidChange: jest.fn(),
            onDidDelete: jest.fn()
        };
        mockContext = {
            subscriptions: {
                push: jest.fn()
            },
            extensionPath : ''
        } as any as vscode.ExtensionContext;
        const createSystemWatcher = vscode.workspace.createFileSystemWatcher as jest.Mock;
        //@ts-ignore
        vscode.workspace.workspaceFolders = [{
            uri: {
                fsPath: 'C:/site/'
            }
        }];
        fsWriteFile.mockClear();
        createSystemWatcher.mockReturnValueOnce(mockWatcher);
        (mockedGetFileSymbols.getFileSymbols as jest.Mock<Promise<mockedGetFileSymbols.FileSymbol>>).mockImplementation(async (uri: vscode.Uri) =>{
            // @ts-expect-error
            const text: string = fs.mockFiles[uri.fsPath] || '';
            return {
                children:[],
                kind: 0,
                text: text,
                value: text
            };
        });
    });

    it('should start listen for create file', () => {
        expect(vscode.workspace.createFileSystemWatcher).not.toHaveBeenCalled();
        activate(mockContext);

        expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalled();
        expect(mockWatcher.onDidCreate).toHaveBeenCalled();
    });

    it.skip('should create files when directory is created', (done) => {
        const createdItemUri: Partial<vscode.Uri> = {
            fsPath:'C:/site/components/new',
        };
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Yes, generate files');

        expect.assertions(5);

        mockWatcher.onDidCreate = jest.fn((callback) => {
            callback(createdItemUri);
            setTimeout(() => {
                expect(fsWriteFile).toHaveBeenCalledTimes(2);
                expect(fsWriteFile.mock.calls[0][0]).toStrictEqual('C:/site/components/new/new.js');
                expect(fsWriteFile.mock.calls[0][1]).toStrictEqual('function NewComponent () {');
                expect(fsWriteFile.mock.calls[1][0]).toStrictEqual('C:/site/components/new/new.css');
                expect(fsWriteFile.mock.calls[1][1]).toStrictEqual('.new { margin:5px; }');
                done();
            }, 20);
        });

        activate(mockContext);
    });

    it.skip('should create content when file is created', (done) => {
        const createdItemUri: Partial<vscode.Uri> = {
            fsPath:'C:/site/action/createAction.js',
        };
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Yes, create content');

        expect.assertions(3);

        mockWatcher.onDidCreate = jest.fn((callback) => {
            callback(createdItemUri);
            setTimeout(() => {
                expect(fsWriteFile).toHaveBeenCalledTimes(1);
                expect(fsWriteFile.mock.calls[0][0]).toStrictEqual('C:/site/action/createAction.js');
                expect(fsWriteFile.mock.calls[0][1]).toStrictEqual('const create = new Action();');
                done();
            }, 20);
        });

        activate(mockContext);
    });

});
