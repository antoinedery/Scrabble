import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent implements OnInit {
    @ViewChild('winnerPanelContainer') winnerPanelContainer: ElementRef;
    playerName: string = '';
    opponentPlayerName: string = '';
    winnerPlayerName: string = '';
    constructor(
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private turnHandlerService: TurnHandlerService,
        private selectGameModeService: SelectGameModeService,
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
        this.playerName = this.playerSettingsService.name;
        this.opponentPlayerName = this.virtualPlayerSettingsService.name;

        this.turnHandlerService.winnerPlayerNameObservable.subscribe((value) => {
            this.winnerPlayerName = value;
        });

        this.turnHandlerService.endGameObservable.subscribe(() => {
            this.displayWinnerPanel();
        });

        this.virtualPlayerSettingsService.virtualPlayerNameSetterObservable.subscribe(() => {
            this.opponentPlayerName = this.virtualPlayerSettingsService.name;
        });
    }

    initializeSubscribeMultiplayerMode(): void {
        this.playerName = this.clientSocketService.gameRoom.gameCreatorName;
        this.opponentPlayerName = this.clientSocketService.gameRoom.joiningPlayerName;

        this.selectGameModeService.endGameObservable.subscribe((value) => {
            this.winnerPlayerName = value;
            this.winnerPanelContainer.nativeElement.style.visibility = 'visible';
            this.changeDetectorRef.detectChanges();
        });
    }
    displayWinnerPanel(): void {
        this.sendScoreToDB();
        this.turnHandlerService.findWinnerPlayer();
        this.winnerPanelContainer.nativeElement.style.visibility = 'visible';
    }

    sendScoreToDB(): void {
        this.clientSocketService.sendScoreToAdd({ name: this.playerName, score: this.playerSettingsService.score, mode: 'Classic' });
    }
}
