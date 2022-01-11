import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { VirtualPlayerDisplayComponent } from '@app/components/admin-mode-folder/virtual-player-display/virtual-player-display.component';
import { of } from 'rxjs';
import { VirtualPlayerManagerComponent } from './virtual-player-manager.component';

describe('VirtualPlayerManagerComponent', () => {
    let component: VirtualPlayerManagerComponent;
    let fixture: ComponentFixture<VirtualPlayerManagerComponent>;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    let dialogSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerManagerComponent, VirtualPlayerDisplayComponent, OfflineServerModalComponent],
            imports: [RouterTestingModule, MatDialogModule, MatCardModule, MatIconModule, FormsModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayerManagerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should call open ', () => {
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });
});
