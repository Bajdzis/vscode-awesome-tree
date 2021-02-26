import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { renderVariableTemplate } from '../variableTemplate/renderVariableTemplate';
import { FileSymbolCompare } from './compareTree';

export function treeSymbolToFlattArray(symbols: FileSymbolCompare[]): FileSymbolCompare[] {
    if(symbols.every(symbol => symbol.children.length === 0)) {
        return symbols;
    }

    const flatten: FileSymbolCompare[] = [];
    symbols.forEach(symbol => {
        if(symbol.children.length !== 0 ) {
            flatten.push(...symbol.children);
        } else {
            flatten.push(symbol);
        }
    });

    return treeSymbolToFlattArray(flatten);
}

export function joinSymbolToString(trees: FileSymbolCompare[], infoAboutFile: PathInfo[]): string {
    return trees.map(item => renderVariableTemplate(item.items[0].text, infoAboutFile )).join('');
}


