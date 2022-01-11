// Disable de lint autorisé par chargés dans les tests
/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { HALF_PROBABILITY, PERCENT, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { VirtualPlayerDifficulty } from '@app/classes/enums/enums';
import { MultiPlayerGameInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { SelectGameMode } from '@app/classes/select-game-mode';
import { DisplayMessageService } from '@app/services/display-message.service';
import { InputChatService } from '@app/services/input-chat.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { BeginnerVirtualPlayerActionsService } from '@app/services/virtual-player-actions/beginner/beginner-virtual-player-actions.service';
import { ExpertVirtualPlayerActionsService } from '@app/services/virtual-player-actions/expert/expert-virtual-player-actions.service';
import { Subject, Subscription } from 'rxjs';
import { ClientSocketService } from './client-socket.service';
import { DictionaryService } from './dictionary.service';
import { SelectGameModeService } from './select-game-mode.service';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService extends SelectGameMode {
    isGameInitialize: boolean = false;
    gameCreatorName: string = '';
    joiningPlayerName: string = '';
    isCurrentPlayerTheGameCreator: boolean = false;
    virtualPlayerDifficulty = VirtualPlayerDifficulty.None;
    virtualPlayerDifficultyObservable: Subject<boolean> = new Subject();
    playerDisconnectionObservable: Subject<string> = new Subject();

    virtualPlayerActionSubscription: Subscription;

    constructor(
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private letterReserveService: LetterReserveService,
        private displayMessageService: DisplayMessageService,
        private dictionaryService: DictionaryService,
        private beginnerVirtualPlayerActionsService: BeginnerVirtualPlayerActionsService,
        private expertVirtualPlayerActionsService: ExpertVirtualPlayerActionsService,
        private turnHandler: TurnHandlerService,
        private playAreaService: PlayAreaService,
        private turnHandlerService: TurnHandlerService,
        private inputChatService: InputChatService,
        private clientSocketService: ClientSocketService,
        public selectGameModeService: SelectGameModeService,
    ) {
        super(selectGameModeService);

        this.clientSocketService.callSelectNameObservable.subscribe((value) => {
            this.assignNames(value);
        });

        this.clientSocketService.multiToSoloObservable.subscribe((value) => {
            this.convertMultiToSolo(value);
        });
    }

    enableVirtualPlayer() {
        this.virtualPlayerActionSubscription = this.virtualPlayerSettingsService.hasToPlayObservable.subscribe((value) => {
            /* istanbul ignore else */
            if (value) this.selectVirtualPlayerAction();
        });
    }

    disableVirtualPlayer() {
        this.virtualPlayerActionSubscription.unsubscribe();
    }

    leaveGame() {
        this.turnHandler.clearTimer();
        this.isGameInitialize = false;
        if (this.selectGameModeService.isSoloModeChosen) {
            this.disableVirtualPlayer();
            return;
        }
        this.clientSocketService.leaveGame();
    }

    initializeSoloGame(): void {
        this.enableVirtualPlayer();
        this.isGameInitialize = true;
        this.letterReserveService.createReserve();
        this.playAreaService.randomizeBoard();
        this.selectFirstPlayerToPlay();
        this.turnHandlerService.turnsPassedCounter = 0;
        this.displayMessageService.clearCommunicationBox();
        this.turnHandler.resetTimer();
        this.inputChatService.debugModeIsActivated = false;
        /* istanbul ignore else */
        if (this.virtualPlayerSettingsService.hasToPlay) this.selectVirtualPlayerAction();
    }

    selectFirstPlayerToPlay(): void {
        if (RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(0, PERCENT) < HALF_PROBABILITY) {
            this.virtualPlayerSettingsService.hasToPlay = false;
            this.playerSettingsService.hasToPlay = true;
            this.playerSettingsService.letters = this.letterReserveService.assignLettersToPlayer();
            this.virtualPlayerSettingsService.letters = this.letterReserveService.assignLettersToPlayer();
            this.turnHandler.activePlayerName = this.playerSettingsService.name;
        } else {
            this.playerSettingsService.hasToPlay = false;
            this.virtualPlayerSettingsService.hasToPlay = true;
            this.virtualPlayerSettingsService.letters = this.letterReserveService.assignLettersToPlayer();
            this.playerSettingsService.letters = this.letterReserveService.assignLettersToPlayer();
            this.turnHandler.activePlayerName = this.virtualPlayerSettingsService.name;
        }
    }

    selectVirtualPlayerAction(): void {
        if (this.virtualPlayerDifficulty === VirtualPlayerDifficulty.Beginner) this.beginnerVirtualPlayerActionsService.executeAction();
        else this.expertVirtualPlayerActionsService.executeAction();
    }

    assignNames(isCurrentPlayerTheGameCreator: boolean): void {
        this.isCurrentPlayerTheGameCreator = isCurrentPlayerTheGameCreator;
        if (this.isSoloModeChosen) {
            this.gameCreatorName = this.playerSettingsService.name;
            this.joiningPlayerName = this.virtualPlayerSettingsService.name;
        } else {
            this.gameCreatorName = this.clientSocketService.gameRoom.gameCreatorName;
            this.joiningPlayerName = this.clientSocketService.gameRoom.joiningPlayerName;
        }
    }

    convertMultiToSolo(gameInfos: MultiPlayerGameInfos) {
        if (gameInfos.turnHandlerInfos.gameEnded) return;
        const isPlayerTurn = gameInfos.existingPlayer.isMyTurn;
        this.enableVirtualPlayer();
        this.dictionaryService.createDictionaryWithEndGameData(gameInfos.dataInfos);
        this.playerDisconnectionObservable.next(gameInfos.quittingPlayer.name);
        this.selectGameModeService.updateGameMode(true);
        this.virtualPlayerDifficulty = VirtualPlayerDifficulty.Beginner;
        if (gameInfos.quittingPlayer.isMyTurn) this.displayMessageService.addMessageList(gameInfos.quittingPlayer.name, 'Passer son tour');
        this.playerSettingsService.setPropertiesForGameConversionSettings(gameInfos.existingPlayer, gameInfos.publicObjectives);
        this.virtualPlayerSettingsService.setPropertiesForGameConversion(gameInfos.quittingPlayer);
        this.turnHandlerService.setPropertiesForGameConversion(gameInfos.turnHandlerInfos, isPlayerTurn);
    }
}
