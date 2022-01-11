// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import { CREATE_GAME } from '@app/classes/constants/constants';
import { Room } from '@app/classes/interfaces/room';
import { Time } from '@app/classes/interfaces/time';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { RoomDataService } from '@app/services/room-data.service';
import { RoomManagerService } from '@app/services/room-manager.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { WaitingGamesManagerService } from '@app/services/waiting-games-manager.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';

describe('RoomManagerService', () => {
    let service: RoomManagerService;
    let waitingGamesManagerService: WaitingGamesManagerService;

    beforeEach(async () => {
        service = Container.get(RoomManagerService);
        waitingGamesManagerService = Container.get(WaitingGamesManagerService);
        service.socketIds.clear();
        service.gamePending.clear();
        service.gameInProgress.clear();
    });

    it('createRoom should create the first room (room1) if no other room exists and make the socket join the room', () => {
        const hostName = 'Jean';
        const roomTimer: Time = { minute: 1, second: 0 };
        const roomShuffleBonus = false;
        const socketStub = {
            id: '123',
            join: (param: string) => {
                return param;
            },
        };
        const dictionaryDetails = {
            title: '',
            description: '',
        };
        const waitingGame: WaitingGame = {
            playerName: hostName,
            timer: roomTimer,
            dictionary: dictionaryDetails,
            bonus: roomShuffleBonus,
            socketId: socketStub.id,
            isLog2990ModeChosen: false,
        };
        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = hostName;
        room.gameCreator.socketID = socketStub.id;
        room.gameParameters.timer = roomTimer;
        room.gameParameters.shuffleBonus = roomShuffleBonus;
        room.gameParameters.dictionary = dictionaryDetails;
        const spy = Sinon.spy(socketStub, 'join');
        service.createRoom(socketStub as unknown as SocketIO.Socket, waitingGame);

        expect(spy.calledOnceWith('room1')).to.equal(true);
        expect(service.gamePending.has('room1'));

        expect(service.gamePending.get('room1')).to.deep.equal(room);
        expect(service.socketIds.has((socketStub as unknown as SocketIO.Socket).id)).to.equal(true);
        expect(service.socketIds.get((socketStub as unknown as SocketIO.Socket).id)).to.equal('room1');

        spy.restore();
    });

    it("createRoom should create another room than 'room1' and make the socket join the room", () => {
        const hostName = 'Jean';
        const roomTimer: Time = { minute: 1, second: 0 };
        const roomShuffleBonus = false;
        const socketStub = {
            id: '123',
            join: (param: string) => {
                return param;
            },
        };
        const dictionaryDetails = {
            title: '',
            description: '',
        };
        const waitingGame: WaitingGame = {
            playerName: hostName,
            timer: roomTimer,
            dictionary: dictionaryDetails,
            bonus: roomShuffleBonus,
            socketId: socketStub.id,
            isLog2990ModeChosen: false,
        };
        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = hostName;
        room.gameCreator.socketID = socketStub.id;
        room.gameParameters.timer = roomTimer;
        room.gameParameters.shuffleBonus = roomShuffleBonus;
        room.gameParameters.dictionary = dictionaryDetails;
        service.gamePending.set('room1', room);
        const spy = Sinon.spy(socketStub, 'join');
        service.createRoom(socketStub as unknown as SocketIO.Socket, waitingGame);

        expect(spy.calledOnceWith('room2')).to.equal(true);
        expect(service.gamePending.has('room2'));

        expect(service.gamePending.get('room2')).to.deep.equal(room);
        expect(service.socketIds.has((socketStub as unknown as SocketIO.Socket).id)).to.equal(true);
        expect(service.socketIds.get((socketStub as unknown as SocketIO.Socket).id)).to.equal('room2');

        spy.restore();
    });

    it('joinRoom should emit cannotJoinGame signal if the room to join is undefined or if gameInProgress doesnt have the room', () => {
        const gameHostSocketID = '123';
        const joiningPlayerName = 'joueur2';

        service.socketIds = new Map();
        const socketStub = {
            id: '456',
            join: (param: string) => {
                return param;
            },
            emit: (eventName: string) => {
                return eventName;
            },
        };
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (roomID: string) => {
                return emitObject;
            },
        };
        const spy = Sinon.spy(socketStub, 'emit');
        service.joinRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, gameHostSocketID, joiningPlayerName);

        expect(spy.calledOnceWith('cannotJoinGame')).to.equal(true);

        spy.restore();
    });

    it('joinRoom should call function deleteWaitingGame and emit the correct signals with the right parameters', () => {
        const gameHostSocketID = '123';
        const joiningPlayerName = 'joueur2';

        const room = CREATE_GAME.constructRoom();
        const gameHostName = 'Paul';
        room.gameCreator.playerName = gameHostName;
        service.gamePending.set('room1', room);
        const socketStub = {
            id: '456',
            join: (param: string) => {
                return param;
            },
            emit: (eventName: string) => {
                return eventName;
            },
        };
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.socketIds = new Map();
        service.socketIds.set(gameHostSocketID, 'room1');
        const spyJoin = Sinon.spy(socketStub, 'join');
        const spyServerTo = Sinon.spy(serverStub, 'to');
        const spyServerEmit = Sinon.spy(emitObject, 'emit');
        const spy = Sinon.spy(waitingGamesManagerService, 'deleteWaitingGame');
        service.joinRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, gameHostSocketID, joiningPlayerName);

        expect(spyJoin.calledOnceWith('room1')).to.equal(true);
        expect(spyServerTo.calledOnceWith('room1')).to.equal(true);
        expect(spyServerEmit.calledOnceWith('sendBothPlayerNames', [gameHostName, joiningPlayerName])).to.equal(true);
        expect(spy.calledOnceWith(serverStub as unknown as SocketIO.Server, gameHostSocketID)).to.equal(true);

        spyJoin.restore();
        spyServerTo.restore();
        spyServerEmit.restore();
        spy.restore();
    });

    it('joinRoom should add the correct data to socketIds and gameInProgress and should delete the corresponding gamePending', () => {
        service.gamePending.clear();
        service.gameInProgress.clear();
        service.socketIds.clear();

        const gameHostName = 'Paul';
        const roomTimer: Time = { minute: 1, second: 30 };
        const roomShuffleBonus = false;
        const dictionaryDetails = {
            title: '',
            description: '',
        };
        const socketStub1 = {
            id: '123',
            join: (param: string) => {
                return param;
            },
            emit: (eventName: string) => {
                return eventName;
            },
        };
        const waitingGame: WaitingGame = {
            playerName: gameHostName,
            timer: roomTimer,
            dictionary: dictionaryDetails,
            bonus: roomShuffleBonus,
            socketId: socketStub1.id,
            isLog2990ModeChosen: false,
        };
        service.createRoom(socketStub1 as unknown as SocketIO.Socket, waitingGame);

        const socketStub2 = {
            id: '456',
            join: (param: string) => {
                return param;
            },
            emit: (eventName: string) => {
                return eventName;
            },
        };
        const joiningPlayerName = 'John';
        const expectedRoom = CREATE_GAME.constructRoom();
        expectedRoom.gameCreator.playerName = gameHostName;
        expectedRoom.gameCreator.socketID = socketStub1.id;
        expectedRoom.gameParameters.timer = roomTimer;
        expectedRoom.gameParameters.shuffleBonus = roomShuffleBonus;
        expectedRoom.guestPlayer.playerName = joiningPlayerName;
        expectedRoom.guestPlayer.socketID = socketStub2.id;

        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (roomID: string) => {
                return emitObject;
            },
        };

        const expectedGameInProgress: Map<string, Room> = new Map();
        expectedGameInProgress.set('room1', expectedRoom);

        const expectedGamePending: Map<string, Room> = new Map();

        const expectedSocketIds: Map<string, string> = new Map();
        expectedSocketIds.set(socketStub1.id, 'room1');
        expectedSocketIds.set(socketStub2.id, 'room1');

        service.joinRoom(serverStub as unknown as SocketIO.Server, socketStub2 as unknown as SocketIO.Socket, socketStub1.id, joiningPlayerName);
        expect(service.gameInProgress).to.deep.equal(expectedGameInProgress);
        expect(service.gamePending).to.deep.equal(expectedGamePending);
        expect(service.socketIds).to.deep.equal(expectedSocketIds);
    });

    it('joinRoom should return false if gamePending is not found', () => {
        service.socketIds.clear();
        const gameHostSocketID = '123';
        service.socketIds.set(gameHostSocketID, 'room1');
        service.gamePending.clear();
        const socketStub2 = {
            id: '456',
            join: (param: string) => {
                return param;
            },
            emit: (eventName: string) => {
                return eventName;
            },
        };
        const joiningPlayerName = 'John';

        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            to: (roomID: string) => {
                return emitObject;
            },
        };
        const result = service.joinRoom(
            serverStub as unknown as SocketIO.Server,
            socketStub2 as unknown as SocketIO.Socket,
            gameHostSocketID,
            joiningPlayerName,
        );
        const expectedResult = false;
        expect(result).to.deep.equal(expectedResult);
    });

    it('endRoom should call socketsLeave and deleteWaitingGame with the right parameters', () => {
        const socketStub = {
            id: '123',
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            socketsLeave: (roomID: string) => {
                return;
            },
        };
        service.socketIds.set(socketStub.id, 'room1');
        const spyLeave = Sinon.spy(serverStub, 'socketsLeave');
        const spy = Sinon.spy(waitingGamesManagerService, 'deleteWaitingGame');
        service.endRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(spyLeave.calledOnceWith('room1')).to.equal(true);
        expect(spy.calledOnceWith(serverStub as unknown as SocketIO.Server, socketStub.id)).to.equal(true);
        spyLeave.restore();
        spy.restore();
    });

    it('endRoom should delete the right data from gamePending and socketIds', () => {
        const socketStub = {
            id: '123',
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            socketsLeave: (roomID: string) => {
                return;
            },
        };

        service.socketIds.set(socketStub.id, 'room1');

        const room = CREATE_GAME.constructRoom();
        room.gameCreator.socketID = socketStub.id;
        service.gamePending.set('room1', room);

        const expectedSocketIds: Map<string, string> = new Map();
        const expectedGamePending: Map<string, Room> = new Map();

        service.endRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(service.gamePending).to.deep.equal(expectedGamePending);
        expect(service.socketIds).to.deep.equal(expectedSocketIds);
    });

    it('endRoom should do nothing if the room to end is undefined', () => {
        const socketStub = {
            id: '123',
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            socketsLeave: (roomID: string) => {
                return;
            },
        };
        const spyLeave = Sinon.spy(serverStub, 'socketsLeave');
        service.endRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(spyLeave.called).to.equal(false);
        spyLeave.restore();
    });

    it('leaveRoom should delete correct data from socketIds and call function deletePlayerInGameInProgress with the right parameters ', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
            broadcast: {
                to: (roomID: string) => {
                    return emitObject;
                },
            },
        };
        const roomToLeave = 'room1';
        service.socketIds.set(socketStub.id, roomToLeave);

        const room = CREATE_GAME.constructRoom();
        room.guestPlayer.socketID = socketStub.id;
        service.gameInProgress.set(roomToLeave, room);

        const expectedSocketIds: Map<string, string> = new Map();
        const spy = Sinon.spy(service, 'deletePlayerInGameInProgress');

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            socketsLeave: (roomID: string) => {
                return;
            },
        };

        service.leaveRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);

        expect(service.socketIds).to.deep.equal(expectedSocketIds);
        expect(spy.calledWith(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomToLeave)).to.equal(true);
        spy.restore();
    });

    it('leaveRoom should do nothing if the room to leave is undefined', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            emit: (eventName: string, arg: string) => {
                return eventName + arg;
            },
            broadcast: {
                to: (roomID: string) => {
                    return emitObject;
                },
            },
        };
        const roomToLeave = 'room1';

        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
            },
            socketsLeave: (roomID: string) => {
                return;
            },
        };

        const room = CREATE_GAME.constructRoom();
        room.guestPlayer.socketID = socketStub.id;
        service.gameInProgress.set(roomToLeave, room);

        const spy = Sinon.spy(service, 'deletePlayerInGameInProgress');
        service.leaveRoom(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(spy.called).to.equal(false);
        spy.restore();
    });

    it('disconnect should call deleteWaitingGame and delete the game from gamePending if it was a waiting game when the player disconnected', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
        };
        const roomID = 'room1';
        service.socketIds.set(socketStub.id, roomID);

        const room = CREATE_GAME.constructRoom();
        room.gameCreator.socketID = socketStub.id;
        service.gamePending.set(roomID, room);

        const expectedSocketIds: Map<string, string> = new Map();
        const expectedGamePending: Map<string, Room> = new Map();

        const spy = Sinon.spy(waitingGamesManagerService, 'deleteWaitingGame');

        service.disconnect(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);

        expect(service.socketIds).to.deep.equal(expectedSocketIds);
        expect(spy.calledWith(serverStub as unknown as SocketIO.Server, socketStub.id)).to.equal(true);
        expect(service.gamePending).to.deep.equal(expectedGamePending);
        spy.restore();
    });

    it('disconnect should call deletePlayerInGameInProgress if the player was playing when he disconnected', () => {
        const tmpTime = 5001;
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
                    return emitObject;
                },
            },
        };
        const serverStub = {
            sockets: {
                emit: (eventName: string) => {
                    return eventName;
                },
                socketsLeave: (roomId: string) => {
                    return;
                },
            },
        };
        const roomID = 'room1';
        service.socketIds.set(socketStub.id, roomID);
        const room = CREATE_GAME.constructRoom();
        room.guestPlayer.socketID = socketStub.id;
        service.gameInProgress.set(roomID, room);
        const spy = Sinon.stub(service, 'deletePlayerInGameInProgress');

        const clock = Sinon.useFakeTimers();
        service.disconnect(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        clock.tick(tmpTime);
        expect(spy.calledWith(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID)).to.equal(true);
        spy.restore();
        clock.restore();
    });

    it('disconnect should do nothing if the room to disconnect from is undefined', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';

        const room = CREATE_GAME.constructRoom();
        room.gameCreator.socketID = socketStub.id;
        service.gamePending.set(roomID, room);
        const spy = Sinon.spy(waitingGamesManagerService, 'deleteWaitingGame');
        service.disconnect(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(spy.called).to.equal(false);
        spy.restore();
    });

    it('deletePlayerInGameInProgress should delete the game data from gameInProgress and call functions clearTimerInterval and reset v1', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';

        const room = CREATE_GAME.constructRoom();
        room.gameCreator.socketID = socketStub.id;
        service.gameInProgress.set(roomID, room);

        const expectedGameInProgress: Map<string, Room> = new Map();

        const container = Container.of(roomID).get(TurnHandlerService);
        const spy1 = Sinon.spy(container, 'clearTimerInterval');
        const spy2 = Sinon.spy(Container.of(roomID), 'reset');

        service.deletePlayerInGameInProgress(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID);
        expect(service.gameInProgress).to.deep.equal(expectedGameInProgress);
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('deletePlayerInGameInProgress should emit otherPlayerLeft signal and delete game creator player data from gameInProgress', () => {
        service.gameInProgress.clear();
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';

        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = 'Paul';
        room.gameCreator.socketID = socketStub.id;
        room.guestPlayer.playerName = 'John';
        room.guestPlayer.socketID = '456';
        service.gameInProgress.set(roomID, room);

        const container = Container.of(roomID);
        const roomDataService = container.get(RoomDataService);
        roomDataService.gameCreator = room.gameCreator;

        const expectedGameInProgress: Map<string, Room> = new Map();

        service.deletePlayerInGameInProgress(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID);
        expect(service.gameInProgress).to.deep.equal(expectedGameInProgress);
    });

    it('deletePlayerInGameInProgress should delete the game data from gameInProgress and call functions clearTimerInterval and reset v2', () => {
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';

        const room = CREATE_GAME.constructRoom();
        room.guestPlayer.socketID = socketStub.id;
        service.gameInProgress.set(roomID, room);

        const expectedGameInProgress: Map<string, Room> = new Map();

        const container = Container.of(roomID).get(TurnHandlerService);
        const spy1 = Sinon.spy(container, 'clearTimerInterval');
        const spy2 = Sinon.spy(Container.of(roomID), 'reset');

        service.deletePlayerInGameInProgress(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID);
        expect(service.gameInProgress).to.deep.equal(expectedGameInProgress);
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('deletePlayerInGameInProgress should emit otherPlayerLeft signal and delete guest player data from gameInProgress', () => {
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';

        const room = CREATE_GAME.constructRoom();
        room.guestPlayer.playerName = 'Paul';
        room.guestPlayer.socketID = socketStub.id;
        room.gameCreator.playerName = 'John';
        room.gameCreator.socketID = '456';
        service.gameInProgress.set(roomID, room);

        const container = Container.of(roomID);
        const roomDataService = container.get(RoomDataService);
        roomDataService.guestPlayer = room.guestPlayer;

        const expectedGameInProgress: Map<string, Room> = new Map();

        service.deletePlayerInGameInProgress(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID);
        expect(service.gameInProgress).to.deep.equal(expectedGameInProgress);
    });

    it('deletePlayerInGameInProgress should return and do nothing if gameInProgress is not found', () => {
        service.socketIds.clear();
        service.gameInProgress.clear();
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
            },
        };
        const socketStub = {
            id: '123',
            broadcast: {
                to: (roomId: string) => {
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
            socketsLeave: (roomId: string) => {
                return;
            },
        };
        const roomID = 'room1';
        service.deletePlayerInGameInProgress(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket, roomID);
        expect(service.gameInProgress.get(roomID)?.gameCreator.socketID).not.to.equal(socketStub.id);
        expect(service.gameInProgress.get(roomID)?.guestPlayer.socketID).not.to.equal(socketStub.id);
    });

    it('removeRoomsWithDictionary should call deleteWaitingGame from WaitingGamesManagerService', () => {
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
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
            socketsLeave: (roomID: string) => {
                return;
            },
        };

        const roomMock = CREATE_GAME.constructRoom();
        roomMock.guestPlayer.playerName = 'Paul';
        roomMock.guestPlayer.socketID = 'abc123';
        roomMock.gameCreator.playerName = 'John';
        roomMock.gameCreator.socketID = '456';

        const pendingRoomMap = new Map<string, string>();
        pendingRoomMap.set('room', 'room');
        service.pendingRoomsDictionaries.set('title', pendingRoomMap);
        const gamePendingStub = Sinon.stub(service.gamePending, 'get').returns(roomMock);
        const deleteWaitingGameStub = Sinon.stub(waitingGamesManagerService, 'deleteWaitingGame');

        service.removeRoomsWithDictionary('title', serverStub as unknown as SocketIO.Server);
        expect(deleteWaitingGameStub.calledWith(serverStub as unknown as SocketIO.Server, '456'));
        gamePendingStub.restore();
        deleteWaitingGameStub.restore();
    });

    it('removeRoomsWithDictionary should return undefined if listRoom is undefined', () => {
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
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
            socketsLeave: (roomID: string) => {
                return;
            },
        };

        const pendingRoomMap = new Map<string, string>();
        pendingRoomMap.set('room', 'room');
        service.pendingRoomsDictionaries.set('title', pendingRoomMap);

        const returnedValue = service.removeRoomsWithDictionary('title', serverStub as unknown as SocketIO.Server);
        expect(returnedValue).to.equal(undefined);
    });
});
