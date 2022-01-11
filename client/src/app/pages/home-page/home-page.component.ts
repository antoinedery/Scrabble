import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameModes } from '@app/classes/enums/enums';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { ScoreModalComponent } from '@app/components/score-modal/score-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private gameModeDialog: MatDialog,
        private clientSocketService: ClientSocketService,
        private selectGameModeService: SelectGameModeService,
    ) {
        clientSocketService.initializeHomeListeners();
        this.clientSocketService.updateNameList();
    }

    openDialog(): void {
        this.gameModeDialog.open(StepperModalComponent, { panelClass: 'custom-dialog-container', disableClose: true });
    }

    launchScore(): void {
        this.clientSocketService.updateScoreList(GameModes.ClassicMode);
        this.clientSocketService.updateScoreList(GameModes.Log2990Mode);
        this.gameModeDialog.open(ScoreModalComponent, { panelClass: 'custom-dialog-container' });
    }

    classicModeChosen(): void {
        this.selectGameModeService.isLOG2990ModeChosen = false;
    }

    lOG2990ModeChosen(): void {
        this.selectGameModeService.isLOG2990ModeChosen = true;
    }
}
