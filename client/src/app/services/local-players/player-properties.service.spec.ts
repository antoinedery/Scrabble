import { TestBed } from '@angular/core/testing';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { PlayerPropertiesService } from '@app/services/local-players/player-properties.service';

describe('LocalPlayerPropertiesService', () => {
    let service: PlayerPropertiesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerPropertiesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('refillRack should refill rack to a size of seven tiles', () => {
        expect(service.letters.length).toEqual(0);
        service.refillRack();
        expect(service.letters.length).toEqual(LETTERS_RACK_SIZE);
    });

    it('removeLetterFromRack should remove white letter from rack', () => {
        const letterToCheck = 'L';
        service.letters.push({ letter: '*', score: 1 });
        service.removeLetterFromRack(letterToCheck);
        expect(service.letters.length).toEqual(0);
    });

    it('removeLetterFromRack should remove normal letter from rack', () => {
        const letterToCheck = 'l';
        service.letters.push({ letter: 'L', score: 1 });
        service.removeLetterFromRack(letterToCheck);
        expect(service.letters.length).toEqual(0);
    });

    it('removeLetterFromRack should return undefined if letter index is undefined', () => {
        spyOn(service, 'getLetterIndex').and.returnValue(undefined);
        expect(service.removeLetterFromRack('A')).toBeUndefined();
    });

    it('getLetterIndex should return true if white letter is in letter rack ', () => {
        const letterToCheck = 'L';
        service.letters = [];
        service.letters.push({ letter: '*', score: 1 });
        expect(service.getLetterIndex(service.letters, letterToCheck)).toEqual(0);
    });

    it('getLetterIndex should return true if normal letter is in letter rack ', () => {
        const letterToCheck = 'l';
        service.letters = [];
        service.letters.push({ letter: 'L', score: 1 });
        expect(service.getLetterIndex(service.letters, letterToCheck)).toEqual(0);
    });

    it('getLetterIndex should return false if normal letter is not in letter rack ', () => {
        const letterToCheck = 'l';
        service.letters = [];
        service.letters.push({ letter: 'I', score: 1 });
        expect(service.getLetterIndex(service.letters, letterToCheck)).toBeUndefined();
    });

    it('setPropertiesForGameConversion assign letters, score and hasToPlay correctly', () => {
        const playerInfos: PlayerInfos = {
            name: 'name',
            letterRack: [{ letter: 'A', score: 1 }],
            playerScore: 1,
            isMyTurn: true,
            privateObjective:
                '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]',
        };
        service.setPropertiesForGameConversion(playerInfos);
        expect(service.letters).toEqual([{ letter: 'A', score: 1 }]);
        expect(service.score).toEqual(1);
        expect(service.hasToPlay).toEqual(true);
    });
});
