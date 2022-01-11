import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuitModalComponent } from '@app/components/informative-panel-folder/quit-modal/quit-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Component({
    selector: 'app-informative-panel',
    templateUrl: './informative-panel.component.html',
    styleUrls: ['./informative-panel.component.scss'],
})
export class InformativePanelComponent implements OnInit {
    @ViewChild('quitButtonContainer') quitButtonContainer: ElementRef;
    reserveRemainingLetters: number = 0;

    constructor(
        public modal: MatDialog,
        private letterReserveService: LetterReserveService,
        private turnHandlerService: TurnHandlerService,
        private mousePlacementService: MousePlacementService,
        public selectGameModeService: SelectGameModeService,
        private clientSocketService: ClientSocketService,
        private changeDetectorRef: ChangeDetectorRef,
        private gameManagerService: GameManagerService,
    ) {
        this.gameManagerService.playerDisconnectionObservable.subscribe(() => {
            this.initializeSubscribeSoloMode();
        });
    }

    ngOnInit(): void {
        if (this.selectGameModeService.isSoloModeChosen) this.initializeSubscribeSoloMode();
        else this.initializeSubscribeMultiplayerMode();
    }

    initializeSubscribeSoloMode(): void {
        this.reserveRemainingLetters = this.letterReserveService.letterReserveTotalSize;
        this.letterReserveService.letterReserveTotalSizeObservable.subscribe((value) => {
            this.reserveRemainingLetters = value;
        });

        this.turnHandlerService.endGameObservable.subscribe(() => {
            this.changeQuitButton();
        });
    }

    initializeSubscribeMultiplayerMode(): void {
        this.clientSocketService.updateReserveTotalSizeObservable.subscribe((value) => {
            this.reserveRemainingLetters = value;
            this.changeDetectorRef.detectChanges();
        });

        this.selectGameModeService.endGameObservable.subscribe(() => {
            this.changeQuitButton();
        });
    }

    openDialog(): void {
        this.mousePlacementService.cancelPlacement();
        this.modal.open(QuitModalComponent, { panelClass: 'custom-dialog-container' });
    }

    changeQuitButton(): void {
        this.quitButtonContainer.nativeElement.innerText = 'Quitter';
    }
}
