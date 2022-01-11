import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { DictionaryService } from '@app/services/dictionary.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { VirtualPlayerPlacementCreatorService } from './virtual-player-placement-creator.service';

describe('VirtualPlayerPlacementCreatorService', () => {
    let service: VirtualPlayerPlacementCreatorService;
    let objectivesValidationService: ObjectivesValidationService;
    let selectGameModeService: SelectGameModeService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let playAreaService: PlayAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerPlacementCreatorService);
        objectivesValidationService = TestBed.inject(ObjectivesValidationService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        playAreaService = TestBed.inject(PlayAreaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createPlacement should call validateObjectives if potentialPlacements is not null', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();
        selectGameModeService.isLOG2990ModeChosen = true;
        const scoredPlacement: ScoredPlacement = {
            placement: {
                axis: AXIS.VERTICAL,
                letters: [
                    { content: 'A', position: { x: 7, y: 7 } },
                    { content: 'A', position: { x: 7, y: 8 } },
                ],
            },
            words: [],
            totalScore: 1,
        };
        virtualPlayerSettingsService.letters = [
            { letter: 'A', score: 1 },
            { letter: 'A', score: 1 },
        ];
        scoredPlacement.placement.letters.push();
        playAreaService.randomizeBoard();
        spyOn(service, 'selectPlacement').and.returnValue(scoredPlacement);
        spyOn(service, 'isPotentialPlacementLength').and.returnValue(true);
        const spy = spyOn(objectivesValidationService, 'validateObjectives');
        spyOn(service, 'displayPlacementOnBoard');
        service.createPlacement();
        expect(spy).toHaveBeenCalledWith(scoredPlacement);
    });

    it('createPlacement should call resetObjectiveCounters if potentialPlacements is null', () => {
        selectGameModeService.isLOG2990ModeChosen = true;
        service.potentialPlacements = [];
        const spy = spyOn(objectivesValidationService, 'resetObjectiveCounters');
        service.createPlacement();
        expect(spy).toHaveBeenCalled();
    });
});
