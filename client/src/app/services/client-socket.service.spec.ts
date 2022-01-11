// Disable de lint autorisé par chargés dans les tests
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Square } from '@app/classes/interfaces/board-game-interfaces';
import { Objective } from '@app/classes/interfaces/objectives';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Reserve, Tile } from '@app/classes/interfaces/tile';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { DisplayWaitingGamesService } from '@app/services/display-waiting-games.service';
import { InputChatService } from '@app/services/input-chat.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { ConsolePlacementService } from '@app/services/players-placements/current/console/console-placement.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { SocketMock } from '@app/services/socket-test-helper';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { Socket } from 'socket.io-client';
import { DictionaryService } from './dictionary.service';

describe('ClientSocketService', () => {
    let service: ClientSocketService;
    let inputChatService: InputChatService;
    let turnHandlerService: TurnHandlerService;
    let selectGameModeService: SelectGameModeService;
    let playAreaService: PlayAreaService;
    let playerSettingsService: PlayerSettingsService;
    let displayMessageService: DisplayMessageService;
    let displayWaitingGamesService: DisplayWaitingGamesService;
    let mousePlacementService: MousePlacementService;
    let matDialog: MatDialog;
    let consolePlacementService: ConsolePlacementService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [MatDialogModule, RouterTestingModule.withRoutes([{ path: 'game', redirectTo: '' }])],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientSocketService);
        inputChatService = TestBed.inject(InputChatService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        playAreaService = TestBed.inject(PlayAreaService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        displayMessageService = TestBed.inject(DisplayMessageService);
        displayWaitingGamesService = TestBed.inject(DisplayWaitingGamesService);
        mousePlacementService = TestBed.inject(MousePlacementService);
        matDialog = TestBed.inject(MatDialog);
        consolePlacementService = TestBed.inject(ConsolePlacementService);
        service.socket = new SocketMock() as unknown as Socket;
        service.initializeHomeListeners();
        service.initializeAdminListeners();
        service.initSubscribes();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('disconnect should empty the socket id and call connectedServerObservable subscribe', () => {
        const connectedServerObservableSpy = spyOn(service.connectedServerObservable, 'next');
        service.socket.emit('disconnect');
        expect(service.id).toEqual('');
        expect(connectedServerObservableSpy).toHaveBeenCalled();
    });

    it('initializeAdminListeners should connect socket', () => {
        service.initializeAdminListeners();
        service.socket.emit('connect');
        expect(service.id).not.toEqual('');
    });

    it('areHomeSubscribesInitialized should return undefined if listeners are already initialized', () => {
        service.initializeHomeListeners();
        expect(service.initializeHomeListeners()).toBeUndefined();
    });

    it('initializeAdminListeners should return undefined if listeners are already initialized', () => {
        service.initializeAdminListeners();
        expect(service.initializeAdminListeners()).toBeUndefined();
    });

    /* **************************** DATABASE ****************************** */

    it('emit on errorMessage should be call .next of alertMessageObservable', () => {
        const alertMessageObservable = spyOn(service.alertMessageObservable, 'next');
        service.socket.emit('errorMessage', '');
        expect(alertMessageObservable).toHaveBeenCalled();
    });

    it('emit on nameList should be call .next of playerNameListObservable', () => {
        const playerNameListObservable = spyOn(service.playerNameListObservable, 'next');
        service.socket.emit('nameList', []);
        expect(playerNameListObservable).toHaveBeenCalled();
    });

    it('emit on deletedRoomDictionary should be call .next of roomEndedByDictionaryRemoval', () => {
        const roomEndedByDictionaryRemovalSpy = spyOn(service.roomEndedByDictionaryRemoval, 'next');
        service.socket.emit('deletedRoomDictionary');
        expect(roomEndedByDictionaryRemovalSpy).toHaveBeenCalled();
    });

    it('emit on scoreList should be call .next of playerNameListObservable', () => {
        const playerScoreListObservable = spyOn(service.playerScoreListObservable, 'next');
        service.socket.emit('scoreList', []);
        expect(playerScoreListObservable).toHaveBeenCalled();
    });

    it('updateScoreList should call emit with scoreListGameMode', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const gameMode = '';
        service.updateScoreList(gameMode);
        expect(socketEmit).toHaveBeenCalledWith('scoreListGameMode', gameMode);
    });

    it('updateNameList should call emit with playerList', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        service.updateNameList();
        expect(socketEmit).toHaveBeenCalledWith('playerList');
    });

    it('resetDataBase should call emit with resetData', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        service.resetDataBase();
        expect(socketEmit).toHaveBeenCalledWith('resetData');
    });

    it('sendScoreToAdd should call emit with sendScoreToAdd and a playerScore', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const playerScore = { name: '', score: 0, mode: '' };
        service.sendScoreToAdd(playerScore);
        expect(socketEmit).toHaveBeenCalledWith('sendScoreToAdd', playerScore);
    });

    it('sendPlayerToAdd should call emit with sendScoreToAdd and a playerName', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const playerName = { name: '', difficulty: '' };
        service.sendPlayerToAdd(playerName);
        expect(socketEmit).toHaveBeenCalledWith('sendPlayerToAdd', playerName);
    });

    it('sendPlayerToUpdate should call emit with sendPlayerToUpdate and a playerName and a new name', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const playerName = { name: '', difficulty: '' };
        const newName = '';
        service.sendPlayerToUpdate(playerName, newName);
        expect(socketEmit).toHaveBeenCalledWith('sendPlayerToUpdate', playerName, newName);
    });

    it('sendPlayerToRemove should call emit with sendPlayerToRemove and a playerName', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const playerName = { name: '', difficulty: '' };
        service.sendPlayerToRemove(playerName);
        expect(socketEmit).toHaveBeenCalledWith('sendPlayerToRemove', playerName);
    });

    /* ***************************** DICTIONARY ***************************** */
    it('emit on updateClientDictionary should be called .next of updateDictionariesObservable', () => {
        const updateDictionariesObservableSpy = spyOn(service.updateDictionariesObservable, 'next');
        service.socket.emit('updateClientDictionary', [{ title: '', description: '' }]);
        expect(updateDictionariesObservableSpy).toHaveBeenCalled();
    });

    it('emit on receiveDictionary should be call .next of dictionaryDownloadObservable', () => {
        service.initializeAdminListeners();
        const dictionaryDownloadObservableSpy = spyOn(service.dictionaryDownloadObservable, 'next');
        service.socket.emit('receiveDictionary', { title: '', description: '', words: [] });
        expect(dictionaryDownloadObservableSpy).toHaveBeenCalled();
    });

    it('emit on sendDictionaryToClient should call .next of dictionaryImportObservable', () => {
        const dictionaryImportObservableSpy = spyOn(service.dictionaryImportObservable, 'next');
        service.socket.emit('sendDictionaryToClient', { title: '', description: '', words: [] });
        expect(dictionaryImportObservableSpy).toHaveBeenCalled();
    });

    it('sendDictionaryToServer should call emit with sendDictionaryToServer', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const dictionary = { title: '', description: '', words: [] };
        service.sendDictionaryToServer(dictionary);
        expect(socketEmit).toHaveBeenCalledWith('sendDictionaryToServer', dictionary);
    });

    it('updateDictionaryList should call emit with updateDictionaryList', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        service.updateDictionaryList();
        expect(socketEmit).toHaveBeenCalledWith('updateDictionaryList');
    });

    it('removeDictionary should call emit with removeDictionary and a title', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const tmp = '';
        service.removeDictionary(tmp);
        expect(socketEmit).toHaveBeenCalledWith('removeDictionary', tmp);
    });

    it('removeDictionary should call emit with editDictionary and previous', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const previousDetails = { title: 'a', description: '' };
        const newDetails = { title: 'b', description: '' };
        service.editDictionary(previousDetails, newDetails);
        expect(socketEmit).toHaveBeenCalledWith('editDictionary', previousDetails, newDetails);
    });

    it('downloadDictionary should call emit with removeDictionary and a title', () => {
        const socketEmit = spyOn(service.socket, 'emit');
        const tmp = '';
        service.downloadDictionary(tmp);
        expect(socketEmit).toHaveBeenCalledWith('downloadDictionary', tmp);
    });

    it('getDictionaryForClient should call emit with getDictionaryForClient and the dictionary name', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        const socketEmit = spyOn(service.socket, 'emit');
        service.getDictionaryForClient();
        expect(socketEmit).toHaveBeenCalledWith('getDictionaryForClient', dictionaryService.dictionaryName);
    });
    it('sendChatMessageSpy should connect to input chat box', () => {
        const msg = 'Ready to send message to input chat box';
        const sendChatMessageSpy = spyOn(service, 'sendChatMessage');
        inputChatService.messageObservable.next(msg);
        expect(sendChatMessageSpy).toHaveBeenCalledWith(msg);
    });
    it('placeLetterSpy should be updated', () => {
        const placeLetterSpy = spyOn(service, 'placeLetter');
        const fakePlacement: Placement = { axis: 0, letters: [] };
        const fakePlayerLetterRack: Tile[] = [];
        fakePlayerLetterRack.push({ letter: 'b', score: 20 });
        const msg = 'makeItUntilMakeIt';
        const array: [Placement, Tile[], string] = [fakePlacement, fakePlayerLetterRack, msg];
        consolePlacementService.lettersToPlaceObservable.next(array);
        service.placeLetter(array[0], array[1], array[2]);
        expect(placeLetterSpy).toHaveBeenCalled();
    });
    it('mousePlacementServiceSpy should connect to input chat box', () => {
        const mousePlacementServiceSpy = spyOn(service, 'placeLetter');
        const fakePlacement: Placement = { axis: 0, letters: [] };
        const fakePlayerLetterRack: Tile[] = [];
        fakePlayerLetterRack.push({ letter: 'b', score: 20 });
        const msg = 'makeItUntilMakeIt';
        const array: [Placement, Tile[], string] = [fakePlacement, fakePlayerLetterRack, msg];
        mousePlacementService.lettersToPlaceObservable.next(array);
        service.placeLetter(array[0], array[1], array[2]);
        expect(mousePlacementServiceSpy).toHaveBeenCalled();
    });
    it('exchangeLettersUsingInputChatSpy should connect to exchange letters method by using input chat', () => {
        const LETTER = 'a';
        spyOn(service, 'exchangeLettersUsingInputChat');
        inputChatService.lettersToExchangeObservable.next(LETTER);
        expect(service.exchangeLettersUsingInputChat).toHaveBeenCalledWith(LETTER);
    });
    it('skipTurnSpy should connect to skip turn', () => {
        spyOn(service, 'skipTurn');
        inputChatService.skipTurnMultiObservable.next();
        expect(service.skipTurn).toHaveBeenCalledWith();
    });
    it('sendReserveSpy should connect to sendReserve', () => {
        spyOn(service, 'sendReserve');
        inputChatService.sendReserveObservable.next();
        expect(service.sendReserve).toHaveBeenCalledWith();
    });
    it('should connect socket', () => {
        service.socket.emit('connect', service.socket.id);
        expect(service.id).toEqual(service.socket.id);
    });
    it('obtainTimeSpy should reset the timer', () => {
        const obtainTimeSpy = spyOn(turnHandlerService, 'obtainTime');
        service.socket.emit('resetTimer', { minute: 1, second: 0 });
        expect(obtainTimeSpy).toHaveBeenCalledWith({ minute: 1, second: 0 });
    });
    it('clearTimerSpy should clear the timer', () => {
        const clearTimerSpy = spyOn(turnHandlerService, 'clearTimer');
        service.socket.emit('clearTimer', { minute: 0, second: 0 });
        expect(clearTimerSpy).toHaveBeenCalledWith();
    });
    it('updateMyTurnToPlaySpy should update my turn to play', () => {
        let isMyTurn = false;
        selectGameModeService.onlinePlayerTurnObservable.subscribe((value) => {
            isMyTurn = value;
        });
        service.socket.id = 'abc';
        service.socket.emit('updateIsMyTurnToPlay', 'abc');
        expect(isMyTurn).toBeTrue();
    });

    it('updateReserveSizeSpy should update the reserve size', () => {
        let reserveSize = 0;
        service.updateReserveTotalSizeObservable.subscribe((value) => {
            reserveSize = value;
        });
        service.socket.emit('hereIsTheReserveSize', 2);
        expect(reserveSize).toEqual(2);
    });
    it('updateLetterRackSpy should update the letter rack', () => {
        let letterRackReceived: Tile[] = [];
        playerSettingsService.lettersChange.subscribe((value) => {
            letterRackReceived = value;
        });
        const fakeLetterRack: Tile[] = [];
        fakeLetterRack.push({ letter: 'b', score: 20 });
        service.socket.emit('hereIsYourLetterRack', fakeLetterRack);
        expect(playerSettingsService.letters).toEqual(fakeLetterRack);
        expect(letterRackReceived).toEqual(fakeLetterRack);
    });
    it('updatePlayerScoreSpy should update the player score', () => {
        const fakePlayerScore = 20;
        const fakePlayerSocketID = service.socket.id;
        const updateLetterRackSpy = spyOn(service, 'updatePlayerScore');
        service.socket.emit('hereIsAPlayerScore', fakePlayerScore, fakePlayerSocketID);
        expect(updateLetterRackSpy).toHaveBeenCalledWith(fakePlayerScore, fakePlayerSocketID);
    });

    it('updatePlayerScoreSpy should update the player score', () => {
        const fakePlayerScore = 20;
        const fakePlayerSocketID = service.socket.id;
        const updateLetterRackSpy = spyOn(service, 'updatePlayerRackSize');
        service.socket.emit('hereIsLetterRackSize', fakePlayerScore, fakePlayerSocketID);
        expect(updateLetterRackSpy).toHaveBeenCalledWith(fakePlayerScore, fakePlayerSocketID);
    });

    it('updateBoardGameSpy should update the board game', () => {
        const boardGameUpdatedObservableSpy = spyOn(playAreaService.boardGameUpdatedObservable, 'next');
        const boardGame: Square[][] = [[]];
        const temp: Square[] = [];
        temp.push({ backgroundColor: '', letter: '', text: '', bonusType: 0 });
        boardGame.push(temp);
        service.socket.emit('hereIsTheBoardUpdated', boardGame);
        expect(boardGameUpdatedObservableSpy).toHaveBeenCalled();
        expect(playAreaService.boardGame).toEqual(boardGame);
    });
    it('closeAllSpy should be updated from launchGame socket', () => {
        const closeAllSpy = spyOn(matDialog, 'closeAll');
        service.socket.emit('launchGame', '');
        expect(closeAllSpy).toHaveBeenCalledWith();
    });
    it('addMessageListSpy should be updated from hereIsTheReserve', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        const reserve = '[["A",{"tile":{"letter":"A","score":1},"quantity":9}]]';
        service.socket.emit('hereIsTheReserve', reserve);
        expect(addMessageListSpy).toHaveBeenCalled();
    });

    it('hereAreTheObjectives signal should send objectives to subscribers', () => {
        let privateMapReceived: Map<number, Objective> = new Map();
        playerSettingsService.privatePlayerObjectiveObservable.subscribe((value) => {
            privateMapReceived = value;
        });
        let publicMapReceived: Map<number, Objective> = new Map();
        playerSettingsService.publicObjectivesObservable.subscribe((value) => {
            publicMapReceived = value;
        });

        const privateMapString =
            '[[8,{"description":"Créer un mot qui rapporte plus de 8 points pendant 3 tours consécutifs","score":30,"fullfilled":false}]]';
        const publicMapString = '[[3,{"description":"Former trois mots avec un placement de lettres","score":20,"fullfilled":false}]]';
        const expectedPrivateObjectiveMap: Map<number, Objective> = JSON.parse(privateMapString);
        const expectedPublicObjectivesMap: Map<number, Objective> = JSON.parse(publicMapString);
        service.socket.emit('hereAreTheObjectives', privateMapString, publicMapString);
        expect(privateMapReceived).toEqual(expectedPrivateObjectiveMap);
        expect(publicMapReceived).toEqual(expectedPublicObjectivesMap);
    });

    it('objectiveCompleted signal should call addMessageList with the right parameters', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        const message = 'objective réussi, félicitations!';
        service.socket.emit('objectiveCompleted', message);
        expect(addMessageListSpy).toHaveBeenCalledOnceWith('system', message);
    });

    it('hereAreTheWaitingGames signal should call addCreatedGame if player is in LOG2990 mode', () => {
        selectGameModeService.isLOG2990ModeChosen = true;
        const addCreatedGameSpy = spyOn(displayWaitingGamesService, 'addCreatedGame');
        service.socket.emit('hereAreTheWaitingGames', [], true);
        expect(addCreatedGameSpy).toHaveBeenCalled();
    });
    it('closeAllSpy should be updated from cannotJoinGame socket', () => {
        const closeAllSpy = spyOn(matDialog, 'closeAll');
        service.socket.emit('cannotJoinGame', '');
        expect(closeAllSpy).toHaveBeenCalledWith();
    });
    it('callSelectNameObservableSpy should be updated', () => {
        const callSelectNameObservableSpy = spyOn(service.callSelectNameObservable, 'next');
        const fakeBothPlayerNames: string[] = [];
        service.socket.emit('sendBothPlayerNames', fakeBothPlayerNames);
        expect(callSelectNameObservableSpy).toHaveBeenCalledWith(false);
    });
    it('addMessageListSpy should add message to a message list from addMessageList socket', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.socket.emit('hereIsANewMessage', 'Welcome back master', 'cryptoMaster');
        expect(addMessageListSpy).toHaveBeenCalled();
    });
    it('addMessageListSpy should add message to a message list from LettersToExchangeNotPossible socket', () => {
        const addMessageListSpy = spyOn(displayMessageService, 'addMessageList');
        service.socket.emit('LettersToExchangeNotPossible', 'system', 'cryptoMaster');
        expect(addMessageListSpy).toHaveBeenCalled();
    });
    it('mousePlacementServiceSpy should cancel the placement request', () => {
        const mousePlacementServiceSpy = spyOn(mousePlacementService, 'cancelPlacement');
        service.socket.emit('cancelPlacement');
        expect(mousePlacementServiceSpy).toHaveBeenCalled();
    });

    it('isOnlinePlayerTurn should return false for isOnlinePlayerTurn', () => {
        service.socket.emit('preventPlayerFromPlaying', service);
        expect(selectGameModeService.isOnlinePlayerTurn).toBe(false);
    });

    it('isOnlinePlayerTurn should return true for isOnlinePlayerTurn', () => {
        service.socket.emit('allowPlayerToPlay', service);
        expect(selectGameModeService.isOnlinePlayerTurn).toBe(true);
    });
    it('endGameObservableSpy should be updated', () => {
        const endGameObservableSpy = spyOn(selectGameModeService.endGameObservable, 'next');
        service.socket.emit('endGame', 'cryptoMaster');
        expect(endGameObservableSpy).toHaveBeenCalled();
    });
    it('createRoomSpy should send data', () => {
        const createRoomSpy = spyOn(service.socket, 'emit');
        const game: WaitingGame = {
            playerName: service.player.name,
            timer: { minute: 1, second: 0 },
            dictionary: { title: 'Français', description: '' },
            bonus: true,
            socketId: '',
            isLog2990ModeChosen: false,
        };
        service.createRoom(game);
        expect(createRoomSpy).toHaveBeenCalledWith('createRoom', game);
    });
    it('joinRoomSpy should send data', () => {
        const joinRoomSpy = spyOn(service.socket, 'emit');
        service.joinRoom(service.socket.id, service.player.name);
        expect(joinRoomSpy).toHaveBeenCalledWith('joinRoom', service.socket.id, service.player.name);
    });
    it('sendReserveSpy should send data', () => {
        const sendReserveSpy = spyOn(service.socket, 'emit');
        service.sendReserve();
        expect(sendReserveSpy).toHaveBeenCalledWith('sendReserve');
    });
    it('placeLetterSpy should send data', () => {
        const placeLetterSpy = spyOn(service.socket, 'emit');
        const fakePlacement: Placement = { axis: 0, letters: [] };
        const fakePlayerLetterRack: Tile[] = [];
        service.placeLetter(fakePlacement, fakePlayerLetterRack, 'makeItUntilMakeIt');
        expect(placeLetterSpy).toHaveBeenCalledWith('LettersToPlace', fakePlacement, fakePlayerLetterRack, 'makeItUntilMakeIt');
    });
    it('exchangeLettersUsingInputChatSpy should send data', () => {
        const exchangeLettersUsingInputChatSpy = spyOn(service.socket, 'emit');
        const msg = 'exchanging letter using a input chat';
        service.exchangeLettersUsingInputChat(msg);
        expect(exchangeLettersUsingInputChatSpy).toHaveBeenCalledWith('LettersToExchangeUsingInputChat', msg);
    });
    it('exchangeLettersUsingMouseSelectionSpy should send data', () => {
        const exchangeLettersUsingMouseSelectionSpy = spyOn(service.socket, 'emit');
        const msg = 'exchanging letter using a mouse selection';
        service.exchangeLettersUsingMouseSelection(msg);
        expect(exchangeLettersUsingMouseSelectionSpy).toHaveBeenCalledWith('LettersToExchangeUsingMouseSelection', msg);
    });
    it('skipTurnSpy should send data', () => {
        const skipTurnSpy = spyOn(service.socket, 'emit');
        service.skipTurn();
        expect(skipTurnSpy).toHaveBeenCalledWith('PasserTourMulti');
    });
    it('leaveGameSpy should send data', () => {
        const leaveGameSpy = spyOn(service.socket, 'emit');
        service.leaveGame();
        expect(leaveGameSpy).toHaveBeenCalledWith('leaveGame');
    });
    it('endRoomSpy should send data', () => {
        const endRoomSpy = spyOn(service.socket, 'emit');
        service.endRoom();
        expect(endRoomSpy).toHaveBeenCalledWith('endRoom');
    });
    it('sendCreatedGameSpy should send data', () => {
        const sendCreatedGameSpy = spyOn(service.socket, 'emit');
        let game: WaitingGame = {
            playerName: '',
            timer: { minute: 0, second: 0 },
            dictionary: { title: 'Français', description: '' },
            bonus: true,
            socketId: '',
            isLog2990ModeChosen: false,
        };
        game = {
            playerName: 'cryptoMaster',
            timer: { minute: 1, second: 0 },
            dictionary: { title: 'English', description: '' },
            bonus: false,
            socketId: service.socket.id,
            isLog2990ModeChosen: false,
        };
        service.sendCreatedGame(game);
        expect(sendCreatedGameSpy).toHaveBeenCalledWith('addWaitingGame', game);
    });
    it('getWaitingGamesSpy should send data', () => {
        selectGameModeService.isLOG2990ModeChosen = true;
        const getWaitingGamesSpy = spyOn(service.socket, 'emit');
        service.getWaitingGames();
        expect(getWaitingGamesSpy).toHaveBeenCalledWith('sendWaitingGames', true);
    });
    it('sendChatMessageSpy should send data', () => {
        const sendChatMessageSpy = spyOn(service.socket, 'emit');
        const msg = 'sending this message';
        service.player.name = 'cryptoMaster';
        service.sendChatMessage(msg);
        expect(sendChatMessageSpy).toHaveBeenCalledWith('newMessageToShare', msg, service.player.name);
    });
    it('getLetterQuantityMulti should return quantity of letter in reserve', () => {
        const fakeReserve: Map<string, Reserve> = new Map<string, Reserve>();
        fakeReserve.set('a', { tile: { letter: 'a', score: 20 }, quantity: 2 });
        const valid = service.getLetterQuantityMulti('a', fakeReserve);
        expect(valid).toEqual(2);
    });
    it('getLetterQuantityMulti should return undefined for quantity of letter in reserve', () => {
        const fakeReserve: Map<string, Reserve> = new Map<string, Reserve>();
        fakeReserve.set('a', { tile: { letter: 'a', score: 20 }, quantity: 2 });
        const invalid = service.getLetterQuantityMulti('b', fakeReserve);
        expect(invalid).toEqual(undefined);
    });
    it('playerScoreObservable should be updated', () => {
        const playerScoreObservableSpy = spyOn(service.playerScoreObservable, 'next');
        const size = 15;
        service.updatePlayerScore(size, service.socket.id);
        expect(playerScoreObservableSpy).toHaveBeenCalled();
    });
    it('opponentScoreObservable should be updated', () => {
        const opponentScoreObservableSpy = spyOn(service.opponentScoreObservable, 'next');
        const size = 5;
        service.updatePlayerScore(size, 'abc');
        expect(opponentScoreObservableSpy).toHaveBeenCalled();
    });

    it('playerRackSizeObservable should be updated', () => {
        const playerScoreObservableSpy = spyOn(service.playerRackSizeObservable, 'next');
        const size = 15;
        service.updatePlayerRackSize(size, service.socket.id);
        expect(playerScoreObservableSpy).toHaveBeenCalled();
    });

    it('opponentScoreObservable should be updated', () => {
        const opponentScoreObservableSpy = spyOn(service.opponentRackSizeObservable, 'next');
        const size = 5;
        service.updatePlayerRackSize(size, 'abc');
        expect(opponentScoreObservableSpy).toHaveBeenCalled();
    });

    it('multiToSoloObservable next should be called on otherPlayerLeft', () => {
        const multiToSoloObservableSpy = spyOn(service.multiToSoloObservable, 'next');
        service.socket.emit('otherPlayerLeft', 2);
        expect(multiToSoloObservableSpy).toHaveBeenCalled();
    });
});
