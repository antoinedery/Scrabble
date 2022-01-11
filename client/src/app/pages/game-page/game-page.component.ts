import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(
        router: Router,
        public selectGameModeService: SelectGameModeService,
        private gameManagerService: GameManagerService,
        private clientSocketService: ClientSocketService,
        private matDialog: MatDialog,
    ) {
        this.clientSocketService.connectedServerObservable.subscribe(() => {
            this.matDialog
                .open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' })
                .afterClosed()
                .subscribe(() => {
                    this.gameManagerService.leaveGame();
                    router.navigate(['/home']);
                });
        });
        /* istanbul ignore else */
        if (!gameManagerService.isGameInitialize) {
            router.navigate(['/home']);
            return;
        }
    }

    @HostListener('window:popstate', ['$event'])
    onPopState() {
        this.gameManagerService.leaveGame();
    }
}
