import * as vscode from 'vscode';
import { FileSymbol, getFileSymbols, SpecialSymbol } from './getFileSymbols';


export const fileWithAwesomeComponent = `import React from 'react';
export class AwesomeComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            awesomeObjectProperty: 2
        };
    }
}
`;

export const fileWithSomeComponent = `import React from 'react';
export class SomeComponent extends React.Component {
    constructor() {
        super();
        this.newFiled = 3;
    }
}
`;

export const fileSymbolWithAwesomeComponent: FileSymbol[] = [
    {
        
        kind: 4,
        value:'AwesomeComponent',
        text: 'export class AwesomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.state = {\n            awesomeObjectProperty: 2\n        };\n    }\n}',
        children:[{
            kind: 8,
            value:'constructor',
            text: 'constructor() {\n        super();\n        this.state = {\n            awesomeObjectProperty: 2\n        };\n    }',
            children:[{
                kind: 6,
                value:'awesomeObjectProperty',
                children:[],
                text: 'awesomeObjectProperty: 2'
            }]
        }],
    }
];


export const fileSymbolWithSomeComponent: FileSymbol[] = [
    {
        value: '',
        kind: SpecialSymbol.DOCUMENT,
        text: 'import React from \'react\';\nexport class SomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.newFiled = 3;\n    }\n}\n',
        children:[ {
            kind: 4,
            value:'SomeComponent',
            text: 'export class SomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.newFiled = 3;\n    }\n}',
            children:[{
                kind: 8,
                value:'constructor',
                children:[],
                text: '',
            }],
        }],
    },
   
];


function createMockDocument(text:string): Partial<vscode.TextDocument>{
    const lines = text.split('\n');
    return {
        getText: (range?: vscode.Range) => {
            if(range === undefined) {
                return text;
            }
            const regesLines = lines.slice(range.start.line, range.end.line);
            regesLines[0] = regesLines[0].slice(range.start.character);
            regesLines[regesLines.length-1] = regesLines[regesLines.length-1].slice(0, range.end.character);

            return regesLines.join('\n');
        }
    };
}


describe('getFileSymbols',() => {

    beforeEach(() => {
        const documentWithAwesomeComponent = createMockDocument(fileWithAwesomeComponent);

        // @ts-ignore
        vscode.workspace.openTextDocument.mockImplementation(async () => documentWithAwesomeComponent);

        // @ts-ignore
        vscode.commands.executeCommand.mockImplementation(async () => fileSymbolWithAwesomeComponent);
    });

    it.skip('should map and cut document by location', async () => {
        const uri = vscode.Uri.parse('some/mocked/path');
        const result = await getFileSymbols(uri);

        expect(result).toEqual('');
    });

    it('should return empty object when error occurred', async () => {

        // @ts-ignore
        vscode.commands.executeCommand.mockImplementation(() => Promise.reject('some error'));
 
        const uri = vscode.Uri.parse('some/mocked/path');
        const result = await getFileSymbols(uri);

        expect(result).toEqual({
            value: '',
            kind: SpecialSymbol.DOCUMENT,
            children: [],
            text: ''
        });
    });
});

