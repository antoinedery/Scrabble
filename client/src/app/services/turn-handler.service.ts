import { Injectable } from '@angular/core';
import { MAX_END_TURN, MAX_VALUE_SECOND, ONE_SECOND_MS } from '@app/classes/constants/constants';
import { TurnHandlerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Tile } from '@app/classes/interfaces/tile';
import { Time } from '@app/classes/interfaces/time';
import { DisplayMessageService } from '@app/services/display-message.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TurnHandlerService {
    counter: Time = { minute: 1, second: 0 };
    timeChange: Subject<Time> = new Subject<Time>();
    timer: number;
    activePlayerName: string;
    timeValue: Time = { minute: 1, second: 0 };

    turnsPassedCounter: number = 0;
    winnerPlayerName: string;
    totalLetterScore: number = 0;

    winnerPlayerNameObservable: Subject<string> = new Subject<string>();
    endGameObservable: Subject<boolean> = new Subject();
    endGamePlayerBonusObservable: Subject<number> = new Subject();
    endGameVirtualPlayerObservable: Subject<number> = new Subject();
    endTimeObservable: Subject<boolean> = new Subject();

    resetObjectivesCountersObservable: Subject<boolean> = new Subject();

    constructor(
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private letterReserveService: LetterReserveService,
        private displayMessageService: DisplayMessageService,
    ) {
        this.endGameObservable.subscribe(() => {
            this.clearTimer();
        });
    }

    switchTurn(): void {
        if (this.playerSettingsService.hasToPlay && !this.virtualPlayerSettingsService.hasToPlay) {
            this.virtualPlayerSettingsService.hasToPlay = true;
            this.playerSettingsService.hasToPlay = false;
            this.activePlayerName = this.virtualPlayerSettingsService.name;
        } else if (this.virtualPlayerSettingsService.hasToPlay && !this.playerSettingsService.hasToPlay) {
            this.virtualPlayerSettingsService.hasToPlay = false;
            this.playerSettingsService.hasToPlay = true;
            this.activePlayerName = this.playerSettingsService.name;
        }
        this.playerSettingsService.hasToPlayObservable.next(this.playerSettingsService.hasToPlay);
        this.virtualPlayerSettingsService.hasToPlayObservable.next(this.virtualPlayerSettingsService.hasToPlay);
    }

    endTurn(): void {
        if (this.endGameVerify()) this.endGame();
        else {
            this.switchTurn();
            this.resetTimer();
        }
    }

    startTimer(timerMinute: number, timerSeconds: number): void {
        this.counter = { minute: timerMinute, second: timerSeconds };
        this.timeChange.next(this.counter);
        this.clearTimerInterval();
        this.timer = window.setInterval(() => {
            if (this.counter.second - 1 < 0) {
                this.counter.minute--;
                this.counter.second = MAX_VALUE_SECOND;
            } else {
                this.counter.second--;
            }
            this.timeChange.next(this.counter);
            if (this.counter.minute === 0 && this.counter.second === 0) {
                this.clearTimerInterval();
                this.displayMessageService.addMessageList(this.activePlayerName, 'Passer son tour');
                if (this.playerSettingsService.hasToPlay) {
                    this.endTimeObservable.next();
                }
                this.incrementTurnsPassed();
            }
        }, ONE_SECOND_MS);
    }

    clearTimerInterval(): void {
        clearInterval(this.timer);
    }

    obtainTime(times: Time): void {
        this.timeValue = times;
        this.timeChange.next(this.timeValue);
    }

    resetTimer(): void {
        this.startTimer(this.timeValue.minute, this.timeValue.second);
    }

    clearTimer() {
        this.clearTimerInterval();
        this.counter = { minute: 0, second: 0 };
        this.timeChange.next(this.counter);
        this.turnsPassedCounter = 0;
    }

    endGameVerify(): boolean {
        if (this.turnsPassedCounter === MAX_END_TURN) return true;

        /* istanbul ignore else*/
        if (this.letterReserveService.letterReserveTotalSize === 0) {
            if (this.playerSettingsService.letters.length === 0 || this.virtualPlayerSettingsService.letters.length === 0) return true;
        }
        return false;
    }

    displayEndGameStatistics(): void {
        const playerRemainingLetters = this.getLettersAsString(this.playerSettingsService.letters);
        const virtualPlayerRemainingLetters = this.getLettersAsString(this.virtualPlayerSettingsService.letters);
        this.displayMessageService.addMessageList('system', 'Fin de partie - Lettres restantes');
        this.displayMessageService.addMessageList('system', this.playerSettingsService.name + ' : ' + playerRemainingLetters);
        this.displayMessageService.addMessageList('system', this.virtualPlayerSettingsService.name + ' : ' + virtualPlayerRemainingLetters);
    }

    endGameScoreBonus(): void {
        if (this.playerSettingsService.letters.length === 0) {
            for (const tile of this.virtualPlayerSettingsService.letters) {
                this.totalLetterScore += tile.score;
            }
            this.endGamePlayerBonusObservable.next(this.totalLetterScore);
        }
        if (this.virtualPlayerSettingsService.letters.length === 0) {
            for (const tile of this.playerSettingsService.letters) {
                this.totalLetterScore += tile.score;
            }
            this.endGameVirtualPlayerObservable.next(this.totalLetterScore);
        }
        if (this.virtualPlayerSettingsService.letters.length !== 0 && this.playerSettingsService.letters.length !== 0) {
            for (const tile of this.virtualPlayerSettingsService.letters) {
                this.totalLetterScore += tile.score;
            }
            this.endGameVirtualPlayerObservable.next(-this.totalLetterScore);
        }
        if (this.virtualPlayerSettingsService.letters.length !== 0 && this.playerSettingsService.letters.length !== 0) {
            this.totalLetterScore = 0;
            for (const tile of this.playerSettingsService.letters) {
                this.totalLetterScore += tile.score;
            }
            this.endGamePlayerBonusObservable.next(-this.totalLetterScore);
        }
    }

    endGame(): void {
        this.playerSettingsService.hasToPlay = false;
        this.virtualPlayerSettingsService.hasToPlay = false;
        this.playerSettingsService.hasToPlayObservable.next(this.playerSettingsService.hasToPlay);
        this.virtualPlayerSettingsService.hasToPlayObservable.next(this.virtualPlayerSettingsService.hasToPlay);
        this.endGameScoreBonus();
        this.endGameObservable.next();
        this.displayEndGameStatistics();
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
        if (this.virtualPlayerSettingsService.score === this.playerSettingsService.score) {
            this.winnerPlayerName = 'equal';
        } else if (this.virtualPlayerSettingsService.score > this.playerSettingsService.score) {
            this.winnerPlayerName = this.virtualPlayerSettingsService.name;
        } else {
            this.winnerPlayerName = this.playerSettingsService.name;
        }
        this.winnerPlayerNameObservable.next(this.winnerPlayerName);
    }

    setPropertiesForGameConversion(turnHandlerInfos: TurnHandlerInfos, isMyTurn: boolean): void {
        this.turnsPassedCounter = turnHandlerInfos.turnsPassed;
        this.timeValue = turnHandlerInfos.timeValue;
        if (isMyTurn) return;
        this.resetTimer();
        this.turnsPassedCounter++;
        /* istanbul ignore else */
        if (this.endGameVerify()) this.endGame();
    }
}
