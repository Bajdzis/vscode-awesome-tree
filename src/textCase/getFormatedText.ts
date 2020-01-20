import {camelCase, snakeCase, lowerCase , kebabCase, upperFirst} from 'lodash';
import { TextCase } from './domain';

type FunctionString = (string: string) => string;

const textCaseToFormatter: { [key in TextCase]: FunctionString} = {
    lowerCase,
    camelCase,
    kebabCase,
    snakeCase,
    pascalCase: (value) => upperFirst(camelCase(value)),
    upperKebabCase: (value) => kebabCase(value).toUpperCase(),
    upperSnakeCase: (value) => snakeCase(value).toUpperCase(),
    other: (value) => value
};

export function getFormatedText(value: string, format: TextCase) {
    return textCaseToFormatter[format](value);
}
