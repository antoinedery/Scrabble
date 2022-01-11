import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdminMode } from '@app/classes/enums/admin-mode';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements AfterViewInit, OnDestroy {
    @ViewChild('dictionary') dictionary: ElementRef;
    @ViewChild('virtualPlayer') virtualPlayer: ElementRef;
    @ViewChild('resetData') resetData: ElementRef;
    downloadDictionary: Subscription;
    selectedComponent: AdminMode = AdminMode.Dictionary;
    elem: HTMLAnchorElement = window.document.createElement('a');

    constructor(private clientSocketService: ClientSocketService, private router: Router) {
        this.downloadDictionary = clientSocketService.dictionaryDownloadObservable.subscribe((data) => {
            const blob = new Blob([JSON.stringify(data)], { type: 'json' });
            this.elem.href = window.URL.createObjectURL(blob);
            this.elem.download = data.title + '.json';
            document.body.appendChild(this.elem);
            this.elem.click();
            document.body.removeChild(this.elem);
        });
    }

    ngAfterViewInit(): void {
        this.selectComponent(AdminMode.Dictionary);
    }

    ngOnDestroy(): void {
        this.downloadDictionary.unsubscribe();
    }

    clearSelectedPage(): void {
        this.dictionary.nativeElement.classList.remove('selectedPage');
        this.virtualPlayer.nativeElement.classList.remove('selectedPage');
        this.resetData.nativeElement.classList.remove('selectedPage');
    }

    selectComponent(adminMode: AdminMode) {
        this.selectedComponent = adminMode;
        this.clearSelectedPage();
        if (adminMode === AdminMode.Dictionary) this.dictionary.nativeElement.classList.add('selectedPage');
        else if (adminMode === AdminMode.VirtualPlayer) {
            this.virtualPlayer.nativeElement.classList.add('selectedPage');
            this.clientSocketService.updateNameList();
        } else this.resetData.nativeElement.classList.add('selectedPage');
    }

    redirectHomePage(): void {
        this.router.navigate(['/home']);
    }
}
