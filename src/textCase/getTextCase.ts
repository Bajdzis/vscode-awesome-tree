import { camelCase, snakeCase, lowerCase , kebabCase, upperFirst } from 'lodash';
import { TextCase } from './domain';

export function getTextCase(value: string): TextCase {
    if(upperFirst(camelCase(value))  === value){
        return 'pascalCase';
    } else if (lowerCase(value) === value) {
        return 'lowerCase';
    } else if (camelCase(value) === value) {
        return 'camelCase';
    } else if (kebabCase(value) === value) {
        return 'kebabCase';
    } else if (snakeCase(value)  === value) {
        return 'snakeCase';
    } else if (snakeCase(value).toUpperCase()  === value) {
        return 'upperSnakeCase';
    } else if (kebabCase(value).toUpperCase()  === value) {
        return 'upperKebabCase';
    }

    return 'other';
}

export function getTextCaseSingleWord(singleWord: string): TextCase {
    if (singleWord.match(/^[a-z]*$/i) === null) {
        return 'other';
    }

    if (upperFirst(lowerCase(singleWord)) === singleWord) {
        return 'pascalCase';
    } else if (lowerCase(singleWord) === singleWord) {
        return 'lowerCase';
    } else if (singleWord.toUpperCase() === singleWord) {
        return 'upperKebabCase';
    }

    return 'other';
}
