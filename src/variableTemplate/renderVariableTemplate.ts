import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { AwesomeTreeError } from '../errors/AwesomeTreeError';
import { TextCase } from '../textCase/domain';
import { getFormatedText } from '../textCase/getFormatedText';

export function renderVariableTemplate(template:string, information: PathInfo[], maxIterate: number = 500) {

    let result = template;

    information.forEach((info, infoIndex) => {
        info.pathParts.forEach((words, wordsIndex) => {
            const regExpTemplate = `\\$\\{(?<textCase>[a-z]*)\\((words)\\[${infoIndex}\\]\\[${wordsIndex}\\]\\[0\\]\\)\\}`;
            result = replaceWhileHaveKnowWords(result, regExpTemplate, words.value, maxIterate);
            words.parts.forEach((word, wordIndex) => {
                const regExpTemplate = `\\$\\{(?<textCase>[a-z]*)\\((singleWord)\\[${infoIndex}\\]\\[${wordsIndex}\\]\\[${wordIndex}\\]\\)\\}`;
                result = replaceWhileHaveKnowWords(result, regExpTemplate, word, maxIterate);
            });
        });
    });

    const otherTextCase = /\$\{:(.*):\}/g;

    return decodeURIComponent(result.replace(otherTextCase, '$1'));
}

function replaceWhileHaveKnowWords(template: string, regExpTemplate: string, word: string, maxIterate: number = 500): string {
    let result = template;
    let regExpResult: RegExpExecArray|null = null;
    while ((regExpResult = (new RegExp(regExpTemplate,'i')).exec(result)) !== null) {
        const textCase: TextCase = regExpResult.groups && (regExpResult.groups.textCase as TextCase) || 'other';
        const templateVariable = regExpResult[0];
        const formatedText = getFormatedText(word, textCase);
        result = result.replace(templateVariable, formatedText);
        maxIterate--;
        if(maxIterate < 0){
            throw new AwesomeTreeError('Too many iterate!', {
                callFunction: 'replaceWhileHaveKnowWords', 
                arguments: [template, regExpTemplate]
            });
        }
    }
    
    return result;
}
