import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { QuitModalComponent } from './quit-modal.component';

describe('QuitModalComponent', () => {
    let component: QuitModalComponent;
    let fixture: ComponentFixture<QuitModalComponent>;
    let quitDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuitModalComponent],
            imports: [MatDialogModule, MatCardModule, RouterTestingModule.withRoutes([{ path: 'home', redirectTo: '' }])],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuitModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        quitDialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when "Oui" button is clicked', () => {
        spyOn(quitDialog, 'closeAll');
        const quitButton = fixture.debugElement.query(By.css('#yes')).nativeElement;
        quitButton.click();
        expect(quitDialog.closeAll).toHaveBeenCalled();
    });

    it('should close the dialog when "Non" button is clicked', () => {
        spyOn(quitDialog, 'closeAll');
        const quitButton = fixture.debugElement.query(By.css('#no')).nativeElement;
        quitButton.click();
        expect(quitDialog.closeAll).toHaveBeenCalled();
    });

    it('leaveMultiGame function should return undefined if solo mode is chosen', () => {
        const gameManagerService = TestBed.inject(GameManagerService);
        const leaveGameSpy = spyOn(gameManagerService, 'leaveGame');
        component.leaveMultiGame();
        expect(leaveGameSpy).toHaveBeenCalled();
    });
});
