import * as vscode from 'vscode';
import { addTextToSymbol } from './addTextToSymbol';

export enum SpecialSymbol {
    TEXT = -1,
    DOCUMENT = -2
}

export interface FileSymbol {
    value: string;
    text: string;
    kind: vscode.SymbolKind | SpecialSymbol; 
    children: FileSymbol[];
}

function mapToMoreSpecificSymbol (symbols : (vscode.SymbolInformation | vscode.DocumentSymbol)[], document: vscode.TextDocument): FileSymbol[] {

    return symbols.reduce((old,item): FileSymbol[] => {
        if(item instanceof vscode.DocumentSymbol) {
            let additional: FileSymbol[] = mapToMoreSpecificSymbol(item.children, document);
                    
            return [
                ...old,
                {
                    value: item.name,
                    kind: item.kind,
                    children:additional,
                    text: document.getText(item.range)
                }
            ];
        } else if (item instanceof vscode.SymbolInformation) {

            // @ts-expect-error
            let additional: FileSymbol[] = mapToMoreSpecificSymbol(item.children || [], document);
            return [
                ...old,
                {
                    value: item.name,
                    kind: item.kind,
                    children: additional,
                    text: document.getText(item.location.range)
                }];
        }

        return old;
    }, [] as FileSymbol[]);

}

export async function getFileSymbols(uri: vscode.Uri) : Promise<FileSymbol> {

    let success = await vscode.commands.executeCommand<Promise<(vscode.SymbolInformation | vscode.DocumentSymbol)[]>>('vscode.executeDocumentSymbolProvider', uri);
    
    let document = await vscode.workspace.openTextDocument(uri);

    if ( success ) {
        const main = {
            value: '',
            kind: SpecialSymbol.DOCUMENT,
            children:mapToMoreSpecificSymbol(success, document),
            text: document.getText()
        };
        console.log({main});
        return addTextToSymbol(main);
    }

    return {
        value: '',
        kind: SpecialSymbol.DOCUMENT,
        children: [],
        text: ''
    };
}

