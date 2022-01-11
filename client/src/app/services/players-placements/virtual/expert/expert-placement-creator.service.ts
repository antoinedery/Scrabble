import { Injectable } from '@angular/core';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
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
export class ExpertPlacementCreatorService extends VirtualPlayerPlacementCreatorService {
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

    addPlacementIfPredicateIsRespected(scoredPlacement: ScoredPlacement): boolean {
        if (this.potentialPlacements.length <= 3) this.potentialPlacements.push(scoredPlacement);
        else {
            let tempLowestScoreIndex = 0;
            for (const [index, placement] of this.potentialPlacements.entries()) {
                if (placement.totalScore < this.potentialPlacements[tempLowestScoreIndex].totalScore) tempLowestScoreIndex = index;
            }
            if (scoredPlacement.totalScore > this.potentialPlacements[tempLowestScoreIndex].totalScore)
                this.potentialPlacements[tempLowestScoreIndex] = scoredPlacement;
        }
        return false;
    }

    selectPlacement(): ScoredPlacement {
        this.potentialPlacements.sort(this.compareScore);
        return this.potentialPlacements.splice(0, 1)[0];
    }

    compareScore(rightScoredPlacement: ScoredPlacement, leftScoredPlacement: ScoredPlacement) {
        return leftScoredPlacement.totalScore - rightScoredPlacement.totalScore;
    }
}
