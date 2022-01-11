import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { ConsolePlacementService } from '@app/services/players-placements/current/console/console-placement.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { BeginnerPlacementCreatorService } from '@app/services/players-placements/virtual/beginner/beginner-placement-creator.service';
import { ExpertPlacementCreatorService } from '@app/services/players-placements/virtual/expert/expert-placement-creator.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { PlayersInformationComponent } from './players-information.component';

describe('PlayersInformationComponent', () => {
    let component: PlayersInformationComponent;
    let fixture: ComponentFixture<PlayersInformationComponent>;
    let playerSettingsService: PlayerSettingsService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let turnHandlerService: TurnHandlerService;
    let gameManagerService: GameManagerService;
    let beginnerPlacementCreatorService: BeginnerPlacementCreatorService;
    let expertPlacementCreatorService: ExpertPlacementCreatorService;
    let clientSocketService: ClientSocketService;
    let selectGameModeService: SelectGameModeService;
    let objectivesValidationService: ObjectivesValidationService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayersInformationComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        gameManagerService = TestBed.inject(GameManagerService);
        gameManagerService.isCurrentPlayerTheGameCreator = true;
        gameManagerService.gameCreatorName = 'creatorName';
        gameManagerService.joiningPlayerName = 'joinerName';

        playerSettingsService = TestBed.inject(PlayerSettingsService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);

        fixture = TestBed.createComponent(PlayersInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        turnHandlerService = TestBed.inject(TurnHandlerService);
        beginnerPlacementCreatorService = TestBed.inject(BeginnerPlacementCreatorService);
        expertPlacementCreatorService = TestBed.inject(ExpertPlacementCreatorService);
        clientSocketService = TestBed.inject(ClientSocketService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        objectivesValidationService = TestBed.inject(ObjectivesValidationService);
        component.initializeSubscribeSoloMode();
        component.initializeSubscribeMultiplayerMode();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('opponentName should be updated from nameChange (subscribe)', () => {
        component.opponentPlayerName = 'Before';
        const expectedName = 'After';
        const nameValidatorService = TestBed.inject(NameValidatorService);
        nameValidatorService.nameChange.next(expectedName);
        expect(component.opponentPlayerName).toEqual(expectedName);
    });

    it('endTurn should update player turns', () => {
        playerSettingsService.hasToPlay = false;
        virtualPlayerSettingsService.hasToPlay = true;
        turnHandlerService.endTurn();
        expect(component.playerTurnToPlay).toEqual(true);
    });

    it('should update the player score when value changes in mousePlacementService (subscribe)', () => {
        const mousePlacementService = TestBed.inject(MousePlacementService);
        const expectedScore = 50;
        mousePlacementService.scoreObservable.next(expectedScore);
        expect(component.playerScore).toEqual(expectedScore);
    });

    it('should update the player score when value changes in consolePlacementService (subscribe)', () => {
        const consolePlacementService = TestBed.inject(ConsolePlacementService);
        const expectedScore = 50;
        consolePlacementService.scoreObservable.next(expectedScore);
        expect(component.playerScore).toEqual(expectedScore);
    });

    it('should update the virtual player score when value changes in placeLetterVirtualPlayerService (subscribe)', () => {
        const expectedScore = 50;
        beginnerPlacementCreatorService.scoreObservable.next(expectedScore);
        expect(component.opponentScore).toEqual(expectedScore);
    });

    it('should update the virtual player score when value changes in placeLetterVirtualPlayerService (subscribe)', () => {
        const expectedScore = 50;
        expertPlacementCreatorService.scoreObservable.next(expectedScore);
        expect(component.opponentScore).toEqual(expectedScore);
    });

    it('realPlayerBonusObservable subscribe should update the player score when value changes in objectivesValidationService', () => {
        const expectedScore = 50;
        objectivesValidationService.realPlayerBonusObservable.next(expectedScore);
        expect(component.playerScore).toEqual(expectedScore);
        expect(playerSettingsService.score).toEqual(expectedScore);
    });

    it('virtualPlayerBonusObservable subscribe should update the virtual player score when value changes in objectivesValidationService', () => {
        const expectedScore = 50;
        objectivesValidationService.virtualPlayerBonusObservable.next(expectedScore);
        expect(component.opponentScore).toEqual(expectedScore);
        expect(virtualPlayerSettingsService.score).toEqual(expectedScore);
    });

    it('should update player bonus', () => {
        const bonusScore = 50;
        turnHandlerService.endGamePlayerBonusObservable.next(bonusScore);
        expect(playerSettingsService.score).toEqual(bonusScore);
    });

    it('should update virtual player bonus', () => {
        const bonusScore = 50;
        turnHandlerService.endGameVirtualPlayerObservable.next(bonusScore);
        expect(virtualPlayerSettingsService.score).toEqual(bonusScore);
    });

    it('should set player score to 0', () => {
        const bonusScore = -50;
        turnHandlerService.endGamePlayerBonusObservable.next(bonusScore);
        expect(playerSettingsService.score).toEqual(0);
    });

    it('should set virtual player score to 0', () => {
        const bonusScore = -50;
        turnHandlerService.endGameVirtualPlayerObservable.next(bonusScore);
        expect(virtualPlayerSettingsService.score).toEqual(0);
    });

    it('should assign the correct name depending on boolean value', () => {
        const creatorName = 'creatorName';
        const joinerName = 'joinerName';
        gameManagerService.isCurrentPlayerTheGameCreator = true;
        gameManagerService.gameCreatorName = 'creatorName';
        gameManagerService.joiningPlayerName = 'joinerName';
        expect(component.currentPlayerName).toBe(creatorName);
        expect(component.opponentPlayerName).toBe(joinerName);
        gameManagerService.isCurrentPlayerTheGameCreator = false;
        fixture = TestBed.createComponent(PlayersInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.opponentPlayerName).toBe(creatorName);
        expect(component.currentPlayerName).toBe(joinerName);
    });

    it('playerScore should be updated through subscribe (multiplayer mode)', () => {
        const expectedScore = 25;
        clientSocketService.playerScoreObservable.next(expectedScore);
        expect(component.playerScore).toBe(expectedScore);
    });

    it('playerTurnToPlay should be updated through subscribe', () => {
        component.initializeSubscribeMultiplayerMode();
        const expectedBoolean = false;
        clientSocketService.hasToPlayObservable.next(expectedBoolean);
        expect(component.playerTurnToPlay).toBe(expectedBoolean);
    });
    it('ngOnInit should call initializeSubscribeMultiplayerMode is selectGameMode is not on solo mode', () => {
        const initializeSubscribeMultiplayerModeSpy = spyOn(component, 'initializeSubscribeMultiplayerMode');
        selectGameModeService.isSoloModeChosen = false;
        component.ngOnInit();
        expect(initializeSubscribeMultiplayerModeSpy).toHaveBeenCalled();
    });

    it('ngOnInit should call initializeSubscribeSoloMode is selectGameMode is on solo mode', () => {
        const initializeSubscribeSoloModeSpy = spyOn(component, 'initializeSubscribeSoloMode');
        selectGameModeService.isSoloModeChosen = true;
        component.ngOnInit();
        expect(initializeSubscribeSoloModeSpy).toHaveBeenCalled();
    });

    it('playerRemainingLetters should be updated through subscribe (solo)', () => {
        component.initializeSubscribeSoloMode();
        const expectedRackLength = 5;
        playerSettingsService.rackSizeObservable.next(expectedRackLength);
        expect(component.playerRemainingLetters).toEqual(expectedRackLength);
    });

    it('opponentRemainingLetters should be updated through subscribe (solo)', () => {
        component.initializeSubscribeSoloMode();
        const expectedRackLength = 5;
        virtualPlayerSettingsService.rackSizeObservable.next(expectedRackLength);
        expect(component.opponentRemainingLetters).toEqual(expectedRackLength);
    });

    it('playerRemainingLetters should be updated through subscribe (multi)', () => {
        component.initializeSubscribeMultiplayerMode();
        const expectedRackLength = 5;
        clientSocketService.playerRackSizeObservable.next(expectedRackLength);
        expect(component.playerRemainingLetters).toEqual(expectedRackLength);
    });

    it('opponentRemainingLetters should be updated through subscribe (multi)', () => {
        component.initializeSubscribeMultiplayerMode();
        const expectedRackLength = 5;
        clientSocketService.opponentRackSizeObservable.next(expectedRackLength);
        expect(component.opponentRemainingLetters).toEqual(expectedRackLength);
    });

    it('opponentScore should be updated through subscribe from clientSocketService when multiplayer mode is selected', () => {
        component.initializeSubscribeMultiplayerMode();
        const opponentScore = 5;
        clientSocketService.opponentScoreObservable.next(opponentScore);
        expect(component.opponentScore).toEqual(opponentScore);
    });

    it('player turns should be updated through subscribe from selectGameMode when multiplayer mode is selected', () => {
        component.initializeSubscribeMultiplayerMode();
        selectGameModeService.onlinePlayerTurnObservable.next(true);
        expect(component.playerTurnToPlay).toEqual(true);
        expect(component.opponentTurnToPlay).toEqual(false);
    });
});
