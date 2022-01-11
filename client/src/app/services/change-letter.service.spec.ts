import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { GameManagerService } from '@app/services/game-manager.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { DisplayMessageService } from './display-message.service';

describe('ChangeLetterService', () => {
    let service: ChangeLetterService;
    let letterReserveService: LetterReserveService;
    let gameManagerService: GameManagerService;
    let playerSettingsService: PlayerSettingsService;
    let displayMessageService: DisplayMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [LetterReserveService, GameManagerService, PlayerSettingsService] });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
        });
        service = TestBed.inject(ChangeLetterService);
        letterReserveService = TestBed.inject(LetterReserveService);
        gameManagerService = TestBed.inject(GameManagerService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        displayMessageService = TestBed.inject(DisplayMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeLetterPlayer should call changeLetter', () => {
        const swipeLettersFromConsoleSpy = spyOn(service, 'swipeLettersFromConsole');
        service.changeLetterPlayer('abc');
        expect(swipeLettersFromConsoleSpy).toHaveBeenCalled();
    });

    it('changeLetterVirtualPlayer should call changeLetter', () => {
        const swipeLettersFromConsoleSpy = spyOn(service, 'swipeLettersFromConsole');
        service.changeLetterVirtualPlayer('abc');
        expect(swipeLettersFromConsoleSpy).toHaveBeenCalled();
    });

    it('swipeLetters should not change the array size of players letters', () => {
        gameManagerService.selectFirstPlayerToPlay();

        const expectedArraySize = 7;
        service.changeLetterPlayer(playerSettingsService.letters[0].letter);
        expect(playerSettingsService.letters.length).toBe(expectedArraySize);
    });

    it('swipeLetters function should call pickTile', () => {
        gameManagerService.selectFirstPlayerToPlay();

        const pickTileSpy = spyOn(letterReserveService, 'pickTile');

        service.changeLetterPlayer(playerSettingsService.letters[0].letter);
        expect(pickTileSpy).toHaveBeenCalled();
    });

    it('swipeLettersFromSelection should not change the array size of players letters', () => {
        gameManagerService.selectFirstPlayerToPlay();
        const expectedArraySize = 7;
        service.swipeLettersFromSelection(playerSettingsService.letters);
        expect(playerSettingsService.letters.length).toBe(expectedArraySize);
    });

    it('swipeLettersFromSelection should print changed letters in the chat', () => {
        displayMessageService.messagesList = [];
        gameManagerService.selectFirstPlayerToPlay();
        service.lettersToChange.set(0, 'A');
        service.lettersToChange.set(1, 'B');
        const expectedMessage = '!échanger ' + 'ab';
        service.swipeLettersFromSelection(playerSettingsService.letters);
        expect(displayMessageService.messagesList[0].text).toEqual(expectedMessage);
    });

    it('validateLetterChange function should call changeLetterFromSelection when player is active and reserve size >= 7', () => {
        letterReserveService.createReserve();
        playerSettingsService.hasToPlay = true;
        playerSettingsService.hasToPlayObservable.next(true);
        const changeLetterFromSelectionSpy = spyOn(service, 'swipeLettersFromSelection');
        service.validateLetterChange();
        expect(changeLetterFromSelectionSpy).toHaveBeenCalled();
    });

    it('validateLetterChange function should call display message in chat if player is not the active player size and reserve size >= 7', () => {
        letterReserveService.createReserve();
        playerSettingsService.hasToPlay = false;
        displayMessageService.messagesList = [];
        const expectedMessage = 'Commande impossible : Vous devez attendre votre tour pour jouer.';
        service.validateLetterChange();
        expect(displayMessageService.messagesList[0].text).toEqual(expectedMessage);
    });

    it('validateLetterChange function should call display message in chat if player is the active player size and reserve size < 7', () => {
        playerSettingsService.hasToPlay = true;
        letterReserveService.letterReserveTotalSize = 1;
        displayMessageService.messagesList = [];
        const expectedMessage = 'Commande impossible : La réserve contient moins de 7 lettres.';
        service.validateLetterChange();
        expect(displayMessageService.messagesList[0].text).toEqual(expectedMessage);
    });
});
