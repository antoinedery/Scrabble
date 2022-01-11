import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GameModeComponent } from '@app/components/create-game-folder/game-mode/game-mode.component';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';
import { WaitingPlayerComponent } from './waiting-player.component';

describe('WaitingPlayerComponent', () => {
    let component: WaitingPlayerComponent;
    let fixture: ComponentFixture<WaitingPlayerComponent>;
    let playerNameComparatorService: PlayerNameComparatorService;
    let stepperFixture: ComponentFixture<StepperModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, MatStepperModule, MatCardModule],
            declarations: [WaitingPlayerComponent, StepperModalComponent, MatStepper, GameModeComponent],
            providers: [StepperModalComponent, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        playerNameComparatorService = TestBed.inject(PlayerNameComparatorService);

        stepperFixture = TestBed.createComponent(StepperModalComponent);
        component.stepper = stepperFixture.debugElement.query(By.directive(MatStepper)).componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('joinRoom function should call receiveGame from playerNameComparatorService', () => {
        const playerNameComparatorServiceSpy = spyOn(playerNameComparatorService, 'receiveGame').and.callThrough();
        component.joinGame();
        expect(playerNameComparatorServiceSpy).toHaveBeenCalled();
    });
});
