// Disable de lint autorisé par chargés
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { AXIS } from '@app/classes/enums/axis';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Tile } from '@app/classes/interfaces/tile';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { DictionaryService } from './dictionary.service';
import { LetterReserveService } from './letter-reserve.service';
import { ObjectivesValidationService } from './objectives-validation.service';
import { PlacementValidationService } from './placement-validation.service';
import { PlayAreaService } from './play-area.service';
import { PlayerPlacementConfirmationService } from './player-placement-confirmation.service';
import { PlayerRackHandlerService } from './player-rack-handler.service';
import { RoomDataService } from './room-data.service';
import { TileHandlerService } from './tile-handler.service';
import { TurnHandlerService } from './turn-handler.service';

describe('PlayerPlacementConfirmationService', () => {
    let service: PlayerPlacementConfirmationService;
    let placementValidationService: PlacementValidationService;
    let tileHandlerService: TileHandlerService;
    let playerRackHandlerService: PlayerRackHandlerService;
    let turnHandlerService: TurnHandlerService;
    let playAreaService: PlayAreaService;
    let activePlayerService: ActivePlayerService;
    let letterReserveService: LetterReserveService;
    let dictionaryService: DictionaryService;
    let roomDataService: RoomDataService;
    let objectivesValidationService: ObjectivesValidationService;

    before(async () => {
        dictionaryService = Container.get(DictionaryService);
        dictionaryService.initDictionary({ title: 'Français', description: '' });
    });

    beforeEach(() => {
        service = Container.get(PlayerPlacementConfirmationService);
        placementValidationService = Container.get(PlacementValidationService);
        tileHandlerService = Container.get(TileHandlerService);
        playerRackHandlerService = Container.get(PlayerRackHandlerService);
        turnHandlerService = Container.get(TurnHandlerService);
        playAreaService = Container.get(PlayAreaService);
        activePlayerService = Container.get(ActivePlayerService);
        letterReserveService = Container.get(LetterReserveService);
        roomDataService = Container.get(RoomDataService);
        objectivesValidationService = Container.get(ObjectivesValidationService);
    });

    it('confirmPlayerPlacement should call reinsertPlacement and emit signal hereIsTheBoardUpdated if placement is not valid', () => {
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 2;
        const WAITING_TIME = 1001;

        const roomID = 'room1';
        const msg = 'voici un message';

        const placedLetters: PlacedLetter[] = [];
        placedLetters.push({ content: 'a', position: { x: 0, y: 0 } });
        const placement = { axis: AXIS.HORIZONTAL, letters: placedLetters };

        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomId: string) => {
                return emitObject;
            },
        };
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
            broadcast: {
                to: (roomId: string) => {
                    return emitObject;
                },
            },
        };
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        roomDataService.isLog2990ModeChosen = true;

        const clock = Sinon.useFakeTimers();
        const spy1 = Sinon.stub(placementValidationService, 'getValidatedPlacement').returns(undefined);
        const spy2 = Sinon.stub(playerRackHandlerService, 'reinsertPlacement');
        const spy3 = Sinon.spy(socketStub, 'emit');
        const spy4 = Sinon.stub(objectivesValidationService, 'resetObjectiveCounters');

        service.confirmPlayerPlacement(placement, socketStub as unknown as SocketIO.Socket, serverStub as unknown as SocketIO.Server, roomID, msg);
        clock.tick(WAITING_TIME);
        expect(spy1.calledOnceWith(placement)).to.equal(true);
        expect(spy2.calledOnceWith(placement.letters)).to.equal(true);
        expect(spy3.calledWith('hereIsTheBoardUpdated', playAreaService.boardGame)).to.equal(true);
        expect(spy4.calledOnce).to.equal(true);
        clock.restore();
        spy1.restore();
        spy2.restore();
        spy3.restore();
        spy4.restore();
    });

    it('confirmPlayerPlacement should call resetTurnsPassed and emit signals hereIsYourLetterRack, allowPlayerToPlay and preventPlayerFromPlaying', () => {
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 2;
        const WAITING_TIME = 1001;

        const roomID = 'room1';
        const msg = 'voici un message';

        const placedLetters: PlacedLetter[] = [];
        placedLetters.push({ content: 'a', position: { x: 0, y: 0 } });
        const placement: Placement = { axis: AXIS.HORIZONTAL, letters: placedLetters };

        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomId: string) => {
                return emitObject;
            },
        };
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
            broadcast: {
                to: (roomId: string) => {
                    return emitObject;
                },
            },
        };
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        const letterRack: Tile[] = [];
        activePlayerService.activePlayerRack = letterRack;
        playAreaService.initialiseBoardCaseList();

        const clock = Sinon.useFakeTimers();
        const spy1 = Sinon.spy(turnHandlerService, 'resetTurnsPassed');
        const spy2 = Sinon.spy(socketStub, 'emit');

        service.confirmPlayerPlacement(placement, socketStub as unknown as SocketIO.Socket, serverStub as unknown as SocketIO.Server, roomID, msg);
        clock.tick(WAITING_TIME);
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledWith('hereIsYourLetterRack', letterRack)).to.equal(true);
        expect(spy2.calledWith('allowPlayerToPlay')).to.equal(true);
        expect(spy2.calledWith('preventPlayerFromPlaying')).to.equal(true);
        clock.restore();
        spy1.restore();
        spy2.restore();
    });

    it('confirmPlayerPlacement should call 4 functions and emit 4 signals if the placement is valid', () => {
        turnHandlerService.counter.minute = 0;
        turnHandlerService.counter.second = 2;

        const WAITING_TIME = 1001;

        const roomID = 'room1';
        const msg = 'voici un message';

        const placedLetters: PlacedLetter[] = [];
        placedLetters.push({ content: 'a', position: { x: 0, y: 0 } });
        placedLetters.push({ content: 'a', position: { x: 1, y: 0 } });
        const placement: Placement = { axis: AXIS.HORIZONTAL, letters: placedLetters };

        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomId: string) => {
                return emitObject;
            },
        };
        const socketStub = {
            id: '123',
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
            broadcast: {
                to: (roomId: string) => {
                    return emitObject;
                },
            },
        };
        turnHandlerService.sio = serverStub as unknown as SocketIO.Server;
        const letterRack: Tile[] = [];
        activePlayerService.activePlayerRack = letterRack;
        activePlayerService.playerScore = 0;
        const playerName = 'John';
        activePlayerService.playerName = playerName;
        const expectedPlayerScore = 6;
        roomDataService.isLog2990ModeChosen = true;
        playAreaService.initialiseBoardCaseList();
        letterReserveService.letterReserveTotalSize = 102;
        const expectedNumberOfRemainingLetters = 95;

        const clock = Sinon.useFakeTimers();
        const spy1 = Sinon.spy(playerRackHandlerService, 'refillPlayerRack');
        const spy2 = Sinon.spy(tileHandlerService, 'placeLetters');
        const spy3 = Sinon.spy(activePlayerService, 'overwriteActualPlayerAttributes');
        const spy4 = Sinon.spy(emitObject, 'emit');
        const spy5 = Sinon.spy(serverStub, 'to');
        const spy6 = Sinon.stub(objectivesValidationService, 'validateObjectives');

        service.confirmPlayerPlacement(placement, socketStub as unknown as SocketIO.Socket, serverStub as unknown as SocketIO.Server, roomID, msg);
        clock.tick(WAITING_TIME);
        expect(activePlayerService.playerScore).to.equal(expectedPlayerScore);
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnceWith(placedLetters)).to.equal(true);
        expect(spy3.calledOnce).to.equal(true);

        expect(spy4.calledWith('hereIsANewMessage', msg, playerName)).to.equal(true);
        expect(spy4.calledWith('hereIsAPlayerScore', expectedPlayerScore, socketStub.id)).to.equal(true);
        expect(spy4.calledWith('hereIsTheReserveSize', expectedNumberOfRemainingLetters)).to.equal(true);
        expect(spy4.calledWith('hereIsTheBoardUpdated', playAreaService.boardGame)).to.equal(true);
        expect(spy5.calledWith(roomID)).to.equal(true);
        expect(spy6.calledOnce).to.equal(true);

        clock.restore();
        spy1.restore();
        spy2.restore();
        spy3.restore();
        spy4.restore();
        spy5.restore();
    });
});
