import * as vscode from 'vscode';

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

function addTextToSymbol(item: FileSymbol): FileSymbol[]{

    const childWithText = item.children.reduce((result, child): FileSymbol[] => {
        // const result: FileSymbol[] = [];

        const lastValue = result.pop();
        let textToSplit = item.text;

        if(lastValue && lastValue.kind === SpecialSymbol.TEXT) {
            textToSplit = lastValue.text;
        } else if (lastValue) {
            result.push(lastValue);
        }

        const [beginText, ...afterStrings] = textToSplit.split(child.text);
        const afterText = afterStrings.join('');

        if (beginText) {
            result.push({
                children:[],
                kind: SpecialSymbol.TEXT,
                text: beginText,
                value: beginText
            });
        }

        result.push(child);

        if (afterText) {
            result.push({
                children:[],
                kind: SpecialSymbol.TEXT,
                text: afterText,
                value: afterText
            });
        }

        return result;
    }, [] as FileSymbol[]);


    return [{
        ...item,
        children: childWithText
    }];
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

        return addTextToSymbol({
            value: '',
            // rangeStart: item.range.start,
            // rangeEnd: item.range.end,
            kind: SpecialSymbol.DOCUMENT,
            children:mapToMoreSpecificSymbol(success, document),
            text: document.getText()
        });
    }
}

