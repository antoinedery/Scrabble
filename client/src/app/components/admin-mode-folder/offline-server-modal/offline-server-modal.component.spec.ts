import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { OfflineServerModalComponent } from './offline-server-modal.component';

describe('OfflineServerModalComponent', () => {
    let component: OfflineServerModalComponent;
    let fixture: ComponentFixture<OfflineServerModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OfflineServerModalComponent],
            imports: [MatDialogModule, MatCardModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OfflineServerModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('closeModal should call matDialog closeAll function', () => {
        const uploadDialog: MatDialog = TestBed.inject(MatDialog);
        spyOn(uploadDialog, 'closeAll');
        const cancelButton = fixture.debugElement.query(By.css('#close')).nativeElement;
        cancelButton.click();
        expect(uploadDialog.closeAll).toHaveBeenCalled();
    });
});
