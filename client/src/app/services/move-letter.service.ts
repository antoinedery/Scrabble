import { Injectable } from '@angular/core';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';

@Injectable({
    providedIn: 'root',
})
export class MoveLetterService {
    constructor(private playerSettingsService: PlayerSettingsService) {}

    moveLetterFromKeyboardEvent(event: KeyboardEvent, letterIndex: number): void {
        if (event.key === 'ArrowRight') this.moveLetterRight(letterIndex);
        else this.moveLetterLeft(letterIndex);
    }

    moveLetterFromMouseEvent(event: WheelEvent, letterIndex: number): void {
        if (event.deltaY > 0) this.moveLetterRight(letterIndex);
        else this.moveLetterLeft(letterIndex);
    }

    moveLetterRight(letterIndex: number): void {
        const currentTile = this.playerSettingsService.letters[letterIndex];
        const nextIndex = (letterIndex + 1) % this.playerSettingsService.letters.length;
        if (nextIndex === 0) {
            const lastTile = this.playerSettingsService.letters.pop();
            /* istanbul ignore else */
            if (lastTile) this.playerSettingsService.letters.unshift(lastTile);
        } else {
            const nextTile = this.playerSettingsService.letters[nextIndex];
            this.playerSettingsService.letters[nextIndex] = currentTile;
            this.playerSettingsService.letters[letterIndex] = nextTile;
        }
    }

    moveLetterLeft(selectedLetterIndex: number): void {
        const currentTile = this.playerSettingsService.letters[selectedLetterIndex];
        const previousIndex = selectedLetterIndex - 1 < 0 ? this.playerSettingsService.letters.length - 1 : selectedLetterIndex - 1;
        if (previousIndex === this.playerSettingsService.letters.length - 1) {
            const firstTile = this.playerSettingsService.letters.shift();
            /* istanbul ignore else */
            if (firstTile) this.playerSettingsService.letters.push(firstTile);
        } else {
            const previousTile = this.playerSettingsService.letters[previousIndex];
            this.playerSettingsService.letters[previousIndex] = currentTile;
            this.playerSettingsService.letters[selectedLetterIndex] = previousTile;
        }
    }
}
