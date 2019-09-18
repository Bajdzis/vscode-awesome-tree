import { PathInfo } from './getInfoAboutPath';
import { getTextCase } from './getInfoWords';
import { addSlashes } from '../helpers/addSlashes';
import { AwesomeTreeError } from '../errors/AwesomeTreeError';


export function createVariableTemplate(search:string, information: PathInfo[], maxIterate: number = 500) {
    const variables: {
        [key: string] : [number,number,number];
    } = {};

    information.forEach((info, infoIndex) => {
        info.pathParts.forEach((words, wordsIndex) => {
            words.parts.forEach((word, wordIndex) => {
                if(!variables[word]){
                    variables[word] = [infoIndex, wordsIndex, wordIndex];
                }
            });
        });
    });

    let result = encodeURIComponent(addSlashes(search));

    Object.keys(variables).sort((a: string,b: string) => a.length - b.length).forEach((variableName) => {
        const [index0, index1, index2] = variables[variableName];
        const regExp = new RegExp(`(?<=^([^\\$\\{]|\\$\\{[^"]*\\})*)(?<varName>${variableName})`,'i');
        let regExpResult: RegExpExecArray|null = null;

        while ((regExpResult = regExp.exec(result)) !== null) {
            const word = regExpResult[0];
            let textCase = getTextCase(word);
            if(textCase !== 'other'){
                result = result.replace( new RegExp(`(?<=^([^\\$\{]|\\$\\{[^"]*\\})*)(?<varName>${word})`, 'g'), `\${${textCase}(variable[${index0}][${index1}][${index2}])}` );
            }
            maxIterate--;
            if(maxIterate < 0){
                throw new AwesomeTreeError('Too many iterate!', {
                    callFunction: 'createVariableTemplate', 
                    arguments: [search, information]
                });
            }
        }
    });

    return result;
}
