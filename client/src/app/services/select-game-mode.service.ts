import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectGameModeService {
    soloModeObservable: Subject<boolean> = new Subject<boolean>();
    isSoloModeChosen: boolean = false;
    onlinePlayerTurnObservable: Subject<boolean> = new Subject<boolean>();
    isOnlinePlayerTurn: boolean = false;
    endGameObservable: Subject<string> = new Subject();
    isLOG2990ModeChosen: boolean = false;

    constructor() {
        this.onlinePlayerTurnObservable.subscribe((value) => {
            this.isOnlinePlayerTurn = value;
        });

        this.endGameObservable.subscribe(() => {
            this.isOnlinePlayerTurn = false;
        });
    }

    updateGameMode(modeValue: boolean): void {
        this.soloModeObservable.next(modeValue);
        this.isSoloModeChosen = modeValue;
    }
}
