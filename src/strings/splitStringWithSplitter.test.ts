import { splitStringWithSplitter } from './splitStringWithSplitter';

describe('splitStringWithSplitter', () => {
    it('should not delete splitter', () => {
        const result = splitStringWithSplitter('some string with  space', ' ');

        expect(result).toEqual([
            'some', ' ', 'string', ' ', 'with', ' ', ' ', 'space'
        ]);
    });
    it('should split by new line', () => {
        const result = splitStringWithSplitter('some line\nnew line!', '\n');

        expect(result).toEqual([
            'some line', '\n', 'new line!'
        ]);
    });
    it('should split by many characters', () => {
        const result = splitStringWithSplitter('some, line\nnew line!', '\n ,');

        expect(result).toEqual([
            'some',',', ' ', 'line', '\n', 'new',' ','line!'
        ]);
    });
    
});
