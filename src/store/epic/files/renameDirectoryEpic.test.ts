jest.mock('path');
jest.mock('fs');
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
        },
        templates: {
            contents:{},
            workspaces:{}
        }
    }
};

const newFooterFileUri: vscode.Uri ={
    authority:'',
    fragment: '',
    fsPath: '\\home\\path\\project\\src\\footer.html',
    path: '/home/path/project/src/footer.html',
    query: '',
    scheme: 'file',
} as vscode.Uri;

describe('epic / renameDirectoryEpic', () => {
    it('should block new event when start generate', (done) => {
        //@ts-ignore
        vscode.workspace.openTextDocument.mockResolvedValue({});
        const actions = of(renameDirectory.started(newFooterFileUri));

        const dependency = createMockDependency();
        dependency.directoryRename.showWebView.mockReturnValue([{
            content: 'content',
            filePath: 'filePath',
            filePathFrom: 'filePathFrom',
            filePathFromRelative: 'filePathFromRelative',
            filePathRelative: 'filePathRelative'
        }] as WebViewInfoAboutRenameFiles[]);
        const epic$ = renameDirectoryEpic(actions as any, MOCK_STATE as any, dependency as any);
 
        epic$.subscribe((action) => {
            expect(action).toEqual(generateStarted());
            done();
        });
    });

});
