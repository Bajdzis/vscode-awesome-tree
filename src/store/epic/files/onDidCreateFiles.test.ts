jest.mock('path');
import { of } from 'rxjs';
import * as vscode from 'vscode';
import { onDidCreate } from '../../action/files/files';
import { createMockDependency } from '../../dependencies/index.mock';
import { RootState } from '../../reducer';
import { getSimilarDirectory } from './files';
import { onDidCreateFilesEpic } from './onDidCreateFiles';

describe('epic / onDidCreateFiles', () => {

    it.skip('TODO', () => {
        const selector = getSimilarDirectory('/home/path/project/src/component/footer/hooks/');
        const similarPaths = selector(mockState as any as RootState);

        const actions = of([onDidCreate({
            type: 'file',
            uri: vscode.Uri.file('/home/path/project')
        }));

        const state: { value : RootState} = {
            value: {
                files: {
                    gitIgnoreCache: {},
                    pathToInfo: [
                        '/home/path/project/src/app.js',
                        '/home/path/project/src/app.css',
                        '/home/path/project/src/app.html',
                        '/home/path/project/.gitignore',
                    ]
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
        const dependency = createMockDependency();
        const observable = onDidCreateFilesEpic(actions as any, state as any, dependency);


        // expect(similarPaths).toEqual([
        //     '/home/path/project/src/component/header/hooks',
        //     '/home/path/project/src/component/header copy/hooks',
        //     '/home/path/project/src/component/content/hooks'
        // ]);
    });


});
