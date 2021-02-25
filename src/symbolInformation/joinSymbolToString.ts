import { FileSymbolCompare } from './compareTree';




export function joinSymbolToFlattArray(symbols: FileSymbolCompare[]): FileSymbolCompare[] {
    if(symbols.every(symbol => symbol.children.length === 0)) {
        return symbols;
    }

    const flatten: FileSymbolCompare[] = [];
    symbols.forEach(symbol => {

        
        if(symbol.children.length !== 0 ) {

            flatten.push(...symbol.children);
        }else {

            flatten.push(symbol);
        }
    });

    return joinSymbolToFlattArray(flatten);
}

export function joinSymbolToString(trees: FileSymbolCompare[]): string {
    return joinSymbolToFlattArray(trees).map(item => item.items[0].text).join('');
}


