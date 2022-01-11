// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import {
    CREATE_GAME,
    OBJECTIVES,
    OBJECTIVE_1,
    OBJECTIVE_2,
    OBJECTIVE_3,
    OBJECTIVE_4,
    OBJECTIVE_5,
    OBJECTIVE_6,
    RANDOM_NUMBER_GENERATOR,
} from '@app/classes/constants/constants';
import { Time } from '@app/classes/interfaces/game-parameters';
import { Objective } from '@app/classes/interfaces/objectives';
import { Player } from '@app/classes/interfaces/player';
import { Tile } from '@app/classes/interfaces/tile';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';
import { RoomDataService } from './room-data.service';

describe('RoomDataService', () => {
    let service: RoomDataService;
    let letterReserveService: LetterReserveService;

    beforeEach(() => {
        service = Container.get(RoomDataService);
        letterReserveService = Container.get(LetterReserveService);
    });

    it('initRoomData should assign the right data to attributes', () => {
        const roomID = 'room1';

        const gameHostName = 'Paul';
        const gameHostSocketID = '123';
        const guestPlayerName = 'John';
        const guestPlayerSocketID = '456';
        const roomTimer: Time = { minute: 1, second: 30 };
        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = gameHostName;
        room.gameCreator.socketID = gameHostSocketID;
        room.guestPlayer.playerName = guestPlayerName;
        room.guestPlayer.socketID = guestPlayerSocketID;
        room.gameParameters.timer = roomTimer;
        room.gameParameters.isLog2990ModeChosen = false;

        service.gameCreator.privateObjective = new Map();
        service.guestPlayer.privateObjective = new Map();

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
        const forcedReturnedValue = { letter: 'A', score: 1 };
        const spy1 = Sinon.stub(letterReserveService, 'pickTile').returns(forcedReturnedValue);

        const letterRack: Tile[] = [];
        const letterRackSize = 7;
        for (let i = 0; i < letterRackSize; i++) {
            letterRack.push({ letter: 'A', score: 1 });
        }

        const spy2 = Sinon.stub(service, 'selectPlayerToStart').returns(gameHostSocketID);

        const expectedGameCreator: Player = {
            socketID: gameHostSocketID,
            playerName: gameHostName,
            playerScore: 0,
            letterRack,
            isMyTurn: true,
            privateObjective: new Map(),
        };
        const expectedGuestPlayer: Player = {
            socketID: guestPlayerSocketID,
            playerName: guestPlayerName,
            playerScore: 0,
            letterRack,
            isMyTurn: false,
            privateObjective: new Map(),
        };

        service.initRoomData(roomID, room, serverStub as unknown as SocketIO.Server);

        expect(service.gameCreator).to.deep.equal(expectedGameCreator);
        expect(service.guestPlayer).to.deep.equal(expectedGuestPlayer);
        spy1.restore();
        spy2.restore();
    });

    it('initRoomData should call initializeObjectives if it is a log2990 game', () => {
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
        const roomID = 'room1';
        const room = CREATE_GAME.constructRoom();
        room.gameParameters.isLog2990ModeChosen = true;

        const spy = Sinon.spy(service, 'initializeObjectives');

        service.initRoomData(roomID, room, serverStub as unknown as SocketIO.Server);

        expect(spy.calledOnce).to.equal(true);

        spy.restore();
    });

    it('initRoomData should return the correct active player name and call sendDataToPlayers() with the correct parameters', () => {
        const roomID = 'room1';

        const gameHostName = 'Paul';
        const gameHostSocketID = '123';
        const guestPlayerName = 'John';
        const guestPlayerSocketID = '456';
        const roomTimer: Time = { minute: 1, second: 30 };
        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = gameHostName;
        room.gameCreator.socketID = gameHostSocketID;
        room.guestPlayer.playerName = guestPlayerName;
        room.guestPlayer.socketID = guestPlayerSocketID;
        room.gameParameters.timer = roomTimer;

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

        const spy1 = Sinon.stub(service, 'selectPlayerToStart').returns(guestPlayerSocketID);
        const spy2 = Sinon.spy(service, 'sendDataToPlayers');

        const activePlayerName = service.initRoomData(roomID, room, serverStub as unknown as SocketIO.Server);

        expect(activePlayerName).to.equal(guestPlayerName);
        expect(spy2.calledOnceWith(serverStub as unknown as SocketIO.Server, guestPlayerSocketID)).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('sendDataToPlayers should send the data to both players', () => {
        const roomID = 'room1';
        const gameHostSocketID = '123';
        const gameHostScore = 0;
        const gameHostLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'A', score: 1 },
            { letter: 'A', score: 1 },
        ];
        const guestPlayerSocketID = '456';
        const guestPlayerScore = 0;
        const guestPlayerLetterRack: Tile[] = [
            { letter: 'B', score: 1 },
            { letter: 'B', score: 1 },
            { letter: 'B', score: 1 },
        ];
        const letterReserveTotalSize = 88;
        const socketToStart = '123';

        service.roomID = roomID;
        service.gameCreator.socketID = gameHostSocketID;
        service.gameCreator.playerScore = gameHostScore;
        service.gameCreator.letterRack = gameHostLetterRack;
        service.guestPlayer.socketID = guestPlayerSocketID;
        service.guestPlayer.playerScore = guestPlayerScore;
        service.guestPlayer.letterRack = guestPlayerLetterRack;
        service.isLog2990ModeChosen = true;
        letterReserveService.letterReserveTotalSize = letterReserveTotalSize;

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

        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');

        service.sendDataToPlayers(serverStub as unknown as SocketIO.Server, socketToStart);

        expect(spy1.calledWith(roomID)).to.equal(true);
        expect(spy1.calledWith(gameHostSocketID)).to.equal(true);
        expect(spy1.calledWith(guestPlayerSocketID)).to.equal(true);
        expect(spy2.calledWith('updateIsMyTurnToPlay', socketToStart)).to.equal(true);
        expect(spy2.calledWith('hereIsTheReserveSize', letterReserveTotalSize)).to.equal(true);
        expect(spy2.calledWith('hereIsAPlayerScore', gameHostScore, gameHostSocketID)).to.equal(true);
        expect(spy2.calledWith('hereIsAPlayerScore', guestPlayerScore, guestPlayerSocketID)).to.equal(true);
        expect(spy2.calledWith('hereIsYourLetterRack', gameHostLetterRack)).to.equal(true);
        expect(spy2.calledWith('hereIsYourLetterRack', guestPlayerLetterRack)).to.equal(true);

        spy1.restore();
        spy2.restore();
    });

    it('sendObjectivesToPlayers should emit 2 hereAreTheObjectives signals', () => {
        service.gameCreator.privateObjective.clear();
        service.guestPlayer.privateObjective.clear();
        service.publicObjectives.clear();
        service.gameCreator.privateObjective.set(OBJECTIVE_2, OBJECTIVES[1]);
        service.guestPlayer.privateObjective.set(OBJECTIVE_3, OBJECTIVES[2]);
        service.publicObjectives.set(OBJECTIVE_4, OBJECTIVES[3]);
        const gameHostSocketID = '123';
        const guestPlayerSocketID = '456';
        service.gameCreator.socketID = gameHostSocketID;
        service.guestPlayer.socketID = guestPlayerSocketID;

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

        const gameCreatorPrivateMapString = '[[2,{"description":"Utiliser 3 voyelles dans un placement de lettres","score":10,"fullfilled":false}]]';
        const guestPlayerPrivateMapString = '[[3,{"description":"Former trois mots avec un placement de lettres","score":20,"fullfilled":false}]]';
        const publicMapString =
            '[[4,{"description":"Former un mot qui contient la lettre V (V doit provenir du chevalet)","score":25,"fullfilled":false}]]';

        const toSpy = Sinon.spy(serverStub, 'to');
        const emitSpy = Sinon.spy(emitObject, 'emit');

        service.sendObjectivesToPlayers(serverStub as unknown as SocketIO.Server);

        expect(toSpy.calledWith(gameHostSocketID)).to.equal(true);
        expect(toSpy.calledWith(guestPlayerSocketID)).to.equal(true);
        expect(emitSpy.calledWith('hereAreTheObjectives', gameCreatorPrivateMapString, publicMapString)).to.equal(true);
        expect(emitSpy.calledWith('hereAreTheObjectives', guestPlayerPrivateMapString, publicMapString)).to.equal(true);

        toSpy.restore();
        emitSpy.restore();
    });

    it('generateRandomNumber should return a number between 2 numbers', () => {
        const minNumber = 1;
        const maxNumber = 10;
        const returnedNumber = service.generateRandomNumber(minNumber, maxNumber);
        expect(returnedNumber).to.be.greaterThanOrEqual(minNumber);
        expect(returnedNumber).to.be.lessThanOrEqual(maxNumber);
    });

    it('selectPlayerToStart should select one player to start and return its socketID', () => {
        const gameHostSocketID = '123';
        const guestPlayerSocketID = '456';

        const socketToStart = service.selectPlayerToStart(gameHostSocketID, guestPlayerSocketID);

        const sockets: string[] = [];
        sockets.push(gameHostSocketID);
        sockets.push(guestPlayerSocketID);
        expect(sockets).to.include(socketToStart);
    });

    it('getPlayerName should return the game host name', () => {
        const socketID = '123';

        const gameHostSocketID = '123';
        const gameHostName = 'John';
        const guestPlayerSocketID = '456';
        const guestPlayerName = 'Paul';

        service.gameCreator.socketID = gameHostSocketID;
        service.gameCreator.playerName = gameHostName;
        service.guestPlayer.socketID = guestPlayerSocketID;
        service.guestPlayer.playerName = guestPlayerName;

        expect(service.getPlayerName(socketID)).to.equal(gameHostName);
    });

    it('getPlayerName should return the guest player name', () => {
        const socketID = '456';

        const gameHostSocketID = '123';
        const gameHostName = 'John';
        const guestPlayerSocketID = '456';
        const guestPlayerName = 'Paul';

        service.gameCreator.socketID = gameHostSocketID;
        service.gameCreator.playerName = gameHostName;
        service.guestPlayer.socketID = guestPlayerSocketID;
        service.guestPlayer.playerName = guestPlayerName;

        expect(service.getPlayerName(socketID)).to.equal(guestPlayerName);
    });

    it('initializeObjectives should call resetAllFullfilledProperties and assignObjectives', () => {
        const spy1 = Sinon.spy(service, 'resetAllFullfilledProperties');
        const spy2 = Sinon.spy(service, 'assignObjectives');

        service.initializeObjectives();

        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnce).to.equal(true);

        spy1.restore();
        spy2.restore();
    });

    it('resetAllFullfilledProperties should set all fullfilled properties of all the objectives to false', () => {
        for (const obj of OBJECTIVES) {
            obj.fullfilled = true;
        }
        service.resetAllFullfilledProperties();
        for (const obj of OBJECTIVES) {
            expect(obj.fullfilled).to.equal(false);
        }
    });

    it('assignObjectives should call functions to assign objectives', () => {
        const forcedReturnedValue1 = 1;
        const forcedReturnedValue2 = 4;
        const expectedReturnedValue: number[] = [];
        expectedReturnedValue.push(forcedReturnedValue1);
        expectedReturnedValue.push(forcedReturnedValue2);
        const spy1 = Sinon.stub(service, 'assignPrivateObjectiveToGameCreator').returns(forcedReturnedValue1);
        const spy2 = Sinon.stub(service, 'assignPrivateObjectiveToGuestPlayer').returns(forcedReturnedValue2);
        const spy3 = Sinon.stub(service, 'assignPublicObjectives');

        service.assignObjectives();

        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnceWith(forcedReturnedValue1)).to.equal(true);
        expect(spy3.calledOnceWith(expectedReturnedValue)).to.equal(true);

        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it('assignPrivateObjectiveToGameCreator should add a random objective to game creator objectives map', () => {
        service.gameCreator.privateObjective.clear();
        const spy = Sinon.stub(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').returns(OBJECTIVE_5);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(OBJECTIVE_5, OBJECTIVES[OBJECTIVE_5 - 1]);
        const result = service.assignPrivateObjectiveToGameCreator();
        expect(result).to.equal(OBJECTIVE_5);
        expect(service.gameCreator.privateObjective).to.deep.equal(expectedMap);
        spy.restore();
    });

    it('assignPrivateObjectiveToGuestPlayer should add a random objective to guest player objectives map', () => {
        service.guestPlayer.privateObjective.clear();
        const callback = Sinon.stub(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER');
        callback.onFirstCall().returns(OBJECTIVE_4);
        callback.onSecondCall().returns(OBJECTIVE_6);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(OBJECTIVE_6, OBJECTIVES[OBJECTIVE_6 - 1]);
        const result = service.assignPrivateObjectiveToGuestPlayer(OBJECTIVE_4);
        expect(result).to.equal(OBJECTIVE_6);
        expect(service.guestPlayer.privateObjective).to.deep.equal(expectedMap);
        callback.restore();
    });

    it('assignPublicObjectives should add 2 random objectives to public objectives map', () => {
        service.publicObjectives.clear();
        const objectivesAlreadyTaken: number[] = [];
        objectivesAlreadyTaken.push(OBJECTIVE_1);
        objectivesAlreadyTaken.push(OBJECTIVE_2);
        const callback = Sinon.stub(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER');
        callback.onCall(0).returns(OBJECTIVE_1);
        callback.onCall(1).returns(OBJECTIVE_3);
        callback.onCall(2).returns(OBJECTIVE_4);
        const expectedMap: Map<number, Objective> = new Map();
        expectedMap.set(OBJECTIVE_3, OBJECTIVES[OBJECTIVE_3 - 1]);
        expectedMap.set(OBJECTIVE_4, OBJECTIVES[OBJECTIVE_4 - 1]);
        service.assignPublicObjectives(objectivesAlreadyTaken);
        expect(service.publicObjectives).to.deep.equal(expectedMap);
        callback.restore();
    });
});
