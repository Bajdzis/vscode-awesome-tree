jest.mock('vscode');
import * as vscode from 'vscode';
import { AwesomeTreeError } from './AwesomeTreeError';
import { reportBug } from './reportBug';

describe('reportBug', () => {
    
    beforeEach(() => {
        // @ts-ignore
        vscode.window.showErrorMessage.mockClear();
        // @ts-ignore
        vscode.commands.executeCommand.mockClear();
    });

    it('should show Error message in alert', () => {
        reportBug(new Error('Some bad error'));
        expect(vscode.window.showErrorMessage).toBeCalledWith('Something go wrong :( Error: Some bad error', 'Create issue on GitHub');
    });

    it('should show Error message in alert when pass custom error', () => {
        reportBug(new AwesomeTreeError('More specific error', {
            some: 'important',
            data: 'for debug!'
        }));
        expect(vscode.window.showErrorMessage).toBeCalledWith('Something go wrong :( Error: More specific error', 'Create issue on GitHub');
    });

    it('should show unexpected error when not pass Error object', () => {
        expect(reportBug(true)).resolves.not.toThrow();
        expect(reportBug(false)).resolves.not.toThrow();
        expect(reportBug('')).resolves.not.toThrow();
        expect(reportBug(123)).resolves.not.toThrow();
        expect(reportBug(null)).resolves.not.toThrow();
        expect(reportBug({})).resolves.not.toThrow();
        expect(reportBug([])).resolves.not.toThrow();
    });

    it('should ', async () => {
        // @ts-ignore
        vscode.window.showErrorMessage.mockResolvedValue('Create issue on GitHub');
        const someImportant = { data: 'for debug!' };

        await reportBug(new AwesomeTreeError('More specific error', someImportant));

        expect(vscode.commands.executeCommand).toBeCalledWith('vscode.open', expect.any(String));
        expect(vscode.commands.executeCommand).toBeCalledWith('vscode.open', expect.stringContaining('https://github.com/Bajdzis/vscode-awesome-tree/issues/new'));
        expect(vscode.commands.executeCommand).toBeCalledWith('vscode.open', expect.stringContaining([
            'Debug Info:', 
            '```json', 
            JSON.stringify(someImportant), 
            '```',
        ].join('\n')));
    });

});
