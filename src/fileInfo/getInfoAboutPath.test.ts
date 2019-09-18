import { getInfoAboutPath } from './getInfoAboutPath';

describe('fileInfo / getInfoAboutPath',() => {
    it('should return dir info', () => {
        const dirInfo = getInfoAboutPath('some/wired_patch/');

        expect(dirInfo.path).toEqual('some/wired_patch/');
        expect(dirInfo.isFile).toEqual(false);
        expect(dirInfo.pathParts).toHaveLength(2);
        expect(dirInfo.pathParts[1].parts).toEqual(['wired','patch']);
        expect(dirInfo.pathParts[1].textCase).toEqual('snakeCase');
    });

    it('should return file info', () => {
        const fileInfo = getInfoAboutPath('/some/wired_patch.json');

        expect(fileInfo.path).toEqual('/some/wired_patch.json');
        expect(fileInfo.isFile).toEqual(true);
        expect(fileInfo.pathParts).toHaveLength(2);
        expect(fileInfo.pathParts[1].parts).toEqual(['wired','patch']);
        expect(fileInfo.pathParts[1].textCase).toEqual('snakeCase');
    });
});
