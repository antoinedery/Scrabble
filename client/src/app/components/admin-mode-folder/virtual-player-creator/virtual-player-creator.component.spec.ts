import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { NameValidatorComponent } from '@app/components/create-game-folder/name-validator/name-validator.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';
import { VirtualPlayerCreatorComponent } from './virtual-player-creator.component';

describe('VirtualPlayerCreatorComponent', () => {
    let component: VirtualPlayerCreatorComponent;
    let fixture: ComponentFixture<VirtualPlayerCreatorComponent>;
    let createPlayerDialog: MatDialog;
    let nameValidatorService: NameValidatorService;
    let virtualPlayerCreatorService: VirtualPlayerCreatorService;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerCreatorComponent, NameValidatorComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatCardModule, MatIconModule, FormsModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        clientSocketService = TestBed.inject(ClientSocketService);
        clientSocketService.id = '123abc';
        fixture = TestBed.createComponent(VirtualPlayerCreatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        createPlayerDialog = TestBed.inject(MatDialog);
        nameValidatorService = TestBed.inject(NameValidatorService);
        virtualPlayerCreatorService = TestBed.inject(VirtualPlayerCreatorService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('connectedServer should be updated through connectedServerObservable (subscribe)', () => {
        component.connectedServer = false;
        clientSocketService.connectedServerObservable.next(true);
        expect(component.connectedServer).toBeTrue();
    });

    it('selectBotDifficulty should assign the correct difficulty (Easy)', () => {
        component.selectBotDifficulty('Easy');
        expect(component.selectedDifficulty).toEqual('Easy');
    });

    it('selectBotDifficulty should assign the correct difficulty (Expert)', () => {
        component.selectBotDifficulty('Expert');
        expect(component.selectedDifficulty).toEqual('Expert');
    });

    it('assignTempPlayerName should save player name', () => {
        component.assignTempPlayerName('name');
        expect(component.virtualPlayerName).toEqual('name');
    });

    it('should close the dialog when "Annuler" button is clicked', () => {
        spyOn(createPlayerDialog, 'closeAll');
        const cancelButton = fixture.debugElement.query(By.css('#close')).nativeElement;
        cancelButton.click();
        expect(createPlayerDialog.closeAll).toHaveBeenCalled();
    });

    it('confirmCreation should close the dialog when "Confirmer" button is clicked', () => {
        component.virtualPlayerName = 'name';
        component.selectedDifficulty = 'Expert';
        nameValidatorService.playerNameIsValid = true;
        spyOn(virtualPlayerCreatorService, 'checkNameExist').and.returnValue(false);
        spyOn(createPlayerDialog, 'closeAll');
        spyOn(clientSocketService, 'sendPlayerToAdd');
        const confirmButton = fixture.debugElement.query(By.css('#confirm')).nativeElement;
        confirmButton.click();
        expect(createPlayerDialog.closeAll).toHaveBeenCalled();
        expect(clientSocketService.sendPlayerToAdd).toHaveBeenCalled();
    });

    it('confirmCreation return undefined', () => {
        component.virtualPlayerName = '';
        expect(component.confirmCreation()).toBeUndefined();
    });
});
