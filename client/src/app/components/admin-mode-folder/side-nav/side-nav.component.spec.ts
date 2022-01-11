import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminMode } from '@app/classes/enums/admin-mode';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDisplayComponent } from '@app/components/admin-mode-folder//dictionary-display/dictionary-display.component';
import { ResetDataComponent } from '@app/components/admin-mode-folder//reset-data/reset-data.component';
import { DictionaryManagerComponent } from '@app/components/admin-mode-folder/dictionary-manager/dictionary-manager.component';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { VirtualPlayerDisplayComponent } from '@app/components/admin-mode-folder/virtual-player-display/virtual-player-display.component';
import { VirtualPlayerManagerComponent } from '@app/components/admin-mode-folder/virtual-player-manager/virtual-player-manager.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SideNavComponent } from './side-nav.component';

describe('SideNavComponent', () => {
    let component: SideNavComponent;
    let fixture: ComponentFixture<SideNavComponent>;
    const routerSpy = { navigate: jasmine.createSpy('navigate') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                SideNavComponent,
                DictionaryManagerComponent,
                DictionaryDisplayComponent,
                VirtualPlayerManagerComponent,
                VirtualPlayerDisplayComponent,
                ResetDataComponent,
                OfflineServerModalComponent,
            ],
            imports: [
                RouterTestingModule,
                MatDialogModule,
                MatIconModule,
                MatCardModule,
                BrowserAnimationsModule,
                MatSidenavModule,
                FormsModule,
                MatStepperModule,
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SideNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clearSelectedPage should remove selectedPage class from all three side navigation options', () => {
        component.clearSelectedPage();
        expect(component.dictionary.nativeElement.classList).not.toContain('selectedPage');
        expect(component.virtualPlayer.nativeElement.classList).not.toContain('selectedPage');
        expect(component.resetData.nativeElement.classList).not.toContain('selectedPage');
    });

    it('selectComponent should add selectedPage class on selected navigation options (dictionary)', () => {
        component.selectComponent(AdminMode.Dictionary);
        expect(component.dictionary.nativeElement.classList).toContain('selectedPage');
    });

    it('selectComponent should add selectedPage class on selected navigation options (virtual player)', () => {
        component.selectComponent(AdminMode.VirtualPlayer);
        expect(component.virtualPlayer.nativeElement.classList).toContain('selectedPage');
    });

    it('selectComponent should add selectedPage class on selected navigation options (reset data)', () => {
        component.selectComponent(AdminMode.ResetData);
        expect(component.resetData.nativeElement.classList).toContain('selectedPage');
    });

    it('download should be triggered through subscribe', () => {
        const clientSocketService = TestBed.inject(ClientSocketService);
        const elemSpy = spyOn(component.elem, 'click');
        const mockDictionary: IDictionary = { title: 'title', description: 'description', words: [] };
        clientSocketService.dictionaryDownloadObservable.next(mockDictionary);
        expect(elemSpy).toHaveBeenCalled();
    });

    it('redirectHomePage should call router.navigate with /home', () => {
        const cancelButton = fixture.debugElement.query(By.css('#quit-button')).nativeElement;
        cancelButton.click();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
});
