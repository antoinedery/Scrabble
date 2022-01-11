import { Injectable } from '@angular/core';
import {
    INPUT_OBJECTIVE,
    MAX_ROW_SIZE,
    NOT_FOUND,
    OBJECTIVE_BOUNDARIES,
    ONE_MINUTE,
    ONE_SECOND_MS,
    THREE_SECONDS_MS,
} from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { BonusValue } from '@app/classes/enums/board-game-enums';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { Subject } from 'rxjs';
import { DisplayMessageService } from './display-message.service';
import { PlayAreaService } from './play-area.service';
import { TileHandlerService } from './tile-handler.service';
import { TurnHandlerService } from './turn-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ObjectivesValidationService {
    currentScoredPlacement: ScoredPlacement;
    currentTimerValue: number = 0;
    gameTimerValue: number = 0;
    objective5CounterRealPlayer: number = 0;
    objective5CounterVirtualPlayer: number = 0;
    objective8CounterRealPlayer: number = 0;
    objective8CounterVirtualPlayer: number = 0;
    validation: { [key: string]: () => boolean };
    realPlayerBonusObservable: Subject<number> = new Subject<number>();
    virtualPlayerBonusObservable: Subject<number> = new Subject<number>();

    wordsOnBoard: Map<string, number> = new Map();
    axes: AXIS[] = new Array();

    constructor(
        private playAreaService: PlayAreaService,
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private turnHandlerService: TurnHandlerService,
        private displayMessageService: DisplayMessageService,
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

    validateObjectives(scoredPlacement: ScoredPlacement, currentTimerValue?: number): void {
        this.currentScoredPlacement = scoredPlacement;
        this.gameTimerValue = (this.turnHandlerService.timeValue.minute * ONE_MINUTE + this.turnHandlerService.timeValue.second) * ONE_SECOND_MS;
        if (currentTimerValue) this.currentTimerValue = currentTimerValue;
        else this.currentTimerValue = this.gameTimerValue - THREE_SECONDS_MS;
        if (this.virtualPlayerSettingsService.hasToPlay) {
            this.verifyPrivateVirtualPlayerObjective();
        } else {
            this.verifyPrivateRealPlayerObjective();
        }

        this.verifyPublicObjectives();
    }

    verifyPrivateVirtualPlayerObjective(): void {
        for (const objective of this.virtualPlayerSettingsService.privateObjective) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.virtualPlayerBonusObservable.next(objective[1].score);
                    this.displayObjectiveConfirmationMessage(true, true, objective[1].description, objective[1].score);
                }
            }
        }
    }

    verifyPrivateRealPlayerObjective(): void {
        for (const objective of this.playerSettingsService.privateObjective) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.playerSettingsService.privatePlayerObjectiveObservable.next(this.playerSettingsService.privateObjective);
                    this.realPlayerBonusObservable.next(objective[1].score);
                    this.displayObjectiveConfirmationMessage(false, true, objective[1].description, objective[1].score);
                }
            }
        }
    }

    verifyPublicObjectives(): void {
        for (const objective of this.playerSettingsService.publicObjectives) {
            /* istanbul ignore else */
            if (!objective[1].fullfilled) {
                const functionToCall = 'validate'.concat(objective[0].toString());
                /* istanbul ignore else */
                if (this.callAdequateValidationFunction(functionToCall)) {
                    objective[1].fullfilled = true;
                    this.playerSettingsService.publicObjectivesObservable.next(this.playerSettingsService.publicObjectives);
                    if (this.virtualPlayerSettingsService.hasToPlay) {
                        this.virtualPlayerBonusObservable.next(objective[1].score);
                        this.displayObjectiveConfirmationMessage(true, false, objective[1].description, objective[1].score);
                    } else {
                        this.realPlayerBonusObservable.next(objective[1].score);
                        this.displayObjectiveConfirmationMessage(false, false, objective[1].description, objective[1].score);
                    }
                }
            }
        }
    }

    displayObjectiveConfirmationMessage(isPlayerTheVirtualPlayer: boolean, isObjectivePrivate: boolean, description: string, score: number): void {
        let fullMsg = '';

        if (isPlayerTheVirtualPlayer) fullMsg = 'Le joueur virtuel a réussi';
        else fullMsg = 'Vous avez réussi';
        if (isObjectivePrivate) fullMsg += " l'objectif privé suivant : ";
        else fullMsg += " l'objectif public suivant : ";

        fullMsg += description + '. + ' + score.toString() + ' points bonus !' + ' Félicitations !';
        this.displayMessageService.addMessageList('system', fullMsg);
    }

    validateObjective1(): boolean {
        this.readBoard();
        for (const element of this.currentScoredPlacement.words) {
            const temp = this.wordsOnBoard.get(element.word.content);
            if (temp) {
                /* istanbul ignore else*/
                if (temp > 1) return true;
            }
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
        if (this.virtualPlayerSettingsService.hasToPlay) {
            this.objective5CounterVirtualPlayer++;
            return this.objective5CounterVirtualPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_HARD;
        } else {
            this.objective5CounterRealPlayer++;
            return this.objective5CounterRealPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_HARD;
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
        if (this.virtualPlayerSettingsService.hasToPlay) {
            if (this.validate8pointsWordCreated()) this.objective8CounterVirtualPlayer++;
            else this.objective8CounterVirtualPlayer = 0;
            return this.objective8CounterVirtualPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_MEDIUM;
        } else {
            if (this.validate8pointsWordCreated()) this.objective8CounterRealPlayer++;
            else this.objective8CounterRealPlayer = 0;
            return this.objective8CounterRealPlayer === OBJECTIVE_BOUNDARIES.MAX_OCC_MOVES_MEDIUM;
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
        if (this.virtualPlayerSettingsService.hasToPlay) {
            this.objective5CounterVirtualPlayer = 0;
            this.objective8CounterVirtualPlayer = 0;
        } else {
            this.objective5CounterRealPlayer = 0;
            this.objective8CounterRealPlayer = 0;
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
                    if (element.length > 1) {
                        let temp = this.wordsOnBoard.get(element);
                        if (temp) this.wordsOnBoard.set(element, ++temp);
                        else this.wordsOnBoard.set(element, 1);
                    }
                    x += element.length;
                } else {
                    x++;
                }
            }
        }
    }
}
