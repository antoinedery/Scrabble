import { TestBed } from '@angular/core/testing';
import {
    OBJECTIVES,
    OBJECTIVE_1,
    OBJECTIVE_4,
    OBJECTIVE_5,
    OBJECTIVE_6,
    OBJECTIVE_8,
    RANDOM_NUMBER_GENERATOR,
} from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Objective } from '@app/classes/interfaces/objectives';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';

describe('CurrentPlayerSettingsService', () => {
    let service: PlayerSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('checkIsLetterInRack should return true if letter is in rack', () => {
        const letterToCheck = 'a';
        service.letters = [];
        service.letters.push({ letter: 'A', score: 1 });
        expect(service.checkIsLetterInRack(letterToCheck)).toBeTrue();
    });

    it('checkIsLetterInRack should return false if letter is not in rack', () => {
        const letterToCheck = 'b';
        service.letters = [];
        service.letters.push({ letter: 'A', score: 1 });
        expect(service.checkIsLetterInRack(letterToCheck)).toBeFalse();
    });

    it('getNumberOfCapitalLettersInLetterRack should return the correct number of capital letters in letter rack ', () => {
        service.letters = [];
        service.letters.push({ letter: 'I', score: 1 });
        service.letters.push({ letter: '*', score: 0 });
        expect(service.getNumberOfBlankLettersInLetterRack()).toEqual(1);
    });

    it('reinsertPlacement should reinsert given letters in rack', () => {
        const placedLetters = [
            {
                content: 'A',
                position: { x: 0, y: 0 },
            },
            {
                content: 'a',
                position: { x: 0, y: 1 },
            },
        ];
        service.letters = [];
        service.reinsertPlacement(placedLetters);

        expect(service.letters[0].letter).toEqual('*');
        expect(service.letters[0].score).toEqual(0);
        expect(service.letters[1].letter).toEqual('A');
        expect(service.letters[1].score).toEqual(1);
    });

    it('reinsertLetter should reinsert given normal letter in rack ', () => {
        const letterToInsert = 'a';
        service.letters = [];
        service.reinsertLetter(letterToInsert);

        expect(service.letters[0].letter).toEqual('A');
        expect(service.letters[0].score).toEqual(1);
    });

    it('reinsertLetter should reinsert given white letter in rack ', () => {
        const letterToInsert = 'A';
        service.letters = [];
        service.reinsertLetter(letterToInsert);

        expect(service.letters[0].letter).toEqual('*');
        expect(service.letters[0].score).toEqual(0);
    });

    it('removePlacementFromRack should remove placement from rack', () => {
        const removeLetterFromRack = spyOn(service, 'removeLetterFromRack');
        service.letters = [];
        service.letters.push({ letter: 'A', score: 1 });
        service.removePlacementFromRack({ axis: AXIS.HORIZONTAL, letters: [{ content: '', position: { x: 0, y: 0 } }] });
        expect(removeLetterFromRack).toHaveBeenCalled();
    });

    it('assignObjectives should call assignPrivateObjectiveToPlayer() and assignPublicObjectives(), and return the correct value', () => {
        const expectedReturnValues: number[] = [];
        expectedReturnValues.push(1);
        const spy1 = spyOn(service, 'assignPrivateObjectiveToPlayer').and.returnValue(expectedReturnValues);
        expectedReturnValues.push(2);
        const spy2 = spyOn(service, 'assignPublicObjectives').and.returnValue(expectedReturnValues);
        const result = service.assignObjectives();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(result).toEqual(expectedReturnValues);
    });

    it('resetAllFullfilledProperties should set all fullfilled properties of all the objectives to false', () => {
        for (const obj of OBJECTIVES) {
            obj.fullfilled = true;
        }
        service.resetAllFullfilledProperties();
        for (const obj of OBJECTIVES) {
            expect(obj.fullfilled).toBeFalse();
        }
    });

    it('assignPrivateObjectiveToPlayer should select a random objective among the 8 ones and add it to the map and return the right value', () => {
        const randomNumber = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(randomNumber);
        const expectedReturnedValue: number[] = [];
        expectedReturnedValue.push(randomNumber);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(randomNumber, OBJECTIVES[randomNumber - 1]);
        const returnedValue = service.assignPrivateObjectiveToPlayer();
        expect(service.privateObjective).toEqual(expectedMap);
        expect(returnedValue).toEqual(expectedReturnedValue);
    });

    it('assignPublicObjectives should select 2 random objectives among the 8 ones other than the one passed in parameter and add them to map', () => {
        const alreadyTakenNumber: number[] = [OBJECTIVE_4];
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValues(OBJECTIVE_4, OBJECTIVE_5, OBJECTIVE_6);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(OBJECTIVE_5, OBJECTIVES[OBJECTIVE_5 - 1]);
        expectedMap.set(OBJECTIVE_6, OBJECTIVES[OBJECTIVE_6 - 1]);
        const result = service.assignPublicObjectives(alreadyTakenNumber);
        expect(result[0]).not.toEqual(result[1]);
        expect(result[0]).not.toEqual(result[2]);
        expect(result[1]).not.toEqual(result[2]);
        expect(service.publicObjectives).toEqual(expectedMap);
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
