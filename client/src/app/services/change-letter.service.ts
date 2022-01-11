import { Injectable } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { DisplayMessageService } from '@app/services/display-message.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ChangeLetterService {
    lettersToChange: Map<number, string> = new Map();

    constructor(
        private letterReserveService: LetterReserveService,
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private turnHandlerService: TurnHandlerService,
        private displayMessageService: DisplayMessageService,
    ) {}

    changeLetterPlayer(lettersToChange: string) {
        this.swipeLettersFromConsole(lettersToChange, this.playerSettingsService.letters);
    }

    changeLetterVirtualPlayer(lettersToChange: string) {
        this.swipeLettersFromConsole(lettersToChange, this.virtualPlayerSettingsService.letters);
    }

    swipeLettersFromConsole(letters: string, currentLetters: Tile[]): void {
        const newTiles: Tile[] = this.letterReserveService.pickTilesArray(letters.length);

        if (newTiles.length === 0) return;
        for (let i = 0; i < letters.length; i++) {
            for (let j = 0; j < currentLetters.length; j++) {
                /* istanbul ignore else */
                if (letters[i].toUpperCase() === currentLetters[j].letter.toUpperCase()) {
                    this.letterReserveService.insertTileInReserve(currentLetters[j]);
                    currentLetters[j] = newTiles[i];
                    break;
                }
            }
        }
    }

    swipeLettersFromSelection(currentLetters: Tile[]): void {
        let changedLetters = '';
        const newTiles: Tile[] = this.letterReserveService.pickTilesArray(this.lettersToChange.size);
        for (const [key, value] of this.lettersToChange.entries()) {
            this.letterReserveService.insertTileInReserve(currentLetters[key]);
            changedLetters += value;
            currentLetters[key] = newTiles[0];
            newTiles.splice(0, 1);
        }
        this.displayMessageService.addMessageList(this.playerSettingsService.name, '!échanger ' + changedLetters.toLowerCase());
        this.turnHandlerService.resetTurnsPassed();
    }

    validateLetterChange(): void {
        if (this.playerSettingsService.hasToPlay && this.letterReserveService.letterReserveTotalSize >= LETTERS_RACK_SIZE) {
            this.swipeLettersFromSelection(this.playerSettingsService.letters);
            this.turnHandlerService.resetObjectivesCountersObservable.next(true);
        } else if (!this.playerSettingsService.hasToPlay && this.letterReserveService.letterReserveTotalSize >= LETTERS_RACK_SIZE) {
            this.displayMessageService.addMessageList('system', 'Commande impossible : Vous devez attendre votre tour pour jouer.');
        } else this.displayMessageService.addMessageList('system', 'Commande impossible : La réserve contient moins de 7 lettres.');
    }
}
