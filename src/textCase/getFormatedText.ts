import {camelCase, snakeCase, lowerCase , kebabCase, capitalize} from 'lodash';
import { TextCase } from './domain';

export function getFormatedText(value: string, format: TextCase) {
    if('capitalize' === format) {
        return capitalize(value);
    } else if ('lowerCase' === format) {
        return lowerCase(value);
    } else if ('camelCase' === format) {
        return camelCase(value);
    } else if ('kebabCase' === format) {
        return kebabCase(value);
    } else if ('snakeCase' === format) {
        return snakeCase(value);
    } else if ('upperKebabCase' === format) {
        return kebabCase(value).toUpperCase();
    } else if ('upperSnakeCase' === format) {
        return snakeCase(value).toUpperCase();
    }

    return value;
}
