import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatMessage } from '@app/classes/interfaces/message';
import { DisplayMessageService } from '@app/services/display-message.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { NameValidatorService } from '@app/services/name-validator.service';

@Component({
    selector: 'app-display-chat',
    templateUrl: './display-chat.component.html',
    styleUrls: ['./display-chat.component.scss'],
})
export class DisplayChatComponent implements OnInit {
    messagesList: ChatMessage[] = [];
    currentPlayerName: string = '';
    opponentPlayerName: string = '';

    constructor(
        public displayMessageService: DisplayMessageService,
        private changeDetector: ChangeDetectorRef,
        private gameManagerService: GameManagerService,
        private nameValidatorService: NameValidatorService,
    ) {}

    ngOnInit(): void {
        this.assignNames();
        this.displayMessageService.messagesListObservable.subscribe((value) => {
            this.messagesList = value;
            this.changeDetector.detectChanges();
        });
        this.nameValidatorService.nameChange.subscribe((value) => {
            for (const message of this.messagesList) {
                /* istanbul ignore else */
                if (message.userName === this.opponentPlayerName) message.userName = value;
            }
            this.opponentPlayerName = value;
        });
    }

    assignNames(): void {
        if (this.gameManagerService.isCurrentPlayerTheGameCreator) {
            this.currentPlayerName = this.gameManagerService.gameCreatorName;
            this.opponentPlayerName = this.gameManagerService.joiningPlayerName;
        } else {
            this.currentPlayerName = this.gameManagerService.joiningPlayerName;
            this.opponentPlayerName = this.gameManagerService.gameCreatorName;
        }
    }
}
