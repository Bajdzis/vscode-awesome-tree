import { PathInfo } from '../fileInfo/getInfoAboutPath';
import { compareVariableTemplate } from '../variableTemplate/compareVariableTemplate';
import { createVariableTemplate } from '../variableTemplate/createVariableTemplate';
import { FileSymbol } from './getFileSymbols';


export interface FileSymbolCompare {
    percent: number;
    items: FileSymbol[];
    children: FileSymbolCompare[];
}


function haveSameKind (elem1:FileSymbol, elem2:FileSymbol) {
    return elem1.kind === elem2.kind ;
}

function haveSameValue (elem1:FileSymbol, elem2:FileSymbol) {

    if (elem1.children.length > 0 && elem2.children.length > 0) {
        return true;
    }

    if (elem1.children.length === 0 && elem2.children.length === 0) {
        return elem1.value === elem2.value || compareVariableTemplate(elem1.text, elem2.text);
    }

    return false;
}

function compareFileSymbol (elem1:FileSymbol, elem2:FileSymbol) {
    if(!haveSameKind(elem1, elem2)){
        return false;
    }
    return haveSameValue(elem1, elem2);
}

export function compareTree(trees: FileSymbol[], isSameElement = compareFileSymbol, numberOfFiles = trees.length): FileSymbolCompare[] {

    if(trees.length === 0) {
        return [];
    }

    const groups: FileSymbol[][] = [];
    trees.forEach(tree => {
        const index = groups.findIndex(group => {
            return isSameElement(group[0], tree);
        });

        if (index === -1) {
            groups.push([tree]);
        }else {
            groups[index].push(tree);
        }

    });


    return groups.map((group): FileSymbolCompare => {
        const children = compareTree(group.reduce((data, item) => ([...data,...item.children]), [] as FileSymbol[]), isSameElement, numberOfFiles);
        return ({
            children: children,
            items: group,
            percent: group.length / numberOfFiles
        });
    });
}


export function filterTree(trees: FileSymbolCompare[], minPercentValue = 0.8): FileSymbolCompare[] {

    return trees.filter(tree => tree.percent >= minPercentValue).map(tree => ({
        ...tree,
        children: filterTree(tree.children, minPercentValue)
    }));
}


export function createTemplateInTree(trees: FileSymbol[], infoAboutFile: PathInfo[]): FileSymbol[] {
    
    return trees.map(tree => ({
        ...tree,
        text: createVariableTemplate(tree.text, infoAboutFile),
        children: createTemplateInTree(tree.children, infoAboutFile)
    }));
}
