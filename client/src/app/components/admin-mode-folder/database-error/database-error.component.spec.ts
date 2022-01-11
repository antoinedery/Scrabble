import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DatabaseErrorComponent } from './database-error.component';

describe('DatabaseErrorComponent', () => {
    let component: DatabaseErrorComponent;
    let clientSocketService: ClientSocketService;
    let fixture: ComponentFixture<DatabaseErrorComponent>;
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DatabaseErrorComponent],
            imports: [MatDialogModule, RouterTestingModule, MatSnackBarModule, BrowserAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DatabaseErrorComponent);
        component = fixture.componentInstance;
        clientSocketService = TestBed.inject(ClientSocketService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should (subscribe) to values upon creation', () => {
        const message = 'Error Message';
        clientSocketService.alertMessageObservable.next(message);
        expect(component.errorMessage).toEqual(message);
    });
});
