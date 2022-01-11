import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { OfflineServerModalComponent } from '@app/components/admin-mode-folder/offline-server-modal/offline-server-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';

@Component({
    selector: 'app-dictionary-display',
    templateUrl: './dictionary-display.component.html',
    styleUrls: ['./dictionary-display.component.scss'],
})
export class DictionaryDisplayComponent implements AfterViewInit {
    @Input() title = '';
    @Input() description = '';
    @Input() index: number = 0;
    @ViewChild('titleDiv') titleDiv: ElementRef;
    @ViewChild('descriptionDiv') descriptionDiv: ElementRef;
    @ViewChild('validationTitle') validationTitleDiv: ElementRef;
    previousTitle: string = '';
    previousDescription: string = '';
    isTitleSelectedToEdit: boolean = false;
    isDescriptionSelectedToEdit: boolean = false;

    constructor(
        public dictionaryNameValidatorService: DictionaryNameValidatorService,
        private eRef: ElementRef,
        private matDialog: MatDialog,
        private clientSocketService: ClientSocketService,
        private chgref: ChangeDetectorRef,
    ) {}

    @HostListener('window:click', ['$event'])
    unselectEdition(event: Event) {
        /* istanbul ignore else */
        if (
            !this.eRef.nativeElement.contains(event.target) &&
            (event.target as HTMLElement).innerHTML !== 'check' &&
            (event.target as HTMLElement).innerHTML !== 'close'
        ) {
            this.disableTitleEditionMode();
            this.disableDescriptionEditionMode();
            this.title = this.previousTitle;
            this.description = this.previousDescription;
            this.chgref.detectChanges();
        }
    }

    ngAfterViewInit(): void {
        this.previousTitle = this.title;
        this.previousDescription = this.description;
        this.dictionaryNameValidatorService.titleIsValid = true;
    }

    enableEditionMode(): void {
        if (this.isTitleSelectedToEdit && this.isDescriptionSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else {
            this.isTitleSelectedToEdit = true;
            this.isDescriptionSelectedToEdit = true;
            this.dictionaryNameValidatorService.validateTitle(this.title);
            this.previousTitle = this.title;
            this.previousDescription = this.description;
            this.showBorder(this.titleDiv);
            this.showBorder(this.descriptionDiv);
            this.validationTitleDiv.nativeElement.style.display = 'block';
            this.chgref.detectChanges();
        }
    }

    disableTitleEditionMode(): void {
        this.isDescriptionSelectedToEdit = false;
        this.isTitleSelectedToEdit = false;
        this.hideBorder(this.titleDiv);
        this.hideBorder(this.descriptionDiv);
        this.title = this.previousTitle;
        this.chgref.detectChanges();
    }

    disableDescriptionEditionMode(): void {
        this.isDescriptionSelectedToEdit = false;
        this.isTitleSelectedToEdit = false;
        this.hideBorder(this.titleDiv);
        this.hideBorder(this.descriptionDiv);
        this.description = this.previousDescription;
        this.chgref.detectChanges();
    }

    confirmTitleEdit(): void {
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else {
            if (!this.dictionaryNameValidatorService.titleIsValid) return;
            this.isDescriptionSelectedToEdit = false;
            this.isTitleSelectedToEdit = false;
            this.hideBorder(this.titleDiv);
            this.hideBorder(this.descriptionDiv);
            this.titleDiv.nativeElement.value = this.title;
            this.editDictionary(
                {
                    title: this.previousTitle,
                    description: this.previousDescription,
                },
                {
                    title: this.title,
                    description: this.description,
                },
            );
            this.previousTitle = this.title;
        }
    }

    confirmDescriptionEdit(): void {
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else {
            this.isDescriptionSelectedToEdit = false;
            this.isDescriptionSelectedToEdit = false;
            this.isTitleSelectedToEdit = false;
            this.hideBorder(this.titleDiv);
            this.hideBorder(this.descriptionDiv);
            this.descriptionDiv.nativeElement.value = this.description;
            this.editDictionary(
                {
                    title: this.previousTitle,
                    description: this.previousDescription,
                },
                {
                    title: this.title,
                    description: this.description,
                },
            );
            this.previousDescription = this.description;
        }
    }

    showBorder(div: ElementRef): void {
        div.nativeElement.readonly = 'false';
        div.nativeElement.classList.add('editable-border');
        div.nativeElement.focus();
    }

    hideBorder(div: ElementRef): void {
        div.nativeElement.classList.remove('editable-border');
        div.nativeElement.readonly = 'true';
    }

    removeDictionary(): void {
        if (this.isTitleSelectedToEdit && this.isDescriptionSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else this.clientSocketService.removeDictionary(this.title);
    }

    editDictionary(previousDetails: DictionaryDetails, newDetails: DictionaryDetails): void {
        if (this.isTitleSelectedToEdit && this.isDescriptionSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else this.clientSocketService.editDictionary(previousDetails, newDetails);
    }

    getFile(): void {
        if (this.isTitleSelectedToEdit && this.isDescriptionSelectedToEdit) return;
        if (this.clientSocketService.id === '') this.matDialog.open(OfflineServerModalComponent, { panelClass: 'custom-dialog-container' });
        else this.clientSocketService.downloadDictionary(this.title);
    }
}
