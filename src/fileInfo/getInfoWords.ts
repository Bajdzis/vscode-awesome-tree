import { snakeCase } from 'lodash';
import { TextCase } from '../textCase/domain';
import { getTextCase } from '../textCase/getTextCase';

export interface WordsInfo {
    value: string;
    parts: string[];
    textCase: TextCase;
}

export function getInfoWords(value: string): WordsInfo {
    let textCase: TextCase = getTextCase(value);
    const inSnakeCase: string = snakeCase(value);
    const parts = inSnakeCase.split('_');

    return {
        value,
        parts,
        textCase
    };
}
