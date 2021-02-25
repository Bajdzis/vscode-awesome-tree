import { FileSymbolCompare } from './compareTree';




export function joinSymbolToFlattArray(symbols: FileSymbolCompare[]): FileSymbolCompare[] {
    if(symbols.every(symbol => symbol.children.length === 0)) {
        return symbols;
    }

    const flatten: FileSymbolCompare[] = [];
    symbols.forEach(symbol => {

        flatten.push({
            ...symbol,
            children: []
        });
        flatten.push(...symbol.children);
    });

    return joinSymbolToFlattArray(flatten);
}

export function joinSymbolToString(trees: FileSymbolCompare[]): string {
    return joinSymbolToFlattArray(trees).map(item => item.items[0].text).join('');
}


