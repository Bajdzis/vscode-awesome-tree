import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { changeToUnixSlashes } from '../strings/changeToUnixSlashes';
import { AwesomeTreeError } from '../errors/AwesomeTreeError';
import { getTextCaseSingleWord, getTextCase } from '../textCase/getTextCase';


export function createVariableTemplate(search:string, information: PathInfo[], maxIterate: number = 500) {
    const variables: {
        [key: string] : ['words' | 'singleWord', number, number, number];
    } = {};

    information.forEach((info, infoIndex) => {
        info.pathParts.forEach((words, wordsIndex) => {
            if (!variables[words.value]) {
                variables[words.value] = ['words', infoIndex, wordsIndex, 0];
            }
            words.parts.forEach((word, wordIndex) => {
                if (!variables[word]) {
                    variables[word] = ['singleWord', infoIndex, wordsIndex, wordIndex];
                }
            });
        });
    });

    let result = encodeURIComponent(changeToUnixSlashes(search));
    const words = Object.keys(variables).sort((a: string,b: string) => b.length - a.length);

    words.forEach((variableName) => {
        const [type, index0, index1, index2] = variables[variableName];
        const regExp = new RegExp(`(?<=^([^\\$\\{]|\\$\\{[^"]*\\})*)(?<varName>${variableName})`,'i');
        let regExpResult: RegExpExecArray|null = null;

        while ((regExpResult = regExp.exec(result)) !== null) {
            const word = regExpResult[0];
            const textCase = type === 'singleWord' ? getTextCaseSingleWord(word) : getTextCase(word);
            const allCurrentWord = new RegExp(`(?<=^([^\\$\{]|\\$\\{[^"]*\\})*)(?<varName>${word})`, 'g');
            if (textCase === 'other') {
                result = result.replace( allCurrentWord, `\${:${word}:}` );
            } else {
                result = result.replace( allCurrentWord, `\${${textCase}(${type}[${index0}][${index1}][${index2}])||'${word}'}` );
            }
            maxIterate--;
            if (maxIterate < 0) {
                throw new AwesomeTreeError('Too many iterate!', {
                    callFunction: 'createVariableTemplate', 
                    arguments: [search, information]
                });
            }
        }
    });

    return result;
}
