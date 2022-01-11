// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { OBJECTIVES, OBJECTIVE_2, OBJECTIVE_4, OBJECTIVE_6 } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { DisplayMessageService } from './display-message.service';
import { PlayerSettingsService } from './local-players/current-player/player-settings.service';
import { TileHandlerService } from './tile-handler.service';

describe('ObjectivesValidationService', () => {
    let service: ObjectivesValidationService;
    let turnHandlerService: TurnHandlerService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let playerSettingsService: PlayerSettingsService;
    let displayMessageService: DisplayMessageService;

    const sevenLettersPlacement: Placement = {
        axis: AXIS.HORIZONTAL,
        letters: [
            { content: 'e', position: { x: 6, y: 6 } },
            { content: 'n', position: { x: 7, y: 6 } },
            { content: 'v', position: { x: 8, y: 6 } },
            { content: 'i', position: { x: 9, y: 6 } },
            { content: 'r', position: { x: 10, y: 6 } },
            { content: 'o', position: { x: 11, y: 6 } },
            { content: 'n', position: { x: 12, y: 6 } },
        ],
    };
    const fakeScoredPlacement: ScoredPlacement = {
        placement: sevenLettersPlacement,
        words: [
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 6, y: 6 },
                    content: 'environ',
                },
                score: 10,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'le',
                },
                score: 2,
            },
        ],
        totalScore: 62,
    };

    const sevenLettersPlacement2: Placement = {
        axis: AXIS.HORIZONTAL,
        letters: [
            { content: 'b', position: { x: 7, y: 12 } },
            { content: 'o', position: { x: 8, y: 12 } },
        ],
    };
    const fakeScoredPlacement2: ScoredPlacement = {
        placement: sevenLettersPlacement2,
        words: [
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 7, y: 13 },
                    content: 'bon',
                },
                score: 10,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'le',
                },
                score: 2,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 3, y: 3 },
                    content: 'hello',
                },
                score: 6,
            },
        ],
        totalScore: 62,
    };
    const otherSevenLettersPlacement: Placement = {
        axis: AXIS.VERTICAL,
        letters: [
            { content: 'c', position: { x: 7, y: 12 } },
            { content: 'a', position: { x: 8, y: 13 } },
            { content: 'n', position: { x: 9, y: 13 } },
            { content: 'a', position: { x: 10, y: 13 } },
            { content: 'd', position: { x: 11, y: 13 } },
            { content: 'a', position: { x: 12, y: 13 } },
            { content: '', position: { x: 13, y: 13 } },
        ],
    };
    const otherFakeScoredPlacement: ScoredPlacement = {
        placement: otherSevenLettersPlacement,
        words: [
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'Canada',
                },
                score: 2,
            },
        ],
        totalScore: 12,
    };
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ObjectivesValidationService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        displayMessageService = TestBed.inject(DisplayMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resetObjectiveCountersSpy should be called when subscribe resetObjectivesCountersObservable is triggered', () => {
        const resetObjectiveCountersSpy = spyOn(service, 'resetObjectiveCounters');
        service.initData();
        turnHandlerService.resetObjectivesCountersObservable.next();
        expect(resetObjectiveCountersSpy).toHaveBeenCalled();
    });

    it('resetObjectiveCountersSpy and wordsOnBoard service should be called', () => {
        const resetObjectiveCountersSpy = spyOn(service, 'resetObjectiveCounters');
        service.wordsOnBoard.set('hello', 1);
        service.resetData();
        expect(resetObjectiveCountersSpy).toHaveBeenCalled();
        expect(service.wordsOnBoard).toEqual(new Map());
    });

    it('callAdequateValidationFunction should call the adequate function and return its return value', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        const randomFunctionToCall = 'validate4';
        const bindSpy = spyOn(service.validateObjective4 as CallableFunction, 'bind').and.callThrough();
        service.callAdequateValidationFunction(randomFunctionToCall);
        expect(bindSpy).toHaveBeenCalled();
    });

    it('verifyPrivateVirtualPlayerObjectiveSpy should be called if its not the players turn', () => {
        const FAKE_CURRENT_TIMER = 7;
        const verifyPrivateVirtualPlayerObjectiveSpy = spyOn(service, 'verifyPrivateVirtualPlayerObjective');
        virtualPlayerSettingsService.hasToPlay = true;
        service.validateObjectives(fakeScoredPlacement, FAKE_CURRENT_TIMER);
        expect(verifyPrivateVirtualPlayerObjectiveSpy).toHaveBeenCalled();
    });

    it('verifyPrivateRealPlayerObjectiveSpy should be called if its players turn', () => {
        const FAKE_CURRENT_TIMER = undefined;
        virtualPlayerSettingsService.hasToPlay = false;
        const verifyPrivateRealPlayerObjectiveSpy = spyOn(service, 'verifyPrivateRealPlayerObjective');
        service.validateObjectives(fakeScoredPlacement, FAKE_CURRENT_TIMER);
        expect(verifyPrivateRealPlayerObjectiveSpy).toHaveBeenCalled();
    });

    it('verifyPrivateVirtualPlayerObjective should set fullfilled property to true if objective is valid', () => {
        virtualPlayerSettingsService.privateObjective.clear();
        playerSettingsService.resetAllFullfilledProperties();
        virtualPlayerSettingsService.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const expectedFuntionToCall = 'validate4';
        service.verifyPrivateVirtualPlayerObjective();
        expect(callAdequateValidationFunctionSpy).toHaveBeenCalledWith(expectedFuntionToCall);
        expect(virtualPlayerSettingsService.privateObjective.get(OBJECTIVE_4)?.fullfilled).toBeTrue();
    });

    it('verifyPrivateVirtualPlayerObjective should updated virtual player score if objective is valid', () => {
        virtualPlayerSettingsService.privateObjective.clear();
        playerSettingsService.resetAllFullfilledProperties();
        let playerScore = 0;
        service.virtualPlayerBonusObservable.subscribe((value) => {
            playerScore += value;
        });
        virtualPlayerSettingsService.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const displayObjectiveConfirmationMessageSpy = spyOn(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[3].description;
        const score = OBJECTIVES[3].score;
        service.verifyPrivateVirtualPlayerObjective();
        expect(displayObjectiveConfirmationMessageSpy).toHaveBeenCalledWith(true, true, description, score);
        expect(playerScore).toEqual(score);
    });

    it('verifyPrivateRealPlayerObjective should set fullfilled property to true if objective is valid', () => {
        playerSettingsService.privateObjective.clear();
        playerSettingsService.resetAllFullfilledProperties();
        playerSettingsService.privateObjective.set(OBJECTIVE_2, OBJECTIVES[1]);
        const callAdequateValidationFunctionSpy = spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const expectedFuntionToCall = 'validate2';
        service.verifyPrivateRealPlayerObjective();
        expect(callAdequateValidationFunctionSpy).toHaveBeenCalledWith(expectedFuntionToCall);
        expect(playerSettingsService.privateObjective.get(OBJECTIVE_2)?.fullfilled).toBeTrue();
    });

    it('verifyPrivateRealPlayerObjective should update player score if objective is valid', () => {
        playerSettingsService.privateObjective.clear();
        playerSettingsService.resetAllFullfilledProperties();
        let playerScore = 0;
        service.realPlayerBonusObservable.subscribe((value) => {
            playerScore += value;
        });
        playerSettingsService.privateObjective.set(OBJECTIVE_2, OBJECTIVES[1]);
        spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const displayObjectiveConfirmationMessageSpy = spyOn(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[1].description;
        const score = OBJECTIVES[1].score;
        service.verifyPrivateRealPlayerObjective();
        expect(displayObjectiveConfirmationMessageSpy).toHaveBeenCalledWith(false, true, description, score);
        expect(playerScore).toEqual(score);
    });

    it('verifyPublicObjectives should set fullfilled property to true if objective is valid', () => {
        playerSettingsService.publicObjectives.clear();
        playerSettingsService.resetAllFullfilledProperties();
        playerSettingsService.publicObjectives.set(OBJECTIVE_6, OBJECTIVES[5]);
        const callAdequateValidationFunctionSpy = spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const expectedFuntionToCall = 'validate6';
        service.verifyPublicObjectives();
        expect(callAdequateValidationFunctionSpy).toHaveBeenCalledWith(expectedFuntionToCall);
        expect(playerSettingsService.publicObjectives.get(OBJECTIVE_6)?.fullfilled).toBeTrue();
    });

    it('verifyPublicObjectives should updated player score if objective is valid and if its real players turn to play', () => {
        playerSettingsService.publicObjectives.clear();
        playerSettingsService.resetAllFullfilledProperties();
        virtualPlayerSettingsService.hasToPlay = false;
        let playerScore = 0;
        service.realPlayerBonusObservable.subscribe((value) => {
            playerScore += value;
        });
        playerSettingsService.publicObjectives.set(OBJECTIVE_6, OBJECTIVES[5]);
        spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const displayObjectiveConfirmationMessageSpy = spyOn(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[5].description;
        const score = OBJECTIVES[5].score;
        service.verifyPublicObjectives();
        expect(displayObjectiveConfirmationMessageSpy).toHaveBeenCalledWith(false, false, description, score);
        expect(playerScore).toEqual(score);
    });

    it('verifyPublicObjectives should update virtual player score if objective is valid and if its virtual players turn to play', () => {
        playerSettingsService.publicObjectives.clear();
        playerSettingsService.resetAllFullfilledProperties();
        virtualPlayerSettingsService.hasToPlay = true;
        let playerScore = 0;
        service.virtualPlayerBonusObservable.subscribe((value) => {
            playerScore += value;
        });
        playerSettingsService.publicObjectives.set(OBJECTIVE_6, OBJECTIVES[5]);
        spyOn(service, 'callAdequateValidationFunction').and.returnValue(true);
        const displayObjectiveConfirmationMessageSpy = spyOn(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[5].description;
        const score = OBJECTIVES[5].score;
        service.verifyPublicObjectives();
        expect(displayObjectiveConfirmationMessageSpy).toHaveBeenCalledWith(true, false, description, score);
        expect(playerScore).toEqual(score);
    });

    it('displayObjectiveConfirmationMessage should display a message in chat indicating virtual player passed his private objective', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        const isPlayerTheVirtualPlayer = true;
        const isObjectivePrivate = true;
        const description = 'Random objective';
        const FAKE_SCORE = 20;
        const expectedMsg = "Le joueur virtuel a réussi l'objectif privé suivant : Random objective. + 20 points bonus ! Félicitations !";
        service.displayObjectiveConfirmationMessage(isPlayerTheVirtualPlayer, isObjectivePrivate, description, FAKE_SCORE);
        expect(addMessageListSpy).toHaveBeenCalledWith('system', expectedMsg);
    });

    it('displayObjectiveConfirmationMessage should send a message alert indicating real player passed a public objective', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        const isPlayerTheVirtualPlayer = false;
        const isObjectivePrivate = false;
        const description = 'Random objective';
        const FAKE_SCORE = 20;
        const expectedMsg = "Vous avez réussi l'objectif public suivant : Random objective. + 20 points bonus ! Félicitations !";
        service.displayObjectiveConfirmationMessage(isPlayerTheVirtualPlayer, isObjectivePrivate, description, FAKE_SCORE);
        expect(addMessageListSpy).toHaveBeenCalledWith('system', expectedMsg);
    });

    it('validateObjective1 should return false if the word to be inserted is not already present in board game', () => {
        const fakeWordsOnBoard: Map<string, number> = new Map();
        fakeWordsOnBoard.set('canadian', 1);
        service.wordsOnBoard = fakeWordsOnBoard;
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective1()).toBeFalse();
    });

    it('validateObjective1 should return false if the word to be inserted is not already present in board game', () => {
        spyOn(service, 'readBoard');
        service.wordsOnBoard.set('environ', 2);
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective1()).toBeTrue();
    });

    it('validateObjective2 should be true if the three vowels are used', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective2()).toBeTrue();
    });

    it('isAVowel should return false if the letter is not a vowel', () => {
        const testLetter = 'j';
        expect(service.isAVowel(testLetter)).toBeFalse();
    });

    it('isAVowel should return true if the letter is not a vowel', () => {
        const testLetter = 'i';
        expect(service.isAVowel(testLetter)).toBeTrue();
    });

    it('validateObjective3 should return false if the insertion of a word does not create three words ', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective3()).toBeFalse();
    });

    it('validateObjective3 should return true if the insertion of a word creates at least three words ', () => {
        service.currentScoredPlacement = fakeScoredPlacement2;
        expect(service.validateObjective3()).toBeTrue();
    });

    it('validateObjective4 should return true if "v" or "V" is in scrabble easel', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective4()).toBeTrue();
    });

    it('validateObjective4 should return false if "v" or "V" is not in scrabble easel', () => {
        service.currentScoredPlacement = otherFakeScoredPlacement;
        expect(service.validateObjective4()).toBeFalse();
    });

    it('validateObjective5 should return false if counter is equal to 4 and virtual player has to play', () => {
        virtualPlayerSettingsService.hasToPlay = true;
        service.objective5CounterVirtualPlayer = 0;
        expect(service.validateObjective5()).toBeFalse();
    });

    it('validateObjective5 should return false if counter is equal to 4 and real player has to play ', () => {
        virtualPlayerSettingsService.hasToPlay = false;
        service.objective5CounterRealPlayer = 0;
        expect(service.validateObjective5()).toBeFalse();
    });

    it('validateObjective5 should return true if counter is equal to 4 and virtual player has to play', () => {
        virtualPlayerSettingsService.hasToPlay = true;
        service.objective5CounterVirtualPlayer = 3;
        expect(service.validateObjective5()).toBeTrue();
    });

    it('validateObjective5 should return true if counter is equal to 4 and real player has to play ', () => {
        virtualPlayerSettingsService.hasToPlay = false;
        service.objective5CounterRealPlayer = 3;
        expect(service.validateObjective5()).toBeTrue();
    });

    it('validateObjective6 should return false if the 5 letters from scrabble easel is not placed in a valid placement in the first 10 s', () => {
        const CURRENT_TIMER = 1000;
        const GAME_TIMER = 9000;
        service.currentTimerValue = CURRENT_TIMER;
        service.gameTimerValue = GAME_TIMER;
        expect(service.validateObjective6()).toBeFalse();
    });

    it('validateObjective6 should return true if the 5 letters from scrabble easel is placed in a valid placement in the first 10 s', () => {
        const CURRENT_TIMER = 9000;
        const GAME_TIMER = 1000;
        service.currentTimerValue = CURRENT_TIMER;
        service.gameTimerValue = GAME_TIMER;
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective6()).toBeTrue();
    });

    it('validateObjective7 should return true if placement touches at least 2 bonus squares', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective7()).toBeTrue();
    });

    it('validateObjective7 should return false if placement doesnt touch at least 2 bonus squares', () => {
        service.currentScoredPlacement = fakeScoredPlacement2;
        expect(service.validateObjective7()).toBeFalse();
    });

    it('validateObjective8 should incremented the virtual player counter objective if validate8pointsWordsCreated is false', () => {
        virtualPlayerSettingsService.hasToPlay = true;
        service.currentScoredPlacement = fakeScoredPlacement;
        service.validateObjective8();
        expect(service.objective8CounterVirtualPlayer).toBe(1);
    });

    it('validateObjective8 should not incremented the virtual player counter objective if validate8pointsWordsCreated is true', () => {
        virtualPlayerSettingsService.hasToPlay = true;
        service.currentScoredPlacement = otherFakeScoredPlacement;
        service.validateObjective8();
        expect(service.objective8CounterVirtualPlayer).toBe(0);
    });

    it('validateObjective8 should incremented the real player counter objective if validate8pointsWordsCreated is false', () => {
        virtualPlayerSettingsService.hasToPlay = false;
        service.currentScoredPlacement = fakeScoredPlacement;
        service.validateObjective8();
        expect(service.objective8CounterRealPlayer).toBe(1);
    });

    it('validateObjective8 should not incremented the real player counter objective if validate8pointsWordsCreated is true', () => {
        virtualPlayerSettingsService.hasToPlay = false;
        service.currentScoredPlacement = otherFakeScoredPlacement;
        service.validateObjective8();
        expect(service.objective8CounterRealPlayer).toBe(0);
    });

    it('validate8pointsWordCreated should return true if there is one word that earns more than 8 points', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validate8pointsWordCreated()).toBeTrue();
    });

    it('validate8pointsWordCreated should return true if there is one word that earns more than 8 points', () => {
        service.currentScoredPlacement = otherFakeScoredPlacement;
        expect(service.validate8pointsWordCreated()).toBeFalse();
    });

    it('resetObjectiveCounters should return 0 for virtual player counter objectives if it is his turn to play ', () => {
        virtualPlayerSettingsService.hasToPlay = true;
        service.resetObjectiveCounters();
        expect(service.objective5CounterVirtualPlayer).toEqual(0);
        expect(service.objective8CounterVirtualPlayer).toEqual(0);
    });

    it('resetObjectiveCounters should return 0 for real player counter objectives if it is his turn to play ', () => {
        virtualPlayerSettingsService.hasToPlay = false;
        service.resetObjectiveCounters();
        expect(service.objective5CounterRealPlayer).toBe(0);
        expect(service.objective8CounterRealPlayer).toBe(0);
    });

    it('readBoardOnAxis should read the board and set words to wordsOnBoard', () => {
        const tileHandlerService = TestBed.inject(TileHandlerService);
        service.wordsOnBoard.clear();
        tileHandlerService.placeLetter({ content: 'e', position: { x: 7, y: 5 } });
        tileHandlerService.placeLetter({ content: 'l', position: { x: 6, y: 5 } });
        tileHandlerService.placeLetters(sevenLettersPlacement.letters);
        service.readBoard();
        expect(service.wordsOnBoard.has('environ')).toEqual(true);
    });
});
