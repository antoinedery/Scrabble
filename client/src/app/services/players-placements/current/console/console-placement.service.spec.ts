// Disable de lint autorisé par chargés
/* eslint-disable max-len */
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { ConsolePlacementService } from '@app/services/players-placements/current/console/console-placement.service';

describe('ConsolePlacementService', () => {
    let service: ConsolePlacementService;
    let playerSettingsService: PlayerSettingsService;
    let playAreaService: PlayAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConsolePlacementService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        playAreaService = TestBed.inject(PlayAreaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateWholeCommand should return an error message if the command is not the right size', () => {
        const command = '!placer a1h bonjour autreMot';
        const expectedResult = { isValid: false, text: "Entrée invalide : la commande n'est pas composée de 3 chaines de caractères" };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return an error message if the command terms are not valid', () => {
        const command = '!placer a1p bonjour';
        const expectedResult = { isValid: false, text: 'Entree invalide : les arguments de la commande ne sont pas valides' };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return an error message if the word doesnt fit on board', () => {
        const command = '!placer a10h wordtoolongtofit';
        const expectedResult = { isValid: false, text: 'Erreur de syntaxe : le mot ne tient pas sur le plateau' };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return an error message if it is the first round and the word doesnt touch the central square', () => {
        playAreaService.initialiseBoardCaseList();
        const command = '!placer a5h bonjour';
        const expectedResult = { isValid: false, text: 'Commande impossible à réaliser : le mot ne touche pas la case centrale' };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return an error message if it is the first round and the word doesnt touch the central square', () => {
        playAreaService.initialiseBoardCaseList();
        playAreaService.boardGame[7][7].letter = 'H';
        const command = '!placer a5h bonjour';
        const expectedResult = {
            isValid: false,
            text: 'Commande impossible à réaliser : le mot ne touche aucune autre lettre déjà présente sur le plateau',
        };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return an error message if the word entered by the user cant be placed on the board', () => {
        playAreaService.initialiseBoardCaseList();
        playAreaService.boardGame[7][7].letter = 'H';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: 'E', score: 0 });
        playerSettingsService.letters.push({ letter: 'L', score: 0 });
        playerSettingsService.letters.push({ letter: 'L', score: 0 });
        const command = '!placer h8h hello';
        const expectedResult = {
            isValid: false,
            text: 'Erreur de syntaxe : les lettres à placer ne sont pas présentes sur le plateau ni sur le chevalet',
        };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateWholeCommand should return true and validation message', () => {
        playAreaService.initialiseBoardCaseList();
        playAreaService.boardGame[7][7].letter = 'H';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: 'E', score: 0 });
        playerSettingsService.letters.push({ letter: 'L', score: 0 });
        playerSettingsService.letters.push({ letter: 'L', score: 0 });
        playerSettingsService.letters.push({ letter: 'O', score: 0 });
        const command = '!placer h8h hello';
        const expectedResult = { isValid: true, text: 'Commande valide et réalisée' };
        expect(service.validateWholeCommand(command)).toEqual(expectedResult);
    });

    it('validateCommandTerms should return an error message if the command arguments are not the right size', () => {
        service.commandArguments = 'a123h';
        const expectedResult = { isValid: false, text: 'Entree invalide : les arguments de la commande ne font pas 3 ou 4 caractères' };
        expect(service.validateCommandTerms()).toEqual(expectedResult);
    });

    it('validateCommandTerms should return an error message if the command arguments are not valid', () => {
        service.commandArguments = 'a12p';
        const expectedResult = { isValid: false, text: 'Entree invalide : les arguments de la commande ne sont pas valides' };
        expect(service.validateCommandTerms()).toEqual(expectedResult);
    });

    it('validateCommandTerms should return an error message if the word to place is not valid', () => {
        service.commandArguments = 'a12h';
        service.wordToPlace = 'abcDE';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: '*', score: 0 });
        const expectedResult = { isValid: false, text: 'Entree invalide : les lettres à placer ne sont pas valides' };
        expect(service.validateCommandTerms()).toEqual(expectedResult);
    });

    it('validateCommandTerms should return true is the command terms are valid', () => {
        service.commandArguments = 'a10h';
        service.wordToPlace = 'valid';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: '*', score: 0 });
        const expectedResult = { isValid: true, text: '' };
        expect(service.validateCommandTerms()).toEqual(expectedResult);
    });

    it('isCommandArgumentsTheRightSize should return true if the command arguments is the right size', () => {
        const commandArguments = 'a12h';
        expect(service.isCommandArgumentsTheRightSize(commandArguments)).toBeTrue();
    });

    it('convertCommandArgumentsInto3Strings should convert the command arguments of size 3 into an array of 3 strings', () => {
        const commandArguments = 'a5h';
        const expectedResult = ['a', '5', 'h'];
        expect(service.convertCommandArgumentsInto3Strings(commandArguments)).toEqual(expectedResult);
    });

    it('convertCommandArgumentsInto3Strings should convert the command arguments of size 4 into an array of 3 strings', () => {
        const commandArguments = 'a12h';
        const expectedResult = ['a', '12', 'h'];
        expect(service.convertCommandArgumentsInto3Strings(commandArguments)).toEqual(expectedResult);
    });

    it('validateCommandArguments should return false if the row is not valid', () => {
        const row = 'p';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        expect(service.validateCommandArguments(commandArguments)).toBeFalse();
    });

    it('validateCommandArguments should return false if the column is not valid', () => {
        const row = 'a';
        const column = '20';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        expect(service.validateCommandArguments(commandArguments)).toBeFalse();
    });

    it('validateCommandArguments should return false if the orientation is not valid', () => {
        const row = 'a';
        const column = '15';
        const orientation = 'p';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        expect(service.validateCommandArguments(commandArguments)).toBeFalse();
    });

    it('validateCommandArguments should return true if the command arguments (row+column+orientation) are valid', () => {
        const row = 'a';
        const column = '12';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        expect(service.validateCommandArguments(commandArguments)).toBeTrue();
    });

    it('validateRowArguments should return whether the row is valid', () => {
        const row = 'c';
        expect(service.validateRowArguments(row)).toBeTrue();
    });

    it('validateColumnArguments should return whether the column is valid', () => {
        const column = 15;
        expect(service.validateColumnArguments(column)).toBeTrue();
    });

    it('validateOrientation should return true if the orientation is valid', () => {
        const orientation = 'v';
        expect(service.validateOrientation(orientation)).toBeTrue();
    });

    it('validateOrientation should return false if the orientation is invalid', () => {
        const orientation = 'p';
        expect(service.validateOrientation(orientation)).toBeFalse();
    });

    it('validateWordToPlace should return false if the word is not at least a character', () => {
        const word = '';
        expect(service.validateWordToPlace(word)).toBeFalse();
    });

    it('validateWordToPlace should return false if the word is not composed only of letters', () => {
        const word = 'aaBB(';
        expect(service.validateWordToPlace(word)).toBeFalse();
    });

    it('validateWordToPlace should return false if the word is not composed only of letters', () => {
        const word = 'aaBB';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: '*', score: 0 });
        expect(service.validateWordToPlace(word)).toBeFalse();
    });

    it('validateWordToPlace should return true if the word is valid', () => {
        const word = 'aEH';
        playerSettingsService.letters = [];
        playerSettingsService.letters.push({ letter: '*', score: 0 });
        playerSettingsService.letters.push({ letter: '*', score: 0 });
        expect(service.validateWordToPlace(word)).toBeTrue();
    });

    it('isInputAtLeastACharacter should return whether the parameter is a least a character', () => {
        const word = 'a';
        expect(service.isInputAtLeastACharacter(word)).toBeTrue();
    });

    it('isInputAWord should return false the parameter is not composed only of letters', () => {
        const word = 'aabbEFg*';
        expect(service.isInputAWord(word)).toBeFalse();
    });

    it('isInputAWord should return true if the parameter is composed only of letters', () => {
        const word = 'aabbEFg';
        expect(service.isInputAWord(word)).toBeTrue();
    });

    it('numberOfCapitalLettersInWordToPlace should return the number of capital letters in the word if it is greater than 0', () => {
        const word = 'abcDE';
        const numberOfCapitalLettersInWord = 2;
        expect(service.numberOfCapitalLettersInWordToPlace(word)).toEqual(numberOfCapitalLettersInWord);
    });

    it('numberOfCapitalLettersInWordToPlace should return 0 if there isnt any capital letters in the word', () => {
        const word = 'abc';
        const numberOfCapitalLettersInWord = 0;
        expect(service.numberOfCapitalLettersInWordToPlace(word)).toEqual(numberOfCapitalLettersInWord);
    });

    it('doesWordFitOnBoard should return whether the word to place would fit horizontally on the game board', () => {
        const row = 'a';
        const column = '12';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'wordTooLongToFit';
        expect(service.doesWordFitOnBoard(commandArguments, wordToPlace)).toBeFalse();
    });

    it('doesWordFitOnBoard should return whether the word to place would fit vertically on the game board', () => {
        const row = 'a';
        const column = '12';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'wordFits';
        expect(service.doesWordFitOnBoard(commandArguments, wordToPlace)).toBeTrue();
    });

    it('wouldWordToPlaceTouchCentralSquare should return false if the word is placed vertically and the column is not 8', () => {
        const row = 'a';
        const column = '9';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeFalse();
    });

    it('wouldWordToPlaceTouchCentralSquare should return false if the word is placed vertically and the starting row is greather than row h', () => {
        const row = 'i';
        const column = '8';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeFalse();
    });

    it('wouldWordToPlaceTouchCentralSquare should return whether the word touches the central square if the word is placed vertically and the starting row is lower than row h', () => {
        const row = 'f';
        const column = '8';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'onH8';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeTrue();
    });

    it('wouldWordToPlaceTouchCentralSquare should return false if the word is placed horizontally and the row is not row h', () => {
        const row = 'f';
        const column = '8';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeFalse();
    });

    it('wouldWordToPlaceTouchCentralSquare should return false if the word is placed horizontally and the starting column is greater than 8', () => {
        const row = 'h';
        const column = '9';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeFalse();
    });

    it('wouldWordToPlaceTouchCentralSquare should return whether the word touches the central square if the word is placed horizontally and the starting column is lower than column 8', () => {
        const row = 'h';
        const column = '7';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        expect(service.wouldWordToPlaceTouchCentralSquare(commandArguments, wordToPlace)).toBeTrue();
    });

    it('wouldWordToPlaceTouchAnotherWord should return true if there is a letter on the right square', () => {
        const row = 'h';
        const column = '8';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        playAreaService.initialiseBoardCaseList();
        const randomRow = 7;
        const randomColumn = 8;
        playAreaService.boardGame[randomRow][randomColumn].letter = 'a';
        expect(service.wouldWordToPlaceTouchAnotherWord(commandArguments, wordToPlace)).toBeTrue();
    });

    it('wouldWordToPlaceTouchAnotherWord should return false if the orientation is horizontal and it doesnt touch any letter on the board', () => {
        const row = 'h';
        const column = '8';
        const orientation = 'h';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        playAreaService.initialiseBoardCaseList();
        expect(service.wouldWordToPlaceTouchAnotherWord(commandArguments, wordToPlace)).toBeFalse();
    });

    it('wouldWordToPlaceTouchAnotherWord should return true if the orientation is vertical and it doesnt touch any letter on the board', () => {
        const row = 'h';
        const column = '8';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'word';
        playAreaService.initialiseBoardCaseList();
        expect(service.wouldWordToPlaceTouchAnotherWord(commandArguments, wordToPlace)).toBeFalse();
    });

    it('canTheLettersBePlacedOnTheBoard should return correct placement if letters are placed vertically', () => {
        spyOn(playerSettingsService, 'removeLetterFromGivenRack').and.returnValue(true);
        const row = 'i';
        const column = '8';
        const orientation = 'v';
        const commandArguments: string[] = [];
        commandArguments.push(row);
        commandArguments.push(column);
        commandArguments.push(orientation);
        const wordToPlace = 'a';
        playAreaService.initialiseBoardCaseList();
        playAreaService.boardGame[7][7].letter = 'l';
        const expectedResult: Placement = { axis: AXIS.VERTICAL, letters: [{ position: { x: 7, y: 8 }, content: 'a' }] };
        expect(service.canTheLettersBePlacedOnTheBoard(commandArguments, wordToPlace)).toEqual(expectedResult);
    });
});
