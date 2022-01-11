// Disable de lint autorisé par chargés
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CREATE_GAME } from '@app/classes/constants/constants';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { Time } from '@app/classes/interfaces/game-parameters';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { PlayerName } from '@app/classes/interfaces/player-name';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { Tile } from '@app/classes/interfaces/tile';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { Server } from '@app/server';
import { SocketManagerService } from '@app/services/socket-manager.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { io, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { ChangeLetterService } from './change-letter.service';
import { DictionaryManagerService } from './dictionary-manager.service';
import { DictionaryService } from './dictionary.service';
import { LetterReserveService } from './letter-reserve.service';
import { NameDatabaseService } from './name-database.service';
import { PlayAreaService } from './play-area.service';
import { PlayerPlacementConfirmationService } from './player-placement-confirmation.service';
import { RoomDataService } from './room-data.service';
import { RoomManagerService } from './room-manager.service';
import { ScoreDatabaseService } from './score-database.service';
import { TurnHandlerService } from './turn-handler.service';
import { WaitingGamesManagerService } from './waiting-games-manager.service';

const WAITING_TIME_FOR_TESTING = 300;

describe('SocketManagerService', () => {
    let service: SocketManagerService;
    let roomManagerService: RoomManagerService;
    let waitingGamesManagerService: WaitingGamesManagerService;
    let socket1: Socket;
    let socket2: Socket;
    let server: Server;

    before(async () => {
        server = Container.get(Server);
        service = Container.get(SocketManagerService);
        server.init();
    });

    beforeEach(async () => {
        roomManagerService = Container.get(RoomManagerService);
        waitingGamesManagerService = Container.get(WaitingGamesManagerService);
        socket1 = io('ws://localhost:3000');
        socket2 = io('ws://localhost:3000');
    });

    afterEach(async () => {
        socket1.close();
        socket2.close();
    });

    after(() => {
        server['server'].close();
        service.sio.close();
    });

    /* *************************** DICTIONARY *************************** */
    it('sendDictionaryToServer signal should call function handleNewDictionary from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const dictionary: IDictionary = { title: '', description: '', words: [] };
        socket1.on('connect', () => {
            socket1.emit('sendDictionaryToServer', dictionary);
        });
        const handleNewDictionaryStub = Sinon.stub(dictionaryManagerService, 'handleNewDictionary');
        setTimeout(() => {
            expect(handleNewDictionaryStub.calledWith(dictionary, Sinon.match.any)).to.equal(true);
            done();
            handleNewDictionaryStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('updateDictionaryList signal should call function updateClientDictionary from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);

        const dictionary = { title: '', description: '', words: [] };
        socket1.on('connect', () => {
            socket1.emit('updateDictionaryList', dictionary);
        });
        const updateClientDictionaryStub = Sinon.stub(dictionaryManagerService, 'updateClientDictionary');
        setTimeout(() => {
            expect(updateClientDictionaryStub.calledWith(Sinon.match.any)).to.equal(true);
            done();
            updateClientDictionaryStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('removeDictionary signal should call function removeDictionary from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const title = 'dictionaryTitle';
        socket1.on('connect', () => {
            socket1.emit('removeDictionary', title);
        });
        const removeDictionaryStub = Sinon.stub(dictionaryManagerService, 'removeDictionary');
        setTimeout(() => {
            expect(removeDictionaryStub.calledWith(title, Sinon.match.any)).to.equal(true);
            done();
            removeDictionaryStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('editDictionary signal should call function editDictionary from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const previousDetails: DictionaryDetails = { title: 'previousTitle', description: 'previousDescription' };
        const newDetails: DictionaryDetails = { title: 'newTitle', description: 'newDescription' };
        socket1.on('connect', () => {
            socket1.emit('editDictionary', previousDetails, newDetails);
        });
        const editDictionaryStub = Sinon.stub(dictionaryManagerService, 'editDictionary');
        setTimeout(() => {
            expect(editDictionaryStub.calledWith(previousDetails, newDetails, Sinon.match.any)).to.equal(true);
            done();
            editDictionaryStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('downloadDictionary signal should call function downloadDictionary from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const title = 'title';
        socket1.on('connect', () => {
            socket1.emit('downloadDictionary', title);
        });
        const downloadDictionaryStub = Sinon.stub(dictionaryManagerService, 'downloadDictionary');
        setTimeout(() => {
            expect(downloadDictionaryStub.calledWith(title, Sinon.match.any)).to.equal(true);
            done();
            downloadDictionaryStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('getDictionaryForClient signal should call function sendDictionaryToClient from DictionaryManagerService', (done) => {
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const title = 'title';
        socket1.on('connect', () => {
            socket1.emit('getDictionaryForClient', title);
        });
        const sendDictionaryToClientStub = Sinon.stub(dictionaryManagerService, 'sendDictionaryToClient');
        setTimeout(() => {
            expect(sendDictionaryToClientStub.calledWith(title, Sinon.match.any)).to.equal(true);
            done();
            sendDictionaryToClientStub.restore();
        }, WAITING_TIME_FOR_TESTING);
    });

    /* ************************** DATABASE *************************** */
    it('scoreListGameMode signal should emit error message', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const playerScoreArray: PlayerScore[] = [];
        const getTop5Stub = Sinon.stub(scoreDatabaseService, 'getTop5').returns(Promise.resolve(playerScoreArray));
        const gameMode = 'Classic';
        socket1.on('connect', () => {
            socket1.emit('scoreListGameMode', gameMode);
        });
        setTimeout(() => {
            expect(getTop5Stub.calledWith(gameMode)).to.equal(true);
            getTop5Stub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('scoreListGameMode signal should call function getTop5 from scoreDatabaseService', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const playerScoreArray: PlayerScore[] = [{ name: 'Antoine', score: 50, mode: 'Classic' }];
        const getTop5Stub = Sinon.stub(scoreDatabaseService, 'getTop5').returns(Promise.resolve(playerScoreArray));

        const gameMode = 'Classic';
        socket1.on('connect', () => {
            socket1.emit('scoreListGameMode', gameMode);
        });
        setTimeout(() => {
            expect(getTop5Stub.calledWith(gameMode)).to.equal(true);
            getTop5Stub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendScoreToAdd signal should call function insertDB from scoreDatabaseService', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const player: PlayerScore = { name: 'Antoine', score: 10, mode: 'Classic' };
        const insertDBStub = Sinon.stub(scoreDatabaseService, 'insertDB').returns(Promise.resolve(false));
        socket1.on('connect', () => {
            socket1.emit('sendScoreToAdd', player);
        });

        setTimeout(() => {
            expect(insertDBStub.calledWith(player)).to.equal(true);
            insertDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendScoreToAdd signal should emit error message', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const player: PlayerScore = { name: 'Antoine', score: 10, mode: 'Classic' };
        const insertDBStub = Sinon.stub(scoreDatabaseService, 'insertDB').returns(Promise.resolve(true));
        socket1.on('connect', () => {
            socket1.emit('sendScoreToAdd', player);
        });

        setTimeout(() => {
            expect(insertDBStub.calledWith(player)).to.equal(true);
            insertDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('playerList signal should call function getCollection from nameDatabaseService', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [{ name: 'Antoine', difficulty: 'Expert' }];
        const getCollectionStub = Sinon.stub(nameDatabaseService, 'getCollection').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('playerList');
        });
        setTimeout(() => {
            expect(getCollectionStub.called).to.equal(true);
            getCollectionStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('playerList signal should emit error message', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [];
        const getCollectionStub = Sinon.stub(nameDatabaseService, 'getCollection').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('playerList');
        });
        setTimeout(() => {
            expect(getCollectionStub.called).to.equal(true);
            getCollectionStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('resetData signal should emit error message', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const nameDatabaseService = Container.get(NameDatabaseService);
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const player: PlayerName[] = [];
        const clearListStub = Sinon.stub(dictionaryManagerService, 'clearList');
        const resetDBScoreStub = Sinon.stub(nameDatabaseService, 'resetDB').returns(Promise.resolve(player));
        const resetDBNameStub = Sinon.stub(scoreDatabaseService, 'resetDB').returns(Promise.resolve(false));

        socket1.on('connect', () => {
            socket1.emit('resetData');
        });

        setTimeout(() => {
            expect(resetDBScoreStub.called).to.equal(true);
            expect(resetDBNameStub.called).to.equal(true);
            resetDBScoreStub.restore();
            resetDBNameStub.restore();
            clearListStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('resetData signal should emit playerArray', (done) => {
        const scoreDatabaseService = Container.get(ScoreDatabaseService);
        const nameDatabaseService = Container.get(NameDatabaseService);
        const dictionaryManagerService = Container.get(DictionaryManagerService);
        const player: PlayerName[] = [{ name: 'Antoine', difficulty: 'Expert' }];
        const clearListStub = Sinon.stub(dictionaryManagerService, 'clearList');
        const resetDBScoreStub = Sinon.stub(nameDatabaseService, 'resetDB').returns(Promise.resolve(player));
        const resetDBNameStub = Sinon.stub(scoreDatabaseService, 'resetDB').returns(Promise.resolve(true));

        socket1.on('connect', () => {
            socket1.emit('resetData');
        });

        setTimeout(() => {
            expect(resetDBScoreStub.called).to.equal(true);
            expect(resetDBNameStub.called).to.equal(true);
            resetDBScoreStub.restore();
            resetDBNameStub.restore();
            clearListStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToAdd signal should call insertDB nameDatabaseService', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [{ name: 'Antoine', difficulty: 'Expert' }];
        const insertDBStub = Sinon.stub(nameDatabaseService, 'insertDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToAdd');
        });
        setTimeout(() => {
            expect(insertDBStub.called).to.equal(true);
            insertDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToAdd signal should emit error message', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [];
        const insertDBStub = Sinon.stub(nameDatabaseService, 'insertDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToAdd');
        });
        setTimeout(() => {
            expect(insertDBStub.called).to.equal(true);
            insertDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToUpdate signal should call updateDB nameDatabaseService', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [{ name: 'Antoine', difficulty: 'Expert' }];
        const updateDBStub = Sinon.stub(nameDatabaseService, 'updateDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToUpdate');
        });
        setTimeout(() => {
            expect(updateDBStub.called).to.equal(true);
            updateDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToUpdate signal should emit error message', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [];
        const updateDBStub = Sinon.stub(nameDatabaseService, 'updateDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToUpdate');
        });
        setTimeout(() => {
            expect(updateDBStub.called).to.equal(true);
            updateDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToRemove signal should call updateDB nameDatabaseService', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [{ name: 'Antoine', difficulty: 'Expert' }];
        const removeDBStub = Sinon.stub(nameDatabaseService, 'removeDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToRemove');
        });
        setTimeout(() => {
            expect(removeDBStub.called).to.equal(true);
            removeDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendPlayerToRemove signal should emit error message', (done) => {
        const nameDatabaseService = Container.get(NameDatabaseService);
        const player: PlayerName[] = [];
        const removeDBStub = Sinon.stub(nameDatabaseService, 'removeDB').returns(Promise.resolve(player));
        socket1.on('connect', () => {
            socket1.emit('sendPlayerToRemove');
        });
        setTimeout(() => {
            expect(removeDBStub.called).to.equal(true);
            removeDBStub.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    /* ************************** MULTIPLAYER *************************** */
    it('createRoom signal should call function createRoom of roomManagerService', (done) => {
        const gameCreatorName = 'joueur1';
        const roomTimer: Time = { minute: 1, second: 0 };
        const shuffleBonus = false;
        const dictionaryDetails = {
            title: '',
            description: '',
        };
        let waitingGame: WaitingGame;
        socket1.on('connect', () => {
            waitingGame = {
                playerName: gameCreatorName,
                timer: roomTimer,
                dictionary: dictionaryDetails,
                bonus: shuffleBonus,
                socketId: socket1.id,
                isLog2990ModeChosen: false,
            };
            socket1.emit('createRoom', waitingGame);
        });
        const spy = Sinon.spy(roomManagerService, 'createRoom');
        setTimeout(() => {
            expect(spy.calledOnceWith(Sinon.match.any, waitingGame)).to.equal(true);
            spy.restore();
            socket1.emit('endRoom');
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('joinRoom signal should call functions joinRoom, randomizeBoard, initRoomData, initTimer with right parameters', (done) => {
        const roomId = 'room1';
        const container = Container.of(roomId);
        const dictionaryService = container.get(DictionaryService);
        const playAreaService = container.get(PlayAreaService);
        const turnHandlerService = container.get(TurnHandlerService);

        socket1.on('connect', () => {
            roomManagerService.socketIds.set(socket1.id, roomId);
            roomManagerService.gameInProgress.set(roomId, CREATE_GAME.constructRoom());
            socket1.emit('joinRoom', '', '');
        });

        const spy1 = Sinon.stub(roomManagerService, 'joinRoom').returns(true);
        const spy2 = Sinon.stub(playAreaService, 'randomizeBoard');
        const spy3 = Sinon.stub(turnHandlerService, 'initTimer');
        const spy4 = Sinon.stub(dictionaryService, 'initDictionary');

        setTimeout(() => {
            expect(spy2.called).to.equal(true);
            expect(spy3.called).to.equal(true);
            expect(spy4.called).to.equal(true);
            spy1.restore();
            spy2.restore();
            spy3.restore();
            spy4.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('addWaitingGame signal should call function addWaitingGame with the right parameters', (done) => {
        const game: WaitingGame = {
            playerName: 'abcd',
            timer: { minute: 1, second: 0 },
            dictionary: { title: '', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        socket1.on('connect', () => {
            socket1.emit('addWaitingGame', game);
        });
        const spy = Sinon.spy(waitingGamesManagerService, 'addWaitingGame');
        setTimeout(() => {
            expect(spy.calledOnceWith(Sinon.match.any, game)).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendWaitingGames signal should call function sendWaitingGames with the right parameter', (done) => {
        const isLog2990ModeChosen = false;
        socket1.on('connect', () => {
            socket1.emit('sendWaitingGames', isLog2990ModeChosen);
        });
        const spy = Sinon.spy(waitingGamesManagerService, 'sendWaitingGames');
        setTimeout(() => {
            expect(spy.calledOnceWith(Sinon.match.any, isLog2990ModeChosen)).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('endRoom signal should call function endRoom with the right parameters', (done) => {
        socket1.on('connect', () => {
            socket1.emit('endRoom');
        });
        const spy = Sinon.spy(roomManagerService, 'endRoom');
        setTimeout(() => {
            expect(spy.calledOnceWith(service.sio, Sinon.match.any)).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('sendReserve signal should emit hereIsTheReserve signal with the reserve', (done) => {
        socket1.on('connect', () => {
            roomManagerService.socketIds.set(socket1.id, 'room1');
            socket1.on('hereIsTheReserve', (reserveArray: string) => {
                const roomContainer = Container.of('room1');
                const reserve = roomContainer.get(LetterReserveService).letterReserve;
                const actualReserveArray = JSON.stringify(Array.from(reserve));
                expect(actualReserveArray).to.equal(reserveArray);
            });
            socket1.emit('sendReserve');
        });

        setTimeout(() => {
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('disconnect signal should call function disconnect with the right parameters', (done) => {
        socket1.on('connect', () => {
            socket1.close();
        });
        const spy = Sinon.stub(roomManagerService, 'disconnect');
        setTimeout(() => {
            expect(spy.calledOnceWith(service.sio, Sinon.match.any)).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('leaveGame signal should call function leaveRoom with the right parameter', (done) => {
        socket1.on('connect', () => {
            socket1.emit('leaveGame');
        });
        const spy = Sinon.spy(roomManagerService, 'leaveRoom');
        setTimeout(() => {
            expect(spy.calledOnceWith(Sinon.match.any, Sinon.match.any)).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('newMessageToShare signal should emit hereIsANewMessage signal with the right parameters', (done) => {
        socket1.on('connect', () => {
            roomManagerService.socketIds.set(socket1.id, 'room1');
            socket1.emit('newMessageToShare', '', '');
        });
        setTimeout(() => {
            const test = Sinon.stub(socket1, 'emit');
            expect(test.calledWith('hereIsANewMessage', '', ''));
            test.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('LettersToExchangeUsingInputChat signal should call the correct functions with the right parameters', (done) => {
        const lettersToExchange = 'abc';
        socket1.on('connect', () => {
            roomManagerService.socketIds = new Map();
            roomManagerService.socketIds.set(socket1.id, 'room1');
            socket1.emit('LettersToExchangeUsingInputChat', lettersToExchange);
        });

        const roomContainer = Container.of('room1');
        const changeLetterService = roomContainer.get(ChangeLetterService);
        const activePlayerService = roomContainer.get(ActivePlayerService);
        const spy1 = Sinon.spy(activePlayerService, 'assignAttributes');
        const spy2 = Sinon.spy(changeLetterService, 'exchangeLettersUsingInputChat');
        setTimeout(() => {
            expect(spy1.calledOnceWith(socket1.id)).to.equal(true);
            expect(spy2.calledOnceWith(Sinon.match.any, lettersToExchange, 'room1')).to.equal(true);
            spy1.restore();
            spy2.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('PasserTourMulti signal should call function incrementTurnsPassed (which switches turns)', (done) => {
        socket1.on('connect', () => {
            roomManagerService.socketIds = new Map();
            roomManagerService.socketIds.set(socket1.id, 'room1');
            socket1.emit('PasserTourMulti');
        });

        const roomContainer = Container.of('room1');
        const turnHandlerService = roomContainer.get(TurnHandlerService);
        turnHandlerService.sio = service.sio;
        const spy = Sinon.spy(turnHandlerService, 'incrementTurnsPassed');
        setTimeout(() => {
            expect(spy.calledOnce).to.equal(true);
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('LettersToExchangeUsingMouseSelection signal should call the correct functions with the right parameters', (done) => {
        const lettersToExchange = '[[0,"S"],[1,"B"]]';
        const roomContainer = Container.of('room1');
        const changeLetterService = roomContainer.get(ChangeLetterService);
        const activePlayerService = roomContainer.get(ActivePlayerService);
        const turnHandlerService = roomContainer.get(TurnHandlerService);
        turnHandlerService.sio = service.sio;
        const roomDataService = roomContainer.get(RoomDataService);
        socket1.on('connect', () => {
            roomManagerService.socketIds = new Map();
            roomManagerService.socketIds.set(socket1.id, 'room1');

            roomDataService.gameCreator.socketID = socket1.id;
            roomDataService.gameCreator.letterRack = [
                { letter: 'S', score: 1 },
                { letter: 'B', score: 1 },
            ];
            socket1.emit('LettersToExchangeUsingMouseSelection', lettersToExchange);
        });
        const spy1 = Sinon.spy(activePlayerService, 'assignAttributes');
        const spy2 = Sinon.spy(changeLetterService, 'exchangeLettersUsingSelection');
        setTimeout(() => {
            expect(spy1.calledOnceWith(socket1.id)).to.equal(true);
            expect(spy2.calledOnceWith(Sinon.match.any, lettersToExchange, 'room1')).to.equal(true);
            spy1.restore();
            spy2.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('LettersToPlace signal should call the correct functions with the right parameters', (done) => {
        const placement: Placement = { axis: 0, letters: [] };
        const playerLetterRack: Tile[] = [];
        playerLetterRack.push({ letter: 'A', score: 1 });
        playerLetterRack.push({ letter: 'B', score: 1 });
        const message = '!placer h8h bonjour';
        const roomContainer = Container.of('room1');
        const activePlayerService = roomContainer.get(ActivePlayerService);
        const playerPlacementConfirmationService = roomContainer.get(PlayerPlacementConfirmationService);
        socket1.on('connect', () => {
            roomManagerService.socketIds = new Map();
            roomManagerService.socketIds.set(socket1.id, 'room1');
            socket1.emit('LettersToPlace', placement, playerLetterRack, message);
        });
        const spy1 = Sinon.spy(activePlayerService, 'assignAttributes');
        const spy2 = Sinon.spy(playerPlacementConfirmationService, 'confirmPlayerPlacement');
        setTimeout(() => {
            expect(spy1.calledOnceWith(socket1.id, playerLetterRack)).to.equal(true);
            expect(spy2.calledOnceWith(placement, Sinon.match.any, service.sio, 'room1', message)).to.equal(true);
            spy1.restore();
            spy2.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });

    it('LettersToPlace signal should do nothing if room is undefined', (done) => {
        const placement: Placement = { axis: 0, letters: [] };
        const playerLetterRack: Tile[] = [];
        playerLetterRack.push({ letter: 'A', score: 1 });
        playerLetterRack.push({ letter: 'B', score: 1 });
        const message = '!placer h8h bonjour';
        const roomContainer = Container.of('room1');
        const activePlayerService = roomContainer.get(ActivePlayerService);
        const playerPlacementConfirmationService = roomContainer.get(PlayerPlacementConfirmationService);
        socket1.on('connect', () => {
            roomManagerService.socketIds = new Map();
            socket1.emit('LettersToPlace', placement, playerLetterRack, message);
        });
        const spy1 = Sinon.spy(activePlayerService, 'assignAttributes');
        const spy2 = Sinon.spy(playerPlacementConfirmationService, 'confirmPlayerPlacement');
        setTimeout(() => {
            expect(spy1.calledOnceWith(socket1.id, playerLetterRack)).to.equal(false);
            expect(spy2.calledOnceWith(placement, Sinon.match.any, service.sio, 'room1', message)).to.equal(false);
            spy1.restore();
            spy2.restore();
            done();
        }, WAITING_TIME_FOR_TESTING);
    });
});
