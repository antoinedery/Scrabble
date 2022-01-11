import { Injectable } from '@angular/core';
import { HELP_MAP, INPUT_BOX, INVALID_COMMAND, LETTERS_RACK_SIZE, MESSAGES_MAP } from '@app/classes/constants/constants';
import { Command } from '@app/classes/enums/enums';
import { Tile } from '@app/classes/interfaces/tile';
import { SelectGameMode } from '@app/classes/select-game-mode';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { DebugCommandService } from '@app/services/debug-command.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { ConsolePlacementService } from '@app/services/players-placements/current/console/console-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { BeginnerVirtualPlayerActionsService } from '@app/services/virtual-player-actions/beginner/beginner-virtual-player-actions.service';
import { Subject } from 'rxjs';
import { ExpertVirtualPlayerActionsService } from './virtual-player-actions/expert/expert-virtual-player-actions.service';

const SYMBOL_FOR_COMMAND = '!';

interface Validation {
    isValid: boolean;
    text: string;
}

@Injectable({
    providedIn: 'root',
})
export class InputChatService extends SelectGameMode {
    debugModeIsActivated = false;
    messageObservable: Subject<string> = new Subject<string>();
    isSoloModeChosenObservable: Subject<boolean> = new Subject<boolean>();
    lettersToExchangeObservable: Subject<string> = new Subject<string>();
    incrementTurnsPassedObservable: Subject<boolean> = new Subject<boolean>();
    skipTurnMultiObservable: Subject<boolean> = new Subject<boolean>();
    sendReserveObservable: Subject<boolean> = new Subject<boolean>();
    quantity: number | undefined;
    commandValidationService: unknown;

    constructor(
        private changeLetterService: ChangeLetterService,
        private playerSettingsService: PlayerSettingsService,
        private turnHandlerService: TurnHandlerService,
        private displayMessageService: DisplayMessageService,
        private debugCommandService: DebugCommandService,
        private letterReserveService: LetterReserveService,
        public selectGameModeService: SelectGameModeService,
        private consolePlacementService: ConsolePlacementService,
        private expertVirtualPlayerActionsService: ExpertVirtualPlayerActionsService,
        private beginnerVirtualPlayerActionsService: BeginnerVirtualPlayerActionsService,
    ) {
        super(selectGameModeService);

        this.beginnerVirtualPlayerActionsService.potentialPlacementObservable.subscribe((value) => {
            /* istanbul ignore else */
            if (this.debugModeIsActivated) {
                for (const placement of value) {
                    this.debugCommandService.displayVirtualPlayerWords(placement);
                }
            }
        });

        this.expertVirtualPlayerActionsService.potentialPlacementObservable.subscribe((value) => {
            /* istanbul ignore else */
            if (this.debugModeIsActivated) {
                for (const placement of value) {
                    this.debugCommandService.displayVirtualPlayerWords(placement);
                }
            }
        });
    }

    validateChangeLetterParameters(lettersToChange: string, currentLetters: Tile[]): Validation {
        //  if parameters length < 1 or > 7
        if (lettersToChange === undefined || lettersToChange.length > LETTERS_RACK_SIZE) {
            return { isValid: false, text: "Commande impossible : Le nombre d'arguments est invalide" };
        }

        const lettersToChangeArray = Array.from(lettersToChange);

        // if reserve size < 7
        if (this.letterReserveService.letterReserveTotalSize < LETTERS_RACK_SIZE) {
            return { isValid: false, text: 'Commande impossible : La réserve contient moins de 7 lettres.' };
        }

        // if currentPlayer's turn to play
        if (!this.playerSettingsService.hasToPlay) {
            return { isValid: false, text: 'Commande impossible : Vous devez attendre votre tour pour jouer' };
        }

        // if letters are in rack
        let isInLetterRack = false;
        for (const charToChange of lettersToChangeArray) {
            if (charToChange.charAt(0) !== '*' && charToChange.charAt(0) === charToChange.charAt(0).toUpperCase()) {
                return { isValid: false, text: 'Erreur de syntaxe : les lettres à échanger doivent être des lettres en minuscules' };
            }
            for (const [index, letter] of currentLetters.entries()) {
                if (charToChange.toUpperCase() === letter.letter.toUpperCase()) {
                    isInLetterRack = true;
                    currentLetters.splice(index, 1);
                    break;
                } else isInLetterRack = false;
            }
            if (!isInLetterRack) return { isValid: false, text: 'Erreur de syntaxe : les lettres doivent être présentes dans le chevalet' };
        }
        return { isValid: true, text: '' };
    }

