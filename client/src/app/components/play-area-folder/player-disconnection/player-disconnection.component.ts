import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameManagerService } from '@app/services/game-manager.service';

@Component({
    selector: 'app-player-disconnection',
    templateUrl: './player-disconnection.component.html',
    styleUrls: ['./player-disconnection.component.scss'],
})
export class PlayerDisconnectionComponent {
    message: string = ' a quitté la partie et a été remplacé par un joueur virtuel débutant.';
    constructor(private gameManagerService: GameManagerService, private snackBar: MatSnackBar) {
        this.gameManagerService.playerDisconnectionObservable.subscribe((value) => {
            this.snackBar.open(value + this.message, 'OK', { duration: 5000, verticalPosition: 'top' });
        });
    }
}
