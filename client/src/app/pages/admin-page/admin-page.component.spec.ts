import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ResetDataComponent } from '@app/components/admin-mode-folder//reset-data/reset-data.component';
import { DatabaseErrorComponent } from '@app/components/admin-mode-folder/database-error/database-error.component';
import { DictionaryDisplayComponent } from '@app/components/admin-mode-folder/dictionary-display/dictionary-display.component';
import { DictionaryManagerComponent } from '@app/components/admin-mode-folder/dictionary-manager/dictionary-manager.component';
import { SideNavComponent } from '@app/components/admin-mode-folder/side-nav/side-nav.component';
import { VirtualPlayerDisplayComponent } from '@app/components/admin-mode-folder/virtual-player-display/virtual-player-display.component';
import { VirtualPlayerManagerComponent } from '@app/components/admin-mode-folder/virtual-player-manager/virtual-player-manager.component';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AdminPageComponent,
                SideNavComponent,
                DictionaryManagerComponent,
                VirtualPlayerManagerComponent,
                ResetDataComponent,
                VirtualPlayerDisplayComponent,
                DictionaryDisplayComponent,
                DatabaseErrorComponent,
            ],
            imports: [
                MatSnackBarModule,
                RouterTestingModule,
                MatDialogModule,
                MatIconModule,
                FormsModule,
                MatCardModule,
                BrowserAnimationsModule,
                MatSidenavModule,
                MatStepperModule,
            ],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
