import { Injectable } from '@angular/core';
import { PERCENT, RANDOM_NUMBER_GENERATOR, VIRTUAL_PLAYER_SCORE_PROBABILITY } from '@app/classes/constants/constants';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { ScoreRange } from '@app/classes/interfaces/virtual-player-score-range';
import { DictionaryService } from '@app/services/dictionary.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MessageCreatorService } from '@app/services/message-creator.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { VirtualPlayerPlacementCreatorService } from '@app/services/players-placements/virtual/virtual-player-placement-creator.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';

@Injectable({
    providedIn: 'root',
})
export class BeginnerPlacementCreatorService extends VirtualPlayerPlacementCreatorService {
    scoreRange: ScoreRange = { min: 0, max: 0 };
    constructor(
        public dictionaryService: DictionaryService,
        public messageCreatorService: MessageCreatorService,
        public placementValidationService: PlacementValidationService,
        public tileHandlerService: TileHandlerService,
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        public objectivesValidationService: ObjectivesValidationService,
        public selectGameModeService: SelectGameModeService,
    ) {
        super(
            dictionaryService,
            messageCreatorService,
            placementValidationService,
            tileHandlerService,
            virtualPlayerSettingsService,
            objectivesValidationService,
            selectGameModeService,
        );
    }

    createPlacement(): [string, ScoredPlacement[]] | undefined {
        this.scoreRange = this.getExpectedWordScore();
        return super.createPlacement();
    }

    getExpectedWordScore(): ScoreRange {
        const wordScoreRange = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(0, PERCENT);
        if (wordScoreRange < VIRTUAL_PLAYER_SCORE_PROBABILITY.LOW_RANGE_POINTS) return { min: 1, max: 6 };
        else if (
            wordScoreRange >= VIRTUAL_PLAYER_SCORE_PROBABILITY.LOW_RANGE_POINTS &&
            wordScoreRange < VIRTUAL_PLAYER_SCORE_PROBABILITY.MEDIUM_RANGE_POINTS
        )
            return { min: 7, max: 12 };
        else return { min: 13, max: 18 };
    }

    addPlacementIfPredicateIsRespected(scoredPlacement: ScoredPlacement): boolean {
        if (scoredPlacement.totalScore >= this.scoreRange.min && scoredPlacement.totalScore <= this.scoreRange.max) {
            return super.addPlacementIfPredicateIsRespected(scoredPlacement);
        }
        return false;
    }
}
