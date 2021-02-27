import { FileSymbol, SpecialSymbol } from './getFileSymbols';

export function addTextToSymbol(item: FileSymbol): FileSymbol{

    const childWithText = item.children.reduce((result, child): FileSymbol[] => {
        const lastValue = result.pop();
        let textToSplit = item.text;

        if(lastValue && lastValue.kind === SpecialSymbol.TEXT) {
            textToSplit = lastValue.text;
        } else if (lastValue) {
            result.push(lastValue);
            result.push(addTextToSymbol(child));
            return result;
        }

        const [beginText, ...afterStrings] = textToSplit.split(child.text);
        const afterText = afterStrings.join(child.text);

        if (beginText) {
            result.push({
                children:[],
                kind: SpecialSymbol.TEXT,
                text: beginText,
                value: beginText
            });
        }

        result.push(addTextToSymbol(child));

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


    return {
        ...item,
        children: childWithText
    };
}
