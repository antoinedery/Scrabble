import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Reserve } from '@app/classes/interfaces/tile';
import { EndGameComponent } from '@app/components/informative-panel-folder//end-game/end-game.component';
import { CountdownTimerComponent } from '@app/components/informative-panel-folder/countdown-timer/countdown-timer.component';
import { InformativePanelComponent } from '@app/components/informative-panel-folder/informative-panel/informative-panel.component';
import { PlayersInformationComponent } from '@app/components/informative-panel-folder/players-information/players-information.component';
import { QuitModalComponent } from '@app/components/informative-panel-folder/quit-modal/quit-modal.component';
import { ZoomSliderComponent } from '@app/components/informative-panel-folder/zoom-slider/zoom-slider.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

describe('InformativePanelComponent', () => {
    let component: InformativePanelComponent;
    let fixture: ComponentFixture<InformativePanelComponent>;
    let quitDialog: MatDialog;
    let letterReserveService: LetterReserveService;
    let turnHandlerService: TurnHandlerService;
    let selectGameModeService: SelectGameModeService;
    let clientSocketService: ClientSocketService;

    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                InformativePanelComponent,
                PlayersInformationComponent,
                QuitModalComponent,
                ZoomSliderComponent,
                CountdownTimerComponent,
                EndGameComponent,
            ],
            imports: [MatDialogModule, MatSliderModule, RouterTestingModule, MatCardModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformativePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        quitDialog = TestBed.inject(MatDialog);
        letterReserveService = TestBed.inject(LetterReserveService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        clientSocketService = TestBed.inject(ClientSocketService);
        component.initializeSubscribeSoloMode();
        component.initializeSubscribeMultiplayerMode();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the open from MatDialog', () => {
        spyOn(quitDialog, 'open');
        const endTurnButton = fixture.debugElement.query(By.css('#quit-button')).nativeElement;
        endTurnButton.click();
        expect(quitDialog.open).toHaveBeenCalled();
    });

    it('onInit should initializeSubscribeSoloMode when solo mode is selected', () => {
        selectGameModeService.isSoloModeChosen = true;
        const initializeSpy = spyOn(component, 'initializeSubscribeSoloMode');
        component.ngOnInit();
        expect(initializeSpy).toHaveBeenCalled();
    });

    it('should update the letter reserve quantity when value changes in LetterReserveService (subscribe)', () => {
        component.initializeSubscribeSoloMode();
        const reserve: Reserve = { tile: { letter: 'A', score: 2 }, quantity: 2 };
        const expectedReserveQuantity = 101;
        letterReserveService.decrementTileQuantity(reserve);
        expect(component.reserveRemainingLetters).toEqual(expectedReserveQuantity);
    });

    it('should update the display of the letter reserve size (subscribe)', () => {
        selectGameModeService.isSoloModeChosen = false;
        component.initializeSubscribeMultiplayerMode();
        clientSocketService.updateReserveTotalSizeObservable.next(1);
        expect(component.reserveRemainingLetters).toEqual(1);
    });

    it('changeQuitButton should be called when endGameObservable subscribe is triggered', () => {
        component.initializeSubscribeMultiplayerMode();
        const changeQuitButtonSpy = spyOn(component, 'changeQuitButton');
        selectGameModeService.endGameObservable.next();
        expect(changeQuitButtonSpy).toHaveBeenCalled();
    });

    it('changeQuitButton function should change inner text of button', () => {
        component.changeQuitButton();
        expect(component.quitButtonContainer.nativeElement.innerText).toBe('Quitter');
    });

    it('should call changeQuitButton', () => {
        component.initializeSubscribeSoloMode();
        const changeQuitButtonSpy = spyOn(component, 'changeQuitButton');
        turnHandlerService.endGameObservable.next();
        expect(changeQuitButtonSpy).toHaveBeenCalled();
    });

    it('initializeSubscribeSoloMode should be called on subscribe', () => {
        const gameManagerService = TestBed.inject(GameManagerService);
        const initializeSubscribeSoloModeSpy = spyOn(component, 'initializeSubscribeSoloMode');
        gameManagerService.playerDisconnectionObservable.next();
        expect(initializeSubscribeSoloModeSpy).toHaveBeenCalled();
    });
});
