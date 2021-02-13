jest.mock('fs');
jest.mock('vscode');
jest.mock('path');
import { getAllFilesPath } from './getAllFilesPath';

describe('getAllFilesPath',() => {

    it('should return all files', () => {
        expect(getAllFilesPath('C:/site')).toEqual([
            'C:/site/components/nav/nav.js',
            'C:/site/components/nav/nav.css',
            'C:/site/components/btn/btn.js',
            'C:/site/components/btn/btn.css',
            'C:/site/action/firstAction.js',
            'C:/site/action/importantAction.js',
            'C:/site/action/createAction.js',
        ]);
    });

    it('should return filter files', () => {
        expect(getAllFilesPath('C:/site', [
            'action/**'
        ])).toEqual([
            'C:/site/components/nav/nav.js',
            'C:/site/components/nav/nav.css',
            'C:/site/components/btn/btn.js',
            'C:/site/components/btn/btn.css'
        ]);
    });

});
