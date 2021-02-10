jest.mock('path');
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { RootState } from '../../reducer';
import { getAllDirectory, getFilesInDirectory, getFirstDirectoryWithSameFiles, getGitIgnoreFiles, getSimilarDirectory } from './files';

describe('selectors / files', () => {

    const mockState: Partial<RootState> = {
        files: {
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
                pathToInfo[next] = getInfoAboutPath(next);
                return pathToInfo;
            }, {} as { [key: string]: PathInfo })
        }
    };

    it('getSimilarDirectory should return only similar path', () => {
        const selector = getSimilarDirectory('/home/path/project/src/component/footer/hooks/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual([
            '/home/path/project/src/component/header/hooks',
            '/home/path/project/src/component/header copy/hooks',
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

    it('getFilesInDirectory should return array with files path', () => {
        const selector = getFilesInDirectory('/home/path/project/src/component/header/');
        const files = selector(mockState as any as RootState);

        expect(files).toEqual([
            'header.js',
            'header.css',
            'header.html',
            'hooks/useHeaderStyle.js',
            'hooks/useAffix.js',
        ]);
    });

    it('getFilesInDirectory should return same files when directory path not have slash on end', () => {
        const selector = getFilesInDirectory('/home/path/project/src/component/header');
        const files = selector(mockState as any as RootState);

        expect(files).toEqual([
            'header.js',
            'header.css',
            'header.html',
            'hooks/useHeaderStyle.js',
            'hooks/useAffix.js',
        ]);
    });

    it('getAllDirectory should get only directories paths', () => {
        const directories = getAllDirectory(mockState as any as RootState);

        expect(directories).toEqual([
            '/home/path/project/src/component/header',
            '/home/path/project/src/component/header/hooks',
            '/home/path/project/src/component/header copy',
            '/home/path/project/src/component/header copy/hooks',
            '/home/path/project/src/component/content',
            '/home/path/project/src/component/content/hooks',
            '/home/path/project/src/tests/content',
            '/home/path/project/src/tests/header',
            '/home/path/project/src',
        ]);
    });

    it('getFirstDirectoryWithSameFiles should return directory path with same files', () => {
        const selector = getFirstDirectoryWithSameFiles('/home/path/project/src/component/header copy/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual('/home/path/project/src/component/header');
    });

    it('getFirstDirectoryWithSameFiles should return null when directory with same files not exist', () => {
        const selector = getFirstDirectoryWithSameFiles('/home/path/project/src/component/content/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual(null);
    });

    it('getFirstDirectoryWithSameFiles should return null when directory with same files have same dir name', () => {
        const selector = getFirstDirectoryWithSameFiles('/home/path/project/src/component/header/hooks/');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual(null);
    });

    it('getGitIgnoreFiles should return path to gitignore file', () => {
        const selector = getGitIgnoreFiles('/home/path/project/src/component/content/hooks/useContentStyle.js');
        const similarPaths = selector(mockState as any as RootState);

        expect(similarPaths).toEqual('/home/path/project/src/component/content/hooks/useContentStyle.js');
    });
});
