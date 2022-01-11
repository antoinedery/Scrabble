import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameManagerService } from '@app/services/game-manager.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-quit-modal',
    templateUrl: './quit-modal.component.html',
    styleUrls: ['./quit-modal.component.scss'],
})
export class QuitModalComponent {
    constructor(private matDialog: MatDialog, public selectGameModeService: SelectGameModeService, private gameManagerService: GameManagerService) {}

    closeModal() {
        this.matDialog.closeAll();
    }

    leaveMultiGame(): void {
        this.closeModal();
        this.gameManagerService.leaveGame();
    }
}
