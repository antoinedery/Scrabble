import { ChangeDetectorRef, Component } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { DisplayWaitingGamesService } from '@app/services/display-waiting-games.service';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';

@Component({
    selector: 'app-find-games',
    templateUrl: './find-games.component.html',
    styleUrls: ['./find-games.component.scss'],
})
export class FindGamesComponent {
    waitingGames: WaitingGame[] = [];
    stepper: MatStepper;
    constructor(
        displayWaitingGamesService: DisplayWaitingGamesService,
        private playerNameComparatorService: PlayerNameComparatorService,
        private stepperModalComponent: StepperModalComponent,
        private chRef: ChangeDetectorRef,
    ) {
        displayWaitingGamesService.waitingGameObservable.subscribe((value) => {
            this.waitingGames = value;
            this.chRef.detectChanges();
        });
        this.waitingGames = displayWaitingGamesService.waitingGames;
        this.stepper = this.stepperModalComponent.stepper;
    }

    joinGame(): void {
        const position = Math.floor(Math.random() * this.waitingGames.length);
        const game: WaitingGame = {
            playerName: this.waitingGames[position].playerName,
            timer: this.waitingGames[position].timer,
            dictionary: this.waitingGames[position].dictionary,
            bonus: this.waitingGames[position].bonus,
            socketId: this.waitingGames[position].socketId,
            isLog2990ModeChosen: this.waitingGames[position].isLog2990ModeChosen,
        };
        this.playerNameComparatorService.receiveGame(game);
        this.stepper.next();
    }
}
