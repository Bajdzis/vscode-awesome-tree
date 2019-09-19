import { createVariableTemplate } from './createVariableTemplate';
import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from './renderVariableTemplate';

const mockPathInfo: PathInfo[] =[
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

        expect(decodeURIComponent(template)).toEqual('/${lowerCase(variable[0][2][0])}/${lowerCase(variable[0][1][0])}/mocked${capitalize(variable[0][1][0])}.test.ts');
    });

    it('should works with wired text case', () => {
        const template = createVariableTemplate('/tests/uri/Wired-CASE_UrI.test.ts', mockPathInfo);

        expect(decodeURIComponent(template)).toEqual('/${lowerCase(variable[0][2][0])}/${lowerCase(variable[0][1][0])}/Wired-CASE_${:UrI:}.test.ts');
    });

    it('should render string base on template', () => {
        const template = createVariableTemplate('/tests/UrI/mocked%${.*}Uri.test.ts', mockPathInfo);
        const render = renderVariableTemplate(template, mockPathInfo);
        expect(render).toEqual('/tests/UrI/mocked%${.*}Uri.test.ts');
    });

    it('should not create infinite loop', () => {

        const specialCharacters: PathInfo[] =[
            {
                extension: '',
                isFile: false,
                path: '/allClasses/uriComponent/tests/',
                pathParts: [
                    {
                        parts:[ '1', '0', 'variable', 'capitalize', 'uri', 'mocked', 'tests', '1', '0', 'variable', 'capitalize'],
                        textCase:'camelCase',
                        value: 'allClasses'
                    }
                ]
            }
        ];

        const template = createVariableTemplate('/tests/uri/mockedUri.test.ts', specialCharacters);
        expect(decodeURIComponent(template)).toEqual('/${lowerCase(variable[0][0][6])}/${lowerCase(variable[0][0][4])}/${lowerCase(variable[0][0][5])}${capitalize(variable[0][0][4])}.test.ts');
    });
    
});