    validateParameters(message: string[]): Validation {
        return message.length > 1 ? { isValid: false, text: 'Erreur: Entrée invalide' } : { isValid: true, text: '' };
    }

    detectInput(message: string, userName: string): void {
        if (!message.replace(/\s/g, '').length || message.length === 0) {
            this.displayMessageService.addMessageList('system', 'Le message ne peut être vide');
        } else if (message[0] === SYMBOL_FOR_COMMAND) {
            this.validateCommand(message);
        } else {
            this.displayMessageService.addMessageList(userName, message);
            this.messageObservable.next(message);
        }
    }

    findCommand(message: string): number {
        for (const entry of MESSAGES_MAP.entries()) {
            if (entry[0] === message) {
                return entry[1];
            }
        }
        return INVALID_COMMAND;
    }

    validateCommand(message: string): void {
        const fullCommand = message.split(' ');
        switch (this.findCommand(fullCommand[0])) {
            case MESSAGES_MAP.get(Command.Insert):
                this.selectGameModeForPlaceLetter(message);
                break;
            case MESSAGES_MAP.get(Command.Exchange):
                this.selectGameModeForChangeLetter(fullCommand[1]);
                break;
            case MESSAGES_MAP.get(Command.SkipTurn):
                this.selectGameModeForSkipTurn(fullCommand);
                break;
            case MESSAGES_MAP.get(Command.Debug):
                this.toggleDebugMode(fullCommand);
                break;
            case MESSAGES_MAP.get(Command.Reserve):
                this.selectGameModePrintReserve(fullCommand);
                break;
            case MESSAGES_MAP.get(Command.Help):
                this.printHelp(fullCommand);
                break;
            default:
                this.displayMessageService.addMessageList('system', 'Erreur : ' + message + " n'est pas une commande valide.");
        }
    }

    validateInputLength(playerMessage: string, userName: string): void {
        if (playerMessage.length <= INPUT_BOX.MAX_LENGTH) {
            this.detectInput(playerMessage, userName);
        } else {
            this.displayMessageService.addMessageList('system', 'Erreur : Le message doit avoir un maximum de 512 caractères.');
        }
    }

    selectGameModePrintReserve(fullCommand: string[]) {
        if (this.selectGameModeService.isSoloModeChosen) {
            this.printReserveSolo(fullCommand);
        } else {
            this.printReserveMulti(fullCommand);
        }
    }

    printHelp(fullCommand: string[]) {
        if (this.validateParameters(fullCommand).isValid) {
            for (const entry of HELP_MAP.entries()) {
                this.displayMessageService.addMessageList('system', entry[0] + ': ' + entry[1] + '\n');
            }
        } else this.displayMessageService.addMessageList('system', this.validateParameters(fullCommand).text);
    }

    selectGameModeForSkipTurn(command: string[]): void {
        if (this.selectGameModeService.isSoloModeChosen) {
            this.skipTurnSolo(command);
        } else {
            this.skipTurnMulti(command);
        }
    }

    selectGameModeForPlaceLetter(message: string): void {
        if (this.isSoloModeChosen) {
            if (!this.playerSettingsService.hasToPlay) {
                this.displayMessageService.addMessageList('system', 'Commande impossible : Vous devez attendre votre tour pour jouer');
                return;
            }
        } else {
            /* istanbul ignore else */
            if (!this.selectGameModeService.isOnlinePlayerTurn) {
                this.displayMessageService.addMessageList('system', 'Commande impossible : Vous devez attendre votre tour pour jouer');
                return;
            }
        }
        this.placeLetter(message);
    }

