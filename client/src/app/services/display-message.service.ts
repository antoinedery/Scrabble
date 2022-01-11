import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/classes/interfaces/message';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DisplayMessageService {
    messagesList: ChatMessage[] = [];
    messagesListObservable: Subject<ChatMessage[]> = new Subject();

    addMessageList(userName: string, message: string): void {
        this.messagesList.push({ userName, text: message });
        this.messagesListObservable.next(this.messagesList);
    }

    clearCommunicationBox(): void {
        this.messagesList = [];
    }
}
