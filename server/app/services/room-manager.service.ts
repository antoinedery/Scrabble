import { CREATE_GAME, QUIT_GAME_DELAY } from '@app/classes/constants/constants';
import { Player } from '@app/classes/interfaces/player';
import { Room } from '@app/classes/interfaces/room';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { DictionaryService } from '@app/services/dictionary.service';
import { RoomDataService } from '@app/services/room-data.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { WaitingGamesManagerService } from '@app/services/waiting-games-manager.service';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Container, Service } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';

declare type SocketId = string;
declare type RoomID = string;
declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class RoomManagerService {
    socketIds: Map<SocketId, RoomID> = new Map<SocketId, RoomID>();
    gamePending: Map<RoomID, Room> = new Map<RoomID, Room>();
    gameInProgress: Map<RoomID, Room> = new Map<RoomID, Room>();

    pendingRoomsDictionaries: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

    constructor(private waitingGamesManagerService: WaitingGamesManagerService) {}

    removeRoomsWithDictionary(title: string, sio: io.Server) {
        const listRoom = this.pendingRoomsDictionaries.get(title);
        if (!listRoom) return;
        for (const roomToEnd of listRoom.values()) {
            const roomInfos = this.gamePending.get(roomToEnd);
            /* istanbul ignore else */
            if (roomInfos) {
                const gameHostSocketId = roomInfos.gameCreator.socketID;
                sio.to(roomToEnd).emit('deletedRoomDictionary');
                this.closeRoom(sio, roomToEnd, gameHostSocketId);
            }
        }

        this.pendingRoomsDictionaries.delete(title);
    }

    createRoom(socket: ASocket, waitingGame: WaitingGame): void {
        const room = CREATE_GAME.constructRoom();
        room.gameCreator.playerName = waitingGame.playerName;
        room.gameCreator.socketID = socket.id;
        room.gameParameters.timer = waitingGame.timer;
        room.gameParameters.shuffleBonus = waitingGame.bonus;
        room.gameParameters.dictionary = waitingGame.dictionary;
        room.gameParameters.isLog2990ModeChosen = waitingGame.isLog2990ModeChosen;

        let roomToAdd: string;
        if (!this.gamePending.size && !this.gameInProgress.size) {
            roomToAdd = 'room1';
        } else {
            let i = 1;
            while (this.gamePending.has('room'.concat(`${i}`)) || this.gameInProgress.has('room'.concat(`${i}`))) {
                i++;
            }
            roomToAdd = 'room'.concat(`${i}`);
        }

        let listRoom = this.pendingRoomsDictionaries.get(waitingGame.dictionary.title);
        if (!listRoom) this.pendingRoomsDictionaries.set(waitingGame.dictionary.title, (listRoom = new Map()));
        listRoom.set(roomToAdd, roomToAdd);

        this.gamePending.set(roomToAdd, room);
        socket.join(roomToAdd);
        this.socketIds.set(socket.id, roomToAdd);
    }

    joinRoom(sio: io.Server, socket: ASocket, gameHostSocketID: string, joiningPlayerName: string): boolean {
        const roomToJoin = this.socketIds.get(gameHostSocketID);
        if (roomToJoin === undefined || this.gameInProgress.get(roomToJoin)) {
            socket.emit('cannotJoinGame');
            return false;
        }

        const roomInfos = this.gamePending.get(roomToJoin);
        if (!roomInfos) return false;

        roomInfos.guestPlayer.playerName = joiningPlayerName;
        roomInfos.guestPlayer.socketID = socket.id;

        this.socketIds.set(socket.id, roomToJoin);
        socket.join(roomToJoin);
        this.waitingGamesManagerService.deleteWaitingGame(sio, gameHostSocketID);

        const gameHostName = roomInfos.gameCreator.playerName;
        sio.to(roomToJoin).emit('sendBothPlayerNames', [gameHostName, joiningPlayerName]);

        this.gameInProgress.set(roomToJoin, roomInfos);

        const listRoom = this.pendingRoomsDictionaries.get(roomInfos.gameParameters.dictionary.title);
        /* istanbul ignore else */
        if (listRoom) listRoom.delete(roomToJoin);

        this.gamePending.delete(roomToJoin);

        return true;
    }

    endRoom(sio: io.Server, socket: ASocket): void {
        const roomToJoin = this.socketIds.get(socket.id);
        if (!roomToJoin) return;
        this.closeRoom(sio, roomToJoin, socket.id);
    }

    closeRoom(sio: io.Server, room: string, socketId: string): void {
        this.gamePending.delete(room);
        sio.socketsLeave(room);
        this.waitingGamesManagerService.deleteWaitingGame(sio, socketId);
        this.socketIds.delete(socketId);
    }

    leaveRoom(sio: io.Server, socket: ASocket): void {
        const room = this.socketIds.get(socket.id);

        if (!room) return;

        /* istanbul ignore else */
        if (this.gameInProgress.has(room)) {
            this.deletePlayerInGameInProgress(sio, socket, room);
        }
    }

    disconnect(sio: io.Server, socket: ASocket): void {
        const room = this.socketIds.get(socket.id);
        this.socketIds.delete(socket.id);
        if (!room) return;

        if (this.gamePending.has(room)) {
            this.waitingGamesManagerService.deleteWaitingGame(sio, socket.id);
            const roomInfos = this.gamePending.get(room);
            /* istanbul ignore else */
            if (roomInfos) {
                const listRoom = this.pendingRoomsDictionaries.get(roomInfos.gameParameters.dictionary.title);
                /* istanbul ignore else */
                if (listRoom) listRoom.delete(room);
                this.gamePending.delete(room);
            }
            return;
        }

        /* istanbul ignore else */
        if (this.gameInProgress.has(room)) {
            setTimeout(() => {
                this.deletePlayerInGameInProgress(sio, socket, room);
            }, QUIT_GAME_DELAY);
        }
    }

    deletePlayerInGameInProgress(sio: io.Server, socket: ASocket, room: string): void {
        const roomInfos = this.gameInProgress.get(room);
        if (!roomInfos) return;
        const container = Container.of(room);
        const roomDataService = container.get(RoomDataService);
        const turnHandlerService = container.get(TurnHandlerService);
        let playerInfos: Player;
        let opponentInfos: Player;
        if (roomDataService.gameCreator.socketID === socket.id) {
            playerInfos = roomDataService.gameCreator;
            opponentInfos = roomDataService.guestPlayer;
        } else {
            playerInfos = roomDataService.guestPlayer;
            opponentInfos = roomDataService.gameCreator;
        }
        const letterReserveService = container.get(LetterReserveService);
        const dictionaryService = container.get(DictionaryService);
        socket.broadcast.to(room).emit('otherPlayerLeft', {
            existingPlayer: {
                name: opponentInfos.playerName,
                letterRack: opponentInfos.letterRack,
                playerScore: opponentInfos.playerScore,
                isMyTurn: opponentInfos.isMyTurn,
                privateObjective: JSON.stringify(Array.from(opponentInfos.privateObjective)),
            },
            quittingPlayer: {
                name: playerInfos.playerName,
                letterRack: playerInfos.letterRack,
                playerScore: playerInfos.playerScore,
                isMyTurn: playerInfos.isMyTurn,
                privateObjective: JSON.stringify(Array.from(playerInfos.privateObjective)),
            },
            publicObjectives: JSON.stringify(Array.from(roomDataService.publicObjectives)),
            turnHandlerInfos: {
                turnsPassed: turnHandlerService.turnsPassedCounter,
                timeValue: turnHandlerService.timeValue,
                gameEnded: roomDataService.isGameEnded,
            },
            dataInfos: {
                reserveInfos: {
                    reserve: JSON.stringify(Array.from(letterReserveService.letterReserve)),
                    size: letterReserveService.letterReserveTotalSize,
                },
                dictionary: dictionaryService.dictionary,
            },
        });
        this.socketIds.delete(roomInfos.gameCreator.socketID);
        this.socketIds.delete(roomInfos.guestPlayer.socketID);
        this.gameInProgress.delete(room);
        sio.socketsLeave(room);
        turnHandlerService.clearTimerInterval();
        container.reset();
    }
}
