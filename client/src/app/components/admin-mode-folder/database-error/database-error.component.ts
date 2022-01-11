import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientSocketService } from '@app/services/client-socket.service';
@Component({
    selector: 'app-database-error',
    templateUrl: './database-error.component.html',
    styleUrls: ['./database-error.component.scss'],
})
export class DatabaseErrorComponent {
    errorMessage: string;
    constructor(public clientSocketService: ClientSocketService, private snackBar: MatSnackBar) {
        this.clientSocketService.alertMessageObservable.subscribe((value) => {
            this.errorMessage = value;
            this.snackBar.open(this.errorMessage, 'OK', { duration: 5000 });
        });
    }
}
