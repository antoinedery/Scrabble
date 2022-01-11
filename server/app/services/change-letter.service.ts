import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { Validation } from '@app/classes/interfaces/validation';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Service } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { TurnHandlerService } from './turn-handler.service';

declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class ChangeLetterService {
    constructor(
        private letterReserveService: LetterReserveService,
        private activePlayerService: ActivePlayerService,
        private turnHandlerService: TurnHandlerService,
    ) {}

    exchangeLettersUsingSelection(socket: ASocket, lettersToExchange: string, roomID: string): void {
        /* istanbul ignore else */
        if (!this.validateLetterChangeUsingSelection()) {
            socket.emit('LettersToExchangeNotPossible', 'Commande impossible : La réserve contient moins de 7 lettres.');
            return;
        }
        const map: Map<number, string> = new Map(JSON.parse(lettersToExchange));
        const lettersExchangedString = this.swipeLettersFromSelection(map);

        this.turnHandlerService.resetObjectivesCountersObservable.next(true);
        this.turnHandlerService.resetTurnsPassed();

        socket.emit('hereIsYourLetterRack', this.activePlayerService.activePlayerRack);
        socket.emit('hereIsANewMessage', '!échanger ' + lettersExchangedString, this.activePlayerService.playerName);
        socket.broadcast
            .to(roomID)
            .emit('hereIsANewMessage', '!échanger ' + lettersExchangedString.length + ' lettres', this.activePlayerService.playerName);
    }

    validateLetterChangeUsingSelection(): boolean {
        return this.letterReserveService.letterReserveTotalSize >= LETTERS_RACK_SIZE;
    }

    swipeLettersFromSelection(lettersToChange: Map<number, string>): string {
        let changedLetters = '';
        const newTiles: Tile[] = this.letterReserveService.pickTilesArray(lettersToChange.size);

        for (const [key, value] of lettersToChange.entries()) {
            this.letterReserveService.insertTileInReserve(this.activePlayerService.activePlayerRack[key]);
            changedLetters += value;
            this.activePlayerService.activePlayerRack[key] = newTiles[0];
            newTiles.splice(0, 1);
        }

        return changedLetters.toLowerCase();
    }

    exchangeLettersUsingInputChat(socket: ASocket, lettersToExchange: string, roomID: string): void {
        const isCommandValid = this.validateChangeLetterParametersFromInputChat(lettersToExchange);
        if (!isCommandValid.isValid) {
            socket.emit('LettersToExchangeNotPossible', isCommandValid.text);
            return;
        }
        this.changeLettersFromInputChat(lettersToExchange);
        this.turnHandlerService.resetObjectivesCountersObservable.next(true);
        this.turnHandlerService.resetTurnsPassed();

        socket.emit('hereIsYourLetterRack', this.activePlayerService.activePlayerRack);
        socket.emit('hereIsANewMessage', '!échanger ' + lettersToExchange, this.activePlayerService.playerName);
        socket.broadcast
            .to(roomID)
            .emit('hereIsANewMessage', '!échanger ' + lettersToExchange.length + ' lettres', this.activePlayerService.playerName);
    }

    validateChangeLetterParametersFromInputChat(lettersToChange: string): Validation {
        //  if parameters length < 1 or > 7
        if (lettersToChange.length === 0 || lettersToChange.length > LETTERS_RACK_SIZE) {
            return { isValid: false, text: "Commande impossible : Le nombre d'arguments est invalide" };
        }
        const lettersToChangeArray = Array.from(lettersToChange);

        // if reserve size < 7
        if (this.letterReserveService.letterReserveTotalSize < LETTERS_RACK_SIZE) {
            return { isValid: false, text: 'Commande impossible : La réserve contient moins de 7 lettres.' };
        }

        // if letters are in rack
        let isInLetterRack = false;
        for (const charToChange of lettersToChangeArray) {
            if (charToChange.charAt(0) !== '*' && charToChange.charAt(0) === charToChange.charAt(0).toUpperCase()) {
                return { isValid: false, text: 'Erreur de syntaxe : les lettres à échanger doivent être des lettres en minuscules' };
            }
            let currentLetterRackTemp: Tile[] = [];
            currentLetterRackTemp = Object.assign(currentLetterRackTemp, this.activePlayerService.activePlayerRack);
            for (const [index, letter] of currentLetterRackTemp.entries()) {
                if (charToChange.toUpperCase() === letter.letter.toUpperCase()) {
                    isInLetterRack = true;
                    currentLetterRackTemp.splice(index, 1);
                    break;
                } else isInLetterRack = false;
            }
            if (!isInLetterRack) return { isValid: false, text: 'Erreur de syntaxe : les lettres doivent être présentes dans le chevalet' };
        }
        return { isValid: true, text: '' };
    }

    changeLettersFromInputChat(letters: string): void {
        const newTiles: Tile[] = [];
        for (const letter of letters) {
            /* istanbul ignore else */
            if (letter) {
                const newTile = this.letterReserveService.pickTile();
                /* istanbul ignore else */
                if (newTile) {
                    newTiles.push(newTile);
                }
            }
        }

        if (newTiles.length === 0) return;

        for (let i = 0; i < letters.length; i++) {
            for (let j = 0; j < this.activePlayerService.activePlayerRack.length; j++) {
                /* istanbul ignore else */
                if (letters[i].toUpperCase() === this.activePlayerService.activePlayerRack[j].letter.toUpperCase()) {
                    this.letterReserveService.insertTileInReserve(this.activePlayerService.activePlayerRack[j]);
                    this.activePlayerService.activePlayerRack[j] = newTiles[i];
                    break;
                }
            }
        }
    }
}
