import {camelCase, snakeCase, lowerCase , kebabCase, capitalize} from 'lodash';

export type TextCase = 'camelCase' | 'snakeCase' | 'lowerCase' | 'kebabCase' | 'capitalize' | 'other';

export interface WordsInfo {
    value: string;
    parts: string[];
    textCase: TextCase;
};

export function getTextCase(value: string): TextCase {
    if(capitalize(value)  === value){
        return 'capitalize';
    } else if (lowerCase(value) === value) {
        return 'lowerCase';
    } else if (camelCase(value) === value) {
        return 'camelCase';
    } else if (kebabCase(value) === value) {
        return 'kebabCase';
    } else if (snakeCase(value)  === value){
        return 'snakeCase';
    }
    return 'other';
}

export function getFormatedText(value: string, format: TextCase) {
    if('capitalize' === format) {
        return capitalize(value);
    } else if ('lowerCase' === format) {
        return lowerCase(value);
    } else if ('camelCase' === format) {
        return camelCase(value);
    } else if ('kebabCase' === format) {
        return kebabCase(value);
    } else if ( 'snakeCase' === format){
        return snakeCase(value);
    }
    return value;
}

export function getInfoWords(value: string): WordsInfo {
    let textCase: TextCase = 'other';
    const inSnakeCase = snakeCase(value);
    const parts = inSnakeCase.split('_');

    if(capitalize(value)  === value){
        textCase = 'capitalize';
    } else if (lowerCase(value) === value) {
        textCase = 'lowerCase';
    } else if (camelCase(value) === value) {
        textCase = 'camelCase';
    } else if (kebabCase(value) === value) {
        textCase = 'kebabCase';
    } else if (inSnakeCase  === value){
        textCase = 'snakeCase';
    }

    return {
        value,
        parts,
        textCase
    }
}
