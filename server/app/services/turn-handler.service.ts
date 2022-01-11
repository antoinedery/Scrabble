import { MAX_END_TURN, MAX_VALUE_SECOND, ONE_SECOND_MS } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { Time } from '@app/classes/interfaces/time';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Subject } from 'rxjs';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { RoomDataService } from './room-data.service';
import { ScoreDatabaseService } from './score-database.service';

@Service()
export class TurnHandlerService {
    counter: Time = { minute: 1, second: 0 };
    timer: NodeJS.Timer;
    turnsPassedCounter: number = 0;
    winnerPlayerName: string = '';
    totalLetterScore: number = 0;
    activePlayerName: string;
    insertConnected = false;
    sio: io.Server;
    endGameObservable: Subject<boolean> = new Subject();
    resetObjectivesCountersObservable: Subject<boolean> = new Subject();
    timeValue: Time = { minute: 1, second: 30 };

    constructor(
        private roomDataService: RoomDataService,
        private letterReserveService: LetterReserveService,
        private scoreDatabaseService: ScoreDatabaseService,
    ) {
        this.endGameObservable.subscribe(() => {
            this.clearTimer();
            this.sio.to(this.roomDataService.roomID).emit('clearTimer');
        });
    }

    initTimer(sio: io.Server, startingPlayerName: string): void {
        this.sio = sio;
        this.activePlayerName = startingPlayerName;
        this.obtainTime(this.roomDataService.timer);
    }

    obtainTime(timer: Time): void {
        const tempTimeValue: Time = { minute: timer.minute, second: timer.second };
        this.timeValue = tempTimeValue;
        this.resetTimer();
    }

    endTurn(): void {
        if (this.endGameVerify()) this.endGame();
        else {
            this.switchTurn();
            this.resetTimer();
        }
    }

    switchTurn(): void {
        let socketToPlay = '';
        if (this.roomDataService.gameCreator.isMyTurn && !this.roomDataService.guestPlayer.isMyTurn) {
            this.roomDataService.guestPlayer.isMyTurn = true;
            this.roomDataService.gameCreator.isMyTurn = false;
            this.activePlayerName = this.roomDataService.guestPlayer.playerName;
            socketToPlay = this.roomDataService.guestPlayer.socketID;
        } else if (this.roomDataService.guestPlayer.isMyTurn && !this.roomDataService.gameCreator.isMyTurn) {
            this.roomDataService.guestPlayer.isMyTurn = false;
            this.roomDataService.gameCreator.isMyTurn = true;
            this.activePlayerName = this.roomDataService.gameCreator.playerName;
            socketToPlay = this.roomDataService.gameCreator.socketID;
        }

        this.sio.to(this.roomDataService.roomID).emit('updateIsMyTurnToPlay', socketToPlay);
    }

    resetTimer(): void {
        this.startTimer(this.timeValue.minute, this.timeValue.second);
        this.sio.to(this.roomDataService.roomID).emit('resetTimer', this.roomDataService.timer);
    }

    startTimer(timerMinute: number, timerSeconds: number): void {
        this.counter = { minute: timerMinute, second: timerSeconds };

        this.clearTimerInterval();
        this.timer = setInterval(() => {
            if (this.counter.second - 1 < 0) {
                this.counter.minute--;
                this.counter.second = MAX_VALUE_SECOND;
            } else this.counter.second--;

            if (this.counter.minute === 0 && this.counter.second === 0) {
                this.clearTimerInterval();
                this.sio.to(this.roomDataService.roomID).emit('hereIsANewMessage', 'Passer son tour', this.activePlayerName);
                const activePlayerSocketID = this.getActivePlayerSocketID();
                this.sio.to(activePlayerSocketID).emit('cancelPlacement');
                this.incrementTurnsPassed();
            }
        }, ONE_SECOND_MS);
    }

    clearTimerInterval(): void {
        clearInterval(this.timer);
    }

    clearTimer() {
        this.clearTimerInterval();
        this.counter = { minute: 0, second: 0 };
    }

    getActivePlayerSocketID(): string {
        return this.roomDataService.gameCreator.playerName === this.activePlayerName
            ? this.roomDataService.gameCreator.socketID
            : this.roomDataService.guestPlayer.socketID;
    }

    endGameVerify(): boolean {
        if (this.turnsPassedCounter === MAX_END_TURN) {
            return true;
        }
        /* istanbul ignore else*/
        if (this.letterReserveService.letterReserveTotalSize === 0) {
            /* istanbul ignore else*/
            if (this.roomDataService.gameCreator.letterRack.length === 0 || this.roomDataService.guestPlayer.letterRack.length === 0) {
                return true;
            }
        }
        return false;
    }

