import { Injectable } from '@angular/core';
import { IDictionary as IDictionary } from '@app/classes/interfaces/dictionary';
import { DataInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import * as importedDictionary from '@assets/dictionary.json';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    dictionary: IDictionary;
    dictionaryName: string = 'Français';
    dictionaryMap: Map<string, number>;
    dictionaryPermutations: Map<string, string>;

    constructor(private letterReserveService: LetterReserveService) {}

    createDictionaryWithEndGameData(data: DataInfos): boolean {
        this.letterReserveService.createUsedReserve(data.reserveInfos);
        return this.createDictionary(data.dictionary);
    }

    createChosenDictionary(dictionary: IDictionary): boolean {
        return this.createDictionary(dictionary);
    }

    createDefaultDictionary(): boolean {
        return this.createChosenDictionary(importedDictionary as IDictionary);
    }

    createDictionary(dictionary: IDictionary): boolean {
        this.dictionary = dictionary;
        this.dictionaryMap = new Map<string, number>();
        this.dictionaryPermutations = new Map<string, string>();
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
        return true;
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
