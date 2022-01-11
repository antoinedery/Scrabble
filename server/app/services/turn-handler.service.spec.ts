// Disable de lint autorisé par chargés
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import { Time } from '@app/classes/interfaces/game-parameters';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { Tile } from '@app/classes/interfaces/tile';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';
import { RoomDataService } from './room-data.service';
import { ScoreDatabaseService } from './score-database.service';

describe('TurnHandlerService', () => {
    let service: TurnHandlerService;
    let roomDataService: RoomDataService;
    let letterReserveService: LetterReserveService;
    let scoreDatabaseService: ScoreDatabaseService;
    let mongoServer: MongoMemoryServer;
    let inMemoryServerUrl: string;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        inMemoryServerUrl = mongoServer.getUri('database');
        scoreDatabaseService = new ScoreDatabaseService(inMemoryServerUrl);

        service = Container.get(TurnHandlerService);
        roomDataService = Container.get(RoomDataService);
        letterReserveService = Container.get(LetterReserveService);
        service['scoreDatabaseService'] = scoreDatabaseService;

        // This is to give time to the connection to be established since constructors can't be async
        await new Promise<void>((resolve) => {
            resolve();
        });
    });
    afterEach(async () => {
        Sinon.restore();
        await mongoServer.stop();
        await scoreDatabaseService.closeConnection();
    });

    it('initTimer should assign attributes sio and activePlayerName, and call function obtainTime()', () => {
        const startingPlayerName = 'John';
        const spy = Sinon.spy(service, 'obtainTime');
        roomDataService.timer = { minute: 2, second: 30 };
        const expectedParameter = { minute: 2, second: 30 };
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.initTimer(serverStub as unknown as SocketIO.Server, startingPlayerName);
        expect(service.sio).to.equal(serverStub);
        expect(service.activePlayerName).to.equal(startingPlayerName);
        expect(spy.calledOnceWith(expectedParameter)).to.equal(true);
        spy.restore();
    });

    it('obtainTime should assign attribute timeValue, and call function resetTimer()', () => {
        const spy = Sinon.spy(service, 'resetTimer');
        const timer = { minute: 2, second: 30 };
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.obtainTime(timer);
        expect(service.timeValue).to.deep.equal(timer);
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('endTurn should call endGame() if endGameVerify() is true', () => {
        const spy1 = Sinon.stub(service, 'endGameVerify').returns(true);
        const spy2 = Sinon.spy(service, 'endGame');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.endTurn();
        expect(spy2.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('endTurn should call switchTurn() and resetTimer() if endGameVerify() is false', () => {
        const spy1 = Sinon.stub(service, 'endGameVerify').returns(false);
        const spy2 = Sinon.spy(service, 'switchTurn');
        const spy3 = Sinon.spy(service, 'resetTimer');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.endTurn();
        expect(spy2.calledOnce).to.equal(true);
        expect(spy3.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it("switchTurn should set guest player's turn to play if it was game creator's turn and emit a signal with the right parameters", () => {
        roomDataService.roomID = 'room1';
        roomDataService.gameCreator.isMyTurn = true;
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.gameCreator.socketID = '123';
        roomDataService.guestPlayer.isMyTurn = false;
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.guestPlayer.socketID = '456';
        const socketToPlay = '456';
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');
        service.switchTurn();
        expect(roomDataService.gameCreator.isMyTurn).to.equal(false);
        expect(roomDataService.guestPlayer.isMyTurn).to.equal(true);
        expect(service.activePlayerName).to.equal('Paul');
        expect(spy1.calledOnceWith('room1')).to.equal(true);
        expect(spy2.calledOnceWith('updateIsMyTurnToPlay', socketToPlay)).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it("switchTurn should set game creator's turn to play if it was guest player's turn and emit a signal with the right parameters", () => {
        roomDataService.roomID = 'room1';
        roomDataService.gameCreator.isMyTurn = false;
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.gameCreator.socketID = '123';
        roomDataService.guestPlayer.isMyTurn = true;
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.guestPlayer.socketID = '456';
        const socketToPlay = '123';
        const emitObject = {
            emit: (eventName: string, args: string) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');
        service.switchTurn();
        expect(roomDataService.gameCreator.isMyTurn).to.equal(true);
        expect(roomDataService.guestPlayer.isMyTurn).to.equal(false);
        expect(service.activePlayerName).to.equal('John');
        expect(spy1.calledOnceWith('room1')).to.equal(true);
        expect(spy2.calledOnceWith('updateIsMyTurnToPlay', socketToPlay)).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('resetTimer should call startTimer() and emit a signal with the right parameters', () => {
        const timer: Time = { minute: 2, second: 30 };
        roomDataService.roomID = 'room1';
        roomDataService.timer = timer;
        service.timeValue = timer;
        const spy1 = Sinon.spy(service, 'startTimer');
        const emitObject = {
            emit: (eventName: string, args: Time) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy2 = Sinon.spy(serverStub, 'to');
        const spy3 = Sinon.spy(emitObject, 'emit');
        service.resetTimer();
        expect(spy1.calledOnceWith(timer.minute, timer.second)).to.equal(true);
        expect(spy2.calledOnceWith('room1')).to.equal(true);
        expect(spy3.calledOnceWith('resetTimer', timer)).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it('clearTimer should call clearTimerInterval() and set counters values to 0', () => {
        const expectedCounter: Time = { minute: 0, second: 0 };
        const spy = Sinon.spy(service, 'clearTimerInterval');
        service.clearTimer();
        expect(service.counter).to.deep.equal(expectedCounter);
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('startTimer should call clearTimerInterval() and set counters values to the passed parameters', () => {
        const minute = 1;
        const seconds = 30;
        const expectedCounter: Time = { minute: 1, second: 30 };
        const spy = Sinon.spy(service, 'clearTimerInterval');
        service.startTimer(minute, seconds);
        expect(service.counter).to.deep.equal(expectedCounter);
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('startTimer should reduce minutes by 1 and reset seconds to 59', () => {
        const WAITING_TIME = 1001;
        const counterParameter: Time = { minute: 1, second: 0 };
        const expectedCounter: Time = { minute: 0, second: 59 };
        const clock = Sinon.useFakeTimers();
        service.startTimer(counterParameter.minute, counterParameter.second);
        clock.tick(WAITING_TIME);
        expect(service.counter).to.deep.equal(expectedCounter);
        clock.restore();
    });

    it('startTimer should reduce seconds by 1', () => {
        const WAITING_TIME = 1001;
        const counterParameter: Time = { minute: 1, second: 30 };
        const expectedCounter: Time = { minute: 1, second: 29 };
        const clock = Sinon.useFakeTimers();
        service.startTimer(counterParameter.minute, counterParameter.second);
        clock.tick(WAITING_TIME);
        expect(service.counter).to.deep.equal(expectedCounter);
        clock.restore();
    });

    it('startTimer should call clearTimerInterval() and incrementTurnsPassed(), and emit 2 signals', () => {
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
        service.sio = serverStub as unknown as SocketIO.Server;
        const roomID = 'room1';
        const gameHostName = 'John';
        const guestPlayerName = 'Paul';
        const gameHostSocketID = '123';
        const guestPlayerSocketID = '456';
        roomDataService.roomID = roomID;
        roomDataService.gameCreator.playerName = gameHostName;
        roomDataService.guestPlayer.playerName = guestPlayerName;
        roomDataService.gameCreator.socketID = gameHostSocketID;
        roomDataService.guestPlayer.socketID = guestPlayerSocketID;
        service.activePlayerName = gameHostName;

        const spy1 = Sinon.spy(service, 'clearTimerInterval');
        const spy2 = Sinon.spy(service, 'incrementTurnsPassed');
        const spy3 = Sinon.spy(serverStub, 'to');
        const spy4 = Sinon.spy(emitObject, 'emit');

        const clock = Sinon.useFakeTimers();
        const WAITING_TIME = 1001;
        const counterParameter: Time = { minute: 0, second: 1 };

        service.startTimer(counterParameter.minute, counterParameter.second);

        clock.tick(WAITING_TIME);
        expect(spy1.called).to.equal(true);
        expect(spy2.calledOnce).to.equal(true);
        expect(spy3.calledWith(roomID)).to.equal(true);
        expect(spy4.calledWith('hereIsANewMessage', 'Passer son tour', gameHostName)).to.equal(true);
        expect(spy3.calledWith(gameHostSocketID)).to.equal(true);
        expect(spy4.calledWith('cancelPlacement')).to.equal(true);

        clock.restore();
        spy1.restore();
        spy2.restore();
    });

    it('getActivePlayerSocketID should return game creator socketID if it is the active player', () => {
        service.activePlayerName = 'John';
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.gameCreator.socketID = '123';
        roomDataService.guestPlayer.socketID = '456';
        const activePlayerSocketID = '123';
        expect(service.getActivePlayerSocketID()).to.equal(activePlayerSocketID);
    });

    it('getActivePlayerSocketID should return guest player socketID if it is the active player', () => {
        service.activePlayerName = 'Paul';
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.gameCreator.socketID = '123';
        roomDataService.guestPlayer.socketID = '456';
        const activePlayerSocketID = '456';
        expect(service.getActivePlayerSocketID()).to.equal(activePlayerSocketID);
    });

    it('displayEndGameStatistics should emit signals to players with their letter rack letters, their scores and the winner name', () => {
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.roomID = 'room1';

        const gameCreatorPlayerRack: Tile[] = [];
        gameCreatorPlayerRack.push({ letter: 'A', score: 1 });
        gameCreatorPlayerRack.push({ letter: 'B', score: 2 });
        gameCreatorPlayerRack.push({ letter: 'C', score: 3 });
        roomDataService.gameCreator.letterRack = gameCreatorPlayerRack;

        const guestPlayerRack: Tile[] = [];
        guestPlayerRack.push({ letter: 'D', score: 4 });
        guestPlayerRack.push({ letter: 'E', score: 5 });
        guestPlayerRack.push({ letter: 'F', score: 6 });
        roomDataService.guestPlayer.letterRack = guestPlayerRack;

        const gameCreatorScore = 20;
        const guestPlayerScore = 30;
        roomDataService.gameCreator.playerScore = gameCreatorScore;
        roomDataService.guestPlayer.playerScore = guestPlayerScore;
        const gameCreatorSocketID = '123';
        const guestPlayerSocketID = '456';
        roomDataService.gameCreator.socketID = gameCreatorSocketID;
        roomDataService.guestPlayer.socketID = guestPlayerSocketID;

        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy1 = Sinon.spy(serverStub, 'to');
        const spy2 = Sinon.spy(emitObject, 'emit');

        const gameCreatorRemainingLetters = 'abc';
        const guestPlayerRemainingLetters = 'def';
        const winner = 'John';
        service.winnerPlayerName = winner;

        service.displayEndGameStatistics();

        expect(spy1.calledWith('room1')).to.equal(true);
        expect(spy2.calledWith('hereIsANewMessage', 'Fin de partie - Lettres restantes', 'system')).to.equal(true);
        expect(spy2.calledWith('hereIsANewMessage', 'John : ' + gameCreatorRemainingLetters, 'system')).to.equal(true);
        expect(spy2.calledWith('hereIsANewMessage', 'Paul : ' + guestPlayerRemainingLetters, 'system')).to.equal(true);
        expect(spy2.calledWith('hereIsAPlayerScore', gameCreatorScore, gameCreatorSocketID)).to.equal(true);
        expect(spy2.calledWith('hereIsAPlayerScore', guestPlayerScore, guestPlayerSocketID)).to.equal(true);
        expect(spy2.calledWith('endGame', winner)).to.equal(true);
        spy1.restore();
        spy2.restore();
    });

    it('endGameScoreBonus should add points to the game creator score', () => {
        service.totalLetterScore = 0;
        roomDataService.gameCreator.playerScore = 0;
        roomDataService.gameCreator.letterRack = [];
        roomDataService.gameCreator.letterRack = letterReserveService.assignLettersToPlayer();
        roomDataService.guestPlayer.letterRack = [];
        roomDataService.guestPlayer.letterRack = letterReserveService.assignLettersToPlayer();
        roomDataService.gameCreator.letterRack.length = 0;
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 2 });
        lettersOnRack.push({ letter: 'C', score: 3 });

        roomDataService.guestPlayer.letterRack = lettersOnRack;
        service.endGameScoreBonus();
        const expectedScore = 6;
        expect(roomDataService.gameCreator.playerScore).to.equal(expectedScore);
        expect(service.totalLetterScore).to.equal(expectedScore);
    });

    it('endGameScoreBonus should add points to the guest player score', () => {
        roomDataService.gameCreator.playerScore = 0;
        roomDataService.guestPlayer.playerScore = 0;
        service.totalLetterScore = 0;
        roomDataService.gameCreator.letterRack = letterReserveService.assignLettersToPlayer();
        roomDataService.guestPlayer.letterRack = letterReserveService.assignLettersToPlayer();
        roomDataService.guestPlayer.letterRack.length = 0;
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 2 });
        lettersOnRack.push({ letter: 'C', score: 3 });

        roomDataService.gameCreator.letterRack = lettersOnRack;
        service.endGameScoreBonus();
        const expectedScore = 6;
        expect(roomDataService.guestPlayer.playerScore).to.equal(expectedScore);
        expect(service.totalLetterScore).to.equal(expectedScore);
    });

    it("endGameScoreBonus should substract points from both players' scores", () => {
        service.totalLetterScore = 0;
        roomDataService.gameCreator.playerScore = 50;
        roomDataService.guestPlayer.playerScore = 50;
        roomDataService.gameCreator.letterRack = letterReserveService.assignLettersToPlayer();
        roomDataService.guestPlayer.letterRack = letterReserveService.assignLettersToPlayer();
        const gameCreatorPlayerRack: Tile[] = [];
        gameCreatorPlayerRack.push({ letter: 'A', score: 1 });
        gameCreatorPlayerRack.push({ letter: 'B', score: 2 });
        gameCreatorPlayerRack.push({ letter: 'C', score: 3 });
        roomDataService.gameCreator.letterRack = gameCreatorPlayerRack;

        const guestPlayerRack: Tile[] = [];
        guestPlayerRack.push({ letter: 'D', score: 4 });
        guestPlayerRack.push({ letter: 'E', score: 5 });
        guestPlayerRack.push({ letter: 'F', score: 6 });
        roomDataService.guestPlayer.letterRack = guestPlayerRack;

        service.endGameScoreBonus();
        const expectedGameCreatorScore = 44;
        const expectedGuestPlayerScore = 35;
        expect(roomDataService.gameCreator.playerScore).to.equal(expectedGameCreatorScore);
        expect(roomDataService.guestPlayer.playerScore).to.equal(expectedGuestPlayerScore);
    });

    it('endGameScoreBonus should call adjustScore()', () => {
        roomDataService.gameCreator.letterRack = [];
        roomDataService.guestPlayer.letterRack = [];
        const spy = Sinon.spy(service, 'adjustScore');
        service.endGameScoreBonus();
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('send Score should send PlayerScore if in Log2990 mode', async () => {
        const player: PlayerScore = {
            name: 'Antoine',
            score: 6,
            mode: 'Log2990',
        };
        const guestPlayer: PlayerScore = {
            name: 'Alex',
            score: 11,
            mode: 'Log2990',
        };
        const playerClassic: PlayerScore = {
            name: 'Antoine',
            score: 6,
            mode: 'Classic',
        };
        const guestPlayerClassic: PlayerScore = {
            name: 'Alex',
            score: 11,
            mode: 'Classic',
        };

        roomDataService.gameCreator.playerName = player.name;
        roomDataService.gameCreator.playerScore = player.score;

        roomDataService.guestPlayer.playerName = guestPlayer.name;
        roomDataService.guestPlayer.playerScore = guestPlayer.score;
        roomDataService.isLog2990ModeChosen = true;
        const spy = Sinon.stub(scoreDatabaseService, 'insertDB').returns(Promise.resolve(true));
        await service.sendScore();
        expect(spy.calledWith(player)).to.equal(true);
        expect(spy.calledWith(guestPlayer)).to.equal(true);
        roomDataService.isLog2990ModeChosen = false;
        await service.sendScore();
        expect(spy.calledWith(playerClassic)).to.equal(true);
        expect(spy.calledWith(guestPlayerClassic)).to.equal(true);
        spy.restore();
    });

    it('send Score should send error if not connected to DB if LOG2990 mode is chosen', async () => {
        roomDataService.isLog2990ModeChosen = true;
        service.insertConnected = false;
        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
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
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy = Sinon.stub(scoreDatabaseService, 'insertDB').returns(Promise.resolve(false));
        const spy2 = Sinon.spy(emitObject, 'emit');
        await service.sendScore();

        expect(spy2.calledWith('errorMessage', "Echec d'insertion du score")).to.equal(true);
        spy.restore();
        spy2.restore();
    });

    it('send Score should send error if not connected to DB and if Classic mode is chosen', async () => {
        roomDataService.isLog2990ModeChosen = false;
        service.insertConnected = false;
        const emitObject = {
            emit: (eventName: string, ...args: unknown[]) => {
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
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        const spy = Sinon.stub(scoreDatabaseService, 'insertDB').returns(Promise.resolve(false));
        const spy2 = Sinon.spy(emitObject, 'emit');
        await service.sendScore();

        expect(spy2.calledWith('errorMessage', "Echec d'insertion du score")).to.equal(true);
        spy.restore();
        spy2.restore();
    });

    it('adjustScore should adjust both players score to 0 if it is inferior to 0', () => {
        roomDataService.gameCreator.playerScore = -2;
        roomDataService.guestPlayer.playerScore = -5;
        service.adjustScore();
        expect(roomDataService.gameCreator.playerScore).to.equal(0);
        expect(roomDataService.guestPlayer.playerScore).to.equal(0);
    });

    it('endGame should call functions endGameScoreBonus(), findWinnerPlayer(), sendScore() and displayEndGameStatistics()', () => {
        const spy1 = Sinon.spy(service, 'endGameScoreBonus');
        const spy2 = Sinon.spy(service, 'findWinnerPlayer');
        const spy3 = Sinon.spy(service, 'displayEndGameStatistics');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.endGame();
        expect(spy1.calledOnce).to.equal(true);
        expect(spy2.calledOnce).to.equal(true);
        expect(spy3.calledOnce).to.equal(true);
        spy1.restore();
        spy2.restore();
        spy3.restore();
    });

    it('incrementTurnsPassed should increment turnsPassedCounter and call function endTurn()', () => {
        service.turnsPassedCounter = 0;
        const spy = Sinon.spy(service, 'endTurn');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.incrementTurnsPassed();
        expect(service.turnsPassedCounter).to.equal(1);
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('resetTurnsPassed should reset turnsPassedCounter and call function endTurn()', () => {
        service.turnsPassedCounter = 3;
        const spy = Sinon.spy(service, 'endTurn');
        const emitObject = {
            emit: (eventName: string, args: unknown[]) => {
                return eventName;
            },
        };
        const serverStub = {
            to: (roomID: string) => {
                return emitObject;
            },
        };
        service.sio = serverStub as unknown as SocketIO.Server;
        service.resetTurnsPassed();
        expect(service.turnsPassedCounter).to.equal(0);
        expect(spy.calledOnce).to.equal(true);
        spy.restore();
    });

    it('getLettersAsString should return string of remaining letters', () => {
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 1 });
        lettersOnRack.push({ letter: 'C', score: 1 });
        lettersOnRack.push({ letter: 'D', score: 1 });
        lettersOnRack.push({ letter: 'E', score: 1 });
        expect(service.getLettersAsString(lettersOnRack)).to.equal('abcde');
    });

    it('findWinnerPlayer should declare a tie if both players score are equal', () => {
        roomDataService.gameCreator.playerScore = 50;
        roomDataService.guestPlayer.playerScore = 50;
        const expectedWinner = 'equal';
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).to.equal(expectedWinner);
    });

    it('findWinnerPlayer should set the game creator as the winner if his score is greater than guest player score', () => {
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.gameCreator.playerScore = 50;
        roomDataService.guestPlayer.playerScore = 30;
        const expectedWinner = 'John';
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).to.equal(expectedWinner);
    });

    it('findWinnerPlayer should set the guest player as the winner if his score is greater than game creator score', () => {
        roomDataService.gameCreator.playerName = 'John';
        roomDataService.guestPlayer.playerName = 'Paul';
        roomDataService.gameCreator.playerScore = 30;
        roomDataService.guestPlayer.playerScore = 50;
        const expectedWinner = 'Paul';
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).to.equal(expectedWinner);
    });

    it('endGameVerify should return true if the number of passed turns is equal to 6', () => {
        service.turnsPassedCounter = 6;
        expect(service.endGameVerify()).to.equal(true);
    });

    it('endGameVerify should return true if the reserve and one of the 2 players dont have any more letter', () => {
        service.turnsPassedCounter = 0;
        letterReserveService.letterReserveTotalSize = 0;

        const gameCreatorPlayerRack: Tile[] = [];
        gameCreatorPlayerRack.push({ letter: 'A', score: 1 });
        gameCreatorPlayerRack.push({ letter: 'B', score: 2 });
        gameCreatorPlayerRack.push({ letter: 'C', score: 3 });
        roomDataService.gameCreator.letterRack = gameCreatorPlayerRack;
        roomDataService.guestPlayer.letterRack = [];

        expect(service.endGameVerify()).to.equal(true);
    });

    it('endGameVerify should return false', () => {
        service.turnsPassedCounter = 0;
        letterReserveService.letterReserveTotalSize = 2;
        expect(service.endGameVerify()).to.equal(false);
    });
});
