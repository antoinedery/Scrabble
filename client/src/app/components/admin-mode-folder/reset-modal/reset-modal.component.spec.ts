import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ResetModalComponent } from './reset-modal.component';

describe('ResetModalComponent', () => {
    let component: ResetModalComponent;
    let fixture: ComponentFixture<ResetModalComponent>;
    let resetDialog: MatDialog;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetModalComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatCardModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        clientSocketService = TestBed.inject(ClientSocketService);
        clientSocketService.id = '123abc';
        fixture = TestBed.createComponent(ResetModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        resetDialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when "Non" button is clicked', () => {
        component.connectedServer = true;
        spyOn(resetDialog, 'closeAll');
        const quitButton = fixture.debugElement.query(By.css('#no')).nativeElement;
        quitButton.click();
        expect(resetDialog.closeAll).toHaveBeenCalled();
    });

    it('should close the dialog and call resetDataBase from ClientSocketService when "Oui" button is clicked', () => {
        component.connectedServer = true;
        spyOn(resetDialog, 'closeAll');
        spyOn(clientSocketService, 'resetDataBase');
        const quitButton = fixture.debugElement.query(By.css('#yes')).nativeElement;
        quitButton.click();
        expect(resetDialog.closeAll).toHaveBeenCalled();
        expect(clientSocketService.resetDataBase).toHaveBeenCalled();
    });

    it('connectedServer should be updated through connectedServerObservable (subscribe)', () => {
        component.connectedServer = false;
        clientSocketService.connectedServerObservable.next(true);
        expect(component.connectedServer).toBeTrue();
    });
});
