import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterTestingModule } from '@angular/router/testing';
import { DictionaryDisplayComponent } from '@app/components/admin-mode-folder/dictionary-display/dictionary-display.component';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { of } from 'rxjs';
import { DictionaryManagerComponent } from './dictionary-manager.component';

describe('DictionaryManagerComponent', () => {
    let component: DictionaryManagerComponent;
    let fixture: ComponentFixture<DictionaryManagerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DictionaryManagerComponent, DictionaryDisplayComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatIconModule, FormsModule, MatCardModule, MatStepperModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictionaryManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should open DictionaryUploadModalComponent', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const dialogSpy: jasmine.Spy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });
});
