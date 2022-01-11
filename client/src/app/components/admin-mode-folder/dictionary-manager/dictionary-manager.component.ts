import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DictionaryUploadModalComponent } from '@app/components/admin-mode-folder/dictionary-upload-modal/dictionary-upload-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';

@Component({
    selector: 'app-dictionary-manager',
    templateUrl: './dictionary-manager.component.html',
    styleUrls: ['./dictionary-manager.component.scss'],
})
export class DictionaryManagerComponent {
    constructor(
        public modal: MatDialog,
        public dictionaryNameValidatorService: DictionaryNameValidatorService,
        public clientSocketService: ClientSocketService,
    ) {}

    openDialog() {
        this.modal.open(DictionaryUploadModalComponent, { panelClass: 'custom-dialog-container' });
    }
}
