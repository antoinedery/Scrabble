import { Injectable } from '@angular/core';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';

@Injectable({
    providedIn: 'root',
})
export class MouseEventHandlerService {
    currentMouseEventReceiver: MouseEventReceiver;
}
