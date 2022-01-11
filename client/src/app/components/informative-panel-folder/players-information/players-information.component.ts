import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { ConsolePlacementService } from '@app/services/players-placements/current/console/console-placement.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { BeginnerPlacementCreatorService } from '@app/services/players-placements/virtual/beginner/beginner-placement-creator.service';
import { ExpertPlacementCreatorService } from '@app/services/players-placements/virtual/expert/expert-placement-creator.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Component({
    selector: 'app-players-information',
    templateUrl: './players-information.component.html',
    styleUrls: ['./players-information.component.scss'],
})
export class PlayersInformationComponent implements OnInit {
    @Input() reserveRemainingLetters: number = 0;
    currentPlayerName: string = '';
    opponentPlayerName: string = '';
    playerTurnToPlay: boolean = false;
    opponentTurnToPlay: boolean = false;
    playerScore: number = 0;
    opponentScore: number = 0;
    playerRemainingLetters: number = LETTERS_RACK_SIZE;
    opponentRemainingLetters: number = LETTERS_RACK_SIZE;

    constructor(
        public mouseEventHandlerService: MouseEventHandlerService,
        public playerSettingsService: PlayerSettingsService,
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private gameManagerService: GameManagerService,
        private turnHandlerService: TurnHandlerService,
        private mousePlacementService: MousePlacementService,
        private consolePlacementService: ConsolePlacementService,
        private beginnerPlacementCreatorService: BeginnerPlacementCreatorService,
        private clientSocketService: ClientSocketService,
        private selectGameModeService: SelectGameModeService,
        private expertPlacementCreatorService: ExpertPlacementCreatorService,
        private chDecRef: ChangeDetectorRef,
        private objectivesValidationService: ObjectivesValidationService,
        private nameValidatorService: NameValidatorService,
    ) {
        this.playerTurnToPlay = this.playerSettingsService.hasToPlay;
        this.opponentTurnToPlay = this.virtualPlayerSettingsService.hasToPlay;

        this.nameValidatorService.nameChange.subscribe((value) => {
            this.opponentPlayerName = value;
        });

        this.gameManagerService.playerDisconnectionObservable.subscribe(() => {
            this.initializeSubscribeSoloMode();
        });
    }

    ngOnInit(): void {
        this.assignNames();
        if (this.selectGameModeService.isSoloModeChosen) this.initializeSubscribeSoloMode();
        else this.initializeSubscribeMultiplayerMode();
    }

    assignNames(): void {
        if (this.gameManagerService.isCurrentPlayerTheGameCreator) {
            this.currentPlayerName = this.gameManagerService.gameCreatorName;
            this.opponentPlayerName = this.gameManagerService.joiningPlayerName;
        } else {
            this.currentPlayerName = this.gameManagerService.joiningPlayerName;
            this.opponentPlayerName = this.gameManagerService.gameCreatorName;
        }
    }

    initializeSubscribeSoloMode(): void {
        this.playerSettingsService.hasToPlayObservable.subscribe((value) => {
            this.playerTurnToPlay = value;
        });

        this.virtualPlayerSettingsService.hasToPlayObservable.subscribe((value) => {
            this.opponentTurnToPlay = value;
        });

        this.consolePlacementService.scoreObservable.subscribe((value) => {
            this.playerScore += value;
            this.playerSettingsService.score = this.playerScore;
        });

        this.mousePlacementService.scoreObservable.subscribe((value) => {
            this.playerScore += value;
            this.playerSettingsService.score = this.playerScore;
        });

        this.objectivesValidationService.realPlayerBonusObservable.subscribe((value) => {
            this.playerScore += value;
            this.playerSettingsService.score = this.playerScore;
        });

        this.objectivesValidationService.virtualPlayerBonusObservable.subscribe((value) => {
            this.opponentScore += value;
            this.virtualPlayerSettingsService.score = this.opponentScore;
        });

        this.beginnerPlacementCreatorService.scoreObservable.subscribe((value) => {
            this.opponentScore += value;
            this.virtualPlayerSettingsService.score = this.opponentScore;
        });

        this.expertPlacementCreatorService.scoreObservable.subscribe((value) => {
            this.opponentScore += value;
            this.virtualPlayerSettingsService.score = this.opponentScore;
        });

        this.turnHandlerService.endGamePlayerBonusObservable.subscribe((value) => {
            this.playerSettingsService.score += value;
            this.playerScore = this.playerSettingsService.score;
            if (this.playerSettingsService.score < 0) {
                this.playerSettingsService.score = 0;
                this.playerScore = this.playerSettingsService.score;
            }
        });

        this.turnHandlerService.endGameVirtualPlayerObservable.subscribe((value) => {
            this.virtualPlayerSettingsService.score += value;
            this.opponentScore = this.virtualPlayerSettingsService.score;
            if (this.virtualPlayerSettingsService.score < 0) {
                this.virtualPlayerSettingsService.score = 0;
                this.opponentScore = this.virtualPlayerSettingsService.score;
            }
        });

        this.playerSettingsService.rackSizeObservable.subscribe((value) => {
            this.playerRemainingLetters = value;
        });

        this.virtualPlayerSettingsService.rackSizeObservable.subscribe((value) => {
            this.opponentRemainingLetters = value;
        });
    }

    initializeSubscribeMultiplayerMode(): void {
        this.clientSocketService.playerScoreObservable.subscribe((value) => {
            this.playerScore = value;
            this.playerSettingsService.score = this.playerScore;
            this.chDecRef.detectChanges();
        });

        this.clientSocketService.opponentScoreObservable.subscribe((value) => {
            this.opponentScore = value;
            this.chDecRef.detectChanges();
        });

        this.clientSocketService.playerScoreObservable.subscribe((value) => {
            this.playerScore = value;
        });

        this.selectGameModeService.onlinePlayerTurnObservable.subscribe((value) => {
            this.playerTurnToPlay = value;
            this.opponentTurnToPlay = !value;
            this.chDecRef.detectChanges();
        });

        this.clientSocketService.playerRackSizeObservable.subscribe((value) => {
            this.playerRemainingLetters = value;
        });

        this.clientSocketService.opponentRackSizeObservable.subscribe((value) => {
            this.opponentRemainingLetters = value;
        });
    }
}
