// Disable de lint autorisé par chargés
/* eslint-disable dot-notation */
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { Server } from '@app/server';
import { expect } from 'chai';
import { io, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManagerService } from './socket-manager.service';
import { WaitingGamesManagerService } from './waiting-games-manager.service';

describe('WaitingGamesManagerService', () => {
    let service: WaitingGamesManagerService;
    let socketManager: SocketManagerService;
    let socket1: Socket;
    let socket2: Socket;
    let server: Server;

    before(async () => {
        server = Container.get(Server);
        socketManager = Container.get(SocketManagerService);
        server.init();
    });

    beforeEach(async () => {
        service = Container.get(WaitingGamesManagerService);
        socket1 = io('ws://localhost:3000');
        socket2 = io('ws://localhost:3000');
    });

    afterEach(async () => {
        socket1.close();
        socket2.close();
    });

    after(() => {
        server['server'].close();
        socketManager.sio.close();
    });

    it('addWaitingGame should add a classic mode waiting game and emit a broadcast signal', (done) => {
        socket1.on('connect', () => {
            service.classicModeWaitingGames = new Map<string, WaitingGame>();
            const game: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '123456789',
                isLog2990ModeChosen: false,
            };
            const expectedParameters: WaitingGame[] = [];
            expectedParameters.push(game);
            socket2.on('hereAreTheWaitingGames', (parameters: WaitingGame[], isALog2990Game: boolean) => {
                expect(service.classicModeWaitingGames.has(game.socketId));
                expect(service.classicModeWaitingGames.get(game.socketId)).to.deep.eq(game);
                expect(parameters).to.deep.equal(expectedParameters);
                expect(isALog2990Game).to.equal(false);
                done();
            });
            socket1.emit('addWaitingGame', game);
        });
    });

    it('addWaitingGame should add a log2990 mode waiting game and emit a broadcast signal', (done) => {
        socket1.on('connect', () => {
            service.log2990ModeWaitingGames = new Map<string, WaitingGame>();
            const game: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '123456789',
                isLog2990ModeChosen: true,
            };
            const expectedParameters: WaitingGame[] = [];
            expectedParameters.push(game);
            socket2.on('hereAreTheWaitingGames', (parameters: WaitingGame[], isALog2990Game: boolean) => {
                expect(service.log2990ModeWaitingGames.has(game.socketId));
                expect(service.log2990ModeWaitingGames.get(game.socketId)).to.deep.eq(game);
                expect(parameters).to.deep.equal(expectedParameters);
                expect(isALog2990Game).to.equal(true);
                done();
            });
            socket1.emit('addWaitingGame', game);
        });
    });

    it('sendWaitingGames should emit a signal with the waitingGames', (done) => {
        const isLOG2990ModeChosen = false;
        socket1.on('connect', () => {
            service.classicModeWaitingGames = new Map<string, WaitingGame>();
            const game: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '123456789',
                isLog2990ModeChosen: isLOG2990ModeChosen,
            };
            service.classicModeWaitingGames.set(game.socketId, game);
            const expectedParameters: WaitingGame[] = [];
            expectedParameters.push(game);
            socket1.on('hereAreTheWaitingGames', (parameters: WaitingGame[]) => {
                expect(parameters).to.deep.equal(expectedParameters);
                done();
            });
            socket1.emit('sendWaitingGames', isLOG2990ModeChosen);
        });
    });

    it('deleteWaitingGame should delete a classic mode waiting game', (done) => {
        socket1.on('connect', () => {
            service.classicModeWaitingGames = new Map<string, WaitingGame>();
            const game1: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '123',
                isLog2990ModeChosen: false,
            };
            const game2: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '456',
                isLog2990ModeChosen: false,
            };
            service.classicModeWaitingGames.set(game1.socketId, game1);
            service.classicModeWaitingGames.set(game2.socketId, game2);
            const expectedParameters: WaitingGame[] = [];
            expectedParameters.push(game2);
            socket1.on('hereAreTheWaitingGames', (parameters: WaitingGame[]) => {
                expect(!service.classicModeWaitingGames.has(game1.socketId));
                expect(parameters).to.deep.equal(expectedParameters);
                done();
            });
            service.deleteWaitingGame(socketManager.sio, game1.socketId);
        });
    });

    it('deleteWaitingGame should delete a log2990 mode waiting game', (done) => {
        socket1.on('connect', () => {
            service.log2990ModeWaitingGames = new Map<string, WaitingGame>();
            const game1: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '123',
                isLog2990ModeChosen: true,
            };
            const game2: WaitingGame = {
                playerName: 'abcd',
                timer: { minute: 1, second: 0 },
                dictionary: { title: '', description: '' },
                bonus: false,
                socketId: '456',
                isLog2990ModeChosen: true,
            };
            service.log2990ModeWaitingGames.set(game1.socketId, game1);
            service.log2990ModeWaitingGames.set(game2.socketId, game2);
            const expectedParameters: WaitingGame[] = [];
            expectedParameters.push(game2);
            socket1.on('hereAreTheWaitingGames', (parameters: WaitingGame[]) => {
                expect(!service.log2990ModeWaitingGames.has(game1.socketId));
                expect(parameters).to.deep.equal(expectedParameters);
                done();
            });
            service.deleteWaitingGame(socketManager.sio, game1.socketId);
        });
    });

    it('convertMapToArray should return the log2990 mode waiting games map into an array', () => {
        service.classicModeWaitingGames.clear();
        service.log2990ModeWaitingGames.clear();
        const isLOG2990ModeChosen = true;
        const game: WaitingGame = {
            playerName: 'abcd',
            timer: { minute: 1, second: 0 },
            dictionary: { title: '', description: '' },
            bonus: false,
            socketId: '123',
            isLog2990ModeChosen: isLOG2990ModeChosen,
        };
        service.log2990ModeWaitingGames.set(game.socketId, game);
        const expectedArray: WaitingGame[] = [];
        expectedArray.push(game);
        const returnedArray = service.convertMapToArray(isLOG2990ModeChosen);
        expect(returnedArray).to.deep.equal(expectedArray);
    });

    it('convertMapToArray should return the classic mode waiting games map into an array', () => {
        service.log2990ModeWaitingGames.clear();
        service.classicModeWaitingGames.clear();
        const isLOG2990ModeChosen = false;
        const game: WaitingGame = {
            playerName: 'abcd',
            timer: { minute: 1, second: 0 },
            dictionary: { title: '', description: '' },
            bonus: false,
            socketId: '123',
            isLog2990ModeChosen: isLOG2990ModeChosen,
        };
        service.classicModeWaitingGames.set(game.socketId, game);
        const expectedArray: WaitingGame[] = [];
        expectedArray.push(game);
        const returnedArray = service.convertMapToArray(isLOG2990ModeChosen);
        expect(returnedArray).to.deep.equal(expectedArray);
    });
});
