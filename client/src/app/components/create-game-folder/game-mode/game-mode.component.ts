import { Component, Input } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-game-mode',
    templateUrl: './game-mode.component.html',
    styleUrls: ['./game-mode.component.scss'],
})
export class GameModeComponent {
    @Input() stepper: MatStepper;
    selectedMode: string = 'card';
    isSoloModeChosen: boolean = false;

    constructor(
        private stepperModalComponent: StepperModalComponent,
        private clientSocketService: ClientSocketService,
        public selectGameModeService: SelectGameModeService,
    ) {}

    clearGameMode(): void {
        this.stepperModalComponent.isSoloModeChosen = false;
        this.stepperModalComponent.isCreateMultiModeChosen = false;
        this.stepperModalComponent.isJoinMultiModeChosen = false;
    }

    selectSoloMode(): void {
        this.clearGameMode();
        this.selectedMode = 'card-selected';
        this.stepperModalComponent.isSoloModeChosen = true;
        this.selectGameModeService.updateGameMode(!this.isSoloModeChosen);
        this.stepper.next();
    }

    selectCreateMultiMode(): void {
        this.clearGameMode();
        this.selectedMode = 'card-selected';
        this.stepperModalComponent.isCreateMultiModeChosen = true;
        this.selectGameModeService.updateGameMode(this.isSoloModeChosen);
        this.stepper.next();
    }

    selectJoinMultiMode(): void {
        this.clearGameMode();
        this.selectedMode = 'card-selected';
        this.stepperModalComponent.isJoinMultiModeChosen = true;
        this.selectGameModeService.updateGameMode(this.isSoloModeChosen);
        this.stepper.next();
        this.clientSocketService.getWaitingGames();
    }
}
