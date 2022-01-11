import { TestBed } from '@angular/core/testing';
import { RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { BeginnerPlacementCreatorService } from '@app/services/players-placements/virtual/beginner/beginner-placement-creator.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { BeginnerVirtualPlayerActionsService } from './beginner-virtual-player-actions.service';

describe('BeginnerVirtualPlayerActionsService', () => {
    let service: BeginnerVirtualPlayerActionsService;
    let beginnerPlacementCreatorService: BeginnerPlacementCreatorService;
    let turnHandlerService: TurnHandlerService;
    let letterReserveService: LetterReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BeginnerVirtualPlayerActionsService);
        beginnerPlacementCreatorService = TestBed.inject(BeginnerPlacementCreatorService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        letterReserveService = TestBed.inject(LetterReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getCreatedPlacement should call getCreatedPlacement and return undefined ', () => {
        const createPlacement = spyOn(beginnerPlacementCreatorService, 'createPlacement').and.returnValue(undefined);
        expect(service.getCreatedPlacement()).toBeUndefined();
        expect(createPlacement).toHaveBeenCalled();
    });

    it('selectLettersToChange should call selectLettersToChange of parent service', () => {
        const generateRandomLettersToChange = spyOn(service, 'generateRandomLettersToChange').and.returnValue('a');
        service.selectLettersToChange();
        expect(generateRandomLettersToChange).toHaveBeenCalled();
    });

    it('selectAction should call addMessageList and incrementTurnsPassed if probability', () => {
        const generateRandomLettersToChange = spyOn(service, 'generateRandomLettersToChange').and.returnValue('a');
        service.selectLettersToChange();
        expect(generateRandomLettersToChange).toHaveBeenCalled();
    });

    it('selectAction should call endTurn when random number < 10', () => {
        const incrementTurnsPassed = spyOn(turnHandlerService, 'incrementTurnsPassed');
        const MY_NUMBER = 5;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(MY_NUMBER);
        service.selectAction();
        expect(incrementTurnsPassed).toHaveBeenCalled();
    });

    it('selectAction should call incrementTurnsPassed when random number > 10 and < 20 and letterReserve size is lower than 7', () => {
        const incrementTurnsPassed = spyOn(turnHandlerService, 'incrementTurnsPassed');
        const MY_NUMBER = 15;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(MY_NUMBER);
        letterReserveService.letterReserveTotalSize = 0;
        service.selectAction();
        expect(incrementTurnsPassed).toHaveBeenCalled();
    });

    it('selectAction should call resetTurnsPassed when random number > 10 and < 20 and letterReserve size is higher than 7', () => {
        spyOn(service, 'selectLettersToChange');
        const resetTurnsPassed = spyOn(turnHandlerService, 'resetTurnsPassed');
        const MY_NUMBER = 15;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(MY_NUMBER);
        letterReserveService.letterReserveTotalSize = 7;
        service.selectAction();
        expect(resetTurnsPassed).toHaveBeenCalled();
    });

    it('selectAction should call selectAction when no letter is placed', () => {
        const placeLetters = spyOn(service, 'placeLetters').and.returnValue(false);
        const MY_NUMBER = 25;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(MY_NUMBER);
        service.selectAction();
        expect(placeLetters).toHaveBeenCalled();
    });

    it('selectAction should not call selectAction if letter is placed', () => {
        const placeLetters = spyOn(service, 'placeLetters').and.returnValue(true);
        const MY_NUMBER = 25;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(MY_NUMBER);
        service.selectAction();
        expect(placeLetters).toHaveBeenCalled();
    });
});
