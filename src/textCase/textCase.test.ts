import { getTextCase, getTextCaseSingleWord } from './getTextCase';
import { getFormatedText } from './getFormatedText';

describe('textCase',() => {

    it('getTextCase should return correct text case', () => {
        expect(getTextCase('SomeText')).toEqual('pascalCase');
        expect(getTextCase('some text')).toEqual('lowerCase');
        expect(getTextCase('someText')).toEqual('camelCase');
        expect(getTextCase('some-text')).toEqual('kebabCase');
        expect(getTextCase('SOME-TEXT')).toEqual('upperKebabCase');
        expect(getTextCase('some_text')).toEqual('snakeCase');
        expect(getTextCase('SOME_TEXT')).toEqual('upperSnakeCase');
    });

    it('getTextCaseSingleWord should return correct text case', () => {
        expect(getTextCaseSingleWord('Word')).toEqual('pascalCase');
        expect(getTextCaseSingleWord('word')).toEqual('lowerCase');
        expect(getTextCaseSingleWord('WORD')).toEqual('upperKebabCase');
        expect(getTextCaseSingleWord('WoRd')).toEqual('other');

        expect(getTextCaseSingleWord('SomeText')).toEqual('other');
        expect(getTextCaseSingleWord('some text')).toEqual('other');
        expect(getTextCaseSingleWord('someText')).toEqual('other');
        expect(getTextCaseSingleWord('some-text')).toEqual('other');
        expect(getTextCaseSingleWord('SOME-TEXT')).toEqual('other');
        expect(getTextCaseSingleWord('some_text')).toEqual('other');
        expect(getTextCaseSingleWord('SOME_TEXT')).toEqual('other');
    });

    it('getFormatedText should return text with correct format', () => {
        const someText = 'Some text';

        expect(getFormatedText(someText, 'pascalCase')).toEqual('SomeText');
        expect(getFormatedText(someText, 'lowerCase')).toEqual('some text');
        expect(getFormatedText(someText, 'camelCase')).toEqual('someText');
        expect(getFormatedText(someText, 'kebabCase')).toEqual('some-text');
        expect(getFormatedText(someText, 'upperKebabCase')).toEqual('SOME-TEXT');
        expect(getFormatedText(someText, 'snakeCase')).toEqual('some_text');
        expect(getFormatedText(someText, 'upperSnakeCase')).toEqual('SOME_TEXT');
    });

});
