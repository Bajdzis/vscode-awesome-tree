import { PathInfo } from "./getInfoAboutPath";
import { TextCase, getTextCase } from "./getInfoWords";


export function createVariableTemplate(search:string, information: PathInfo[]) {
    const variables: {
        [key: string] : [TextCase, number,number,number];
    } = {};

    information.forEach((info, infoIndex) => {
        info.pathParts.forEach((words, wordsIndex) => {
            words.parts.forEach((word, wordIndex) => {
                if(!variables[word]){
                    variables[word] = [words.textCase, infoIndex, wordsIndex, wordIndex];
                }
            });
        });
    });

    let result = encodeURIComponent(search);

    Object.keys(variables).sort((a: string,b: string) => a.length - b.length).forEach((variableName) => {
        const [_, index0, index1, index2] = variables[variableName];
        const regExp = new RegExp(`(?<=^([^\\$\\{]|\\$\\{[^"]*\\})*)(?<varName>${variableName})`,'i');
        let regExpResult: RegExpExecArray|null = null;

        while ((regExpResult = regExp.exec(result)) !== null) {
            const word = regExpResult[0];
            let textCase = getTextCase(word);
            if(textCase !== 'other'){
                result = result.replace( new RegExp(`(?<=^([^\\$\{]|\\$\\{[^"]*\\})*)(?<varName>${word})`, 'g'), `\${${textCase}(variable[${index0}][${index1}][${index2}])}` );
            }
        }
    });

    return result;
}