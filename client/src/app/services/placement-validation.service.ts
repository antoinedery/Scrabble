import { Injectable } from '@angular/core';
import { BONUS_MAP, MAX_PLACEMENT_BONUS, LETTERS_RACK_SIZE, MAX_ROW_SIZE } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { BonusType } from '@app/classes/enums/board-game-enums';
import { Bonus, BonusLetter, BoundedLetter, PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { Placement, UnscoredPlacement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { Word, UnscoredWord, ScoredWord } from '@app/classes/interfaces/word-interfaces';
import { DictionaryService } from '@app/services/dictionary.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { TileHandlerService } from '@app/services/tile-handler.service';

@Injectable({
    providedIn: 'root',
})
export class PlacementValidationService {
    placement: Placement;
    axes: AXIS[];
    bonusesContainer: Map<PlacedLetter, BonusLetter>;
    letterContainer: Map<number, BoundedLetter>;

    constructor(
        private dictionaryService: DictionaryService,
        private letterReserveService: LetterReserveService,
        private tileHandlerService: TileHandlerService,
    ) {}

    initialiseVariables(placement: Placement) {
        this.initialisePlacement(placement);
        this.initialiseContainers();
        this.initialiseAxes();
    }

    initialisePlacement(placement: Placement) {
        this.placement = placement;
    }

    initialiseContainers() {
        this.bonusesContainer = new Map();
        this.letterContainer = new Map();
    }

    initialiseAxes() {
        this.axes = new Array();
        if (this.placement.axis === AXIS.HORIZONTAL) {
            this.axes.push(AXIS.VERTICAL);
            this.axes.push(AXIS.HORIZONTAL);
        } else {
            this.axes.push(AXIS.HORIZONTAL);
            this.axes.push(AXIS.VERTICAL);
        }
    }

    getValidatedPlacement(placement: Placement): ScoredPlacement | undefined {
        const unscoredPlacement = this.getUnscoredPlacement(placement);

        if (unscoredPlacement) return this.getScoredPlacement(unscoredPlacement);
        return;
    }

    getScoredPlacement(unscoredPlacement: UnscoredPlacement): ScoredPlacement {
        const scoredPlacement: ScoredPlacement = {
            placement: unscoredPlacement.placement,
            words: new Array(),
            totalScore: 0,
        };

        this.addWordsScores(unscoredPlacement.words, scoredPlacement);

        if (scoredPlacement.placement.letters.length === LETTERS_RACK_SIZE) {
            scoredPlacement.totalScore += MAX_PLACEMENT_BONUS;
        }
        return scoredPlacement;
    }

    addWordsScores(unscoredWords: UnscoredWord[], scoredPlacement: ScoredPlacement) {
        for (const unscoredWord of unscoredWords) {
            const defaultWordScore = this.dictionaryService.getValue(unscoredWord.word.content);
            /* istanbul ignore else*/
            if (defaultWordScore) {
                const scoredWord: ScoredWord = {
                    word: unscoredWord.word,
                    score: defaultWordScore,
                };

                this.addWordBonuses(scoredWord, unscoredWord.bonuses);

                scoredPlacement.totalScore += scoredWord.score;
                scoredPlacement.words.push(scoredWord);
            }
        }
    }

    addWordBonuses(scoredWord: ScoredWord, bonuses: BonusLetter[]) {
        let wordBonus = 1;
        for (const bonifiedLetter of bonuses) {
            if (bonifiedLetter.bonus.type === BonusType.LETTER) {
                this.addLetterBonus(scoredWord, bonifiedLetter);
            } else wordBonus *= bonifiedLetter.bonus.value;
        }
        scoredWord.score *= wordBonus;
    }

    addLetterBonus(scoredWord: ScoredWord, bonifiedLetter: BonusLetter) {
        const letterValue = this.letterReserveService.getLetterScore(bonifiedLetter.content.toUpperCase());
        /* istanbul ignore else*/
        if (letterValue) {
            scoredWord.score -= letterValue;
            scoredWord.score += letterValue * bonifiedLetter.bonus.value;
        }
    }

    getUnscoredPlacement(placement: Placement): UnscoredPlacement | undefined {
        this.initialiseVariables(placement);

        const unscoredWords: UnscoredWord[] = new Array();
        for (const searchedAxis of this.axes) {
            if (!this.getAxisWords(searchedAxis, unscoredWords)) return;
        }
        if (unscoredWords.length === 0) return;
        return {
            placement: this.placement,
            words: unscoredWords,
        };
    }

    addLetter(letter: PlacedLetter) {
        const letterToPlace = letter.content.toLowerCase();
        if (this.placement.axis === AXIS.HORIZONTAL)
            this.letterContainer.set(letter.position.x, { position: letter.position.y, content: letterToPlace });
        else this.letterContainer.set(letter.position.y, { position: letter.position.x, content: letterToPlace });
    }

    addBonus(letter: PlacedLetter) {
        const bonusValue = this.tileHandlerService.getBonusOnTile(letter.position);
        const bonusType: Bonus = BONUS_MAP.get(bonusValue);
        if (bonusType) this.bonusesContainer.set(letter, { content: letter.content, bonus: bonusType });
    }

    setContainers(axis: AXIS, letter: PlacedLetter) {
        if (axis !== this.placement.axis) {
            this.addLetter(letter);
            this.addBonus(letter);
        }
    }

    getAxisWords(searchedAxis: AXIS, words: UnscoredWord[]): boolean {
        for (const letter of this.placement.letters) {
            this.setContainers(searchedAxis, letter);
            const term: Word = this.getTerm(searchedAxis, letter.position);
            /* istanbul ignore else*/
            if (term.content.length > 1) {
                /* istanbul ignore else*/
                if (this.dictionaryService.contains(term.content)) {
                    words.push({
                        word: term,
                        bonuses: this.getWordBonuses(searchedAxis, letter),
                    });
                    /* istanbul ignore else*/
                    if (this.placement.axis === searchedAxis) return true;
                } else return false;
            }
        }
        return true;
    }

    getTerm(searchedAxis: AXIS, vec: Vec2): Word {
        const tOrigin = this.tileHandlerService.transposeIfVertical(searchedAxis, { x: vec.x, y: vec.y });
        const tSearched = { x: tOrigin.x - 1, y: tOrigin.y };
        while (tSearched.x >= 0) {
            /* istanbul ignore else*/
            if (!this.tileHandlerService.getTransposedTile(searchedAxis, tSearched)) break;
            tOrigin.x = tSearched.x--;
        }

        let letterContent = '';
        tSearched.x = tOrigin.x;

        while (tSearched.x < MAX_ROW_SIZE) {
            const letterInPlacement = this.isInPlacement(searchedAxis, tSearched);
            if (letterInPlacement) letterContent += letterInPlacement;
            else {
                const letterInBoard = this.tileHandlerService.getTransposedTile(searchedAxis, tSearched);
                if (!letterInBoard) break;
                letterContent += letterInBoard;
            }
            tSearched.x++;
        }

        return {
            axis: searchedAxis,
            content: letterContent,
            origin: this.tileHandlerService.transposeIfVertical(searchedAxis, tOrigin),
        };
    }

    isInPlacement(axis: AXIS, inputVec: Vec2): string | undefined {
        const vec = this.tileHandlerService.transposeIfVertical(axis, inputVec);
        let letterInContainer;
        if (this.placement.axis === AXIS.HORIZONTAL) {
            letterInContainer = this.letterContainer.get(vec.x);
            /* istanbul ignore else*/
            if (letterInContainer && letterInContainer.position === vec.y) return letterInContainer.content;
        } else {
            letterInContainer = this.letterContainer.get(vec.y);
            /* istanbul ignore else*/
            if (letterInContainer && letterInContainer.position === vec.x) return letterInContainer.content;
        }
        return;
    }

    getWordBonuses(searchedAxis: AXIS, placedLetter: PlacedLetter): BonusLetter[] {
        /* istanbul ignore else*/
        if (searchedAxis === this.placement.axis) {
            return Array.from(this.bonusesContainer.values());
        }

        const bonusInContainer = this.bonusesContainer.get(placedLetter);
        /* istanbul ignore else*/
        if (bonusInContainer) return [bonusInContainer];
        return new Array();
    }
}
