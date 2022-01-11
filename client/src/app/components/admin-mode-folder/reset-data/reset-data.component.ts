import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResetModalComponent } from '@app/components/admin-mode-folder/reset-modal/reset-modal.component';

@Component({
    selector: 'app-reset-data',
    templateUrl: './reset-data.component.html',
    styleUrls: ['./reset-data.component.scss'],
})
export class ResetDataComponent {
    constructor(private modal: MatDialog) {}

    openDialog() {
        this.modal.open(ResetModalComponent, { panelClass: 'custom-dialog-container' });
    }
}
