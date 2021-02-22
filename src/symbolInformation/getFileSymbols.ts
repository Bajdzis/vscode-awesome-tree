import * as vscode from 'vscode';
import { addTextToSymbol } from './addTextToSymbol';

export enum SpecialSymbol {
    TEXT = -1,
    DOCUMENT = -2
}

export interface FileSymbol {
    value: string;
    // rangeStart: vscode.Position;
    // rangeEnd: vscode.Position;
    text: string;
    kind: vscode.SymbolKind | SpecialSymbol; 
    children: FileSymbol[];
}


function mapToMoreSpecificSymbol (symbols : (vscode.SymbolInformation | vscode.DocumentSymbol)[], document: vscode.TextDocument): FileSymbol[] {

    const result =  symbols.reduce((old,item): FileSymbol[] => {
        console.log({item});
        if(item instanceof vscode.DocumentSymbol) {
            let additional: FileSymbol[] = mapToMoreSpecificSymbol(item.children, document);
                    
            return [
                ...old,
                {
                    value: item.name,
                    // rangeStart: item.range.start,
                    // rangeEnd: item.range.end,
                    kind: item.kind,
                    children:additional,
                    text: document.getText(item.range)
                }];
        } else  if(item instanceof vscode.SymbolInformation) {

            // @ts-expect-error
            let additional: FileSymbol[] = mapToMoreSpecificSymbol(item.children || [], document);
            return [
                ...old,
                {
                    value: item.name,
                    // rangeStart: item.location.range.start,
                    // rangeEnd: item.location.range.end,
                    kind: item.kind,
                    children: additional,
                    text: document.getText(item.location.range)
                }];
        }

        return old;
    }, [] as FileSymbol[]);


    return result; 

}
export async function getFileSymbols(uri: vscode.Uri){

    let success = await vscode.commands.executeCommand<Promise<(vscode.SymbolInformation | vscode.DocumentSymbol)[]>>('vscode.executeDocumentSymbolProvider', uri);
    
    let document = await vscode.workspace.openTextDocument(uri);
    if(success) {
        const main = {
            value: '',
            // rangeStart: item.range.start,
            // rangeEnd: item.range.end,
            kind: SpecialSymbol.DOCUMENT,
            children:mapToMoreSpecificSymbol(success, document),
            text: document.getText()
        };
        console.log({main});
        return addTextToSymbol(main);
    }
}