    displayEndGameStatistics(): void {
        const gameCreatorRemainingLetters = this.getLettersAsString(this.roomDataService.gameCreator.letterRack);
        const guestPlayerRemainingLetters = this.getLettersAsString(this.roomDataService.guestPlayer.letterRack);

        this.sio.to(this.roomDataService.roomID).emit('hereIsANewMessage', 'Fin de partie - Lettres restantes', 'system');
        this.sio
            .to(this.roomDataService.roomID)
            .emit('hereIsANewMessage', this.roomDataService.gameCreator.playerName + ' : ' + gameCreatorRemainingLetters, 'system');
        this.sio
            .to(this.roomDataService.roomID)
            .emit('hereIsANewMessage', this.roomDataService.guestPlayer.playerName + ' : ' + guestPlayerRemainingLetters, 'system');

        const gameCreatorScore = this.roomDataService.gameCreator.playerScore;
        const guestPlayerScore = this.roomDataService.guestPlayer.playerScore;
        const gameCreatorSocketID = this.roomDataService.gameCreator.socketID;
        const guestPlayerSocketID = this.roomDataService.guestPlayer.socketID;

        this.sio.to(this.roomDataService.roomID).emit('hereIsAPlayerScore', gameCreatorScore, gameCreatorSocketID);
        this.sio.to(this.roomDataService.roomID).emit('hereIsAPlayerScore', guestPlayerScore, guestPlayerSocketID);

        this.sio.to(this.roomDataService.roomID).emit('endGame', this.winnerPlayerName);
    }

    endGameScoreBonus(): void {
        if (this.roomDataService.gameCreator.letterRack.length === 0) {
            for (const tile of this.roomDataService.guestPlayer.letterRack) {
                this.totalLetterScore += tile.score;
            }
            this.roomDataService.gameCreator.playerScore += this.totalLetterScore;
        }
        if (this.roomDataService.guestPlayer.letterRack.length === 0) {
            for (const tile of this.roomDataService.gameCreator.letterRack) {
                this.totalLetterScore += tile.score;
            }
            this.roomDataService.guestPlayer.playerScore += this.totalLetterScore;
        }
        if (this.roomDataService.guestPlayer.letterRack.length !== 0 && this.roomDataService.gameCreator.letterRack.length !== 0) {
            for (const tile of this.roomDataService.guestPlayer.letterRack) {
                this.totalLetterScore += tile.score;
            }
            this.roomDataService.guestPlayer.playerScore -= this.totalLetterScore;
        }
        if (this.roomDataService.guestPlayer.letterRack.length !== 0 && this.roomDataService.gameCreator.letterRack.length !== 0) {
            this.totalLetterScore = 0;
            for (const tile of this.roomDataService.gameCreator.letterRack) {
                this.totalLetterScore += tile.score;
            }
            this.roomDataService.gameCreator.playerScore -= this.totalLetterScore;
        }
        this.adjustScore();
    }

    adjustScore(): void {
        if (this.roomDataService.gameCreator.playerScore < 0) this.roomDataService.gameCreator.playerScore = 0;
        if (this.roomDataService.guestPlayer.playerScore < 0) this.roomDataService.guestPlayer.playerScore = 0;
    }
    async sendScore(): Promise<void> {
        if (this.roomDataService.isLog2990ModeChosen) {
            this.insertConnected =
                (await this.scoreDatabaseService.insertDB({
                    name: this.roomDataService.gameCreator.playerName,
                    score: this.roomDataService.gameCreator.playerScore,
                    mode: 'Log2990',
                })) &&
                (await this.scoreDatabaseService.insertDB({
                    name: this.roomDataService.guestPlayer.playerName,
                    score: this.roomDataService.guestPlayer.playerScore,
                    mode: 'Log2990',
                }));
            /* istanbul ignore else */
            if (!this.insertConnected) {
                this.sio.to(this.roomDataService.roomID).emit('errorMessage', "Echec d'insertion du score");
            }
        } else {
            this.insertConnected =
                (await this.scoreDatabaseService.insertDB({
                    name: this.roomDataService.gameCreator.playerName,
                    score: this.roomDataService.gameCreator.playerScore,
                    mode: 'Classic',
                })) &&
                (await this.scoreDatabaseService.insertDB({
                    name: this.roomDataService.guestPlayer.playerName,
                    score: this.roomDataService.guestPlayer.playerScore,
                    mode: 'Classic',
                }));
            /* istanbul ignore else */
            if (!this.insertConnected) {
                this.sio.to(this.roomDataService.roomID).emit('errorMessage', "Echec d'insertion du score");
            }
        }
    }

    async endGame(): Promise<void> {
        this.roomDataService.isGameEnded = true;
        this.roomDataService.gameCreator.isMyTurn = false;
        this.roomDataService.guestPlayer.isMyTurn = false;
        this.endGameScoreBonus();
        this.endGameObservable.next(true);
        this.findWinnerPlayer();
        this.displayEndGameStatistics();
        await this.sendScore();
    }

    incrementTurnsPassed(): void {
        this.resetObjectivesCountersObservable.next(true);
        this.turnsPassedCounter++;
        this.endTurn();
    }

    resetTurnsPassed(): void {
        this.turnsPassedCounter = 0;
        this.endTurn();
    }

    getLettersAsString(tile: Tile[]): string {
        let lettersString = '';
        for (const [index] of tile.entries()) {
            lettersString += tile[index].letter;
        }
        return lettersString.toLowerCase();
    }

    findWinnerPlayer(): void {
        if (this.roomDataService.gameCreator.playerScore === this.roomDataService.guestPlayer.playerScore) {
            this.winnerPlayerName = 'equal';
        } else if (this.roomDataService.gameCreator.playerScore > this.roomDataService.guestPlayer.playerScore) {
            this.winnerPlayerName = this.roomDataService.gameCreator.playerName;
        } else {
            this.winnerPlayerName = this.roomDataService.guestPlayer.playerName;
        }
    }
}
