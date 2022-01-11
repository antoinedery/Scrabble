import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ScoreModalComponent } from './score-modal.component';

describe('ScoreModalComponent', () => {
    let component: ScoreModalComponent;
    let fixture: ComponentFixture<ScoreModalComponent>;
    let scoreDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScoreModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatStepperModule, BrowserAnimationsModule, MatCardModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScoreModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        scoreDialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setMode should assign boolean according to selected game mode', () => {
        component.setMode(true);
        expect(component.verifyClassic).toBeTrue();
    });

    it('closeModal should close the dialog when "Annuler" button is clicked', () => {
        spyOn(scoreDialog, 'closeAll');
        const cancelButton = fixture.debugElement.query(By.css('#cancel-button')).nativeElement;
        cancelButton.click();
        expect(scoreDialog.closeAll).toHaveBeenCalled();
    });
});
