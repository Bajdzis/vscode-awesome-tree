import { camelCase, snakeCase, lowerCase , kebabCase, capitalize } from 'lodash';
import { TextCase } from './domain';

export function getTextCase(value: string): TextCase {
    if(capitalize(value)  === value){
        return 'capitalize';
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
