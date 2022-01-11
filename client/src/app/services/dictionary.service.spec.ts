import { TestBed } from '@angular/core/testing';
import { TEMP_DICTIONARY } from '@app/classes/constants/constants';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DataInfos, ReserveInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { DictionaryService } from '@app/services/dictionary.service';
import { LetterReserveService } from './letter-reserve.service';

describe('DictionaryService', () => {
    let service: DictionaryService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DictionaryService);
        service.createDictionary(TEMP_DICTIONARY);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('dictionary should return true when word is found', () => {
        const word = 'aller';
        expect(service.contains(word)).toBeTrue();
    });
    it('dictionary should return false when word is not found', () => {
        const word = 'abc';
        expect(service.contains(word)).toBeFalse();
    });
    it('dictionary should return value for corresponding word', () => {
        const word = 'aller';
        const expectedScore = 5;
        expect(service.getValue(word)).toEqual(expectedScore);
    });
    it('dictionary should return undefined for invalid word', () => {
        const word = 'abc';
        expect(service.getValue(word)).toBeUndefined();
    });

    it('createDictionaryWithEndGameData should call create used reserve', () => {
        const letterReserveService = TestBed.inject(LetterReserveService);
        const reserveInfos: ReserveInfos = { reserve: 'abc', size: 5 };
        const dictionary: IDictionary = { title: '', description: '', words: [] };
        const dataInfos: DataInfos = { reserveInfos, dictionary };
        const letterReserveServiceSpy = spyOn(letterReserveService, 'createUsedReserve');
        spyOn(service, 'createDictionary').and.returnValue(true);
        service.createDictionaryWithEndGameData(dataInfos);
        expect(letterReserveServiceSpy).toHaveBeenCalled();
    });
});
