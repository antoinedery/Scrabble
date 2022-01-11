import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { of } from 'rxjs';
import { ResetDataComponent } from './reset-data.component';

describe('ResetDataComponent', () => {
    let component: ResetDataComponent;
    let fixture: ComponentFixture<ResetDataComponent>;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    let dialogSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetDataComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatCardModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResetDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should call open', () => {
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });
});
