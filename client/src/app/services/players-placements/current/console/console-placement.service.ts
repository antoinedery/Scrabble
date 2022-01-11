import { Injectable } from '@angular/core';
import {
    CENTRAL_SQUARE,
    COLUMN_NUMBER_POSSIBILITIES,
    COMMAND_ARGUMENTS_MIN_SIZE,
    COMMAND_ARGUMENTS_POSSIBLE_SIZES,
    MIDDLE_TILE_POSITION,
    NOT_FOUND,
    ORIENTATION_POSSIBILITIES,
    RowColumnMinMaxSize,
    ROW_LETTER_POSSIBILITIES,
} from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Tile } from '@app/classes/interfaces/tile';
import { Validation } from '@app/classes/interfaces/validation';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { PlayerPlacementConfirmationService } from '@app/services/players-placements/current/player-placement-confirmation.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ConsolePlacementService extends PlayerPlacementConfirmationService {
    commands: string[];
    commandArguments: string;
    commandArgumentsSize: string[];
    wordToPlace: string;
    constructor(
        private characterValidatorService: CharacterValidatorService,
        public playerSettingsService: PlayerSettingsService,
        public placementValidationService: PlacementValidationService,
        public tileHandlerService: TileHandlerService,
        public turnHandlerService: TurnHandlerService,
        public selectGameModeService: SelectGameModeService,
        public objectivesValidationService: ObjectivesValidationService,
    ) {
        super(
            playerSettingsService,
            placementValidationService,
            tileHandlerService,
            turnHandlerService,
            selectGameModeService,
            objectivesValidationService,
        );
    }

    validateWholeCommand(wholeCommand: string): Validation {
        if (!this.validateCommandSize(wholeCommand)) {
            return { isValid: false, text: "Entrée invalide : la commande n'est pas composée de 3 chaines de caractères" };
        }
        this.commands = wholeCommand.split(' ');
        this.commandArguments = this.commands[1];
        this.wordToPlace = this.commands[2];

        if (!this.validateCommandTerms().isValid) {
            return { isValid: this.validateCommandTerms().isValid, text: this.validateCommandTerms().text };
        }

        if (!this.doesWordFitOnBoard(this.commandArgumentsSize, this.wordToPlace)) {
            return { isValid: false, text: 'Erreur de syntaxe : le mot ne tient pas sur le plateau' };
        }
        if (this.tileHandlerService.isEmptyTile(MIDDLE_TILE_POSITION)) {
            /* istanbul ignore else */
            if (!this.wouldWordToPlaceTouchCentralSquare(this.commandArgumentsSize, this.wordToPlace)) {
                return { isValid: false, text: 'Commande impossible à réaliser : le mot ne touche pas la case centrale' };
            }
        } else {
            if (!this.wouldWordToPlaceTouchAnotherWord(this.commandArgumentsSize, this.wordToPlace)) {
                return { isValid: false, text: 'Commande impossible à réaliser : le mot ne touche aucune autre lettre déjà présente sur le plateau' };
            }
        }
        const placement = this.canTheLettersBePlacedOnTheBoard(this.commandArgumentsSize, this.wordToPlace);

        if (!placement) {
            return { isValid: false, text: 'Erreur de syntaxe : les lettres à placer ne sont pas présentes sur le plateau ni sur le chevalet' };
        }

        for (const letter of placement.letters) {
            this.placeLetterFromRack(letter);
        }

        this.placement = placement;
        this.messageToOutput = wholeCommand;
        this.confirmPlayerPlacement();
        return { isValid: true, text: 'Commande valide et réalisée' };
    }

    validateCommandTerms(): Validation {
        if (!this.isCommandArgumentsTheRightSize(this.commandArguments)) {
            return { isValid: false, text: 'Entree invalide : les arguments de la commande ne font pas 3 ou 4 caractères' };
        }
        this.commandArgumentsSize = this.convertCommandArgumentsInto3Strings(this.commandArguments);

        if (!this.validateCommandArguments(this.commandArgumentsSize)) {
            return { isValid: false, text: 'Entree invalide : les arguments de la commande ne sont pas valides' };
        }

        if (!this.validateWordToPlace(this.wordToPlace)) {
            return { isValid: false, text: 'Entree invalide : les lettres à placer ne sont pas valides' };
        }
        return { isValid: true, text: '' };
    }

    validateCommandSize(commands: string): boolean {
        return commands.split(' ').length === 3;
    }

    isCommandArgumentsTheRightSize(commandArguments: string): boolean {
        return COMMAND_ARGUMENTS_POSSIBLE_SIZES.indexOf(commandArguments.length) !== NOT_FOUND;
    }

    convertCommandArgumentsInto3Strings(commandArguments: string): string[] {
        const newCommandsArguments = [''];
        if (commandArguments.length === COMMAND_ARGUMENTS_MIN_SIZE) {
            for (let i = 0; i < commandArguments.length; i++) {
                newCommandsArguments[i] = commandArguments[i];
            }
        } else {
            newCommandsArguments[0] = commandArguments[0];
            newCommandsArguments[1] = commandArguments[1].concat(commandArguments[2]);
            newCommandsArguments[2] = commandArguments[3];
        }
        return newCommandsArguments;
    }

    validateCommandArguments(commandArguments: string[]): boolean {
        const validateX = this.validateRowArguments(commandArguments[0]);
        const validateY = this.validateColumnArguments(+commandArguments[1]);
        const validateOrientation = this.validateOrientation(commandArguments[2]);
        return !validateX ? false : !validateY ? false : !validateOrientation ? false : true;
    }

    validateRowArguments(letter: string): boolean {
        return ROW_LETTER_POSSIBILITIES.indexOf(letter) !== NOT_FOUND;
    }

    validateColumnArguments(numbers: number): boolean {
        return COLUMN_NUMBER_POSSIBILITIES.indexOf(numbers) !== NOT_FOUND;
    }

    validateOrientation(orientation: string): boolean {
        return orientation === ORIENTATION_POSSIBILITIES.horizontal ? true : orientation === ORIENTATION_POSSIBILITIES.vertical ? true : false;
    }

    validateWordToPlace(wordToPlace: string): boolean {
        if (!this.isInputAtLeastACharacter(wordToPlace)) {
            return false;
        }
        if (!this.isInputAWord(wordToPlace)) {
            return false;
        }
        const letterRackCapitalLetters = this.playerSettingsService.getNumberOfBlankLettersInLetterRack();
        const wordToPlaceCapitalLetters = this.numberOfCapitalLettersInWordToPlace(wordToPlace);
        if (wordToPlaceCapitalLetters > letterRackCapitalLetters) {
            return false;
        }
        return true;
    }

    isInputAtLeastACharacter(input: string): boolean {
        const INPUT_MIN_SIZE = 1;
        return input.length >= INPUT_MIN_SIZE;
    }

    isInputAWord(input: string) {
        for (const inputletter of input) {
            const letter = this.characterValidatorService.removeLetterAccent(inputletter);
            if (!this.characterValidatorService.checkIsALetter(letter)) {
                return false;
            }
        }
        return true;
    }

    numberOfCapitalLettersInWordToPlace(wordToPlace: string): number {
        const capitalLetters = wordToPlace.match(/[A-Z]/g);
        const nbCapitalLetters: number | undefined = capitalLetters?.length;
        return nbCapitalLetters ? nbCapitalLetters : 0;
    }

    doesWordFitOnBoard(commandArguments: string[], word: string): boolean {
        return commandArguments[2] === ORIENTATION_POSSIBILITIES.vertical
            ? commandArguments[0].charCodeAt(0) + word.length - 1 <= ROW_LETTER_POSSIBILITIES[ROW_LETTER_POSSIBILITIES.length - 1].charCodeAt(0)
            : +commandArguments[1] + word.length - 1 <= COLUMN_NUMBER_POSSIBILITIES.length;
    }

    wouldWordToPlaceTouchCentralSquare(commandArguments: string[], wordToPlace: string): boolean {
        if (commandArguments[2] === ORIENTATION_POSSIBILITIES.vertical) {
            if (commandArguments[1] !== CENTRAL_SQUARE.column) return false;
            return commandArguments[0].charCodeAt(0) > CENTRAL_SQUARE.row.charCodeAt(0)
                ? false
                : commandArguments[0].charCodeAt(0) + wordToPlace.length - 1 >= CENTRAL_SQUARE.row.charCodeAt(0);
        }
        if (commandArguments[0] !== CENTRAL_SQUARE.row) return false;
        return +commandArguments[1] > +CENTRAL_SQUARE.column ? false : +commandArguments[1] + wordToPlace.length - 1 >= +CENTRAL_SQUARE.column;
    }

    wouldWordToPlaceTouchAnotherWord(commandArguments: string[], wordToPlace: string): boolean {
        let y = commandArguments[0].charCodeAt(0) - 'a'.charCodeAt(0);
        let x = +commandArguments[1] - 1;
        let i = 0;
        while (i < wordToPlace.length) {
            const thisSquare = this.tileHandlerService.getLetterOnTile({ x, y });
            const upperSquare = y - 1 >= RowColumnMinMaxSize.SmallestRowPossible && this.tileHandlerService.getLetterOnTile({ x, y: y - 1 });
            const lowerSquare = y + 1 <= RowColumnMinMaxSize.BiggestRowPossible && this.tileHandlerService.getLetterOnTile({ x, y: y + 1 });
            const leftSquare = x - 1 >= RowColumnMinMaxSize.SmallestColumnPossible && this.tileHandlerService.getLetterOnTile({ x: x - 1, y });
            const rightSquare = x + 1 <= RowColumnMinMaxSize.BiggestColumnPossible && this.tileHandlerService.getLetterOnTile({ x: x + 1, y });

            if (thisSquare || upperSquare || lowerSquare || leftSquare || rightSquare) {
                return true;
            }
            if (commandArguments[2] === ORIENTATION_POSSIBILITIES.horizontal) x++;
            else y++;
            i++;
        }
        return false;
    }

    canTheLettersBePlacedOnTheBoard(commandArguments: string[], wordToPlace: string): Placement | undefined {
        const placementAxis = commandArguments[2] === ORIENTATION_POSSIBILITIES.horizontal ? AXIS.HORIZONTAL : AXIS.VERTICAL;
        const placement: Placement = {
            axis: placementAxis,
            letters: new Array(),
        };
        const vecCtr = {
            x: +commandArguments[1] - 1,
            y: commandArguments[0].charCodeAt(0) - 'a'.charCodeAt(0),
        };
        let currentLetterRackTemp: Tile[] = [];
        currentLetterRackTemp = Object.assign(currentLetterRackTemp, this.playerSettingsService.letters);
        for (const content of wordToPlace) {
            const letter = this.characterValidatorService.removeLetterAccent(content);
            if (letter !== this.tileHandlerService.getLetterOnTile(vecCtr)) {
                if (
                    !this.tileHandlerService.isEmptyTile(vecCtr) ||
                    !this.playerSettingsService.removeLetterFromGivenRack(currentLetterRackTemp, letter)
                )
                    return;

                placement.letters.push({ content, position: { x: vecCtr.x, y: vecCtr.y } });
            }
            this.tileHandlerService.incrementVector(placement.axis, vecCtr);
        }
        return placement;
    }
}
