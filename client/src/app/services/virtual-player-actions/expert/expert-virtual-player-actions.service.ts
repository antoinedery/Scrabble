import { Injectable } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { VirtualPlayerActionsService } from '@app/services/virtual-player-actions/virtual-player-actions.service';
import { ExpertPlacementCreatorService } from '@app/services/players-placements/virtual/expert/expert-placement-creator.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';

@Injectable({
    providedIn: 'root',
})
export class ExpertVirtualPlayerActionsService extends VirtualPlayerActionsService {
    constructor(
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        public changeLetterService: ChangeLetterService,
        public turnHandlerService: TurnHandlerService,
        public displayMessageService: DisplayMessageService,
        public letterReserveService: LetterReserveService,
        public expertPlacementCreatorService: ExpertPlacementCreatorService,
    ) {
        super(virtualPlayerSettingsService, changeLetterService, turnHandlerService, displayMessageService);
    }

    selectAction(): void {
        const placedLetters = this.expertPlacementCreatorService.createPlacement();
        if (placedLetters) {
            this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, placedLetters[0]);
            this.potentialPlacementObservable.next(placedLetters[1]);
            this.turnHandlerService.resetTurnsPassed();
        } else if (this.letterReserveService.letterReserveTotalSize > 0) {
            this.selectLettersToChange();
            this.turnHandlerService.resetTurnsPassed();
        } else super.selectAction();
    }

    selectLettersToChange(): void {
        let lettersToChange = '';
        let sizeToRemove = this.virtualPlayerSettingsService.letters.length;

        if (this.letterReserveService.letterReserveTotalSize < LETTERS_RACK_SIZE) {
            lettersToChange = this.generateRandomLettersToChange(this.letterReserveService.letterReserveTotalSize);
            sizeToRemove = this.letterReserveService.letterReserveTotalSize;
        } else {
            for (const letter of this.virtualPlayerSettingsService.letters) {
                lettersToChange += letter.letter;
            }
        }

        super.selectLettersToChange(lettersToChange, sizeToRemove);
    }
}
