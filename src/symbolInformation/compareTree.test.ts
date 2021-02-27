import { addTextToSymbol } from './addTextToSymbol';
import { compareTree, filterTree } from './compareTree';
import { FileSymbol } from './getFileSymbols';

const someDiv: FileSymbol = {
    children:[],
    kind: 7,
    text: '<div class="someClass"></div>',
    value: 'div'
};

const someContainer: FileSymbol = addTextToSymbol({
    children:[someDiv],
    kind: 7,
    text: '<div class="container"><div class="someClass"></div></div>',
    value: 'div'
});

const someOtherContainer: FileSymbol = addTextToSymbol({
    children:[someDiv,someDiv],
    kind: 7,
    text: '<div class="container"><div class="someClass"></div><div class="someClass"></div></div>',
    value: 'div'
});

describe('compareTree',() => {
    it('should return 100 percent value when compare two same files', () => {
        const result = compareTree([someDiv,someDiv]);
        expect(result).toEqual([{
            percent: 1,
            items: [
                someDiv,someDiv
            ],
            children: []
        }]);
    });

    it('should return object with children', () => {
        const result = compareTree([{
            children:[someDiv],
            kind: 7,
            text: '<div class="container"><div class="someClass"></div></div>',
            value: 'div'
        }]);
        expect(result).toEqual([{
            percent: 1,
            items: [
                {
                    children:[someDiv],
                    kind: 7,
                    text: '<div class="container"><div class="someClass"></div></div>',
                    value: 'div'
                }
            ],
            children: [{
                percent: 1,
                items: [someDiv],
                children: []
            }]
        }]);
    });

    it('should return same compare graph every time', () => {
        const result = compareTree([someContainer,someOtherContainer]);
        expect(result).toMatchSnapshot();
    });

    it('should filter elements by percent', () => {
        const result = compareTree([someDiv,someDiv,someDiv,someOtherContainer]);
        const filterResult = filterTree(result, 0.5);
        
        expect(result).toMatchSnapshot();
        expect(filterResult).toEqual([{
            percent: 0.75,
            items: [someDiv,someDiv,someDiv],
            children: []
        }]);
    });
});
