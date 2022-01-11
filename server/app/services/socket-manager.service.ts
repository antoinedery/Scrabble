import { MAX_BUFFER_SIZE } from '@app/classes/constants/constants';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { PlayerName } from '@app/classes/interfaces/player-name';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { Tile } from '@app/classes/interfaces/tile';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { NameDatabaseService } from '@app/services/name-database.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { RoomManagerService } from '@app/services/room-manager.service';
import { ScoreDatabaseService } from '@app/services/score-database.service';
import { WaitingGamesManagerService } from '@app/services/waiting-games-manager.service';
import * as http from 'http';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { DictionaryManagerService } from './dictionary-manager.service';
import { DictionaryService } from './dictionary.service';
import { PlayerPlacementConfirmationService } from './player-placement-confirmation.service';
import { RoomDataService } from './room-data.service';
import { TurnHandlerService } from './turn-handler.service';

@Service()
export class SocketManagerService {
    sio: io.Server;

    constructor(
        private roomManagerService: RoomManagerService,
        private waitingGamesManagerService: WaitingGamesManagerService,
        private nameDatabaseService: NameDatabaseService,
        private scoreDatabaseService: ScoreDatabaseService,
        private dictionaryManagerService: DictionaryManagerService,
    ) {}

    initSocket(server: http.Server): void {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] }, maxHttpBufferSize: MAX_BUFFER_SIZE });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('createRoom', (waitingGame: WaitingGame) => {
                this.roomManagerService.createRoom(socket, waitingGame);
            });

            socket.on('joinRoom', (gameHostSocketID: string, joiningPlayerName: string) => {
                const wasJoinASuccess = this.roomManagerService.joinRoom(this.sio, socket, gameHostSocketID, joiningPlayerName);
                /* istanbul ignore else */
                if (wasJoinASuccess) {
                    const room = this.roomManagerService.socketIds.get(socket.id);
                    /* istanbul ignore else */
                    if (room) {
                        const container = Container.of(room);
                        const dictionaryService = container.get(DictionaryService);
                        const playAreaService = container.get(PlayAreaService);
                        const roomDataService = container.get(RoomDataService);
                        const turnHandlerService = container.get(TurnHandlerService);
                        const roomInfos = this.roomManagerService.gameInProgress.get(room);
                        /* istanbul ignore else */
                        if (roomInfos) {
                            dictionaryService.initDictionary(roomInfos.gameParameters.dictionary);
                            playAreaService.randomizeBoard(roomInfos.gameParameters.shuffleBonus, this.sio, room);
                            const startingPlayerName = roomDataService.initRoomData(room, roomInfos, this.sio);
                            turnHandlerService.initTimer(this.sio, startingPlayerName);
                        }
                    }
                }
            });

            socket.on('addWaitingGame', (game: WaitingGame) => {
                this.waitingGamesManagerService.addWaitingGame(socket, game);
            });

            socket.on('sendWaitingGames', (isLog2990ModeChosen: boolean) => {
                this.waitingGamesManagerService.sendWaitingGames(socket, isLog2990ModeChosen);
            });

            socket.on('endRoom', () => {
                this.roomManagerService.endRoom(this.sio, socket);
            });

            socket.on('sendReserve', () => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                const roomContainer = Container.of(room);
                const reserve = roomContainer.get(LetterReserveService).letterReserve;
                const reserveArray = JSON.stringify(Array.from(reserve));
                socket.emit('hereIsTheReserve', reserveArray);
            });

            socket.on('disconnect', () => {
                this.roomManagerService.disconnect(this.sio, socket);
            });

            socket.on('leaveGame', () => {
                this.roomManagerService.leaveRoom(this.sio, socket);
            });

            socket.on('newMessageToShare', (message: string, userName: string) => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                /* istanbul ignore else */
                if (room !== undefined) {
                    socket.broadcast.to(room).emit('hereIsANewMessage', message, userName);
                }
            });

            socket.on('LettersToExchangeUsingInputChat', (lettersToExchange: string) => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                /* istanbul ignore else */
                if (room !== undefined) {
                    const roomContainer = Container.of(room);
                    const changeLetterService = roomContainer.get(ChangeLetterService);
                    const activePlayerService = roomContainer.get(ActivePlayerService);
                    activePlayerService.assignAttributes(socket.id);
                    changeLetterService.exchangeLettersUsingInputChat(socket, lettersToExchange, room);
                }
            });

            socket.on('PasserTourMulti', () => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                const roomContainer = Container.of(room);
                const turnHandlerService = roomContainer.get(TurnHandlerService);
                turnHandlerService.incrementTurnsPassed();
            });

            socket.on('LettersToExchangeUsingMouseSelection', (lettersToExchange: string) => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                /* istanbul ignore else */
                if (room !== undefined) {
                    const roomContainer = Container.of(room);
                    const changeLetterService = roomContainer.get(ChangeLetterService);
                    const activePlayerService = roomContainer.get(ActivePlayerService);
                    activePlayerService.assignAttributes(socket.id);
                    changeLetterService.exchangeLettersUsingSelection(socket, lettersToExchange, room);
                }
            });

            socket.on('LettersToPlace', (placement: Placement, playerLetterRack: Tile[], message: string) => {
                const room = this.roomManagerService.socketIds.get(socket.id);
                if (!room) return;
                const roomContainer = Container.of(room);
                const activePlayerService = roomContainer.get(ActivePlayerService);
                const playerPlacementConfirmationService = roomContainer.get(PlayerPlacementConfirmationService);
                activePlayerService.assignAttributes(socket.id, playerLetterRack);
                playerPlacementConfirmationService.confirmPlayerPlacement(placement, socket, this.sio, room, message);
            });

            /* ***********************DATABASE************************* */

            socket.on('scoreListGameMode', async (gameMode: string) => {
                const scoreArray = await this.scoreDatabaseService.getTop5(gameMode);
                if (scoreArray.length !== 0) {
                    socket.emit('scoreList', scoreArray);
                } else {
                    socket.emit('errorMessage', 'Echec de retour du leaderboard');
                }
            });

            socket.on('sendScoreToAdd', async (player: PlayerScore) => {
                const insertConnected = await this.scoreDatabaseService.insertDB(player);
                /* istanbul ignore else */
                if (!insertConnected) {
                    socket.emit('errorMessage', "Echec d'insertion du score");
                }
            });

            socket.on('playerList', async () => {
                const playerArray = await this.nameDatabaseService.getCollection();
                if (playerArray.length !== 0) {
                    socket.emit('nameList', playerArray);
                    socket.broadcast.emit('nameList', playerArray);
                } else {
                    socket.emit('errorMessage', 'Echec de retour des noms JV');
                }
            });

            socket.on('resetData', async () => {
                this.dictionaryManagerService.clearList(socket);
                const playerArray = await this.nameDatabaseService.resetDB();
                const resetConnected = await this.scoreDatabaseService.resetDB();
                if (playerArray.length === 0 && !resetConnected) {
                    socket.emit('errorMessage', 'Echec de reinitialisation de BD');
                } else {
                    socket.emit('nameList', playerArray);
                    socket.broadcast.emit('nameList', playerArray);
                }
            });

            socket.on('sendPlayerToAdd', async (player: PlayerName) => {
                const playerArray = await this.nameDatabaseService.insertDB(player);
                if (playerArray.length !== 0) {
                    socket.emit('nameList', playerArray);
                    socket.broadcast.emit('nameList', playerArray);
                } else {
                    socket.emit('errorMessage', "Echec d'insertion de nom");
                }
            });

            socket.on('sendPlayerToUpdate', async (player: PlayerName, newName: string) => {
                const playerArray = await this.nameDatabaseService.updateDB(player, newName);
                if (playerArray.length !== 0) {
                    socket.emit('nameList', playerArray);
                    socket.broadcast.emit('nameList', playerArray);
                } else {
                    socket.emit('errorMessage', 'Echec de mise a jour de score');
                }
            });

            socket.on('sendPlayerToRemove', async (player: PlayerName) => {
                const playerArray = await this.nameDatabaseService.removeDB(player);
                if (playerArray.length !== 0) {
                    socket.emit('nameList', playerArray);
                    socket.broadcast.emit('nameList', playerArray);
                } else {
                    socket.emit('errorMessage', 'Echec de suppression de nom');
                }
            });

            /* ***********************Dictionary uploader************************* */

            socket.on('sendDictionaryToServer', (dictionary: IDictionary) => {
                this.dictionaryManagerService.handleNewDictionary(dictionary, socket);
            });

            socket.on('updateDictionaryList', () => {
                this.dictionaryManagerService.updateClientDictionary(socket);
            });

            socket.on('removeDictionary', (title: string) => {
                this.dictionaryManagerService.removeDictionary(title, socket);
                this.roomManagerService.removeRoomsWithDictionary(title, this.sio);
            });

            socket.on('editDictionary', (previousDetails: DictionaryDetails, newDetails: DictionaryDetails) => {
                this.dictionaryManagerService.editDictionary(previousDetails, newDetails, socket);
            });

            socket.on('downloadDictionary', (title: string) => {
                this.dictionaryManagerService.downloadDictionary(title, socket);
            });

            socket.on('getDictionaryForClient', (title: string) => {
                this.dictionaryManagerService.sendDictionaryToClient(title, socket);
            });
        });
    }
}
