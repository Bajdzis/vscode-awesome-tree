import { addTextToSymbol } from './addTextToSymbol';
import { FileSymbol, SpecialSymbol } from './getFileSymbols';

const someDiv: FileSymbol = {
    children:[],
    kind: 7,
    text: '<div class="someClass"></div>',
    value: 'div'
};

describe('addTextToSymbol',() => {

    it('should return self when no have children', () => {
        const result = addTextToSymbol(someDiv);
        expect(result).toEqual(someDiv);
    });

    it('should add text child', () => {
        const someContainer: FileSymbol = {
            children:[someDiv],
            kind: 7,
            text: '<div class="container"><div class="someClass"></div></div>',
            value: 'div'
        };

        const result = addTextToSymbol(someContainer);
        expect(result.children).toEqual([
            {
                children:[],
                kind: SpecialSymbol.TEXT,
                text: '<div class="container">',
                value: '<div class="container">'
            },
            someDiv,
            {
                children:[],
                kind: SpecialSymbol.TEXT,
                text: '</div>',
                value: '</div>'
            }
        ]);
    });

    it('should add text child when have same child many times', () => {
        const someContainer: FileSymbol = {
            children:[someDiv,someDiv],
            kind: 7,
            text: '<div class="container"><div class="someClass"></div> space <div class="someClass"></div></div>',
            value: 'div'
        };

        const result = addTextToSymbol(someContainer);
        expect(result.children).toEqual([
            {
                children:[],
                kind: SpecialSymbol.TEXT,
                text: '<div class="container">',
                value: '<div class="container">'
            },
            someDiv,
            {
                children:[],
                kind: SpecialSymbol.TEXT,
                text: ' space ',
                value: ' space '
            },
            someDiv,
            {
                children:[],
                kind: SpecialSymbol.TEXT,
                text: '</div>',
                value: '</div>'
            }
        ]);
    });

});
