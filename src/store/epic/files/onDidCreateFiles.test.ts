jest.mock('fs');
jest.mock('path');
import { PathInfo } from 'awesome-tree-engine';
import { of } from 'rxjs';
import { fillFileContentStarted, onDidCreate } from '../../action/files/files';
import { createMockDependency } from '../../dependencies/index.mock';
import { RootState } from '../../reducer';
import { onDidCreateFilesEpic } from './onDidCreateFiles';
import ignore from 'ignore';

const MOCK_STATE: { value : RootState} = {
    value: {
        files: {
            gitIgnoreCache: {
                '/home/path/project/': ignore().add('/dist/**')
            },
            pathToInfo: [
                '/home/path/project/src/app.js',
                '/home/path/project/src/app.css',
                '/home/path/project/src/app.html',
                '/home/path/project/.gitignore',
            ].reduce((pathToInfo, next) => {
                pathToInfo[next] = new PathInfo(next);
                return pathToInfo;
            }, {} as { [key: string]: PathInfo })
        },
        lock: {
            locked: false
        }
    }
};

const newFileInBuildDirectoryPathInfo= new PathInfo('/home/path/project/dist/index.js');
const newFooterFilePathInfo = new PathInfo('/home/path/project/src/footer.html');

describe('epic / onDidCreateFiles', () => {
    it('should throw fill action when file not exclude', (done) => {

        const actions = of(onDidCreate( newFooterFilePathInfo ));

        const dependency = createMockDependency();
        dependency.config.canUseThisFile.mockReturnValue(true);
        dependency.files.isEmptyDirectory.mockReturnValue(false);
        dependency.files.isEmptyFile.mockReturnValue(true);
        dependency.files.isDirectory.mockReturnValue(false);
        const epic$ = onDidCreateFilesEpic(actions as any, MOCK_STATE as any, dependency as any);

        epic$.subscribe((action) => {
            expect(action).toEqual(fillFileContentStarted(newFooterFilePathInfo));
            done();
        });
    });

    it('should exclude by gitignore', (done) => {
        const actions = of(onDidCreate(newFileInBuildDirectoryPathInfo));

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
            expect(dependency.outputChannel.appendLine).toHaveBeenCalledWith('File \'/home/path/project/dist/index.js\' is exclude in setting! Check \'awesomeTree.excludeByGitIgnoreFile\' setting. Exclude by \'.gitignore\' from directory : \'/home/path/project/\'');
            done();
        }, 20);
    });

});
