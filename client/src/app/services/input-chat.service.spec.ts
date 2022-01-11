// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { INVALID_COMMAND } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { Tile } from '@app/classes/interfaces/tile';
import { DisplayMessageService } from '@app/services/display-message.service';
import { InputChatService } from '@app/services/input-chat.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { DebugCommandService } from './debug-command.service';
import { LetterReserveService } from './letter-reserve.service';
import { SelectGameModeService } from './select-game-mode.service';
import { BeginnerVirtualPlayerActionsService } from './virtual-player-actions/beginner/beginner-virtual-player-actions.service';
import { ExpertVirtualPlayerActionsService } from './virtual-player-actions/expert/expert-virtual-player-actions.service';

describe('InputChatService', () => {
    let service: InputChatService;
    let playerSettingsService: PlayerSettingsService;
    let displayMessageService: DisplayMessageService;
    let letterReserveService: LetterReserveService;
    let selectGameModeService: SelectGameModeService;
    let debugCommandService: DebugCommandService;

    const CURRENT_PLAYER = 'currentPlayer';
    const MESSAGE = 'Hello';
    const MESSAGE_COMMAND = '!placer';
    const WRONG_COMMAND = '!hello';
    const OVERSIZED_MESSAGE =
        'mljkhwgqhmdqanftwzngtfykzqqpybmorwexoftphztlowxsxgqdtrozsdetqcollykjmbeyxffqeyjfdiipyagwufzfvqdsrmgc' +
        'mljkhwgqhmdqanftwzngtfykzqqpybmorwexoftphztlowxsxgqdtrozsdetqcollykjmbeyxffqeyjfdiipyagwufzfvqdsrmgc' +
        'mljkhwgqhmdqanftwzngtfykzqqpybmorwexoftphztlowxsxgqdtrozsdetqcollykjmbeyxffqeyjfdiipyagwufzfvqdsrmgc' +
        'mljkhwgqhmdqanftwzngtfykzqqpybmorwexoftphztlowxsxgqdtrozsdetqcollykjmbeyxffqeyjfdiipyagwufzfvqdsrmgc' +
        'mljkhwgqhmdqanftwzngtfykzqqpybmorwexoftphztlowxsxgqdtrozsdetqcollykjmbeyxffqeyjfdiipyagwufzfvqdsrmgc' +
        'mljkhwgqhmdqa';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InputChatService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        displayMessageService = TestBed.inject(DisplayMessageService);
        letterReserveService = TestBed.inject(LetterReserveService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        debugCommandService = TestBed.inject(DebugCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('beginnerVirtualPlayerActionService should call displayVirtualPlayerWords through subscribe', () => {
        const beginnerVirtualPlayerActionService = TestBed.inject(BeginnerVirtualPlayerActionsService);
        service.debugModeIsActivated = true;
        const displayVirtualPlayerWordsSpy = spyOn(debugCommandService, 'displayVirtualPlayerWords');
        const scoredPlacement: ScoredPlacement[] = [];
        scoredPlacement.push({ placement: { axis: AXIS.HORIZONTAL, letters: [] }, words: [], totalScore: 1 });
        beginnerVirtualPlayerActionService.potentialPlacementObservable.next(scoredPlacement);
        expect(displayVirtualPlayerWordsSpy).toHaveBeenCalled();
    });

    it('expertVirtualPlayerActionService should call displayVirtualPlayerWords through subscribe', () => {
        const expertVirtualPlayerActionService = TestBed.inject(ExpertVirtualPlayerActionsService);
        service.debugModeIsActivated = true;
        const displayVirtualPlayerWordsSpy = spyOn(debugCommandService, 'displayVirtualPlayerWords');
        const scoredPlacement: ScoredPlacement[] = [];
        scoredPlacement.push({ placement: { axis: AXIS.HORIZONTAL, letters: [] }, words: [], totalScore: 1 });
        expertVirtualPlayerActionService.potentialPlacementObservable.next(scoredPlacement);
        expect(displayVirtualPlayerWordsSpy).toHaveBeenCalled();
    });

    it('detectInput should send the message in the messagesList array and should validate the command', () => {
        const SYMBOL_FOR_COMMAND = '!';
        const validateCommandSpy = spyOn(service, 'validateCommand');
        service.detectInput(MESSAGE_COMMAND, CURRENT_PLAYER);
        expect(MESSAGE_COMMAND[0]).toEqual(SYMBOL_FOR_COMMAND);
        expect(validateCommandSpy).toHaveBeenCalled();
    });

    it('detectInput should only send the message in the map', () => {
        const test = spyOn(displayMessageService, 'addMessageList');
        const SYMBOL_FOR_COMMAND = '!';
        service.detectInput(MESSAGE, CURRENT_PLAYER);
        expect(MESSAGE[0]).not.toEqual(SYMBOL_FOR_COMMAND);
        expect(test).toHaveBeenCalled();
    });

    it('detectInput should send an error message if the input only contains blank space', () => {
        displayMessageService.messagesList = [];
        service.detectInput('     ', 'system');
        expect(displayMessageService.messagesList[0].text).toEqual('Le message ne peut être vide');
    });

    it('detectInput should send an error message if the input is empty', () => {
        displayMessageService.messagesList = [];
        service.detectInput('', 'system');
        expect(displayMessageService.messagesList[0].text).toEqual('Le message ne peut être vide');
    });

    it('findCommand should validate the user command', () => {
        service.findCommand(WRONG_COMMAND);
        expect(service.findCommand(WRONG_COMMAND)).toEqual(INVALID_COMMAND);
    });

    it('validateInputLength should call detectInput if the player message is less than 512 characters', () => {
        const test = spyOn(service, 'detectInput');
        service.validateInputLength(MESSAGE, CURRENT_PLAYER);
        expect(test).toHaveBeenCalled();
    });

    it('validateInputLength should print error message when input length is > 512 characters and system as designed user', () => {
        const errorMessage = 'Erreur : Le message doit avoir un maximum de 512 caractères.';
        displayMessageService.messagesList = [];
        service.validateInputLength(OVERSIZED_MESSAGE, '');
        expect(displayMessageService.messagesList[0].text).toEqual(errorMessage);
        expect(displayMessageService.messagesList[0].userName).toEqual('system');
    });

    it('validateCommand should call the method placeLetter', () => {
        const placeLetterSpy = spyOn(service, 'selectGameModeForPlaceLetter');
        const MESSAGE_COMMAND_PLACE_LETTER = '!placer';
        service.validateCommand(MESSAGE_COMMAND_PLACE_LETTER);
        expect(placeLetterSpy).toHaveBeenCalled();
    });

    it('validateCommand should call the method endTurnCommand', () => {
        const selectGameModeForSkipTurn = spyOn(service, 'selectGameModeForSkipTurn');
        service.validateCommand('!passer');
        expect(selectGameModeForSkipTurn).toHaveBeenCalled();
    });

    it('validateCommand should print error message when command does not exist', () => {
        const errorMessage = "Erreur : !echange n'est pas une commande valide.";
        displayMessageService.messagesList = [];
        service.validateCommand('!echange');
        expect(displayMessageService.messagesList[0].text).toEqual(errorMessage);
        expect(displayMessageService.messagesList[0].userName).toEqual('system');
    });

    it('validateCommand should call the change letter function', () => {
        const selectGameModeForChangeLetter = spyOn(service, 'selectGameModeForChangeLetter');
        service.validateCommand('!échanger a');
        expect(selectGameModeForChangeLetter).toHaveBeenCalled();
    });

    it('validateCommand should call the toggleDebugMode function', () => {
        const toggleDebugModeSpy = spyOn(service, 'toggleDebugMode');
        service.validateCommand('!debug');
        expect(toggleDebugModeSpy).toHaveBeenCalled();
    });

    it('validateCommand should call the printReserve function', () => {
        const selectGameModePrintReserve = spyOn(service, 'selectGameModePrintReserve');
        service.validateCommand('!reserve');
        expect(selectGameModePrintReserve).toHaveBeenCalled();
    });

    it('validateCommand should call the printHelp function', () => {
        const askHelpSpy = spyOn(service, 'printHelp');
        service.validateCommand('!aide');
        expect(askHelpSpy).toHaveBeenCalled();
    });

    it('changeLetter function should print the command in the chat when letter is in rack', () => {
        playerSettingsService.hasToPlay = true;
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];
        playerSettingsService.letters.push({ letter: 'A', score: 1 });
        service.exchangeLetterSolo('a');
        expect(displayMessageService.messagesList[0].text).toEqual('!échanger a');
    });

    it('changeLetter function should print an error message in the chat when letter is not in rack', () => {
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];
        playerSettingsService.letters.push({ letter: 'B', score: 1 });
        playerSettingsService.hasToPlay = true;
        service.exchangeLetterSolo('a');
        expect(displayMessageService.messagesList[0].text).toEqual('Erreur de syntaxe : les lettres doivent être présentes dans le chevalet');
    });

    it('endTurnCommand should print whos turn has been passed', () => {
        displayMessageService.messagesList = [];
        playerSettingsService.hasToPlay = true;
        const message: string[] = [];
        message.push('!passer');
        service.skipTurnSolo(message);
        expect(displayMessageService.messagesList[0].text).toEqual('Passer son tour');
    });

    it('endTurnCommand should print an error', () => {
        displayMessageService.messagesList = [];
        playerSettingsService.hasToPlay = true;
        const message: string[] = [];
        message.push('!passer');
        message.push(' ');
        service.skipTurnSolo(message);
        expect(displayMessageService.messagesList[0].text).toEqual('Erreur: Entrée invalide');
    });

    it('endTurnCommand should print error message when it is not the players turn to play', () => {
        displayMessageService.messagesList = [];
        playerSettingsService.hasToPlay = false;
        const message: string[] = [];
        message.push('!passer');
        service.skipTurnSolo(message);
        expect(displayMessageService.messagesList[0].text).toEqual("Commande impossible : Ce n'est pas votre tour de jouer.");
    });

    it('endTurnCommand should print error message when it is not the players turn to play', () => {
        displayMessageService.messagesList = [];
        playerSettingsService.hasToPlay = true;
        const message: string[] = [];
        message.push('!passer');
        message.push(' ');
        service.skipTurnSolo(message);
        expect(displayMessageService.messagesList[0].text).toEqual('Erreur: Entrée invalide');
    });

    it('placeLetter should print the command in the chat when the command is valid and the letters are inserted on the board', () => {
        const command = '!placer h8h hi';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: 'H', score: 1 });
        playerSettingsService.letters.push({ letter: 'I', score: 1 });
        displayMessageService.messagesList = [];
        service.placeLetter(command);
        expect(displayMessageService.messagesList[0].text).toEqual(command);
    });

    it('placeLetter should print the corresponding error message when the command is not valid', () => {
        const command = '!placer h6h hi';
        const errorMessage = 'Commande impossible à réaliser : le mot ne touche pas la case centrale';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: 'H', score: 1 });
        playerSettingsService.letters.push({ letter: 'I', score: 1 });
        displayMessageService.messagesList = [];
        service.placeLetter(command);
        expect(displayMessageService.messagesList[0].text).toEqual(errorMessage);
    });

    it('toggleDebugMode function should print invalid command in chat', () => {
        displayMessageService.messagesList = [];
        const message: string[] = [];
        message.push('!debug');
        message.push(' ');
        service.toggleDebugMode(message);
        expect(displayMessageService.messagesList[0].text).toEqual('Erreur: Entrée invalide');
    });

    it('toggleDebugMode function should print that debug mode was activated when it was false before function call', () => {
        service.debugModeIsActivated = false;
        displayMessageService.messagesList = [];
        service.validateCommand('!debug');
        expect(displayMessageService.messagesList[0].text).toEqual('Affichages de débogages activés');
    });

    it('toggleDebugMode function should print that debug mode was deactivated when it was true before function call', () => {
        service.debugModeIsActivated = true;
        displayMessageService.messagesList = [];
        service.validateCommand('!debug');
        expect(displayMessageService.messagesList[0].text).toEqual('Affichages de débogage désactivés');
    });

    it('selectGameModeForExchangeLetter should call changeLetterService if solo mode is chosen', () => {
        const exchangeLetterSoloSpy = spyOn(service, 'exchangeLetterSolo');
        selectGameModeService.isSoloModeChosen = true;
        service.selectGameModeForChangeLetter('');
        expect(exchangeLetterSoloSpy).toHaveBeenCalled();
    });

    it('validateChangeLetterParameters should return true when letter is contained in the rack', () => {
        playerSettingsService.hasToPlay = true;
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = 'b';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'B', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeTrue();
    });

    it('validateChangeLetterParameters should return false when arguments exceed 7 letters', () => {
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = 'abcdefhg';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 1 });
        lettersOnRack.push({ letter: 'C', score: 1 });
        lettersOnRack.push({ letter: 'D', score: 1 });
        lettersOnRack.push({ letter: 'E', score: 1 });
        lettersOnRack.push({ letter: 'F', score: 1 });
        lettersOnRack.push({ letter: 'G', score: 1 });
        lettersOnRack.push({ letter: 'H', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('validateChangeLetterParameters should return false when the argument is empty', () => {
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = '';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('validateChangeLetterParameters should return false when it is not players turn to play', () => {
        playerSettingsService.hasToPlay = false;
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = 'b';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'B', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('validateChangeLetterParameters should return false when arguments are capital letters', () => {
        playerSettingsService.hasToPlay = true;
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = 'A';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('validateChangeLetterParameters should return false when a letter is not in rack', () => {
        playerSettingsService.hasToPlay = true;
        playerSettingsService.letters = [];
        displayMessageService.messagesList = [];

        const lettersToChange = 'a';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'B', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('validateChangeLetterParameters should return false when the letter reserve is less than 7 tiles', () => {
        playerSettingsService.hasToPlay = true;
        letterReserveService.letterReserveTotalSize = 6;
        const lettersToChange = 'a';
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });

        expect(service.validateChangeLetterParameters(lettersToChange, lettersOnRack).isValid).toBeFalse();
    });

    it('selectGameModePrintReserve should call adequate function according to selected game mode', () => {
        selectGameModeService.isSoloModeChosen = true;
        const printReserveSoloSpy = spyOn(service, 'printReserveSolo');
        service.selectGameModePrintReserve(['!debug']);
        expect(printReserveSoloSpy).toHaveBeenCalled();
        selectGameModeService.isSoloModeChosen = false;
        const printReserveMultiSpy = spyOn(service, 'printReserveMulti');
        service.selectGameModePrintReserve(['!debug']);
        expect(printReserveMultiSpy).toHaveBeenCalled();
    });

    it('selectGameModeForSkipTurn should call adequate function according to selected game mode', () => {
        selectGameModeService.isSoloModeChosen = true;
        const skipTurnSoloSpy = spyOn(service, 'skipTurnSolo');
        service.selectGameModeForSkipTurn(['!passer']);
        expect(skipTurnSoloSpy).toHaveBeenCalled();
        selectGameModeService.isSoloModeChosen = false;
        const skipTurnMultiSpy = spyOn(service, 'skipTurnMulti');
        service.selectGameModeForSkipTurn(['!passer']);
        expect(skipTurnMultiSpy).toHaveBeenCalled();
    });

    it('selectGameModeForPlaceLetter should call placeLetter if solo mode is selected and it is players turn to play', () => {
        service.isSoloModeChosen = true;
        playerSettingsService.hasToPlay = true;
        const placeLetterSpy = spyOn(service, 'placeLetter');
        service.selectGameModeForPlaceLetter('message');
        expect(placeLetterSpy).toHaveBeenCalled();
    });

    it('selectGameModeForPlaceLetter should return undefined if it is not players turn to play in solo mode', () => {
        service.isSoloModeChosen = true;
        playerSettingsService.hasToPlay = false;
        expect(service.selectGameModeForPlaceLetter('message')).toBeUndefined();
    });

    it('selectGameModeForPlaceLetter should return undefined if it is not players turn to play in multiplayer mode', () => {
        service.isSoloModeChosen = false;
        selectGameModeService.isOnlinePlayerTurn = false;
        expect(service.selectGameModeForPlaceLetter('message')).toBeUndefined();
    });

    it('selectGameModeForChangeLetter should call exchangeLetterMulti when multiplayer mode is selected', () => {
        service.isSoloModeChosen = false;
        const exchangeLetterMultiSpy = spyOn(service, 'exchangeLetterMulti');
        service.selectGameModeForChangeLetter('message');
        expect(exchangeLetterMultiSpy).toHaveBeenCalled();
    });

    it('exchangeLetterMulti should call exchangeLetterMulti when multiplayer mode is selected and it is players turn', () => {
        selectGameModeService.isOnlinePlayerTurn = true;
        const lettersToExchangeObservableSpy = spyOn(service.lettersToExchangeObservable, 'next');
        service.selectGameModeForChangeLetter('message');
        expect(lettersToExchangeObservableSpy).toHaveBeenCalled();
    });

    it('exchangeLetterMulti should call exchangeLetterMulti when multiplayer mode is selected and it is not players turn to play', () => {
        selectGameModeService.isOnlinePlayerTurn = false;
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.selectGameModeForChangeLetter('message');
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('skipTurnMulti should call skipTurnMultiObservable when message is valid and it is players turn', () => {
        selectGameModeService.isOnlinePlayerTurn = true;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: true, text: '' });
        const skipTurnMultiObservableSpy = spyOn(service.skipTurnMultiObservable, 'next');
        service.skipTurnMulti(['message']);
        expect(skipTurnMultiObservableSpy).toHaveBeenCalled();
    });

    it('skipTurnMulti should call skipTurnMultiObservable when message is valid and it is not players turn', () => {
        selectGameModeService.isOnlinePlayerTurn = false;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: true, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.skipTurnMulti(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('skipTurnMulti should call skipTurnMultiObservable when message is valid and it is not players turn', () => {
        selectGameModeService.isOnlinePlayerTurn = false;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: false, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.skipTurnMulti(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printReserveSolo should call getLetterQuantity when message is valid and debug mode is activated', () => {
        service.debugModeIsActivated = true;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: true, text: '' });
        const getLetterQuantitySpy = spyOn(letterReserveService, 'getLetterQuantity');
        service.printReserveSolo(['message']);
        expect(getLetterQuantitySpy).toHaveBeenCalled();
    });

    it('printReserveSolo should display message when debug mode is not activated', () => {
        service.debugModeIsActivated = false;
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printReserveSolo(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printReserveSolo should display message when message is not valid and debug mode is activated', () => {
        service.debugModeIsActivated = true;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: false, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printReserveSolo(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printReserveMulti should call sendReserveObservable message is valid and debug mode is activated', () => {
        service.debugModeIsActivated = true;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: true, text: '' });
        const sendReserveObservableSpy = spyOn(service.sendReserveObservable, 'next');
        service.printReserveMulti(['message']);
        expect(sendReserveObservableSpy).toHaveBeenCalled();
    });

    it('printReserveMulti should display message when debug mode is not activated', () => {
        service.debugModeIsActivated = false;
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printReserveMulti(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printReserveMulti should display message when message is not valid and debug mode is activated', () => {
        service.debugModeIsActivated = true;
        spyOn(service, 'validateParameters').and.returnValue({ isValid: false, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printReserveMulti(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printHelp should display the HELP_MAP if the command is valid', () => {
        service.debugModeIsActivated = false;
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printReserveSolo(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printHelp should display message if the command is valid', () => {
        spyOn(service, 'validateParameters').and.returnValue({ isValid: true, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printHelp(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('printHelp should display message if the command is not valid', () => {
        spyOn(service, 'validateParameters').and.returnValue({ isValid: false, text: '' });
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.printHelp(['message']);
        expect(addMessageListSpy).toHaveBeenCalled();
    });
});
