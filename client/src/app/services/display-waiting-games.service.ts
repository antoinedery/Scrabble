import { Injectable } from '@angular/core';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DisplayWaitingGamesService {
    waitingGameObservable: Subject<WaitingGame[]> = new Subject<WaitingGame[]>();
    waitingGames: WaitingGame[] = [];

    addCreatedGame(games: WaitingGame[]): void {
        this.waitingGames = games;
        this.waitingGameObservable.next(this.waitingGames);
    }
}
