import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';
import { DictionaryUploadModalComponent } from './dictionary-upload-modal.component';

describe('DictionaryUploadModalComponent', () => {
    let component: DictionaryUploadModalComponent;
    let fixture: ComponentFixture<DictionaryUploadModalComponent>;
    let clientSocketService: ClientSocketService;
    let dictionaryNameValidatorService: DictionaryNameValidatorService;

    const getFileList = () => {
        const dt = new DataTransfer();
        dt.items.add(new File([], 'dictionary.json'));
        return dt.files;
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DictionaryUploadModalComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatCardModule, MatStepperModule, BrowserAnimationsModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        clientSocketService = TestBed.inject(ClientSocketService);
        clientSocketService.id = '123abc';
        fixture = TestBed.createComponent(DictionaryUploadModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dictionaryNameValidatorService = TestBed.inject(DictionaryNameValidatorService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isFileValid should be updated through dictionaryValidityObservable (subscribe)', () => {
        component.isFileValid = false;
        dictionaryNameValidatorService.dictionaryValidityObservable.next(true);
        expect(component.isFileValid).toBeTrue();
    });

    it('connectedServer should be updated through connectedServerObservable (subscribe)', () => {
        component.connectedServer = false;
        clientSocketService.connectedServerObservable.next(true);
        expect(component.connectedServer).toBeTrue();
    });

    it('closeModal should call matDialog closeAll function', () => {
        const uploadDialog: MatDialog = TestBed.inject(MatDialog);
        spyOn(uploadDialog, 'closeAll');
        const cancelButton = fixture.debugElement.query(By.css('#close')).nativeElement;
        cancelButton.click();
        expect(uploadDialog.closeAll).toHaveBeenCalled();
    });

    it('confirm function should call confirmUpload from dictionaryNameValidatorService', () => {
        component.file = getFileList();
        component.isFileValid = true;
        const confirmUploadSpy = spyOn(dictionaryNameValidatorService, 'confirmUpload');
        component.confirm();
        expect(confirmUploadSpy).toHaveBeenCalled();
    });

    it('confirm function should return undefined when file is invalid or undefined ', () => {
        component.isFileValid = false;
        expect(component.confirm()).toBeUndefined();
    });

    it('upload should call handleFile from dictionaryNameValidatorService', () => {
        const handleFileSpy = spyOn(dictionaryNameValidatorService, 'handleFile');
        const mockFile = new File([''], '', { type: '' });
        const uploadEvent: unknown = { currentTarget: { files: [mockFile] } };
        component.upload(uploadEvent as Event);
        expect(handleFileSpy).toHaveBeenCalled();
    });
});
