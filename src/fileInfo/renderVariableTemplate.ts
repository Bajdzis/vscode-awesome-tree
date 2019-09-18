import { PathInfo } from './getInfoAboutPath';
import { TextCase, getFormatedText } from './getInfoWords';
import { AwesomeTreeError } from '../errors/AwesomeTreeError';

export function renderVariableTemplate(template:string, information: PathInfo[], maxIterate: number = 500) {

    let result = template;

    information.forEach((info, infoIndex) => {
        info.pathParts.forEach((words, wordsIndex) => {
            words.parts.forEach((word, wordIndex) => {
                const regExpTemplate = `\\$\\{(?<textCase>[a-z]*)\\(variable\\[${infoIndex}\\]\\[${wordsIndex}\\]\\[${wordIndex}\\]\\)\\}`;
                let regExpResult: RegExpExecArray|null = null;
                while ((regExpResult = (new RegExp(regExpTemplate,'i')).exec(result)) !== null) {
                    const textCase: TextCase = regExpResult.groups && (regExpResult.groups.textCase as TextCase) || 'other';
                    const templateVariable = regExpResult[0];
                    const formatedText = getFormatedText(word, textCase);
                    result = result.replace(templateVariable, formatedText);
                    maxIterate--;
                    if(maxIterate < 0){
                        throw new AwesomeTreeError('Too many iterate!', {
                            callFunction: 'renderVariableTemplate', 
                            arguments: [template, information]
                        });
                    }
                }
            });
        });
    });

    return decodeURIComponent(result);
}
