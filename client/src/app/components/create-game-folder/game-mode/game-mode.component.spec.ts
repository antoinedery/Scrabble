import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameSettingsComponent } from '@app/components/create-game-folder/game-settings/game-settings.component';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { VirtualPlayerSettingsComponent } from '@app/components/create-game-folder/virtual-player-settings/virtual-player-settings.component';
import { GameModeComponent } from './game-mode.component';

describe('GameModeComponent', () => {
    let component: GameModeComponent;
    let fixture: ComponentFixture<GameModeComponent>;
    let stepperFixture: ComponentFixture<StepperModalComponent>;
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameModeComponent, StepperModalComponent, GameSettingsComponent, VirtualPlayerSettingsComponent],
            imports: [FormsModule, MatStepperModule, MatDialogModule, RouterTestingModule, MatSlideToggleModule, MatCardModule],
            providers: [{ provide: MatDialogRef, useValue: {} }, { provide: Router, useValue: routerSpy }, StepperModalComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameModeComponent);
        component = fixture.componentInstance;

        stepperFixture = TestBed.createComponent(StepperModalComponent);
        component.stepper = stepperFixture.debugElement.query(By.directive(MatStepper)).componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select solo game mode', () => {
        const soloModeSelected = 'card-selected';
        const button = fixture.debugElement.nativeElement.querySelector('#solo');
        button.click();
        expect(component.selectedMode).toBe(soloModeSelected);
    });

    it('should select create multi mode', () => {
        const createMultiModeSelected = 'card-selected';
        const button = fixture.debugElement.nativeElement.querySelector('#createMulti');
        button.click();
        expect(component.selectedMode).toBe(createMultiModeSelected);
    });

    it('should select join multi mode', () => {
        const joinMultiModeSelected = 'card-selected';
        const button = fixture.debugElement.nativeElement.querySelector('#joinMulti');
        button.click();
        expect(component.selectedMode).toBe(joinMultiModeSelected);
    });
});
