import { FileSymbol } from './getFileSymbols';


export interface FileSymbolCompare {
    percent: number;
    items: FileSymbol[];
    children: FileSymbolCompare[];
}

function compareFileSymbol (elem1:FileSymbol, elem2:FileSymbol) {
    if(elem1.children.length > 0 &&  elem2.children.length > 0) {
        return elem1.kind === elem2.kind;
    }
    return elem1.kind === elem2.kind && elem1.value === elem2.value;
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
