import { Injectable } from '@angular/core';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';

@Injectable({
    providedIn: 'root',
})
export class PlayerNameComparatorService {
    areNameIdentical: boolean = false;
    opponentPlayerName: string = '';
    game: WaitingGame;

    receiveGame(game: WaitingGame): void {
        this.game = game;
        this.opponentPlayerName = game.playerName;
    }

    comparePlayerNames(currentPlayerName: string): boolean {
        return (this.areNameIdentical = this.opponentPlayerName.toUpperCase() === currentPlayerName.toUpperCase());
    }
}
