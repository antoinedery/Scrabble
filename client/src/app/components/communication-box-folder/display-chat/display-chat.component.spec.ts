import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { DisplayMessageService } from '@app/services/display-message.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { DisplayChatComponent } from './display-chat.component';

describe('DisplayChatComponent', () => {
    let component: DisplayChatComponent;
    let fixture: ComponentFixture<DisplayChatComponent>;
    let displayMessageService: DisplayMessageService;
    let gameManagerService: GameManagerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DisplayChatComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        displayMessageService = TestBed.inject(DisplayMessageService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('currentPlayerName and opponentPlayerName should be correctly assigned when boolean is true', () => {
        gameManagerService = TestBed.inject(GameManagerService);
        gameManagerService.isCurrentPlayerTheGameCreator = true;
        const creatorName = 'creatorName';
        const joinerName = 'joinerName';
        gameManagerService.gameCreatorName = creatorName;
        gameManagerService.joiningPlayerName = joinerName;
        fixture = TestBed.createComponent(DisplayChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.currentPlayerName).toBe(creatorName);
        expect(component.opponentPlayerName).toBe(joinerName);
    });

    it('currentPlayerName and opponentPlayerName should be correctly assigned when boolean is true', () => {
        gameManagerService = TestBed.inject(GameManagerService);
        gameManagerService.isCurrentPlayerTheGameCreator = false;
        const creatorName = 'creatorName';
        const joinerName = 'joinerName';
        gameManagerService.gameCreatorName = creatorName;
        gameManagerService.joiningPlayerName = joinerName;
        fixture = TestBed.createComponent(DisplayChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.opponentPlayerName).toBe(creatorName);
        expect(component.currentPlayerName).toBe(joinerName);
    });

    it('messagesList should be updated when new message is pushed (subscribe)', () => {
        const newMessage = [{ userName: 'username', text: 'messageContent' }];
        displayMessageService.messagesListObservable.next(newMessage);
        expect(component.messagesList[0]).toEqual({ userName: 'username', text: 'messageContent' });
    });

    it('opponentPlayerName should be updated through subscribe', () => {
        const newMessage = [{ userName: 'Before', text: 'messageContent' }];
        displayMessageService.messagesListObservable.next(newMessage);
        component.opponentPlayerName = 'Before';
        const nameValidatorService = TestBed.inject(NameValidatorService);
        nameValidatorService.nameChange.next('After');
        expect(component.opponentPlayerName).toEqual('After');
    });
});