    placeLetter(message: string): void {
        const validation = this.consolePlacementService.validateWholeCommand(message);
        if (validation.isValid) {
            this.displayMessageService.addMessageList(this.playerSettingsService.name, message);
        } else {
            this.displayMessageService.addMessageList('system', validation.text);
        }
    }

    selectGameModeForChangeLetter(message: string): void {
        if (this.selectGameModeService.isSoloModeChosen) {
            this.exchangeLetterSolo(message);
        } else {
            this.exchangeLetterMulti(message);
        }
    }

    exchangeLetterSolo(message: string): void {
        const currentLetters = Array.from(this.playerSettingsService.letters);
        if (this.validateChangeLetterParameters(message, currentLetters).isValid) {
            this.displayMessageService.addMessageList(this.playerSettingsService.name, '!échanger ' + message);
            this.changeLetterService.changeLetterPlayer(message);
            this.turnHandlerService.resetObjectivesCountersObservable.next(true);
            this.turnHandlerService.resetTurnsPassed();
        } else {
            this.displayMessageService.addMessageList('system', this.validateChangeLetterParameters(message, currentLetters).text);
        }
    }

    exchangeLetterMulti(message: string): void {
        if (this.selectGameModeService.isOnlinePlayerTurn) {
            this.lettersToExchangeObservable.next(message);
        } else {
            this.displayMessageService.addMessageList('system', "Erreur : Ce n'est pas votre tour de jouer.");
        }
    }

    skipTurnSolo(message: string[]): void {
        if (this.validateParameters(message).isValid && this.playerSettingsService.hasToPlay) {
            this.displayMessageService.addMessageList(this.playerSettingsService.name, 'Passer son tour');
            this.turnHandlerService.incrementTurnsPassed();
        } else if (this.validateParameters(message).isValid && !this.playerSettingsService.hasToPlay) {
            this.displayMessageService.addMessageList('system', "Commande impossible : Ce n'est pas votre tour de jouer.");
        } else this.displayMessageService.addMessageList('system', this.validateParameters(message).text);
    }

    skipTurnMulti(message: string[]): void {
        if (this.validateParameters(message).isValid && this.selectGameModeService.isOnlinePlayerTurn) {
            this.displayMessageService.addMessageList(this.playerSettingsService.name, 'Passer son tour');
            this.messageObservable.next('Passer son tour');
            this.skipTurnMultiObservable.next();
        } else if (this.validateParameters(message).isValid && !this.selectGameModeService.isOnlinePlayerTurn) {
            this.displayMessageService.addMessageList('system', "Commande impossible : Ce n'est pas votre tour de jouer.");
        } else this.displayMessageService.addMessageList('system', this.validateParameters(message).text);
    }

    toggleDebugMode(message: string[]): void {
        if (!this.validateParameters(message).isValid) this.displayMessageService.addMessageList('system', this.validateParameters(message).text);
        else {
            if (this.debugModeIsActivated) {
                this.displayMessageService.addMessageList('system', 'Affichages de débogage désactivés');
            } else this.displayMessageService.addMessageList('system', 'Affichages de débogages activés');
            this.debugModeIsActivated = !this.debugModeIsActivated;
        }
    }

    printReserveSolo(message: string[]): void {
        if (this.validateParameters(message).isValid && this.debugModeIsActivated) {
            for (const letter of this.letterReserveService.letterReserve.keys()) {
                this.quantity = this.letterReserveService.getLetterQuantity(letter);

                this.displayMessageService.addMessageList('system', letter + `: ${this.quantity}` + '\n');
            }
        } else if (!this.debugModeIsActivated) {
            this.displayMessageService.addMessageList('system', 'Commande impossible : Affichages de débogage désactivés');
        } else this.displayMessageService.addMessageList('system', this.validateParameters(message).text);
    }

    printReserveMulti(message: string[]): void {
        if (this.validateParameters(message).isValid && this.debugModeIsActivated) {
            this.sendReserveObservable.next(true);
        } else if (!this.debugModeIsActivated) {
            this.displayMessageService.addMessageList('system', 'Commande impossible : Affichages de débogage désactivés');
        } else this.displayMessageService.addMessageList('system', this.validateParameters(message).text);
    }
}
