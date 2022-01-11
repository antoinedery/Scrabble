import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GameManagerService } from '@app/services/game-manager.service';
import { PlayerDisconnectionComponent } from './player-disconnection.component';

describe('PlayerDisconnectionComponent', () => {
    let component: PlayerDisconnectionComponent;
    let fixture: ComponentFixture<PlayerDisconnectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerDisconnectionComponent],
            imports: [RouterTestingModule, MatDialogModule, MatSnackBarModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerDisconnectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('snackBar open should be called from player disconnection (subscribe)', () => {
        const gameManagerService = TestBed.inject(GameManagerService);
        const snackBarSpy = spyOn(TestBed.inject(MatSnackBar), 'open');
        gameManagerService.playerDisconnectionObservable.next('message');
        expect(snackBarSpy).toHaveBeenCalled();
    });
});
