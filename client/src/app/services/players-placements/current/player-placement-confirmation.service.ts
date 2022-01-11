import { Injectable } from '@angular/core';
import { ONE_MINUTE, ONE_SECOND_MS, THREE_SECONDS_MS } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Tile } from '@app/classes/interfaces/tile';
import { PlayerPlacement } from '@app/classes/player-placement';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerPlacementConfirmationService extends PlayerPlacement {
    placement: Placement = { axis: AXIS.HORIZONTAL, letters: [] };
    messageToOutput: string;
    lettersToPlaceObservable: Subject<[Placement, Tile[], string]> = new Subject();

    constructor(
        public playerSettingsService: PlayerSettingsService,
        public placementValidationService: PlacementValidationService,
        public tileHandlerService: TileHandlerService,
        public turnHandlerService: TurnHandlerService,
        public selectGameModeService: SelectGameModeService,
        public objectivesValidationService: ObjectivesValidationService,
    ) {
        super(playerSettingsService, tileHandlerService);
    }

    confirmPlayerPlacement() {
        if (this.selectGameModeService.isSoloModeChosen) {
            let timeoutValue = THREE_SECONDS_MS;
            const timerValue = (this.turnHandlerService.counter.minute * ONE_MINUTE + this.turnHandlerService.counter.second) * ONE_SECOND_MS;
            if (timerValue <= timeoutValue) timeoutValue = (timerValue / ONE_SECOND_MS - 1) * ONE_SECOND_MS;
            window.setTimeout(() => {
                const scoredPlacement = this.placementValidationService.getValidatedPlacement(this.placement);
                if (scoredPlacement) {
                    if (this.selectGameModeService.isLOG2990ModeChosen)
                        this.objectivesValidationService.validateObjectives(scoredPlacement, timerValue);
                    this.scoreObservable.next(scoredPlacement.totalScore);
                    this.playerSettingsService.refillRack();
                    this.playerSettingsService.rackSizeObservable.next(this.playerSettingsService.letters.length);
                } else {
                    if (this.selectGameModeService.isLOG2990ModeChosen) this.objectivesValidationService.resetObjectiveCounters();
                    this.tileHandlerService.removePlacement(this.placement.letters);
                    this.playerSettingsService.reinsertPlacement(this.placement.letters);
                }
                this.playerSettingsService.hasToPlay = true;
                this.turnHandlerService.resetTurnsPassed();
            }, timeoutValue);
            this.playerSettingsService.hasToPlay = false;
        } else {
            this.lettersToPlaceObservable.next([this.placement, this.playerSettingsService.letters, this.messageToOutput]);
        }
    }
}
