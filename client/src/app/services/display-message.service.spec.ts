import { TestBed } from '@angular/core/testing';
import { DisplayMessageService } from '@app/services/display-message.service';

const CURRENT_PLAYER = 'currentPlayer';
const OPPONENT_PLAYER = 'opponentPlayer';
const MESSAGE = 'Hello';

describe('DisplayMessageService', () => {
    let service: DisplayMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DisplayMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addMessageList should add the message in the messagesList array with currentPlayer as user', () => {
        service.messagesList = [];
        service.addMessageList(CURRENT_PLAYER, MESSAGE);
        expect(service.messagesList[0].text).toEqual(MESSAGE);
        expect(service.messagesList[0].userName).toEqual(CURRENT_PLAYER);
    });

    it('addMessageList should add the message in the messagesList array with opponentPlayer as user', () => {
        service.messagesList = [];
        service.addMessageList(OPPONENT_PLAYER, MESSAGE);
        expect(service.messagesList[0].text).toEqual(MESSAGE);
        expect(service.messagesList[0].userName).toEqual(OPPONENT_PLAYER);
    });
});
