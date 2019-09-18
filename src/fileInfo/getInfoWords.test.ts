import { getInfoWords } from './getInfoWords';

describe('fileInfo / getInfoWords',() => {
    it('should return info', () => {
        const wordsInfo = getInfoWords('firstLetterIsSmall');

        expect(wordsInfo.value).toEqual('firstLetterIsSmall');
        expect(wordsInfo.textCase).toEqual('camelCase');
        expect(wordsInfo.parts).toEqual(['first', 'letter', 'is', 'small']);
    });
});
