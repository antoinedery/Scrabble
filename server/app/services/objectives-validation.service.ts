import { INPUT_OBJECTIVE, MAX_ROW_SIZE, NOT_FOUND, OBJECTIVE_BOUNDARIES, ONE_MINUTE, ONE_SECOND_MS } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { BonusValue } from '@app/classes/enums/board-game-enums';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { Subject } from 'rxjs';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Service } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { PlayAreaService } from './play-area.service';
import { RoomDataService } from './room-data.service';
import { TileHandlerService } from './tile-handler.service';
import { TurnHandlerService } from './turn-handler.service';

declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class ObjectivesValidationService {
    currentScoredPlacement: ScoredPlacement;
    currentTimerValue: number = 0;
    gameTimerValue: number = 0;
    objective5CounterGameCreator: number = 0;
    objective5CounterGuestPlayer: number = 0;
    objective8CounterGameCreator: number = 0;
    objective8CounterGuestPlayer: number = 0;
    validation: { [key: string]: () => boolean };
    gameCreatorBonusObservable: Subject<number> = new Subject<number>();
    guestPlayerBonusObservable: Subject<number> = new Subject<number>();
    wordsOnBoard: Map<string, string> = new Map();
    axes: AXIS[] = new Array();

    constructor(
        private playAreaService: PlayAreaService,
        private turnHandlerService: TurnHandlerService,
        private roomDataService: RoomDataService,
        private activePlayerService: ActivePlayerService,
        private tileHandlerService: TileHandlerService,
    ) {
        this.initData();
    }

    initData(): void {
        this.validation = {
            validate1: this.validateObjective1,
            validate2: this.validateObjective2,
            validate3: this.validateObjective3,
            validate4: this.validateObjective4,
            validate5: this.validateObjective5,
            validate6: this.validateObjective6,
            validate7: this.validateObjective7,
            validate8: this.validateObjective8,
        };
        this.turnHandlerService.resetObjectivesCountersObservable.subscribe(() => {
            this.resetObjectiveCounters();
        });
        this.axes = [];
        this.axes.push(AXIS.HORIZONTAL);
        this.axes.push(AXIS.VERTICAL);
    }

    resetData(): void {
        this.resetObjectiveCounters();
        this.wordsOnBoard = new Map();
    }

    callAdequateValidationFunction(name: string): boolean {
        return this.validation[name].bind(this)();
    }

    validateObjectives(scoredPlacement: ScoredPlacement, currentTimerValue: number, sio: io.Server, socket: ASocket): void {
        this.currentScoredPlacement = scoredPlacement;
        this.gameTimerValue = (this.turnHandlerService.timeValue.minute * ONE_MINUTE + this.turnHandlerService.timeValue.second) * ONE_SECOND_MS;
        this.currentTimerValue = currentTimerValue;

        if (this.roomDataService.gameCreator.isMyTurn) {
            this.verifyGameCreatorPrivateObjective(sio, socket);
        } else {
            this.verifyGuestPlayerPrivateObjective(sio, socket);
        }

        this.verifyPublicObjectives(sio, socket);
    }

    verifyGameCreatorPrivateObjective(sio: io.Server, socket: ASocket): void {
        for (const objective of this.roomDataService.gameCreator.privateObjective) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.activePlayerService.playerScore += objective[1].score;
                    this.displayObjectiveConfirmationMessage(true, objective[1].description, objective[1].score, sio, socket);
                }
            }
        }
    }

    verifyGuestPlayerPrivateObjective(sio: io.Server, socket: ASocket): void {
        for (const objective of this.roomDataService.guestPlayer.privateObjective) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.activePlayerService.playerScore += objective[1].score;
                    this.displayObjectiveConfirmationMessage(true, objective[1].description, objective[1].score, sio, socket);
                }
            }
        }
    }

    verifyPublicObjectives(sio: io.Server, socket: ASocket): void {
        for (const objective of this.roomDataService.publicObjectives) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.activePlayerService.playerScore += objective[1].score;
                    this.displayObjectiveConfirmationMessage(false, objective[1].description, objective[1].score, sio, socket);
                }
            }
        }
    }

    displayObjectiveConfirmationMessage(isObjectivePrivate: boolean, description: string, score: number, sio: io.Server, socket: ASocket): void {
        let messageToCurrentPlayer = '';
        let messageToOpponent = '';

        messageToCurrentPlayer = 'Vous avez réussi';
        messageToOpponent = 'Votre adversaire a réussi';
        if (isObjectivePrivate) messageToCurrentPlayer += " l'objectif privé suivant : ";
        else messageToCurrentPlayer += " l'objectif public suivant : ";
        messageToCurrentPlayer += description + '. + ' + score.toString() + ' points bonus !' + ' Félicitations !';

        const startingSubstringToCopy = 16;
        messageToOpponent += messageToCurrentPlayer.substring(startingSubstringToCopy);

        socket.emit('objectiveCompleted', messageToCurrentPlayer);
        socket.broadcast.to(this.roomDataService.roomID).emit('objectiveCompleted', messageToOpponent);

        this.roomDataService.sendObjectivesToPlayers(sio);
    }

    validateObjective1(): boolean {
        this.readBoard();
        for (const element of this.currentScoredPlacement.words) {
            if (this.wordsOnBoard.has(element.word.content)) return true;
        }
        return false;
    }

    validateObjective2(): boolean {
        let vowelNumber = 0;
        for (const placedLetter of this.currentScoredPlacement.placement.letters) {
            if (this.isAVowel(placedLetter.content)) vowelNumber++;
        }
        return vowelNumber >= OBJECTIVE_BOUNDARIES.MAX_OCC_VOWELS;
    }

    isAVowel(letter: string) {
        return INPUT_OBJECTIVE.VOWELS.indexOf(letter) !== NOT_FOUND;
    }

    validateObjective3(): boolean {
        return this.currentScoredPlacement.words.length >= OBJECTIVE_BOUNDARIES.MAX_OCC_WORDS;
    }

    validateObjective4(): boolean {
        for (const placedLetter of this.currentScoredPlacement.placement.letters) {
            if (placedLetter.content.includes('v') || placedLetter.content.includes('V')) return true;
        }
        return false;
    }

    validateObjective5(): boolean {
        if (this.roomDataService.gameCreator.isMyTurn) {
            this.objective5CounterGameCreator++;
            return this.objective5CounterGameCreator === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_HARD;
        } else {
            this.objective5CounterGuestPlayer++;
            return this.objective5CounterGuestPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_HARD;
        }
    }

    validateObjective6(): boolean {
        const SEVEN_SECONDS = 7000;
        let delay = 0;
        delay = this.gameTimerValue - SEVEN_SECONDS;
        if (this.currentTimerValue < delay) return false;
        return this.currentScoredPlacement.placement.letters.length >= OBJECTIVE_BOUNDARIES.MAX_OCC_LETTERS;
    }

    validateObjective7(): boolean {
        let bonusSquareNumber = 0;
        for (const placedLetter of this.currentScoredPlacement.placement.letters) {
            if (this.playAreaService.boardGame[placedLetter.position.y][placedLetter.position.x].bonusType !== BonusValue.XX) bonusSquareNumber++;
        }
        return bonusSquareNumber >= OBJECTIVE_BOUNDARIES.MAX_OCC_BONUS_SQUARE;
    }

    validateObjective8(): boolean {
        if (this.roomDataService.gameCreator.isMyTurn) {
            if (this.validate8pointsWordCreated()) this.objective8CounterGameCreator++;
            else this.objective8CounterGameCreator = 0;
            return this.objective8CounterGameCreator === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_MEDIUM;
        } else {
            if (this.validate8pointsWordCreated()) this.objective8CounterGuestPlayer++;
            else this.objective8CounterGuestPlayer = 0;
            return this.objective8CounterGuestPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_MEDIUM;
        }
    }

    validate8pointsWordCreated(): boolean {
        const SCORE_NEEDED = 8;
        for (const word of this.currentScoredPlacement.words) {
            if (word.score >= SCORE_NEEDED) return true;
        }
        return false;
    }

    resetObjectiveCounters(): void {
        if (this.roomDataService.gameCreator.isMyTurn) {
            this.objective5CounterGameCreator = 0;
            this.objective8CounterGameCreator = 0;
        } else {
            this.objective5CounterGuestPlayer = 0;
            this.objective8CounterGuestPlayer = 0;
        }
    }

    readBoard(): void {
        this.wordsOnBoard = new Map();
        for (const axis of this.axes) {
            this.readBoardOnAxis(axis);
        }
    }

    readBoardOnAxis(searchedAxis: AXIS): void {
        for (let y = 0; y < MAX_ROW_SIZE; y++) {
            let x = 0;
            while (x < MAX_ROW_SIZE) {
                let element = this.tileHandlerService.getTransposedTile(searchedAxis, { x, y });
                if (element) {
                    let ctr = x + 1;
                    while (ctr < MAX_ROW_SIZE) {
                        const nextElement = this.tileHandlerService.getTransposedTile(searchedAxis, { x: ctr, y });
                        if (!nextElement) break;
                        element += nextElement;
                        ctr++;
                    }
                    if (element.length > 1) this.wordsOnBoard.set(element, element);
                    x += element.length;
                } else {
                    x++;
                }
            }
        }
    }
}
