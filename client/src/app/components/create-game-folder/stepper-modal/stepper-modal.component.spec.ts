import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { GameModeComponent } from '@app/components/create-game-folder/game-mode/game-mode.component';
import { GameSettingsComponent } from '@app/components/create-game-folder/game-settings/game-settings.component';
import { NameValidatorComponent } from '@app/components/create-game-folder/name-validator/name-validator.component';
import { VirtualPlayerSettingsComponent } from '@app/components/create-game-folder/virtual-player-settings/virtual-player-settings.component';
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
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { StepperModalComponent } from './stepper-modal.component';

describe('StepperModalComponent', () => {
    let component: StepperModalComponent;
    let fixture: ComponentFixture<StepperModalComponent>;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let turnHandlerService: TurnHandlerService;
    let playerNameComparatorService: PlayerNameComparatorService;
    let clientSocketService: ClientSocketService;
    let nameValidatorService: NameValidatorService;
    let gameManagerService: GameManagerService;
    let selectGameModeService: SelectGameModeService;
    let playerSettingsService: PlayerSettingsService;
    let objectivesValidationService: ObjectivesValidationService;
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                StepperModalComponent,
                GameModeComponent,
                GameSettingsComponent,
                VirtualPlayerSettingsComponent,
                MatStepper,
                NameValidatorComponent,
            ],
            imports: [
                MatDialogModule,
                RouterTestingModule,
                MatStepperModule,
                BrowserAnimationsModule,
                FormsModule,
                MatSlideToggleModule,
                MatCardModule,
                MatMenuModule,
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                VirtualPlayerSettingsService,
                PlayerSettingsService,
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StepperModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        playerNameComparatorService = TestBed.inject(PlayerNameComparatorService);
        clientSocketService = TestBed.inject(ClientSocketService);
        nameValidatorService = TestBed.inject(NameValidatorService);
        gameManagerService = TestBed.inject(GameManagerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        objectivesValidationService = TestBed.inject(ObjectivesValidationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('game page should be opened when gameModeIsSelected is set to true (if)', () => {
        const initializeSoloGameSpy = spyOn(gameManagerService, 'initializeSoloGame');
        const dictionaryService = TestBed.inject(DictionaryService);
        spyOn(dictionaryService, 'createDefaultDictionary').and.returnValue(true);
        virtualPlayerSettingsService.gameModeIsSelected = true;
        component.launchSoloGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
        expect(initializeSoloGameSpy).toHaveBeenCalled();
        turnHandlerService.clearTimerInterval();
    });

    it('launchSoloGame should call initializeObjectives() if LOG2990 mode is chosen', () => {
        const initializeSoloGameSpy = spyOn(gameManagerService, 'initializeSoloGame');
        const dictionaryService = TestBed.inject(DictionaryService);
        spyOn(dictionaryService, 'createDefaultDictionary').and.returnValue(true);
        virtualPlayerSettingsService.gameModeIsSelected = true;
        selectGameModeService.isLOG2990ModeChosen = true;
        const spy = spyOn(component, 'initializeObjectives');
        component.launchSoloGame();
        expect(spy).toHaveBeenCalled();
        expect(initializeSoloGameSpy).toHaveBeenCalled();
    });

    it('initializeObjectives should call resetAllFullfilledProperties, assignObjectives, assignPrivateObjectiveToVirtualPlayer and resetData', () => {
        const spy1 = spyOn(playerSettingsService, 'resetAllFullfilledProperties');
        const forcedReturnedValue: number[] = [1];
        const spy2 = spyOn(playerSettingsService, 'assignObjectives').and.returnValue(forcedReturnedValue);
        const spy3 = spyOn(virtualPlayerSettingsService, 'assignPrivateObjectiveToVirtualPlayer');
        const spy4 = spyOn(objectivesValidationService, 'resetData');
        component.initializeObjectives();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalledWith(forcedReturnedValue);
        expect(spy4).toHaveBeenCalled();
    });

    it('closeModal should not be call then gameModeSelected is set to false (else)', () => {
        const initializeSoloGameSpy = spyOn(gameManagerService, 'initializeSoloGame');
        const dictionaryService = TestBed.inject(DictionaryService);
        spyOn(dictionaryService, 'createDefaultDictionary').and.returnValue(true);
        spyOn(component, 'closeModal');
        virtualPlayerSettingsService.gameModeIsSelected = false;
        component.launchSoloGame();
        expect(initializeSoloGameSpy).not.toHaveBeenCalled();
        expect(component.closeModal).not.toHaveBeenCalled();
    });

    it('closeModal function should clear player name and selected game mode', () => {
        component.closeModal();
        expect(nameValidatorService.playerNameIsValid).toBe(false);
        expect(virtualPlayerSettingsService.gameModeIsSelected).toBe(false);
    });

    it('launchMultiGame should return undefined if both player names are identical', () => {
        playerNameComparatorService.areNameIdentical = true;
        expect(component.launchMultiGame()).toBeUndefined();
    });

    it('launchMultiGame should call joinRoom from ClientSocketService', () => {
        spyOn(clientSocketService, 'joinRoom');
        playerNameComparatorService.areNameIdentical = false;
        nameValidatorService.playerNameIsValid = true;
        const game: WaitingGame = {
            playerName: 'testName',
            timer: { minute: 1, second: 0 },
            dictionary: { title: 'Français', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        playerNameComparatorService.game = game;
        component.launchMultiGame();
        expect(clientSocketService.joinRoom).toHaveBeenCalled();
    });

    it('createRoom should return undefined if player name is not valid', () => {
        nameValidatorService.playerNameIsValid = false;
        expect(component.createRoom()).toBeUndefined();
    });

    it('createRoom should call createWaitingGame from createWaitingGamesService', () => {
        const createWaitingGameSpy = spyOn(component.createWaitingGameObservable, 'next');
        nameValidatorService.playerNameIsValid = true;
        component.createRoom();
        expect(createWaitingGameSpy).toHaveBeenCalled();
    });

    it('endRoom function should call endRoom from ClientSocketService', () => {
        const endRoomSpy = spyOn(clientSocketService, 'endRoom');
        component.endRoom();
        expect(endRoomSpy).toHaveBeenCalled();
    });

    it('confirmPlayerName should return if playerName is not valid', () => {
        nameValidatorService.playerNameIsValid = false;
        expect(component.confirmPlayerName()).toBeUndefined();
    });

    it('confirmPlayerName should change stepper page if playerName is valid', () => {
        const stepperNextSpy = spyOn(component.stepper, 'next');
        nameValidatorService.playerNameIsValid = true;
        component.confirmPlayerName();
        expect(stepperNextSpy).toHaveBeenCalled();
    });

    it('resetBotNames call next from virtualPlayerDifficultyObservable', () => {
        const observableNextSpy = spyOn(gameManagerService.virtualPlayerDifficultyObservable, 'next');
        component.resetBotNames();
        expect(observableNextSpy).toHaveBeenCalled();
    });

    it('convertToSoloGame should set booleans and call updateGameMode', () => {
        const endRoomSpy = spyOn(component, 'endRoom');
        component.convertToSoloGame();
        expect(component.isSoloModeChosen).toBeTrue();
        expect(component.isCreateMultiModeChosen).toBeFalse();
        expect(endRoomSpy).toHaveBeenCalled();
    });

    it('launchSoloGame should call getDictionaryForClient from clientSocketService if server is connected', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        const dictionaryNameValidator = TestBed.inject(DictionaryNameValidatorService);
        dictionaryService.dictionaryName = 'English';
        spyOn(dictionaryNameValidator, 'checkTitleExist').and.returnValue(true);
        spyOn(dictionaryService, 'createDefaultDictionary').and.returnValue(true);
        clientSocketService.id = '123abc';
        virtualPlayerSettingsService.gameModeIsSelected = true;
        const getDictionaryForClientSpy = spyOn(clientSocketService, 'getDictionaryForClient');
        component.launchSoloGame();
        expect(getDictionaryForClientSpy).toHaveBeenCalled();
    });

    it('launchSoloGame should return undefined if dictionary is deleted', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        const dictionaryNameValidator = TestBed.inject(DictionaryNameValidatorService);
        dictionaryService.dictionaryName = 'English';
        spyOn(dictionaryNameValidator, 'checkTitleExist').and.returnValue(false);
        spyOn(dictionaryService, 'createDefaultDictionary').and.returnValue(true);
        clientSocketService.id = '123abc';
        virtualPlayerSettingsService.gameModeIsSelected = true;
        component.launchSoloGame();
        expect(component.launchSoloGame()).toBeUndefined();
    });

    it('stepper next should be called from roomEndedByDictionaryRemoval (subscribe)', () => {
        const stepperNextSpy = spyOn(component.stepper, 'next');
        clientSocketService.roomEndedByDictionaryRemoval.next();
        expect(stepperNextSpy).toHaveBeenCalled();
    });

    it('launchGame should be called through dictionaryImportObservable subscribe', () => {
        const launchGameSpy = spyOn(component, 'launchGame');
        clientSocketService.dictionaryImportObservable.next({ title: '', description: '', words: [] });
        expect(launchGameSpy).toHaveBeenCalled();
    });
});
