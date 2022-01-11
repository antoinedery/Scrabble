import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class DictionaryService {
    dictionary: IDictionary;
    dictionaryMap: Map<string, number> = new Map<string, number>();
    dictionaryPermutations: Map<string, string> = new Map<string, string>();
    path: string = './app/assets/dictionaries/';

    constructor(private letterReserveService: LetterReserveService) {}

    initDictionary(dictionary: DictionaryDetails) {
        this.dictionary = JSON.parse(fs.readFileSync(this.path + dictionary.title + '.json', 'utf8'));
        this.createDictionary();
    }

    createDictionary(): void {
        for (const word of this.dictionary.words) {
            let value = 0;

            for (let index = 0; index < word.length; index++) {
                const tempIndex = index + 1;
                const tempValue: number | undefined = this.letterReserveService.getLetterScore(word[index].toUpperCase());
                /* istanbul ignore else*/
                if (tempValue) value += tempValue;
                const substring = word.slice(0, tempIndex);
                /* istanbul ignore else*/
                if (substring && !this.dictionaryPermutations.has(substring)) this.dictionaryPermutations.set(substring, substring);
            }
            this.dictionaryMap.set(word, value);
        }
    }

    contains(word: string): boolean {
        const normalTerm = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return this.dictionaryMap.has(normalTerm);
    }

    getValue(word: string): number | undefined {
        const normalTerm = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return this.dictionaryMap.get(normalTerm);
    }
}
