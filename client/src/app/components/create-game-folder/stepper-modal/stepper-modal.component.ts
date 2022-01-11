import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';
import { DictionaryService } from '@app/services/dictionary.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-stepper-modal',
    templateUrl: './stepper-modal.component.html',
    styleUrls: ['./stepper-modal.component.scss'],
})
export class StepperModalComponent implements OnDestroy {
    @ViewChild(MatStepper) stepper: MatStepper;
    isGameReadyToLaunch: boolean = false;
    isSoloModeChosen: boolean = false;
    isCreateMultiModeChosen: boolean = false;
    isJoinMultiModeChosen: boolean = false;
    createWaitingGameObservable: Subject<boolean> = new Subject();
    createRoomObservable: Subject<boolean> = new Subject();

    dictionaryImportSub: Subscription;

    constructor(
        private matDialog: MatDialog,
        private playerSettingsService: PlayerSettingsService,
        private nameValidatorService: NameValidatorService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private gameManagerService: GameManagerService,
        private router: Router,
        private clientSocketService: ClientSocketService,
        private playerNameComparatorService: PlayerNameComparatorService,
        private chgRef: ChangeDetectorRef,
        private selectGameModeService: SelectGameModeService,
        private dictionaryService: DictionaryService,
        private objectivesValidationService: ObjectivesValidationService,
        private dictionaryNameValidator: DictionaryNameValidatorService,
    ) {
        this.clientSocketService.roomEndedByDictionaryRemoval.subscribe(() => {
            this.stepper.next();
        });

        this.dictionaryImportSub = this.clientSocketService.dictionaryImportObservable.subscribe((result) => {
            while (!this.dictionaryService.createChosenDictionary(result));
            this.launchGame();
        });
    }

    ngOnDestroy(): void {
        this.dictionaryImportSub.unsubscribe();
    }

    confirmPlayerName(): void {
        if (!this.nameValidatorService.playerNameIsValid) return;
        this.stepper.next();
    }

    launchSoloGame(): void {
        if (!this.virtualPlayerSettingsService.gameModeIsSelected) return;
        const dictionaryName = this.dictionaryService.dictionaryName;
        if (this.clientSocketService.id !== '' && dictionaryName !== 'Français') {
            if (!this.dictionaryNameValidator.checkTitleExist(dictionaryName)) this.stepper.next();
            else this.clientSocketService.getDictionaryForClient();
            return;
        }
        while (!this.dictionaryService.createDefaultDictionary());
        this.launchGame();
    }

    launchGame() {
        this.gameManagerService.assignNames(true);

        if (this.selectGameModeService.isLOG2990ModeChosen) this.initializeObjectives();

        this.gameManagerService.initializeSoloGame();
        this.closeModal();
        this.router.navigate(['/game']);
    }

    initializeObjectives(): void {
        this.playerSettingsService.resetAllFullfilledProperties();
        const objectivesTaken = this.playerSettingsService.assignObjectives();
        this.virtualPlayerSettingsService.assignPrivateObjectiveToVirtualPlayer(objectivesTaken);
        this.objectivesValidationService.resetData();
    }

    resetBotNames(): void {
        this.gameManagerService.virtualPlayerDifficultyObservable.next(false);
    }

    launchMultiGame(): void {
        if (
            this.playerNameComparatorService.areNameIdentical ||
            !this.nameValidatorService.playerNameIsValid ||
            this.gameManagerService.isGameInitialize
        )
            return;
        this.gameManagerService.isGameInitialize = true;
        this.clientSocketService.joinRoom(this.playerNameComparatorService.game.socketId, this.playerSettingsService.name);
    }

    convertToSoloGame(): void {
        this.isSoloModeChosen = true;
        this.isCreateMultiModeChosen = false;
        this.selectGameModeService.updateGameMode(this.isSoloModeChosen);
        this.chgRef.detectChanges();
        this.endRoom();
    }

    closeModal(): void {
        this.matDialog.closeAll();
        this.chgRef.detectChanges();
        this.nameValidatorService.playerNameIsValid = false;
        this.virtualPlayerSettingsService.gameModeIsSelected = false;
    }

    createRoom(): void {
        if (!this.nameValidatorService.playerNameIsValid) return;
        this.stepper.next();
        this.createWaitingGameObservable.next(true);
        this.gameManagerService.isGameInitialize = true;
    }

    endRoom(): void {
        this.clientSocketService.endRoom();
        this.gameManagerService.isGameInitialize = false;
    }
}
