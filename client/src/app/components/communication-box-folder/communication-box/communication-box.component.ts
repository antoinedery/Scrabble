import { Component } from '@angular/core';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent {
    constructor(private mouseEventHandlerService: MouseEventHandlerService, public selectGameModeService: SelectGameModeService) {}
    setMouseEventReceiverOnFocusIn(): void {
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.CommunicationBox;
    }

    setMouseEventReceiverOnFocusOut(): void {
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
    }
}
