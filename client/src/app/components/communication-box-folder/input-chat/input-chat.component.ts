import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { InputChatService } from '@app/services/input-chat.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';

@Component({
    selector: 'app-input-chat',
    templateUrl: './input-chat.component.html',
    styleUrls: ['./input-chat.component.scss'],
})
export class InputChatComponent implements AfterViewInit {
    @ViewChild('inputBox') inputBox: ElementRef;
    playerMessage: string = '';
    buttonPressed: string = '';
    constructor(
        private inputChatService: InputChatService,
        private playerSettingsService: PlayerSettingsService,
        public mousePlacementService: MousePlacementService,
    ) {}

    ngAfterViewInit(): void {
        this.inputBox.nativeElement.focus();
    }

    sendMessage(): void {
        this.inputChatService.validateInputLength(this.playerMessage, this.playerSettingsService.name);
        this.playerMessage = '';
    }
}
