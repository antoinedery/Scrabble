import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MAXIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS, MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS } from '@app/classes/constants/constants';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { VirtualPlayerActionsService } from '@app/services/virtual-player-actions/virtual-player-actions.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';

describe('VirtualPlayerActionsService', () => {
    let service: VirtualPlayerActionsService;
    let turnHandlerService: TurnHandlerService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
        });
        service = TestBed.inject(VirtualPlayerActionsService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('placedLetters of VirtualPlayerActionsService should return true for valid placement', () => {
        spyOn(service, 'getCreatedPlacement').and.returnValue(['', []]);
        expect(service.placeLetters()).toBeTrue();
    });

    it('placedLetters of VirtualPlayerActionsService should return false if placement is undefined', () => {
        spyOn(service, 'getCreatedPlacement').and.returnValue(undefined);
        expect(service.placeLetters()).toBeFalse();
    });

    it('selectAction should call turnHandlerService after 20 seconds', fakeAsync(() => {
        const incrementTurnsPassed = spyOn(turnHandlerService, 'incrementTurnsPassed');
        service.selectAction();
        tick(MAXIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS);
        expect(incrementTurnsPassed).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('executeAction should call selectAction after 3 seconds', fakeAsync(() => {
        const selectAction = spyOn(service, 'selectAction');
        service.executeAction();
        tick(MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS);
        expect(selectAction).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('getCreatedPlacement should return undefined', () => {
        expect(service.getCreatedPlacement()).toBeUndefined();
    });

    it('generateRandomLettersToChange should return correct letters to change', () => {
        virtualPlayerSettingsService.letters.push({ letter: 'A', score: 1 });
        expect(service.generateRandomLettersToChange(1)).toEqual('A');
    });
});
