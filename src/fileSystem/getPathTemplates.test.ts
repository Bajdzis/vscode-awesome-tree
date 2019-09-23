import { DirectoriesInfo } from '../fileInfo/getSiblingInfo';
import { getPathTemplates } from './getPathTemplates';
import { getInfoAboutPath } from '../fileInfo/getInfoAboutPath';

describe('getPathTemplates',() => {
    const directoriesInfo: DirectoriesInfo = {
        '/some/real/path/to/dir': {
            directoryInfo: getInfoAboutPath('/some/real/path/to/dir'),
            filesPath:[
                '/file.txt',
                '/some/file/in/folder.txt'
            ]
        }
    };
    
    it('should return path template', () => {
        expect(getPathTemplates(directoriesInfo)).toEqual(['%2Ffile.txt', '%2F${lowerCase(words[0][0][0])||\'some\'}%2Ffile%2Fin%2Ffolder.txt']);
    });

});
