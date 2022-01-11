import { Component, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-offline-server-modal',
    templateUrl: './offline-server-modal.component.html',
    styleUrls: ['./offline-server-modal.component.scss'],
})
export class OfflineServerModalComponent {
    constructor(private matDialog: MatDialog, private ngZone: NgZone) {}

    closeModal(): void {
        this.ngZone.run(() => {
            this.matDialog.closeAll();
        });
    }
}
