import { renderVariableTemplate } from './renderVariableTemplate';
import { PathInfo } from '../fileInfo/getInfoAboutPath';

describe('fileInfo / createVariableTemplate',() => {

    it('should use default value', () => {
        const template = '/${lowerCase(words[0][2][0])||\'default\'}/${lowerCase(singleWord[0][1][0])||\'value\'}/${:WoRkS:}.test.ts';
        const render = renderVariableTemplate(template, []);
        expect(render).toEqual('/default/value/WoRkS.test.ts');
    });


    it('should not use default value', () => {

        const mockPathInfo: PathInfo = 
            {
                extension: '',
                isFile: false,
                path: '/allClasses/uriComponent/tests/',
                pathParts: [
                    {
                        parts:['all', 'classes'],
                        textCase:'camelCase',
                        value: 'allClasses'
                    }, 
                    {
                        parts:['uri', 'component'],
                        textCase:'camelCase',
                        value: 'uriComponent'
                    },
                    {
                        parts:['tests'],
                        textCase:'camelCase',
                        value: 'tests'
                    }
                ]
            }
        ;

        const template = '/${pascalCase(words[0][1][0])||\'default\'}/${lowerCase(singleWord[0][1][1])||\'value\'}/${:WoRkS:}.test.ts';
        const render = renderVariableTemplate(template, [mockPathInfo]);
        expect(render).toEqual('/UriComponent/component/WoRkS.test.ts');
    });

});
