import { compareVariableTemplate } from './compareVariableTemplate';

describe('fileInfo / compareVariableTemplate',() => {

    it('same strings should be truth ', () => {
        const template1 = 'same strings';
        const template2 = 'same strings';

        const result = compareVariableTemplate(template1, template2);

        expect(result).toEqual(true);
    });

    it('same default values should be truth', () => {
        const template1 = 'same ${lowerCase(singleWord[0][0][6])||\'default\'} - ${lowerCase(singleWord[0][0][4])||\'values\'}';
        const template2 = 'same ${lowerCase(singleWord[0][0][6])||\'default\'} - ${lowerCase(singleWord[0][0][4])||\'values\'}';

        const result = compareVariableTemplate(template1, template2);

        expect(result).toEqual(true);
    });

    it('different default values should be truth', () => {
        const template1 = 'other ${lowerCase(singleWord[0][0][6])||\'default\'} - ${lowerCase(singleWord[0][0][4])||\'values\'}';
        const template2 = 'other ${lowerCase(singleWord[0][0][6])||\'Values\'} - ${lowerCase(singleWord[0][0][4])||\'DEFAULT\'}';

        const result = compareVariableTemplate(template1, template2);

        expect(result).toEqual(true);
    });

    it('other strings should be falsy', () => {
        const template1 = 'not same strings';
        const template2 = 'other strings';

        const result = compareVariableTemplate(template1, template2);

        expect(result).toEqual(false);
    });

    it('same default values but other variable should be truth', () => {
        const template1 = 'same ${lowerCase(singleWord[0][0][6])||\'default\'} - ${lowerCase(singleWord[0][0][4])||\'values\'}';
        const template2 = 'same ${lowerCase(singleWord[0][0][5])||\'default\'} - ${lowerCase(singleWord[0][0][8])||\'values\'}';

        const result = compareVariableTemplate(template1, template2);

        expect(result).toEqual(false);
    });

});
