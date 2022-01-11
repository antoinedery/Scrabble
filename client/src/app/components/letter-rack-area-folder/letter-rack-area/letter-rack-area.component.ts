import { Component } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { InputChatService } from '@app/services/input-chat.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-letter-rack-area',
    templateUrl: './letter-rack-area.component.html',
    styleUrls: ['./letter-rack-area.component.scss'],
})
export class LetterRackAreaComponent {
    constructor(
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private inputChatService: InputChatService,
        private displayMessageService: DisplayMessageService,
        public selectGameModeService: SelectGameModeService,
        public clientSocketService: ClientSocketService,
        private mousePlacementService: MousePlacementService,
    ) {}

    playPlacement() {
        let temp = false;
        if (this.selectGameModeService.isSoloModeChosen) {
            temp = this.virtualPlayerSettingsService.hasToPlay;
        } else temp = !this.selectGameModeService.isOnlinePlayerTurn;

        if (temp) this.displayMessageService.addMessageList('system', "Commande impossible : ce n'est pas votre tour de jouer.");
        else this.mousePlacementService.confirmPlayerPlacement();
    }

    selectGameMode(): void {
        if (this.selectGameModeService.isSoloModeChosen) {
            this.endTurnButton(!this.virtualPlayerSettingsService.hasToPlay);
        } else this.endTurnButton(this.selectGameModeService.isOnlinePlayerTurn);
    }

    endTurnButton(isMyTurnToPlay: boolean): void {
        if (isMyTurnToPlay) {
            this.mousePlacementService.cancelPlacement();
            this.inputChatService.validateCommand('!passer');
        } else this.displayMessageService.addMessageList('system', "Commande impossible : ce n'est pas votre tour de jouer.");
    }
}
