import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { GameModeComponent } from '@app/components/create-game-folder/game-mode/game-mode.component';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { WaitingPlayerComponent } from '@app/components/create-game-folder/waiting-player/waiting-player.component';
import { DisplayWaitingGamesService } from '@app/services/display-waiting-games.service';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';
import { FindGamesComponent } from './find-games.component';

describe('FindGamesComponent', () => {
    let component: FindGamesComponent;
    let fixture: ComponentFixture<FindGamesComponent>;
    let displayWaitingGamesService: DisplayWaitingGamesService;
    let playerNameComparatorService: PlayerNameComparatorService;
    let stepperFixture: ComponentFixture<StepperModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FindGamesComponent, WaitingPlayerComponent, StepperModalComponent, GameModeComponent],
            imports: [MatDialogModule, RouterTestingModule, MatCardModule, MatStepperModule],
            providers: [StepperModalComponent, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FindGamesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        displayWaitingGamesService = TestBed.inject(DisplayWaitingGamesService);
        playerNameComparatorService = TestBed.inject(PlayerNameComparatorService);

        stepperFixture = TestBed.createComponent(StepperModalComponent);
        component.stepper = stepperFixture.debugElement.query(By.directive(MatStepper)).componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('The subscribe of waitingGames should be called when addCreatedGame from DisplayWaitingGamesService is called', () => {
        const game: WaitingGame = {
            playerName: 'testName',
            timer: { minute: 1, second: 0 },
            dictionary: { title: '', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        const waitingGamesArray: WaitingGame[] = [];
        waitingGamesArray.push(game);
        displayWaitingGamesService.addCreatedGame(waitingGamesArray);
        expect(component.waitingGames).toEqual(waitingGamesArray);
    });

    it('joinRoom function should call receiveGame from playerNameComparatorService', () => {
        const game: WaitingGame = {
            playerName: 'testName',
            timer: { minute: 1, second: 0 },
            dictionary: { title: '', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        const waitingGamesArray: WaitingGame[] = [];
        waitingGamesArray.push(game);
        component.waitingGames = waitingGamesArray;
        const playerNameComparatorServiceSpy = spyOn(playerNameComparatorService, 'receiveGame').and.callThrough();
        component.joinGame();
        expect(playerNameComparatorServiceSpy).toHaveBeenCalled();
    });
});
