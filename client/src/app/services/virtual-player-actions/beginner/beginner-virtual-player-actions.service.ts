import { Injectable } from '@angular/core';
import { LETTERS_RACK_SIZE, PERCENT, RANDOM_NUMBER_GENERATOR, VIRTUAL_PLAYER_ACTION_PROBABILITY } from '@app/classes/constants/constants';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { BeginnerPlacementCreatorService } from '@app/services/players-placements/virtual/beginner/beginner-placement-creator.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { VirtualPlayerActionsService } from '@app/services/virtual-player-actions/virtual-player-actions.service';

@Injectable({
    providedIn: 'root',
})
export class BeginnerVirtualPlayerActionsService extends VirtualPlayerActionsService {
    constructor(
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        public changeLetterService: ChangeLetterService,
        public turnHandlerService: TurnHandlerService,
        public displayMessageService: DisplayMessageService,
        public letterReserveService: LetterReserveService,
        private beginnerPlacementCreatorService: BeginnerPlacementCreatorService,
    ) {
        super(virtualPlayerSettingsService, changeLetterService, turnHandlerService, displayMessageService);
    }

    selectAction(): void {
        const randomNumber = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(0, PERCENT);
        if (randomNumber < VIRTUAL_PLAYER_ACTION_PROBABILITY.END_TURN_PROBABILITY) {
            // this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, 'Passer son tour');
            // this.turnHandlerService.incrementTurnsPassed();
            this.endTurnVirtualPlayer();
        } else if (
            randomNumber >= VIRTUAL_PLAYER_ACTION_PROBABILITY.CHANGE_LETTER_PROBABILITY &&
            randomNumber < VIRTUAL_PLAYER_ACTION_PROBABILITY.CHANGE_LETTER_PROBABILITY * 2
        ) {
            if (this.letterReserveService.letterReserveTotalSize >= LETTERS_RACK_SIZE) {
                this.selectLettersToChange();
                this.turnHandlerService.resetTurnsPassed();
            } else {
                this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, 'Passer son tour');
                this.turnHandlerService.incrementTurnsPassed();
            }
        } else {
            if (!this.placeLetters()) super.selectAction();
        }
    }

    getCreatedPlacement(): [string, ScoredPlacement[]] | undefined {
        return this.beginnerPlacementCreatorService.createPlacement();
    }

    selectLettersToChange(): void {
        const numberLettersToChange = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(1, this.virtualPlayerSettingsService.letters.length);
        const lettersToChange = this.generateRandomLettersToChange(numberLettersToChange);
        super.selectLettersToChange(lettersToChange, numberLettersToChange);
    }
}
