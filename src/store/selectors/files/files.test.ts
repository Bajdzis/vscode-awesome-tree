jest.mock('path');
import { PathInfo } from 'awesome-tree-engine';
import { RootState } from '../../reducer';
import { getAllFiles } from './files';

describe('selectors / files', () => {
    const mockState: Partial<RootState> = {
        files: {
            gitIgnoreCache: {},
            pathToInfo: [
                '/home/path/project/src/component/header/header.js',
                '/home/path/project/src/component/header/header.css',
                '/home/path/project/src/component/header/header.html',
                '/home/path/project/src/component/header/hooks/useHeaderStyle.js',
                '/home/path/project/src/component/header/hooks/useAffix.js',
                '/home/path/project/src/component/header copy/header.css',
                '/home/path/project/src/component/header copy/header.html',
                '/home/path/project/src/component/header copy/header.js',
                '/home/path/project/src/component/header copy/hooks/useAffix.js',
                '/home/path/project/src/component/header copy/hooks/useHeaderStyle.js',
                '/home/path/project/src/component/content/content.js',
                '/home/path/project/src/component/content/content.css',
                '/home/path/project/src/component/content/content.html',
                '/home/path/project/src/component/content/hooks/useContentStyle.js',
                '/home/path/project/src/tests/content/content.js',
                '/home/path/project/src/tests/header/header.js',
                '/home/path/project/src/app.js',
                '/home/path/project/src/app.css',
                '/home/path/project/src/app.html',
                '/home/path/project/.gitignore',
            ].reduce((pathToInfo, next) => {
                pathToInfo[next] = new PathInfo(next);
                return pathToInfo;
            }, {} as { [key: string]: PathInfo })
        }
    };
    it('getAllFiles should return all path info', () => {
        const similarPaths = getAllFiles(mockState as any as RootState);

        expect(similarPaths).toHaveLength(20);
    });
});
