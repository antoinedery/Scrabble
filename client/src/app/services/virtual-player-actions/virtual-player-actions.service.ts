import { Injectable } from '@angular/core';
import {
    MAXIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS,
    MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS,
    RANDOM_NUMBER_GENERATOR,
} from '@app/classes/constants/constants';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerActionsService {
    potentialPlacementObservable: Subject<ScoredPlacement[]> = new Subject<ScoredPlacement[]>();

    constructor(
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        public changeLetterService: ChangeLetterService,
        public turnHandlerService: TurnHandlerService,
        public displayMessageService: DisplayMessageService,
    ) {}

    selectAction(): void {
        window.setTimeout(() => {
            // this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, 'Passer son tour');
            // this.turnHandlerService.incrementTurnsPassed();
            this.endTurnVirtualPlayer();
        }, MAXIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS - MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS);
    }

    executeAction(): void {
        window.setTimeout(() => {
            this.selectAction();
        }, MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS);
    }

    getCreatedPlacement(): [string, ScoredPlacement[]] | undefined {
        return;
    }

    placeLetters(): boolean {
        const placedLetters = this.getCreatedPlacement();
        if (placedLetters) {
            this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, placedLetters[0]);
            this.potentialPlacementObservable.next(placedLetters[1]);
            this.turnHandlerService.resetTurnsPassed();
            return true;
        }
        return false;
    }

    selectLettersToChange(lettersToChange: string, numberLettersToChange: number): void {
        this.changeLetterService.changeLetterVirtualPlayer(lettersToChange);
        this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, '!échanger ' + numberLettersToChange + ' lettres');
    }

    generateRandomLettersToChange(numberLettersToChange: number): string {
        let lettersToChange = '';
        const virtualPlayerLetters = [...this.virtualPlayerSettingsService.letters];
        for (let i = 0; i < numberLettersToChange; i++) {
            const letterIndex = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(0, virtualPlayerLetters.length - 1);
            lettersToChange += virtualPlayerLetters[letterIndex].letter;
            virtualPlayerLetters.splice(letterIndex, 1);
        }
        return lettersToChange;
    }

    endTurnVirtualPlayer(): void {
        this.displayMessageService.addMessageList(this.virtualPlayerSettingsService.name, 'Passer son tour');
        this.turnHandlerService.incrementTurnsPassed();
    }
}
