import * as vscode from 'vscode';
import { FileSymbol, SpecialSymbol } from './getFileSymbols';


const fileWithAwesomeComponent = `import React from 'react';
export class AwesomeComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            awesomeObjectProperty: 2
        };
    }
}
`;

const fileWithSomeComponent = `import React from 'react';
export class SomeComponent extends React.Component {
    constructor() {
        super();
        this.newFiled = 3;
    }
}
`;

const fileSymbolWithAwesomeComponent: FileSymbol[] = [
    {
        
        kind: vscode.SymbolKind.Class,
        // rangeEnd: new vscode.Position(8,1),
        // rangeStart: new vscode.Position(1,0),
        value:'AwesomeComponent',
        text: 'export class AwesomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.state = {\n            awesomeObjectProperty: 2\n        };\n    }\n}',
        children:[{
            kind: vscode.SymbolKind.Constructor,
            // rangeEnd: new vscode.Position(7,5),
            // rangeStart: new vscode.Position(2,4),
            value:'constructor',
            text: 'constructor() {\n        super();\n        this.state = {\n            awesomeObjectProperty: 2\n        };\n    }',
            children:[{
                kind: vscode.SymbolKind.Property,
                // rangeEnd: new vscode.Position(5,36),
                // rangeStart: new vscode.Position(5,12),
                value:'awesomeObjectProperty',
                children:[],
                text: 'awesomeObjectProperty: 2'
            }]
        }],
    }
];


const fileSymbolWithSomeComponent: FileSymbol[] = [
    {
        value: '',
        // rangeStart: item.range.start,
        // rangeEnd: item.range.end,
        kind: SpecialSymbol.DOCUMENT,
        text: 'import React from \'react\';\nexport class SomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.newFiled = 3;\n    }\n}\n',
        children:[ {
            kind: vscode.SymbolKind.Class,
            // rangeEnd: new vscode.Position(6,1),
            // rangeStart: new vscode.Position(1,0),
            value:'SomeComponent',
            text: 'export class SomeComponent extends React.Component {\n    constructor() {\n        super();\n        this.newFiled = 3;\n    }\n}',
            children:[{
                kind: vscode.SymbolKind.Constructor,
                // rangeEnd: new vscode.Position(5,5),
                // rangeStart: new vscode.Position(2,4),
                value:'constructor',
                children:[],
                text: '',
            }],
        }],
    },
   
];


export function test() {
    console.log({fileSymbolWithSomeComponent, fileSymbolWithAwesomeComponent, fileWithSomeComponent, fileWithAwesomeComponent});
}
