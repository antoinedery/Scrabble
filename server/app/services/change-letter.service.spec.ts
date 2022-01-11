// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-named-as-default */
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { Validation } from '@app/classes/interfaces/validation';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import Container from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { LetterReserveService } from './letter-reserve.service';
import { TurnHandlerService } from './turn-handler.service';

describe('ChangeLetterService', () => {
    let service: ChangeLetterService;
    let letterReserveService: LetterReserveService;
    let activePlayerService: ActivePlayerService;
    let turnHandlerService: TurnHandlerService;

    beforeEach(async () => {
        service = Container.get(ChangeLetterService);
        letterReserveService = Container.get(LetterReserveService);
        activePlayerService = Container.get(ActivePlayerService);
        turnHandlerService = Container.get(TurnHandlerService);
    });

    it('exchangeLettersUsingSelection should emit LettersToExchangeNotPossible signal and return', () => {
        const spy = Sinon.stub(service, 'validateLetterChangeUsingSelection').returns(false);
        const socketStub = {
            id: '456',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
        };
        const spyEmit = Sinon.spy(socketStub, 'emit');
        const lettersToExchange = '[[0,"A"],[1,"B"]]';
        const roomID = 'room1';
        service.exchangeLettersUsingSelection(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy.calledOnce).to.equal(true);
        expect(spyEmit.calledOnceWith('LettersToExchangeNotPossible', 'Commande impossible : La réserve contient moins de 7 lettres.')).to.equal(
            true,
        );
        spy.restore();
        spyEmit.restore();
    });

    it('exchangeLettersUsingSelection should call functions swipeLettersFromSelection and resetTurnsPassed with the right parameters', () => {
        const spy1 = Sinon.spy(service, 'swipeLettersFromSelection');
        const spy2 = Sinon.spy(turnHandlerService, 'resetTurnsPassed');
        const spy3 = Sinon.stub(service, 'validateLetterChangeUsingSelection').returns(true);
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '456',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
            broadcast: {
                to: (room: string) => {
                    return emitObject;
                },
            },
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (room: string) => {
                return emitObject;
            },
        };
        const lettersToExchange = '[[0,"A"],[1,"B"]]';
        const map: Map<number, string> = new Map();
        map.set(0, 'A');
        map.set(1, 'B');
        const roomID = 'room1';
        activePlayerService.activePlayerRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        service.exchangeLettersUsingSelection(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy1.calledOnceWith(map)).to.deep.equal(true);
        expect(spy2.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it('exchangeLettersUsingSelection should send 3 emit signals with the right parameters', () => {
        const spy1 = Sinon.stub(service, 'validateLetterChangeUsingSelection').returns(true);
        const emitObject = {
            emit: (...args: unknown[]) => {
                return;
            },
        };
        const socketStub = {
            id: '456',
            emit: (...args: unknown[]) => {
                return;
            },
            broadcast: {
                to: (room: string) => {
                    return emitObject;
                },
            },
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (room: string) => {
                return emitObject;
            },
        };
        const spy2 = Sinon.spy(socketStub, 'emit');
        const spy3 = Sinon.spy(emitObject, 'emit');
        const lettersToExchange = '[[0,"A"],[1,"B"]]';
        const roomID = 'room1';
        activePlayerService.playerName = 'John';
        activePlayerService.activePlayerRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        const forcedReturnValue = [
            { letter: 'D', score: 1 },
            { letter: 'D', score: 1 },
        ];
        const expectedLetterRack = [
            { letter: 'D', score: 1 },
            { letter: 'D', score: 1 },
        ];
        const spy4 = Sinon.stub(letterReserveService, 'pickTilesArray').returns(forcedReturnValue);
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        service.exchangeLettersUsingSelection(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy2.calledWith('hereIsYourLetterRack', expectedLetterRack)).to.deep.equal(true);
        expect(spy2.calledWith('hereIsANewMessage', '!échanger ab', 'John')).to.equal(true);
        expect(spy3.calledWith('hereIsANewMessage', '!échanger 2 lettres', 'John')).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
        spy4.restore();
    });

    it('validateLetterChangeUsingSelection should return false if letter reserve has < 7 letters', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE - 1;
        const returnedValue = service.validateLetterChangeUsingSelection();
        expect(returnedValue).to.equal(false);
    });

    it('swipeLettersFromSelection should replace letters passed in parameter from player rack', () => {
        const forcedReturnedValue = [
            { letter: 'D', score: 1 },
            { letter: 'E', score: 1 },
            { letter: 'F', score: 1 },
        ];
        const expectedResult = [
            { letter: 'D', score: 1 },
            { letter: 'E', score: 1 },
            { letter: 'F', score: 1 },
        ];
        const startingLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
            { letter: 'C', score: 1 },
        ];
        activePlayerService.activePlayerRack = startingLetterRack;
        const spy1 = Sinon.stub(letterReserveService, 'pickTilesArray').returns(forcedReturnedValue);
        const spy2 = Sinon.spy(letterReserveService, 'insertTileInReserve');
        const lettersToChange: Map<number, string> = new Map();
        lettersToChange.set(0, 'A');
        lettersToChange.set(1, 'B');
        lettersToChange.set(2, 'C');
        service.swipeLettersFromSelection(lettersToChange);
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledThrice).to.equal(true);
        expect(activePlayerService.activePlayerRack).to.deep.equal(expectedResult);
        spy1.restore();
        spy2.restore();
    });

    it('exchangeLettersUsingInputChat should emit LettersToExchangeNotPossible signal and return', () => {
        const forcedReturnedValue: Validation = { isValid: false, text: 'validation didnt pass.' };
        const spy = Sinon.stub(service, 'validateChangeLetterParametersFromInputChat').returns(forcedReturnedValue);
        const socketStub = {
            id: '456',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
        };
        const spyEmit = Sinon.spy(socketStub, 'emit');
        const lettersToExchange = 'abc';
        const roomID = 'room1';
        const startingLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
            { letter: 'C', score: 1 },
        ];
        activePlayerService.activePlayerRack = startingLetterRack;
        service.exchangeLettersUsingInputChat(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy.calledOnce).to.equal(true);
        expect(spyEmit.calledOnceWith('LettersToExchangeNotPossible', forcedReturnedValue.text)).to.equal(true);
        spy.restore();
        spyEmit.restore();
    });

    it('exchangeLettersUsingInputChat should call functions changeLettersFromInputChat and resetTurnsPassed with the right parameters', () => {
        const forcedReturnedValue: Validation = { isValid: true, text: 'validation passed.' };
        const spy1 = Sinon.stub(service, 'validateChangeLetterParametersFromInputChat').returns(forcedReturnedValue);
        const spy2 = Sinon.spy(service, 'changeLettersFromInputChat');
        const spy3 = Sinon.spy(turnHandlerService, 'resetTurnsPassed');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '456',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
            broadcast: {
                to: (room: string) => {
                    return emitObject;
                },
            },
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (room: string) => {
                return emitObject;
            },
        };
        const lettersToExchange = 'ab';
        const roomID = 'room1';
        activePlayerService.activePlayerRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        service.exchangeLettersUsingInputChat(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy2.calledOnceWith(lettersToExchange)).to.equal(true);
        expect(spy3.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it('exchangeLettersUsingInputChat should send 3 emit signals with the right parameters', () => {
        const forcedReturnedValue: Validation = { isValid: true, text: 'validation passed.' };
        const spy1 = Sinon.stub(service, 'validateChangeLetterParametersFromInputChat').returns(forcedReturnedValue);
        const emitObject = {
            emit: (...args: unknown[]) => {
                return;
            },
        };
        const socketStub = {
            id: '456',
            emit: (...args: unknown[]) => {
                return;
            },
            broadcast: {
                to: (room: string) => {
                    return emitObject;
                },
            },
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (room: string) => {
                return emitObject;
            },
        };
        const spy2 = Sinon.spy(socketStub, 'emit');
        const spy3 = Sinon.spy(emitObject, 'emit');
        const lettersToExchange = 'ab';
        const roomID = 'room1';
        activePlayerService.playerName = 'John';
        activePlayerService.activePlayerRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        const forcedReturnValue = { letter: 'D', score: 1 };
        const expectedLetterRack = [
            { letter: 'D', score: 1 },
            { letter: 'D', score: 1 },
        ];
        const spy4 = Sinon.stub(letterReserveService, 'pickTile').returns(forcedReturnValue);
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        service.exchangeLettersUsingInputChat(socketStub as unknown as SocketIO.Socket, lettersToExchange, roomID);
        expect(spy2.calledWith('hereIsYourLetterRack', expectedLetterRack)).to.equal(true);
        expect(spy2.calledWith('hereIsANewMessage', '!échanger ab', 'John')).to.equal(true);
        expect(spy3.calledWith('hereIsANewMessage', '!échanger 2 lettres', 'John')).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
        spy4.restore();
    });

    it('validateChangeLetterParametersFromInputChat should return not valid if parameters length is < 1', () => {
        const returnedValue = service.validateChangeLetterParametersFromInputChat('');
        const expectedResult = { isValid: false, text: "Commande impossible : Le nombre d'arguments est invalide" };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('validateChangeLetterParametersFromInputChat should return not valid if parameters length is > 7', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE;
        const returnedValue = service.validateChangeLetterParametersFromInputChat('abcdefghijk');
        const expectedResult = { isValid: false, text: "Commande impossible : Le nombre d'arguments est invalide" };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('validateChangeLetterParametersFromInputChat should return not valid if letterReserveTotalSize is > 7', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE - 1;
        const returnedValue = service.validateChangeLetterParametersFromInputChat('abc');
        const expectedResult = { isValid: false, text: 'Commande impossible : La réserve contient moins de 7 lettres.' };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('validateChangeLetterParametersFromInputChat should return not valid if the letters to exchange are capital letters', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE + 1;
        const returnedValue = service.validateChangeLetterParametersFromInputChat('Abc');
        const expectedResult = { isValid: false, text: 'Erreur de syntaxe : les lettres à échanger doivent être des lettres en minuscules' };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('validateChangeLetterParametersFromInputChat should return not valid if the letters to exchange are not in the letter rack', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE + 1;
        activePlayerService.activePlayerRack = [];
        const returnedValue = service.validateChangeLetterParametersFromInputChat('abc');
        const expectedResult = { isValid: false, text: 'Erreur de syntaxe : les lettres doivent être présentes dans le chevalet' };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('validateChangeLetterParametersFromInputChat should return true if all the validations pass', () => {
        letterReserveService.letterReserveTotalSize = LETTERS_RACK_SIZE + 1;
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: 'A', score: 1 });
        activePlayerService.activePlayerRack.push({ letter: 'B', score: 1 });
        activePlayerService.activePlayerRack.push({ letter: 'C', score: 1 });
        const returnedValue = service.validateChangeLetterParametersFromInputChat('abc');
        const expectedResult = { isValid: true, text: '' };
        expect(returnedValue).to.deep.equal(expectedResult);
    });

    it('changeLettersFromInputChat should call pickTile and insertTileInReserve from LetterReserveService', () => {
        const spy1 = Sinon.spy(letterReserveService, 'pickTile');
        const spy2 = Sinon.spy(letterReserveService, 'insertTileInReserve');
        const lettersToChange = 'abc';
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: 'A', score: 1 });
        activePlayerService.activePlayerRack.push({ letter: 'B', score: 1 });
        activePlayerService.activePlayerRack.push({ letter: 'C', score: 1 });
        service.changeLettersFromInputChat(lettersToChange);
        expect(spy1.called).to.equal(true);
        expect(spy2.called).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('changeLettersFromInputChat should return and not replace any letters if the letters passed in parameters is an empty string', () => {
        const lettersToChange = '';
        const startingLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        activePlayerService.activePlayerRack = [];
        Object.assign(activePlayerService.activePlayerRack, startingLetterRack);
        service.changeLettersFromInputChat(lettersToChange);
        expect(activePlayerService.activePlayerRack).to.deep.equal(startingLetterRack);
    });

    it('changeLettersFromInputChat should return and not replace any letters if pickTile() function returns undefined', () => {
        const spy1 = Sinon.stub(letterReserveService, 'pickTile').returns(undefined);
        const lettersToChange = 'ab';
        const startingLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        activePlayerService.activePlayerRack = [];
        Object.assign(activePlayerService.activePlayerRack, startingLetterRack);
        service.changeLettersFromInputChat(lettersToChange);
        expect(activePlayerService.activePlayerRack).to.deep.equal(startingLetterRack);
        spy1.restore();
    });

    it('changeLettersFromInputChat should not include the same letters after the call to changeLettersFromInputChat', () => {
        const forcedReturnedValue: Tile = { letter: 'A', score: 1 };
        const spy1 = Sinon.stub(letterReserveService, 'pickTile').returns(forcedReturnedValue);
        const lettersToChange = 'abc';
        const startingLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
            { letter: 'C', score: 1 },
        ];
        const expectedLetterRack = [
            { letter: 'A', score: 1 },
            { letter: 'A', score: 1 },
            { letter: 'A', score: 1 },
        ];
        activePlayerService.activePlayerRack = [];
        Object.assign(activePlayerService.activePlayerRack, startingLetterRack);
        service.changeLettersFromInputChat(lettersToChange);
        expect(activePlayerService.activePlayerRack).to.not.deep.equal(startingLetterRack);
        expect(activePlayerService.activePlayerRack).to.deep.equal(expectedLetterRack);
        spy1.restore();
    });
});
