import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';

@Component({
    selector: 'app-dictionary-upload-modal',
    templateUrl: './dictionary-upload-modal.component.html',
    styleUrls: ['./dictionary-upload-modal.component.scss'],
})
export class DictionaryUploadModalComponent {
    @ViewChild(MatStepper) stepper: MatStepper;
    file: FileList;
    isFileValid: boolean = false;
    verificationIsReceived: boolean = false;
    connectedServer: boolean = true;
    isUploadSuccessful: boolean = true;

    constructor(
        private matDialog: MatDialog,
        private dictionaryNameValidatorService: DictionaryNameValidatorService,
        public clientSocketService: ClientSocketService,
        private chgref: ChangeDetectorRef,
    ) {
        this.dictionaryNameValidatorService.dictionaryValidityObservable.subscribe((value) => {
            this.verificationIsReceived = true;
            this.isFileValid = value;
        });

        this.clientSocketService.connectedServerObservable.subscribe((value) => {
            this.connectedServer = value;
            this.chgref.detectChanges();
        });
    }

    closeModal(): void {
        this.matDialog.closeAll();
    }

    upload(event: Event): void {
        const element = event.currentTarget as HTMLInputElement;
        const fileList = element.files;
        /* istanbul ignore else */
        if (fileList && fileList.length > 0) {
            this.verificationIsReceived = false;
            this.file = fileList;
            this.dictionaryNameValidatorService.handleFile(fileList[0]);
        }
    }

    confirm(): void {
        if (!this.file || !this.isFileValid) return;
        this.dictionaryNameValidatorService.confirmUpload();
        this.stepper.next();
    }
}
