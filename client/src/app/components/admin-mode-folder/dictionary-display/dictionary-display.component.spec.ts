import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';
import { of } from 'rxjs';
import { DictionaryDisplayComponent } from './dictionary-display.component';

describe('DictionaryDisplayComponent', () => {
    let component: DictionaryDisplayComponent;
    let fixture: ComponentFixture<DictionaryDisplayComponent>;
    let dictionaryNameValidatorService: DictionaryNameValidatorService;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DictionaryDisplayComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatIconModule, FormsModule, BrowserAnimationsModule, MatCardModule],
            providers: [DictionaryDisplayComponent, { provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        clientSocketService = TestBed.inject(ClientSocketService);
        clientSocketService.id = 'abc123';
        fixture = TestBed.createComponent(DictionaryDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dictionaryNameValidatorService = TestBed.inject(DictionaryNameValidatorService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Source: https://stackoverflow.com/questions/41421807/angular-2-how-to-mock-changedetectorref-while-unit-testing
    // Adapted to ElementRef
    it('disableTitleEditionMode and disableDescriptionEditionMode should be called on mouse click', () => {
        const eRef = fixture.debugElement.injector.get(ElementRef);
        spyOn(eRef.nativeElement.constructor.prototype, 'contains').and.returnValue(false);
        const disableTitleEditionModeSpy = spyOn(component, 'disableTitleEditionMode');
        const disableDescriptionEditionModeSpy = spyOn(component, 'disableDescriptionEditionMode');
        window.dispatchEvent(new MouseEvent('click'));
        expect(disableTitleEditionModeSpy).toHaveBeenCalled();
        expect(disableDescriptionEditionModeSpy).toHaveBeenCalled();
    });

    it('enableEditionMode should call validateTitle and validateDictionary', () => {
        const validateTitleSpy = spyOn(dictionaryNameValidatorService, 'validateTitle');
        component.enableEditionMode();
        expect(validateTitleSpy).toHaveBeenCalled();
    });

    it('enableEditionMode should call showBorder twice', () => {
        const showBorderSpy = spyOn(component, 'showBorder');
        component.enableEditionMode();
        expect(showBorderSpy).toHaveBeenCalledTimes(2);
    });

    it('enableEditionMode should save previous dictionary title', () => {
        component.previousTitle = '';
        component.title = 'title';
        component.enableEditionMode();
        expect(component.previousTitle).toEqual('title');
    });

    it('enableEditionMode should return undefined if title and description are already selected to edit', () => {
        component.isTitleSelectedToEdit = true;
        component.isDescriptionSelectedToEdit = true;
        expect(component.enableEditionMode()).toBeUndefined();
    });

    it('enableEditionMode should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.enableEditionMode();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('disableTitleEditionMode should reassign title with previous title', () => {
        component.previousTitle = 'title';
        component.title = 'title2';
        component.disableTitleEditionMode();
        expect(component.title).toEqual('title');
    });

    it('disableTitleEditionMode should call hideBorder', () => {
        const hideBorderSpy = spyOn(component, 'hideBorder');
        component.disableTitleEditionMode();
        expect(hideBorderSpy).toHaveBeenCalled();
    });

    it('disableDescriptionEditionMode should reassign description with previous description', () => {
        component.previousDescription = 'description';
        component.description = 'description2';
        component.disableDescriptionEditionMode();
        expect(component.description).toEqual('description');
    });

    it('disableDescriptionEditionMode should call hideBorder', () => {
        const hideBorderSpy = spyOn(component, 'hideBorder');
        component.disableDescriptionEditionMode();
        expect(hideBorderSpy).toHaveBeenCalled();
    });

    it('confirmTitleEdit should call hideBorder if title is valid', () => {
        spyOn(clientSocketService, 'editDictionary');
        const hideBorderSpy = spyOn(component, 'hideBorder');
        component.confirmTitleEdit();
        expect(hideBorderSpy).toHaveBeenCalled();
    });

    it('confirmTitleEdit should save title as previousTitle if title is valid', () => {
        spyOn(clientSocketService, 'editDictionary');
        component.previousTitle = 'title';
        component.title = 'title2';
        component.confirmTitleEdit();
        expect(component.previousTitle).toEqual('title2');
    });

    it('confirmTitleEdit should return undefined if title is not valid', () => {
        spyOn(clientSocketService, 'editDictionary');
        dictionaryNameValidatorService.titleIsValid = false;
        expect(component.confirmTitleEdit()).toBeUndefined();
    });

    it('confirmTitleEdit should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.confirmTitleEdit();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('confirmDescriptionEdit should call hideBorder if description is valid', () => {
        spyOn(clientSocketService, 'editDictionary');
        const hideBorderSpy = spyOn(component, 'hideBorder');
        component.confirmDescriptionEdit();
        expect(hideBorderSpy).toHaveBeenCalled();
    });

    it('confirmDescriptionEdit should save description as previousDescription if description is valid', () => {
        spyOn(clientSocketService, 'editDictionary');
        component.previousDescription = 'description';
        component.description = 'description2';
        component.confirmDescriptionEdit();
        expect(component.previousDescription).toEqual('description2');
    });

    it('confirmDescriptionEdit should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.confirmDescriptionEdit();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('removeDictionary should return undefined if title and description are already selected to edit', () => {
        component.isTitleSelectedToEdit = true;
        component.isDescriptionSelectedToEdit = true;
        expect(component.removeDictionary()).toBeUndefined();
    });

    it('removeDictionary should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.removeDictionary();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('removeDictionary should call removeDictionary from clientSocketService if server is connected', () => {
        const removeDictionarySpy = spyOn(clientSocketService, 'removeDictionary');
        clientSocketService.id = '123abc';
        fixture.detectChanges();
        component.removeDictionary();
        expect(removeDictionarySpy).toHaveBeenCalled();
    });

    it('editDictionary should return undefined if title and description are already selected to edit', () => {
        component.isTitleSelectedToEdit = true;
        component.isDescriptionSelectedToEdit = true;
        const previousDetails: DictionaryDetails = { title: 'title1', description: 'description1' };
        const newDetails: DictionaryDetails = { title: 'title2', description: 'description2' };
        expect(component.editDictionary(previousDetails, newDetails)).toBeUndefined();
    });

    it('editDictionary should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        const previousDetails: DictionaryDetails = { title: 'title1', description: 'description1' };
        const newDetails: DictionaryDetails = { title: 'title2', description: 'description2' };
        component.editDictionary(previousDetails, newDetails);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('editDictionary should call editDictionary from clientSocketService if server is connected', () => {
        const editDictionarySpy = spyOn(clientSocketService, 'editDictionary');
        clientSocketService.id = '123abc';
        fixture.detectChanges();
        const previousDetails: DictionaryDetails = { title: 'title1', description: 'description1' };
        const newDetails: DictionaryDetails = { title: 'title2', description: 'description2' };
        component.editDictionary(previousDetails, newDetails);
        expect(editDictionarySpy).toHaveBeenCalled();
    });

    it('getFile should return undefined if title and description are already selected to edit', () => {
        component.isTitleSelectedToEdit = true;
        component.isDescriptionSelectedToEdit = true;
        expect(component.getFile()).toBeUndefined();
    });

    it('getFile should open OfflineServerModal if server is offline', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        clientSocketService.id = '';
        component.getFile();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('getFile should call downloadDictionary from clientSocketService if server is connected', () => {
        const downloadDictionarySpy = spyOn(clientSocketService, 'downloadDictionary');
        clientSocketService.id = '123abc';
        fixture.detectChanges();
        component.getFile();
        expect(downloadDictionarySpy).toHaveBeenCalled();
    });
});
