import { Component, Input } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { Time } from '@app/classes/interfaces/time';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';

@Component({
    selector: 'app-waiting-player',
    templateUrl: './waiting-player.component.html',
    styleUrls: ['./waiting-player.component.scss'],
})
export class WaitingPlayerComponent {
    @Input() playerName: string = '';
    @Input() timer: Time = { minute: 1, second: 0 };
    @Input() dictionary: DictionaryDetails = { title: '', description: '' };
    @Input() bonus: boolean = false;
    @Input() socketId: string = '';
    @Input() isLog2990ModeChosen: boolean = false;
    stepper: MatStepper;

    constructor(private stepperModalComponent: StepperModalComponent, private playerNameComparatorService: PlayerNameComparatorService) {
        this.stepper = this.stepperModalComponent.stepper;
    }

    joinGame(): void {
        const game: WaitingGame = {
            playerName: this.playerName,
            timer: this.timer,
            dictionary: this.dictionary,
            bonus: this.bonus,
            socketId: this.socketId,
            isLog2990ModeChosen: this.isLog2990ModeChosen,
        };
        this.playerNameComparatorService.receiveGame(game);
        this.stepper.next();
    }
}
