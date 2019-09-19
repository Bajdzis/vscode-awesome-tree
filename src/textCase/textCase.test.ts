import { getTextCase } from './getTextCase';
import { getFormatedText } from './getFormatedText';

describe('textCase / getTextCase',() => {

    it('should return correct text case', () => {
        expect(getTextCase('Some text')).toEqual('capitalize');
        expect(getTextCase('some text')).toEqual('lowerCase');
        expect(getTextCase('someText')).toEqual('camelCase');
        expect(getTextCase('some-text')).toEqual('kebabCase');
        expect(getTextCase('SOME-TEXT')).toEqual('upperKebabCase');
        expect(getTextCase('some_text')).toEqual('snakeCase');
        expect(getTextCase('SOME_TEXT')).toEqual('upperSnakeCase');
    });

    it('should return text with correct format', () => {
        const someText = 'some text';

        expect(getFormatedText(someText, 'capitalize')).toEqual('Some text');
        expect(getFormatedText(someText, 'lowerCase')).toEqual('some text');
        expect(getFormatedText(someText, 'camelCase')).toEqual('someText');
        expect(getFormatedText(someText, 'kebabCase')).toEqual('some-text');
        expect(getFormatedText(someText, 'upperKebabCase')).toEqual('SOME-TEXT');
        expect(getFormatedText(someText, 'snakeCase')).toEqual('some_text');
        expect(getFormatedText(someText, 'upperSnakeCase')).toEqual('SOME_TEXT');
    });

});
