jest.mock('path');
jest.mock('fs');
import { PathInfo } from 'awesome-tree-engine';
import { of } from 'rxjs';
import * as vscode from 'vscode';
import { renameDirectory } from '../../action/files/files';
import { generateStarted } from '../../action/lock/lock';
import { WebViewInfoAboutRenameFiles } from '../../dependencies/directoryRename/directoryRename';
import { createMockDependency } from '../../dependencies/index.mock';
import { RootState } from '../../reducer';
import { renameDirectoryEpic } from './renameDirectoryEpic';

const MOCK_STATE: { value : RootState} = {
    value: {
        files: {
            gitIgnoreCache: {},
            pathToInfo: [] as any as RootState['files']['pathToInfo']
        },
        lock: {
            locked: false
        }
    }
};

describe('epic / renameDirectoryEpic', () => {
    it('should block new event when start generate', (done) => {
        //@ts-ignore
        vscode.workspace.openTextDocument.mockResolvedValue({});
        const actions = of(renameDirectory.started(new PathInfo('\\home\\path\\project\\src\\footer.html')));

        const dependency = createMockDependency();
        dependency.directoryRename.showWebView.mockReturnValue([{
            content: 'content',
            filePath: 'filePath',
        }] as WebViewInfoAboutRenameFiles[]);
        const epic$ = renameDirectoryEpic(actions as any, MOCK_STATE as any, dependency as any);

        epic$.subscribe((action) => {
            expect(action).toEqual(generateStarted());
            done();
        });
    });

});
