// Disable de lint autorisé par chargés
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
import { OBJECTIVES, OBJECTIVE_4 } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { PlayAreaService } from './play-area.service';
import { RoomDataService } from './room-data.service';
import { TileHandlerService } from './tile-handler.service';

describe('ObjectivesValidationService', () => {
    let service: ObjectivesValidationService;
    let turnHandlerService: TurnHandlerService;
    let roomDataService: RoomDataService;
    let activePlayerService: ActivePlayerService;
    let playAreaService: PlayAreaService;
    let tileHandlerService: TileHandlerService;

    const sevenLettersPlacement: Placement = {
        axis: AXIS.HORIZONTAL,
        letters: [
            { content: 'e', position: { x: 6, y: 6 } },
            { content: 'n', position: { x: 7, y: 6 } },
            { content: 'v', position: { x: 8, y: 6 } },
            { content: 'i', position: { x: 9, y: 6 } },
            { content: 'r', position: { x: 10, y: 6 } },
            { content: 'o', position: { x: 11, y: 6 } },
            { content: 'n', position: { x: 12, y: 6 } },
        ],
    };
    const fakeScoredPlacement: ScoredPlacement = {
        placement: sevenLettersPlacement,
        words: [
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 6, y: 6 },
                    content: 'environ',
                },
                score: 10,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'le',
                },
                score: 2,
            },
        ],
        totalScore: 62,
    };

    const sevenLettersPlacement2: Placement = {
        axis: AXIS.HORIZONTAL,
        letters: [
            { content: 'b', position: { x: 7, y: 12 } },
            { content: 'o', position: { x: 8, y: 12 } },
        ],
    };
    const fakeScoredPlacement2: ScoredPlacement = {
        placement: sevenLettersPlacement2,
        words: [
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 7, y: 13 },
                    content: 'bon',
                },
                score: 10,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'le',
                },
                score: 2,
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 3, y: 3 },
                    content: 'hello',
                },
                score: 6,
            },
        ],
        totalScore: 62,
    };
    const otherSevenLettersPlacement: Placement = {
        axis: AXIS.VERTICAL,
        letters: [
            { content: 'c', position: { x: 7, y: 12 } },
            { content: 'a', position: { x: 8, y: 13 } },
            { content: 'n', position: { x: 9, y: 13 } },
            { content: 'a', position: { x: 10, y: 13 } },
            { content: 'd', position: { x: 11, y: 13 } },
            { content: 'a', position: { x: 12, y: 13 } },
            { content: '', position: { x: 13, y: 13 } },
        ],
    };
    const otherFakeScoredPlacement: ScoredPlacement = {
        placement: otherSevenLettersPlacement,
        words: [
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 7, y: 12 },
                    content: 'Canada',
                },
                score: 2,
            },
        ],
        totalScore: 12,
    };

    const socketStub = {
        emit: (eventName: string, ...arg: unknown[]) => {
            return eventName + arg;
        },
        broadcast: {
            to: (room: string) => {
                return emitObject;
            },
        },
    };
    const serverStub = {
        to: (room: string) => {
            return emitObject;
        },
    };
    const emitObject = {
        emit: (eventName: string, ...args: unknown[]) => {
            return eventName;
        },
    };

    beforeEach(() => {
        service = Container.get(ObjectivesValidationService);
        turnHandlerService = Container.get(TurnHandlerService);
        roomDataService = Container.get(RoomDataService);
        activePlayerService = Container.get(ActivePlayerService);
        playAreaService = Container.get(PlayAreaService);
        tileHandlerService = Container.get(TileHandlerService);
    });

    it('resetObjectiveCountersSpy should be called when subscribe resetObjectivesCountersObservable is triggered', () => {
        const resetObjectiveCountersSpy = Sinon.spy(service, 'resetObjectiveCounters');
        service.initData();
        turnHandlerService.resetObjectivesCountersObservable.next(true);
        expect(resetObjectiveCountersSpy.called).to.equal(true);
        expect(service.axes).to.include(AXIS.HORIZONTAL);
        expect(service.axes).to.include(AXIS.VERTICAL);
        resetObjectiveCountersSpy.restore();
    });

    it('resetObjectiveCountersSpy and wordsOnBoard service should be called', () => {
        const resetObjectiveCountersSpy = Sinon.spy(service, 'resetObjectiveCounters');
        service.wordsOnBoard.set('hello', 'hello');
        service.resetData();
        expect(resetObjectiveCountersSpy.calledOnce).to.equal(true);
        expect(service.wordsOnBoard).to.deep.equal(new Map());
        resetObjectiveCountersSpy.restore();
    });

    it('callAdequateValidationFunction should call the adequate function and return its return value', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        const randomFunctionToCall = 'validate4';
        const bindSpy = Sinon.stub(service.validateObjective4 as CallableFunction, 'bind').callThrough();
        service.callAdequateValidationFunction(randomFunctionToCall);
        expect(bindSpy.called).to.equal(true);
    });

    it('validateObjectives should call verifyPublicObjectives', () => {
        const FAKE_CURRENT_TIMER = 7;
        const verifySpy = Sinon.spy(service, 'verifyPublicObjectives');
        roomDataService.gameCreator.isMyTurn = true;
        service.validateObjectives(
            fakeScoredPlacement,
            FAKE_CURRENT_TIMER,
            serverStub as unknown as SocketIO.Server,
            socketStub as unknown as SocketIO.Socket,
        );
        expect(verifySpy.calledOnceWith(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket)).to.equal(true);
        verifySpy.restore();
    });

    it('validateObjectives should call verifyGameCreatorPrivateObjective if its the game creators turn', () => {
        const FAKE_CURRENT_TIMER = 7;
        const verifySpy = Sinon.spy(service, 'verifyGameCreatorPrivateObjective');
        roomDataService.gameCreator.isMyTurn = true;
        service.validateObjectives(
            fakeScoredPlacement,
            FAKE_CURRENT_TIMER,
            serverStub as unknown as SocketIO.Server,
            socketStub as unknown as SocketIO.Socket,
        );
        expect(verifySpy.calledOnceWith(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket)).to.equal(true);
        verifySpy.restore();
    });

    it('validateObjectives should call verifyGuestPlayerPrivateObjective if its the guest players turn', () => {
        const FAKE_CURRENT_TIMER = 7;
        const verifySpy = Sinon.spy(service, 'verifyGuestPlayerPrivateObjective');
        roomDataService.gameCreator.isMyTurn = false;
        service.validateObjectives(
            fakeScoredPlacement,
            FAKE_CURRENT_TIMER,
            serverStub as unknown as SocketIO.Server,
            socketStub as unknown as SocketIO.Socket,
        );
        expect(verifySpy.calledOnceWith(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket)).to.equal(true);
        verifySpy.restore();
    });

    it('verifyGameCreatorPrivateObjective should set fullfilled property to true if objective is valid', () => {
        roomDataService.gameCreator.privateObjective.clear();
        roomDataService.resetAllFullfilledProperties();
        roomDataService.gameCreator.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const expectedFuntionToCall = 'validate4';
        service.verifyGameCreatorPrivateObjective(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(callAdequateValidationFunctionSpy.calledWith(expectedFuntionToCall)).to.equal(true);
        expect(roomDataService.gameCreator.privateObjective.get(OBJECTIVE_4)?.fullfilled).to.equal(true);
        callAdequateValidationFunctionSpy.restore();
    });

    it('verifyGameCreatorPrivateObjective should update active player score if objective is valid', () => {
        roomDataService.gameCreator.privateObjective.clear();
        roomDataService.resetAllFullfilledProperties();
        activePlayerService.playerScore = 0;
        roomDataService.gameCreator.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const displayObjectiveConfirmationMessageSpy = Sinon.spy(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[3].description;
        const score = OBJECTIVES[3].score;
        service.verifyGameCreatorPrivateObjective(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(
            displayObjectiveConfirmationMessageSpy.calledWith(
                true,
                description,
                score,
                serverStub as unknown as SocketIO.Server,
                socketStub as unknown as SocketIO.Socket,
            ),
        ).to.equal(true);
        expect(activePlayerService.playerScore).to.equal(score);
        callAdequateValidationFunctionSpy.restore();
        displayObjectiveConfirmationMessageSpy.restore();
    });

    it('verifyGuestPlayerPrivateObjective should set fullfilled property to true if objective is valid', () => {
        roomDataService.guestPlayer.privateObjective.clear();
        roomDataService.resetAllFullfilledProperties();
        roomDataService.guestPlayer.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const expectedFuntionToCall = 'validate4';
        service.verifyGuestPlayerPrivateObjective(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(callAdequateValidationFunctionSpy.calledWith(expectedFuntionToCall)).to.equal(true);
        expect(roomDataService.guestPlayer.privateObjective.get(OBJECTIVE_4)?.fullfilled).to.equal(true);
        callAdequateValidationFunctionSpy.restore();
    });

    it('verifyGuestPlayerPrivateObjective should update active player score if objective is valid', () => {
        roomDataService.guestPlayer.privateObjective.clear();
        roomDataService.resetAllFullfilledProperties();
        activePlayerService.playerScore = 0;
        roomDataService.guestPlayer.privateObjective.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const displayObjectiveConfirmationMessageSpy = Sinon.spy(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[3].description;
        const score = OBJECTIVES[3].score;
        service.verifyGuestPlayerPrivateObjective(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(
            displayObjectiveConfirmationMessageSpy.calledWith(
                true,
                description,
                score,
                serverStub as unknown as SocketIO.Server,
                socketStub as unknown as SocketIO.Socket,
            ),
        ).to.equal(true);
        expect(activePlayerService.playerScore).to.equal(score);
        callAdequateValidationFunctionSpy.restore();
        displayObjectiveConfirmationMessageSpy.restore();
    });

    it('verifyPublicObjectives should set fullfilled property to true if objective is valid', () => {
        roomDataService.publicObjectives.clear();
        roomDataService.resetAllFullfilledProperties();
        roomDataService.publicObjectives.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const expectedFuntionToCall = 'validate4';
        service.verifyPublicObjectives(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(callAdequateValidationFunctionSpy.calledWith(expectedFuntionToCall)).to.equal(true);
        expect(roomDataService.publicObjectives.get(OBJECTIVE_4)?.fullfilled).to.equal(true);
        callAdequateValidationFunctionSpy.restore();
    });

    it('verifyPublicObjectives should update active player score if objective is valid', () => {
        roomDataService.publicObjectives.clear();
        roomDataService.resetAllFullfilledProperties();
        activePlayerService.playerScore = 0;
        roomDataService.publicObjectives.set(OBJECTIVE_4, OBJECTIVES[3]);
        const callAdequateValidationFunctionSpy = Sinon.stub(service, 'callAdequateValidationFunction').returns(true);
        const displayObjectiveConfirmationMessageSpy = Sinon.spy(service, 'displayObjectiveConfirmationMessage');
        const description = OBJECTIVES[3].description;
        const score = OBJECTIVES[3].score;
        service.verifyPublicObjectives(serverStub as unknown as SocketIO.Server, socketStub as unknown as SocketIO.Socket);
        expect(
            displayObjectiveConfirmationMessageSpy.calledWith(
                false,
                description,
                score,
                serverStub as unknown as SocketIO.Server,
                socketStub as unknown as SocketIO.Socket,
            ),
        ).to.equal(true);
        expect(activePlayerService.playerScore).to.equal(score);
        callAdequateValidationFunctionSpy.restore();
        displayObjectiveConfirmationMessageSpy.restore();
    });

    it('displayObjectiveConfirmationMessage should emit objectiveCompleted signal and call sendObjectivesToPlayers()', () => {
        const emitSpy = Sinon.spy(socketStub, 'emit');
        const sendObjectivesSpy = Sinon.spy(roomDataService, 'sendObjectivesToPlayers');
        const isObjectivePrivate = true;
        const description = 'Random objective';
        const FAKE_SCORE = 20;
        const expectedMsgToCurrentPlayer = "Vous avez réussi l'objectif privé suivant : Random objective. + 20 points bonus ! Félicitations !";
        const expectedMsgToOpponent = "Votre adversaire a réussi l'objectif privé suivant : Random objective. + 20 points bonus ! Félicitations !";
        service.displayObjectiveConfirmationMessage(
            isObjectivePrivate,
            description,
            FAKE_SCORE,
            serverStub as unknown as SocketIO.Server,
            socketStub as unknown as SocketIO.Socket,
        );
        expect(emitSpy.calledWith('objectiveCompleted', expectedMsgToCurrentPlayer));
        expect(emitSpy.calledWith('objectiveCompleted', expectedMsgToOpponent));
        expect(sendObjectivesSpy.calledOnceWith(serverStub as unknown as SocketIO.Server)).to.equal(true);
    });

    it('validateObjective1 should return false if the word to be inserted is not present in board game', () => {
        service.wordsOnBoard = new Map();
        const readBoardStub = Sinon.stub(service, 'readBoard');
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective1()).to.equal(false);
        expect(readBoardStub.called).to.equal(true);
        readBoardStub.restore();
    });

    it('validateObjective1 should return true if the word to be inserted is already present in board game', () => {
        service.wordsOnBoard.set('environ', 'environ');
        service.currentScoredPlacement = fakeScoredPlacement;
        const readBoardStub = Sinon.stub(service, 'readBoard');
        expect(service.validateObjective1()).to.equal(true);
        readBoardStub.restore();
    });

    it('validateObjective2 should be true if the three vowels are used', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective2()).equal(true);
    });

    it('isAVowel should return false if the letter is not a vowel', () => {
        const testLetter = 'j';
        expect(service.isAVowel(testLetter)).equal(false);
    });

    it('isAVowel should return true if the letter is not a vowel', () => {
        const testLetter = 'i';
        expect(service.isAVowel(testLetter)).equal(true);
    });

    it('validateObjective3 should return false if the insertion of a word does not create three words ', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective3()).equal(false);
    });

    it('validateObjective3 should return true if the insertion of a word creates at least three words ', () => {
        service.currentScoredPlacement = fakeScoredPlacement2;
        expect(service.validateObjective3()).equal(true);
    });

    it('validateObjective4 should return true if "v" or "V" is in scrabble easel', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective4()).equal(true);
    });

    it('validateObjective4 should return false if "v" or "V" is not in scrabble easel', () => {
        service.currentScoredPlacement = otherFakeScoredPlacement;
        expect(service.validateObjective4()).equal(false);
    });

    it('validateObjective5 should return false if counter is equal to 4 and game creator has to play', () => {
        roomDataService.gameCreator.isMyTurn = true;
        service.objective5CounterGameCreator = 0;
        expect(service.validateObjective5()).equal(false);
    });

    it('validateObjective5 should return false if counter is equal to 4 and guest player has to play ', () => {
        roomDataService.gameCreator.isMyTurn = false;
        service.objective5CounterGuestPlayer = 0;
        expect(service.validateObjective5()).equal(false);
    });

    it('validateObjective5 should return true if counter is equal to 4 and game creator has to play', () => {
        roomDataService.gameCreator.isMyTurn = true;
        service.objective5CounterGameCreator = 3;
        expect(service.validateObjective5()).equal(true);
    });

    it('validateObjective5 should return true if counter is equal to 4 and guest player has to play ', () => {
        roomDataService.gameCreator.isMyTurn = false;
        service.objective5CounterGuestPlayer = 3;
        expect(service.validateObjective5()).equal(true);
    });

    it('validateObjective6 should return false if the 5 letters from scrabble easel is not placed in a valid placement in the first 10 s', () => {
        const CURRENT_TIMER = 1000;
        const GAME_TIMER = 9000;
        service.currentTimerValue = CURRENT_TIMER;
        service.gameTimerValue = GAME_TIMER;
        expect(service.validateObjective6()).equal(false);
    });

    it('validateObjective6 should return true if the 5 letters from scrabble easel is placed in a valid placement in the first 10 s', () => {
        const CURRENT_TIMER = 9000;
        const GAME_TIMER = 1000;
        service.currentTimerValue = CURRENT_TIMER;
        service.gameTimerValue = GAME_TIMER;
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective6()).equal(true);
    });

    it('validateObjective7 should return true if placement touches at least 2 bonus squares', () => {
        playAreaService.initialiseBoardCaseList();
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validateObjective7()).equal(true);
    });

    it('validateObjective7 should return false if placement doesnt touch at least 2 bonus squares', () => {
        playAreaService.initialiseBoardCaseList();
        service.currentScoredPlacement = fakeScoredPlacement2;
        expect(service.validateObjective7()).equal(false);
    });

    it('validateObjective8 should incremented the game creator objective counter if validate8pointsWordsCreated is false', () => {
        roomDataService.gameCreator.isMyTurn = true;
        service.currentScoredPlacement = fakeScoredPlacement;
        service.objective8CounterGameCreator = 0;
        service.validateObjective8();
        expect(service.objective8CounterGameCreator).equal(1);
    });

    it('validateObjective8 should not incremented the game creator objective counter if validate8pointsWordsCreated is true', () => {
        roomDataService.gameCreator.isMyTurn = true;
        service.currentScoredPlacement = otherFakeScoredPlacement;
        service.objective8CounterGameCreator = 0;
        service.validateObjective8();
        expect(service.objective8CounterGameCreator).equal(0);
    });

    it('validateObjective8 should incremented the guest player objective counter if validate8pointsWordsCreated is false', () => {
        roomDataService.gameCreator.isMyTurn = false;
        service.currentScoredPlacement = fakeScoredPlacement;
        service.objective8CounterGuestPlayer = 0;
        service.validateObjective8();
        expect(service.objective8CounterGuestPlayer).to.equal(1);
    });

    it('validateObjective8 should not incremented the guest player objective counter if validate8pointsWordsCreated is true', () => {
        roomDataService.gameCreator.isMyTurn = false;
        service.currentScoredPlacement = otherFakeScoredPlacement;
        service.objective8CounterGuestPlayer = 0;
        service.validateObjective8();
        expect(service.objective8CounterGuestPlayer).to.equal(0);
    });

    it('validate8pointsWordCreated should return true if there is one word that earns more than 8 points', () => {
        service.currentScoredPlacement = fakeScoredPlacement;
        expect(service.validate8pointsWordCreated()).to.equal(true);
    });

    it('validate8pointsWordCreated should return true if there is one word that earns more than 8 points', () => {
        service.currentScoredPlacement = otherFakeScoredPlacement;
        expect(service.validate8pointsWordCreated()).to.equal(false);
    });

    it('resetObjectiveCounters should set game creator objective counters to 0 if it is his turn to play ', () => {
        roomDataService.gameCreator.isMyTurn = true;
        service.objective5CounterGameCreator = 2;
        service.objective8CounterGameCreator = 2;
        service.resetObjectiveCounters();
        expect(service.objective5CounterGameCreator).to.equal(0);
        expect(service.objective8CounterGameCreator).to.equal(0);
    });

    it('resetObjectiveCounters should set guest player objective counters to 0 if it is his turn to play ', () => {
        roomDataService.gameCreator.isMyTurn = false;
        service.objective5CounterGuestPlayer = 2;
        service.objective8CounterGuestPlayer = 2;
        service.resetObjectiveCounters();
        expect(service.objective5CounterGuestPlayer).to.equal(0);
        expect(service.objective8CounterGuestPlayer).to.equal(0);
    });

    it('readBoard should set wordsOnBoard to a new Map and call readBoardOnAxis() ', () => {
        service.wordsOnBoard.clear();
        service.wordsOnBoard.set('hello', 'hello');
        service.axes = [];
        service.axes.push(AXIS.HORIZONTAL);
        service.axes.push(AXIS.VERTICAL);
        const readBoardOnAxisSpy = Sinon.stub(service, 'readBoardOnAxis');
        service.readBoard();
        expect(readBoardOnAxisSpy.calledWith(AXIS.HORIZONTAL)).to.equal(true);
        expect(readBoardOnAxisSpy.calledWith(AXIS.VERTICAL)).to.equal(true);
        readBoardOnAxisSpy.restore();
    });

    it('readBoardOnAxis should read the board and set words to wordsOnBoard', () => {
        service.wordsOnBoard.clear();
        tileHandlerService.placeLetter({ content: 'l', position: { x: 6, y: 7 } });
        tileHandlerService.placeLetters(sevenLettersPlacement.letters);
        service.readBoardOnAxis(sevenLettersPlacement.axis);
        expect(service.wordsOnBoard.has('environ')).to.equal(true);
    });
});
