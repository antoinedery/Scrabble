import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
    selector: 'app-reset-modal',
    templateUrl: './reset-modal.component.html',
    styleUrls: ['./reset-modal.component.scss'],
})
export class ResetModalComponent {
    connectedServer: boolean = true;
    constructor(private matDialog: MatDialog, public clientSocketService: ClientSocketService, private chgref: ChangeDetectorRef) {
        this.clientSocketService.connectedServerObservable.subscribe((value) => {
            this.connectedServer = value;
            this.chgref.detectChanges();
        });
    }

    closeModal() {
        this.matDialog.closeAll();
    }

    confirmReset(): void {
        this.clientSocketService.resetDataBase();
        this.closeModal();
    }
}
