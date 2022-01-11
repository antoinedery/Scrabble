import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { THREE_SECONDS_MS } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { PlayerPlacementConfirmationService } from '@app/services/players-placements/current/player-placement-confirmation.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

describe('PlayerPlacementConfirmationService', () => {
    let service: PlayerPlacementConfirmationService;
    let placementValidationService: PlacementValidationService;
    let tileHandlerService: TileHandlerService;
    let playerSettingsService: PlayerSettingsService;
    let turnHandlerService: TurnHandlerService;
    let selectGameModeService: SelectGameModeService;
    let objectivesValidationService: ObjectivesValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerPlacementConfirmationService);
        placementValidationService = TestBed.inject(PlacementValidationService);
        tileHandlerService = TestBed.inject(TileHandlerService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        objectivesValidationService = TestBed.inject(ObjectivesValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('confirmPlayerPlacement should call removePlacement and reinsertPlacement if placement is not valid', fakeAsync(() => {
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 4;
        selectGameModeService.isSoloModeChosen = true;
        const removePlacement = spyOn(tileHandlerService, 'removePlacement');
        const reinsertPlacement = spyOn(playerSettingsService, 'reinsertPlacement');
        spyOn(placementValidationService, 'getValidatedPlacement').and.returnValue(undefined);
        service.confirmPlayerPlacement();
        tick(THREE_SECONDS_MS);
        expect(removePlacement).toHaveBeenCalled();
        expect(reinsertPlacement).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('confirmPlayerPlacement should call refillRack if placement is valid', fakeAsync(() => {
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 2;
        selectGameModeService.isSoloModeChosen = true;
        const refillRack = spyOn(playerSettingsService, 'refillRack');
        spyOn(placementValidationService, 'getValidatedPlacement').and.returnValue({
            placement: {
                axis: AXIS.VERTICAL,
                letters: [],
            },
            words: [],
            totalScore: 1,
        });
        service.confirmPlayerPlacement();
        tick(THREE_SECONDS_MS);
        expect(refillRack).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('confirmPlayerPlacement should call next function on lettersToPlaceObservable if placement is valid', fakeAsync(() => {
        selectGameModeService.isSoloModeChosen = false;
        const nextObservableSpy = spyOn(service.lettersToPlaceObservable, 'next');
        service.confirmPlayerPlacement();
        expect(nextObservableSpy).toHaveBeenCalled();
    }));

    it('confirmPlayerPlacement should call validateObjectives with the correct parameters if placement is valid', fakeAsync(() => {
        selectGameModeService.isSoloModeChosen = true;
        selectGameModeService.isLOG2990ModeChosen = true;
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 30;
        const expectedTimerValue = 30000;
        const spy = spyOn(objectivesValidationService, 'validateObjectives');
        const expectedScoredPlacement: ScoredPlacement = {
            placement: {
                axis: AXIS.VERTICAL,
                letters: [],
            },
            words: [],
            totalScore: 1,
        };
        spyOn(placementValidationService, 'getValidatedPlacement').and.returnValue(expectedScoredPlacement);
        service.confirmPlayerPlacement();
        tick(THREE_SECONDS_MS);
        expect(spy).toHaveBeenCalledWith(expectedScoredPlacement, expectedTimerValue);
        discardPeriodicTasks();
    }));

    it('confirmPlayerPlacement should call resetObjectiveCounters if placement is not valid', fakeAsync(() => {
        selectGameModeService.isSoloModeChosen = true;
        selectGameModeService.isLOG2990ModeChosen = true;
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 2;
        const spy = spyOn(objectivesValidationService, 'resetObjectiveCounters');
        spyOn(placementValidationService, 'getValidatedPlacement').and.returnValue(undefined);
        service.confirmPlayerPlacement();
        tick(THREE_SECONDS_MS);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));
});
