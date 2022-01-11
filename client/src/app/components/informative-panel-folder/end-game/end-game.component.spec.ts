import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { EndGameComponent } from './end-game.component';

describe('EndGameComponent', () => {
    let component: EndGameComponent;
    let fixture: ComponentFixture<EndGameComponent>;
    let turnHandlerService: TurnHandlerService;
    let selectGameModeService: SelectGameModeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndGameComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EndGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        turnHandlerService = TestBed.inject(TurnHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        component.initializeSubscribeSoloMode();
        component.initializeSubscribeMultiplayerMode();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onInit should initializeSubscribeSoloMode when solo mode is selected', () => {
        selectGameModeService.isSoloModeChosen = true;
        const initializeSpy = spyOn(component, 'initializeSubscribeSoloMode');
        component.ngOnInit();
        expect(initializeSpy).toHaveBeenCalled();
    });

    it('should call displayWinnerPanel from solo mode', () => {
        component.initializeSubscribeSoloMode();
        const displayWinnerPanelSpy = spyOn(component, 'displayWinnerPanel');
        turnHandlerService.endGameObservable.next();
        expect(displayWinnerPanelSpy).toHaveBeenCalled();
    });

    it('displayWinnerPanel function should make visible winner of game', () => {
        spyOn(component, 'sendScoreToDB');
        component.displayWinnerPanel();
        expect(component.winnerPanelContainer.nativeElement.style.visibility).toBe('visible');
        expect(component.sendScoreToDB).toHaveBeenCalled();
    });

    it('initializeSubscribeSoloMode should update winnerPlayerName through subscribe', () => {
        component.initializeSubscribeSoloMode();
        turnHandlerService.winnerPlayerNameObservable.next('Winner Winner Chicken Dinner');
        expect(component.winnerPlayerName).toEqual('Winner Winner Chicken Dinner');
    });

    it('winnerPlayerName property should be updated through endGameObservable subscribe', () => {
        selectGameModeService = TestBed.inject(SelectGameModeService);
        component.winnerPlayerName = '';
        const expectedPlayerName = 'WinnerWinnerChickenDinner';
        selectGameModeService.endGameObservable.next(expectedPlayerName);
        expect(component.winnerPlayerName).toEqual(expectedPlayerName);
    });

    it('sendScoreToDB should call sendScoreToAdd from clientSocketService', () => {
        const clientSocketService = TestBed.inject(ClientSocketService);
        const sendScoreToAddSpy = spyOn(clientSocketService, 'sendScoreToAdd');
        component.sendScoreToDB();
        expect(sendScoreToAddSpy).toHaveBeenCalled();
    });

    it('initializeSubscribeSoloMode should be called on subscribe', () => {
        const gameManagerService = TestBed.inject(GameManagerService);
        const initializeSubscribeSoloModeSpy = spyOn(component, 'initializeSubscribeSoloMode');
        gameManagerService.playerDisconnectionObservable.next();
        expect(initializeSubscribeSoloModeSpy).toHaveBeenCalled();
    });

    it('opponentPlayerName  should be assigned on subscribe', () => {
        component.opponentPlayerName = '';
        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        virtualPlayerSettingsService.name = 'TEST';
        virtualPlayerSettingsService.virtualPlayerNameSetterObservable.next();
        expect(component.opponentPlayerName).toEqual('TEST');
    });
});
