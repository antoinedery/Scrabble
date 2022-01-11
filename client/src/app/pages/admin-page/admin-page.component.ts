import { Component } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    constructor(private clientSocketService: ClientSocketService) {
        this.clientSocketService.initializeAdminListeners();
        this.clientSocketService.updateDictionaryList();
    }
}
