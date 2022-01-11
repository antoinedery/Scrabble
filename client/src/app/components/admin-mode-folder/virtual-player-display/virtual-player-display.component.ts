import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BEGINNER_BOT_NAMES, EXPERT_BOT_NAMES } from '@app/classes/constants/constants';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';

@Component({
    selector: 'app-virtual-player-display',
    templateUrl: './virtual-player-display.component.html',
    styleUrls: ['./virtual-player-display.component.scss'],
})
export class VirtualPlayerDisplayComponent implements AfterViewInit {
    @Input() name: string = '';
    @Input() difficulty: string = '';
    @ViewChild('nameDiv') nameDiv: ElementRef;
    @ViewChild('validation') validation: ElementRef;
    previousName: string = '';
    isSelectedToEdit: boolean = false;

    constructor(
        public nameValidatorService: NameValidatorService,
        private eRef: ElementRef,
        private matDialog: MatDialog,
        public virtualPlayerCreatorService: VirtualPlayerCreatorService,
        private clientSocketService: ClientSocketService,
        private chgref: ChangeDetectorRef,
    ) {}

    @HostListener('window:click', ['$event'])
    unselectEdition(event: Event) {
        /* istanbul ignore else */
        if (!this.eRef.nativeElement.contains(event.target) && (event.target as HTMLElement).innerHTML !== 'check') {
            this.disableEditionMode();
            this.name = this.previousName;
            this.chgref.detectChanges();
        }
    }

    ngAfterViewInit(): void {
        this.previousName = this.name;
        this.nameValidatorService.playerNameIsValid = true;
    }

    checkDefaultName(name: string) {
        return (BEGINNER_BOT_NAMES.includes(name) || EXPERT_BOT_NAMES.includes(name)) && this.isSelectedToEdit === false;
    }

    enableEditionMode(): void {
        if (this.isSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else {
            this.nameValidatorService.validatePlayerName(this.name);
            this.previousName = this.name;
            this.nameDiv.nativeElement.readonly = 'false';
            this.nameDiv.nativeElement.classList.add('editable-border');
            this.nameDiv.nativeElement.focus();
            this.isSelectedToEdit = true;
            this.validation.nativeElement.style.display = 'block';
            this.chgref.detectChanges();
        }
    }

    disableEditionMode(): void {
        this.isSelectedToEdit = false;
        this.nameDiv.nativeElement.classList.remove('editable-border');
        this.nameDiv.nativeElement.readonly = 'true';
        this.validation.nativeElement.style.display = 'none';
        this.chgref.detectChanges();
    }

    confirmEdit(): void {
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else {
            if (!this.nameValidatorService.playerNameIsValid || this.virtualPlayerCreatorService.checkNameExist(this.name)) return;
            this.disableEditionMode();
            this.nameDiv.nativeElement.value = this.name;
            this.clientSocketService.sendPlayerToUpdate({ name: this.previousName, difficulty: this.difficulty }, this.name);
            this.previousName = this.name;
            this.chgref.detectChanges();
        }
    }

    removePlayer(): void {
        if (this.isSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else this.clientSocketService.sendPlayerToRemove({ name: this.name, difficulty: this.difficulty });
    }
}
