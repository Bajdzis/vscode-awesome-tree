import { addTextToSymbol } from './addTextToSymbol';
import { compareTree } from './compareTree';
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

    it('should return self when no have children', () => {
        const result = compareTree([someContainer, someOtherContainer]);
        expect(result).toEqual([]);
    });

});
