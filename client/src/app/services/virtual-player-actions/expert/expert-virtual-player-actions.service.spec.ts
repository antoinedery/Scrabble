import { TestBed } from '@angular/core/testing';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { ExpertPlacementCreatorService } from '@app/services/players-placements/virtual/expert/expert-placement-creator.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { VirtualPlayerActionsService } from '@app/services/virtual-player-actions/virtual-player-actions.service';
import { ExpertVirtualPlayerActionsService } from './expert-virtual-player-actions.service';
// import { DisplayMessageService } from '@app/services/display-message.service';

describe('ExpertVirtualPlayerActionsService', () => {
    let service: ExpertVirtualPlayerActionsService;
    let letterReserveService: LetterReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExpertVirtualPlayerActionsService);
        letterReserveService = TestBed.inject(LetterReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('selectAction should call resetTurnsPassedSpy if a valid placement is created', () => {
        const turnHandlerService = TestBed.inject(TurnHandlerService);
        const expertPlacementCreatorService = TestBed.inject(ExpertPlacementCreatorService);
        spyOn(expertPlacementCreatorService, 'createPlacement').and.returnValue(['', []]);
        const resetTurnsPassedSpy = spyOn(turnHandlerService, 'resetTurnsPassed');
        service.selectAction();
        expect(resetTurnsPassedSpy).toHaveBeenCalled();
    });

    it('selectAction should call selectLettersToChange if no valid placement is created and reserve letter is > 0', () => {
        const expertPlacementCreatorService = TestBed.inject(ExpertPlacementCreatorService);
        letterReserveService.letterReserveTotalSize = 1;
        spyOn(expertPlacementCreatorService, 'createPlacement').and.returnValue(undefined);
        const selectLettersToChangeSpy = spyOn(service, 'selectLettersToChange');
        service.selectAction();
        expect(selectLettersToChangeSpy).toHaveBeenCalled();
    });

    it('selectAction should call selectAction from super if no valid placement is created and reserve letter is empty', () => {
        const expertPlacementCreatorService = TestBed.inject(ExpertPlacementCreatorService);
        letterReserveService.letterReserveTotalSize = 0;
        spyOn(expertPlacementCreatorService, 'createPlacement').and.returnValue(undefined);
        const selectActionSpy = spyOn(VirtualPlayerActionsService.prototype, 'selectAction');
        service.selectAction();
        expect(selectActionSpy).toHaveBeenCalled();
    });

    it('selectLettersToChange should call selectLettersToChange from super if reserve size is < 7 letters', () => {
        letterReserveService.letterReserveTotalSize = 1;
        spyOn(service, 'generateRandomLettersToChange');
        const selectLettersToChangeSpy = spyOn(VirtualPlayerActionsService.prototype, 'selectLettersToChange');
        service.selectLettersToChange();
        expect(selectLettersToChangeSpy).toHaveBeenCalled();
    });

    it('selectLettersToChange should call selectAction from super if reserve size is > 7 letters', () => {
        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        virtualPlayerSettingsService.letters.push({ letter: 'A', score: 1 });
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE;
        const selectLettersToChangeSpy = spyOn(VirtualPlayerActionsService.prototype, 'selectLettersToChange');
        service.selectLettersToChange();
        expect(selectLettersToChangeSpy).toHaveBeenCalled();
    });
});
