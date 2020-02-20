import { getSimilarDirectory } from './files';
import { RootState } from '../../reducer';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';

describe('selectors / files',() => {

    const mockState: Partial<RootState> = {
        files: {
            pathToInfo: [
                '/home/path/project/src/component/header/header.js',
                '/home/path/project/src/component/header/header.css',
                '/home/path/project/src/component/header/header.html',
                '/home/path/project/src/component/header/hooks/useHeaderStyle.js',
                '/home/path/project/src/component/header/hooks/useAffix.js',
                '/home/path/project/src/component/content/content.js',
                '/home/path/project/src/component/content/content.css',
                '/home/path/project/src/component/content/content.html',
                '/home/path/project/src/component/content/hooks/useContentStyle.js',
                '/home/path/project/src/tests/content/content.js',
                '/home/path/project/src/tests/header/header.js',
                '/home/path/project/src/app.js',
                '/home/path/project/src/app.css',
                '/home/path/project/src/app.html',
            ].reduce((pathToInfo, next) => {
                pathToInfo[next] = getInfoAboutPath(next);
                return pathToInfo;
            }, {} as { [key: string]: PathInfo } )
        }
    };

    it('getSimilarDirectory should return only similar path', () => {
        const selector = getSimilarDirectory('/home/path/project/src/component/footer/hooks/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual([
            '/home/path/project/src/component/header/hooks',
            '/home/path/project/src/component/content/hooks'
        ]);
    });

    it('getSimilarDirectory should return only similar path', () => {
        const selector = getSimilarDirectory('/home/path/project/src/tests/footer/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual([
            '/home/path/project/src/tests/content',
            '/home/path/project/src/tests/header'
        ]);
    });

    it('getSimilarDirectory should return empty array when not found similar dir', () => {
        const selector = getSimilarDirectory('/home/path/project/src/some/other/path/very/long/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual([]);
    });
});
