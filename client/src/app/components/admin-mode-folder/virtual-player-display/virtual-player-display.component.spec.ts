import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';
import { of } from 'rxjs';
import { VirtualPlayerDisplayComponent } from './virtual-player-display.component';

describe('VirtualPlayerDisplayComponent', () => {
    let component: VirtualPlayerDisplayComponent;
    let fixture: ComponentFixture<VirtualPlayerDisplayComponent>;
    let nameValidatorService: NameValidatorService;
    let virtualPlayerCreatorService: VirtualPlayerCreatorService;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerDisplayComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatIconModule, MatCardModule, FormsModule, BrowserAnimationsModule],
            providers: [VirtualPlayerDisplayComponent, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        clientSocketService = TestBed.inject(ClientSocketService);
        clientSocketService.id = 'abc123';
        fixture = TestBed.createComponent(VirtualPlayerDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        nameValidatorService = TestBed.inject(NameValidatorService);
        virtualPlayerCreatorService = TestBed.inject(VirtualPlayerCreatorService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Source: https://stackoverflow.com/questions/41421807/angular-2-how-to-mock-changedetectorref-while-unit-testing
    // Adapted to ElementRef
    it('disableTitleEditionMode and disableDescriptionEditionMode should be called on mouse click', () => {
        const eRef = fixture.debugElement.injector.get(ElementRef);
        spyOn(eRef.nativeElement.constructor.prototype, 'contains').and.returnValue(false);
        const disableEditionModeSpy = spyOn(component, 'disableEditionMode');
        window.dispatchEvent(new MouseEvent('click'));
        expect(disableEditionModeSpy).toHaveBeenCalled();
    });

    it('checkDefaultName should return true if name is a default name and not selected to edit', () => {
        component.isSelectedToEdit = true;
        expect(component.checkDefaultName('Bob')).toBeFalse();
    });

    it('enableEditionMode should call nameValidatorService', () => {
        const nameValidatorServiceSpy = spyOn(nameValidatorService, 'validatePlayerName');
        component.enableEditionMode();
        expect(nameValidatorServiceSpy).toHaveBeenCalled();
    });

    it('enableEditionMode should save name as previousName', () => {
        component.name = 'name';
        component.previousName = '';
        component.enableEditionMode();
        expect(component.previousName).toEqual('name');
    });

    it('enableEditionMode should return undefined if name is selectedToEdit', () => {
        component.isSelectedToEdit = true;
        expect(component.enableEditionMode()).toBeUndefined();
    });

    it('enableEditionMode should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.enableEditionMode();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('confirmEdit should call disableEditionMode if player is valid and does not exist', () => {
        const disableEditionModeSpy = spyOn(component, 'disableEditionMode');
        component.confirmEdit();
        expect(disableEditionModeSpy).toHaveBeenCalled();
    });

    it('confirmEdit should call sendPlayerToUpdate from ClientSocketService if player is valid and does not exist', () => {
        const sendPlayerToUpdateSpy = spyOn(clientSocketService, 'sendPlayerToUpdate');
        component.confirmEdit();
        expect(sendPlayerToUpdateSpy).toHaveBeenCalled();
    });

    it('confirmEdit should return undefined if player is not valid', () => {
        nameValidatorService.playerNameIsValid = false;
        expect(component.confirmEdit()).toBeUndefined();
    });

    it('confirmEdit should return undefined if player already exists', () => {
        spyOn(virtualPlayerCreatorService, 'checkNameExist').and.returnValue(true);
        expect(component.confirmEdit()).toBeUndefined();
    });

    it('removePlayer should call sendPlayerToRemove from ClientSocketService', () => {
        const sendPlayerToRemoveSpy = spyOn(clientSocketService, 'sendPlayerToRemove');
        component.removePlayer();
        expect(sendPlayerToRemoveSpy).toHaveBeenCalled();
    });

    it('confirmEdit should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.confirmEdit();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('removePlayer should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.removePlayer();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('removePlayer should return undefined if name is selected to edit', () => {
        component.isSelectedToEdit = true;
        expect(component.removePlayer()).toBeUndefined();
    });
});
