import { createVariableTemplate } from './createVariableTemplate';
import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from './renderVariableTemplate';

const mockPathInfo: PathInfo[] = [
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
];

describe('fileInfo / createVariableTemplate',() => {

    it('should return template string', () => {
        const template = createVariableTemplate('/tests/uri/mockedUri.test.ts', mockPathInfo);

        expect(decodeURIComponent(template)).toEqual('/${lowerCase(words[0][2][0])||\'tests\'}/${lowerCase(singleWord[0][1][0])||\'uri\'}/mocked${pascalCase(singleWord[0][1][0])||\'Uri\'}.test.ts');
    });

    it('should return template with words without single word', () => {
        const template = createVariableTemplate('/tests/uriComponent/TestsUriComponent.test.ts', mockPathInfo);
        const render = renderVariableTemplate(template, mockPathInfo);

        expect(decodeURIComponent(template)).toEqual('/${lowerCase(words[0][2][0])||\'tests\'}/${camelCase(words[0][1][0])||\'uriComponent\'}/${pascalCase(words[0][2][0])||\'Tests\'}${pascalCase(words[0][1][0])||\'UriComponent\'}.test.ts');
        expect(render).toEqual('/tests/uriComponent/TestsUriComponent.test.ts');
    });

    it('should works with wired text case', () => {
        const template = createVariableTemplate('/tests/uri/Wired-CASE_UrI.test.ts', mockPathInfo);

        expect(decodeURIComponent(template)).toEqual('/${lowerCase(words[0][2][0])||\'tests\'}/${lowerCase(singleWord[0][1][0])||\'uri\'}/Wired-CASE_${:UrI:}.test.ts');
    });

    it('should render string base on template', () => {
        const template = createVariableTemplate('/tests/UrI/mocked%${.*}Uri.test.ts', mockPathInfo);
        const render = renderVariableTemplate(template, mockPathInfo);
        expect(render).toEqual('/tests/UrI/mocked%${.*}Uri.test.ts');
    });

    it('should use default value', () => {
        const template = '/${lowerCase(words[0][2][0])||\'default\'}/${lowerCase(singleWord[0][1][0])||\'value\'}/${:WoRkS:}.test.ts';
        const render = renderVariableTemplate(template, []);
        expect(render).toEqual('/default/value/WoRkS.test.ts');
    });

    it('should not create infinite loop', () => {

        const specialCharacters: PathInfo[] =[
            {
                extension: '',
                isFile: false,
                path: '/allClasses/uriComponent/tests/',
                pathParts: [
                    {
                        parts:[ '1', '0', 'words', 'pascalCase', 'uri', 'mocked', 'tests', '1', '0', 'singleWord', 'pascalCase'],
                        textCase:'camelCase',
                        value: 'allClasses'
                    }
                ]
            }
        ];

        const template = createVariableTemplate('/tests/uri/mockedUri.test.ts', specialCharacters);
        expect(decodeURIComponent(template)).toEqual('/${lowerCase(singleWord[0][0][6])||\'tests\'}/${lowerCase(singleWord[0][0][4])||\'uri\'}/${lowerCase(singleWord[0][0][5])||\'mocked\'}${pascalCase(singleWord[0][0][4])||\'Uri\'}.test.ts');
    });
    
});
