import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VirtualPlayerCreatorComponent } from '@app/components/admin-mode-folder/virtual-player-creator/virtual-player-creator.component';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';

@Component({
    selector: 'app-virtual-player-manager',
    templateUrl: './virtual-player-manager.component.html',
    styleUrls: ['./virtual-player-manager.component.scss'],
})
export class VirtualPlayerManagerComponent {
    constructor(public modal: MatDialog, public virtualPlayerCreatorService: VirtualPlayerCreatorService) {}

    openDialog() {
        this.modal.open(VirtualPlayerCreatorComponent, { panelClass: 'custom-dialog-container' });
    }
}
