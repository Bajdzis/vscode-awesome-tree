jest.mock('path');
import { of } from 'rxjs';
import * as vscode from 'vscode';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { fillFileContentStarted, onDidCreate } from '../../action/files/files';
import { createMockDependency } from '../../dependencies/index.mock';
import { RootState } from '../../reducer';
import { onDidCreateFilesEpic } from './onDidCreateFiles';

const MOCK_STATE: { value : RootState} = {
    value: {
        files: {
            gitIgnoreCache: {
                '/home/path/project/.gitignore': [
                    '/dist/**'
                ]
            },
            pathToInfo: [
                '/home/path/project/src/app.js',
                '/home/path/project/src/app.css',
                '/home/path/project/src/app.html',
                '/home/path/project/.gitignore',
            ].reduce((pathToInfo, next) => {
                pathToInfo[next] = getInfoAboutPath(next);
                return pathToInfo;
            }, {} as { [key: string]: PathInfo })
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

const newFileInBuildDirectoryUri: vscode.Uri ={
    authority:'',
    fragment: '',
    fsPath: '\\home\\path\\project\\dist\\index.js',
    path: '/home/path/project/dist/index.js',
    query: '',
    scheme: 'file',
} as vscode.Uri;

describe('epic / onDidCreateFiles', () => {
    it('should throw fill action when file not exclude', (done) => {

        const actions = of(onDidCreate({
            uri: newFooterFileUri,
            type: 'file',
        }));

        const dependency = createMockDependency();
        dependency.config.canUseThisFile.mockReturnValue(true);
        dependency.files.isEmptyDirectory.mockReturnValue(false);
        dependency.files.isEmptyFile.mockReturnValue(true);
        dependency.files.isDirectory.mockReturnValue(false);
        const epic$ = onDidCreateFilesEpic(actions as any, MOCK_STATE as any, dependency as any);

        epic$.subscribe((action) => {
            expect(action).toEqual(fillFileContentStarted(newFooterFileUri));
            done();
        });
    });

    it('should exclude by gitignore', (done) => {
        const actions = of(onDidCreate({
            uri: newFileInBuildDirectoryUri,
            type: 'file',
        }));

        const dependency = createMockDependency();
        dependency.files.isEmptyDirectory.mockReturnValue(false);
        dependency.files.isEmptyFile.mockReturnValue(true);
        dependency.files.isDirectory.mockReturnValue(false);
        const epic$ = onDidCreateFilesEpic(actions as any, MOCK_STATE as any, dependency as any);
        const completeCallback = jest.fn();

        epic$.subscribe(completeCallback);

        setTimeout(() => {
            expect(completeCallback).not.toHaveBeenCalled();
            expect(dependency.outputChannel.appendLine).toHaveBeenCalled();
            expect(dependency.outputChannel.appendLine).toHaveBeenCalledWith('File \'\\home\\path\\project\\dist\\index.js\' is exclude in setting! Check \'awesomeTree.excludeByGitIgnoreFile\' setting. Exclude by \'.gitignore\' line : \'/dist/**\'');
            done();
        }, 20);
    });

});
