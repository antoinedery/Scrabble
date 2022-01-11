import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NameValidatorService } from '@app/services/name-validator.service';
import { PlayerNameComparatorService } from '@app/services/player-name-comparator.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';

@Component({
    selector: 'app-name-validator',
    templateUrl: './name-validator.component.html',
    styleUrls: ['./name-validator.component.scss'],
})
export class NameValidatorComponent implements AfterViewInit {
    @ViewChild('nameValidity') nameValidity: ElementRef;
    @ViewChild('nameCriteria') nameCriteria: ElementRef;
    @ViewChild('inputText') inputText: ElementRef;
    @Input() isMultiplayerModeSelected = false;
    @Input() isAdminModeSelected = false;
    @Output() playerNameOutput = new EventEmitter<string>();
    playerName = '';
    constructor(
        public nameValidatorService: NameValidatorService,
        public playerNameComparatorService: PlayerNameComparatorService,
        public virtualPlayerCreatorService: VirtualPlayerCreatorService,
    ) {}

    ngAfterViewInit(): void {
        this.inputText.nativeElement.blur();
    }

    showPlayerNameCriteria(): void {
        this.nameValidity.nativeElement.style.display = 'block';
        if (this.nameValidatorService.playerNameIsValid) this.nameCriteria.nativeElement.style.display = 'none';
        else this.nameCriteria.nativeElement.style.display = 'block';
    }

    sendPlayerNameToParent() {
        this.playerNameOutput.emit(this.playerName);
    }
}
