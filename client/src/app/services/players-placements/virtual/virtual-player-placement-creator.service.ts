import { Injectable } from '@angular/core';
import { BOARD_GAME, FOUR_LETTER_WORD, MAX_ROW_SIZE, MIDDLE_TILE_POSITION, WORD_ORIENTATION_PROBABILITY } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { BoundedTerm, Substring, Word } from '@app/classes/interfaces/word-interfaces';
import { PlayerPlacement } from '@app/classes/player-placement';
import { DictionaryService } from '@app/services/dictionary.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MessageCreatorService } from '@app/services/message-creator.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerPlacementCreatorService extends PlayerPlacement {
    terms: Word[][] = new Array();
    permutations: Map<string, string> = new Map();
    potentialPlacements: ScoredPlacement[] = new Array();
    axes: AXIS[] = new Array();

    validWords: Map<string, string> = new Map();

    constructor(
        public dictionaryService: DictionaryService,
        public messageCreatorService: MessageCreatorService,
        public placementValidationService: PlacementValidationService,
        public tileHandlerService: TileHandlerService,
        public virtualPlayerSettingsService: VirtualPlayerSettingsService,
        public objectivesValidationService: ObjectivesValidationService,
        public selectGameModeService: SelectGameModeService,
    ) {
        super(virtualPlayerSettingsService, tileHandlerService);
    }

    createPlacement(): [string, ScoredPlacement[]] | undefined {
        this.potentialPlacements = new Array();
        this.getStringPermutations();
        this.initializeAxes();
        if (this.tileHandlerService.isEmptyTile(MIDDLE_TILE_POSITION)) {
            this.createFirstWord();
        } else {
            for (const axis of this.axes) {
                if (this.findAxisPlacements(this.getWordsOnAxis(axis), axis)) break;
            }
        }
        if (this.isPotentialPlacementLength()) {
            const selectedPlacement = this.selectPlacement();
            if (this.selectGameModeService.isLOG2990ModeChosen) this.objectivesValidationService.validateObjectives(selectedPlacement);
            this.displayPlacementOnBoard(selectedPlacement);
            this.scoreObservable.next(selectedPlacement.totalScore);
            this.virtualPlayerSettingsService.rackSizeObservable.next(this.virtualPlayerSettingsService.letters.length);
            const contentToOutput = this.messageCreatorService.getContentToOutput(selectedPlacement.placement);
            return [contentToOutput, this.potentialPlacements];
        }
        if (this.selectGameModeService.isLOG2990ModeChosen) this.objectivesValidationService.resetObjectiveCounters();
        return;
    }

    isPotentialPlacementLength(): boolean {
        return this.potentialPlacements.length > 0;
    }

    selectPlacement(): ScoredPlacement {
        const index = Math.floor(Math.random() * this.potentialPlacements.length);
        return this.potentialPlacements.splice(index, 1)[0];
    }

    getStringPermutations() {
        const letterRack = this.virtualPlayerSettingsService.getVirtualPlayerRack();
        const permutationArray = this.getPermutations(letterRack);
        permutationArray.shift();
        this.permutations.clear();
        this.validWords.clear();
        for (const permutation of permutationArray) {
            let term = '';
            for (const content of permutation) term += content.toLowerCase();
            if (this.dictionaryService.contains(term)) this.validWords.set(term, term);
            this.permutations.set(term, term);
        }
    }

    getPermutations(words: string[]): string[][] {
        const permutationArray: string[][] = [[]];
        let m: string;
        let remLst;
        for (let i = 0; i < words.length; i++) {
            m = words[i];
            remLst = words.slice(0, i).concat(words.slice(i + 1));
            this.getPermutations(remLst).forEach((element) => {
                permutationArray.push([m].concat(element));
            });
        }
        return permutationArray;
    }

    createFirstWord(): void {
        const startingPositions: [AXIS, Vec2][] = new Array();
        for (const axis of this.axes) {
            if (axis === AXIS.HORIZONTAL) {
                startingPositions.push([axis, { x: 3, y: 7 }]);
                startingPositions.push([axis, { x: 7, y: 7 }]);
            } else {
                startingPositions.push([axis, { x: 7, y: 3 }]);
                startingPositions.push([axis, { x: 7, y: 7 }]);
            }
        }
        for (const term of this.validWords.keys()) {
            if (term.length <= FOUR_LETTER_WORD) {
                let middleIndex = Math.round(term.length / 2);
                if (term.length % 2 === 1) middleIndex -= 1;

                const ctrVec = { x: BOARD_GAME.CENTER_POSITION, y: BOARD_GAME.CENTER_POSITION };
                if (this.axes[0] === AXIS.HORIZONTAL) ctrVec.x -= middleIndex;
                else ctrVec.y -= middleIndex;

                if (this.addPlacementAtStartingPosition(this.axes[0], ctrVec, term)) return;
            } else {
                for (const value of startingPositions) {
                    const ctrVec = { x: value[1].x, y: value[1].y };

                    if (this.addPlacementAtStartingPosition(value[0], ctrVec, term)) return;
                }
            }
        }
        return;
    }

    addPlacementAtStartingPosition(searchedAxis: AXIS, vec: Vec2, term: string): boolean {
        const placement: Placement = {
            axis: searchedAxis,
            letters: [],
        };
        for (const letterOfWord of term) {
            placement.letters.push({ content: letterOfWord, position: { x: vec.x, y: vec.y } });
            this.tileHandlerService.incrementVector(placement.axis, vec);
        }
        return this.addPlacementToPotentialPlacements(placement);
    }

    addPlacementToPotentialPlacements(placement: Placement): boolean {
        const scoredPlacement = this.placementValidationService.getValidatedPlacement(placement);
        if (scoredPlacement) return this.addPlacementIfPredicateIsRespected(scoredPlacement);
        return false;
    }

    addPlacementIfPredicateIsRespected(scoredPlacement: ScoredPlacement): boolean {
        this.potentialPlacements.push(scoredPlacement);
        return this.potentialPlacements.length > 3;
    }

    displayPlacementOnBoard(selectedPlacement: ScoredPlacement) {
        for (const letter of selectedPlacement.placement.letters) {
            this.placeLetterFromRack(letter);
        }
        this.virtualPlayerSettingsService.refillRack();
    }

    initializeAxes() {
        this.axes = new Array();
        if (Math.random() > WORD_ORIENTATION_PROBABILITY) {
            this.axes.push(AXIS.HORIZONTAL);
            this.axes.push(AXIS.VERTICAL);
        } else {
            this.axes.push(AXIS.VERTICAL);
            this.axes.push(AXIS.HORIZONTAL);
        }
    }

    getWordsOnAxis(searchedAxis: AXIS): BoundedTerm[][] {
        const boundedTerms: BoundedTerm[][] = new Array();
        for (let y = 0; y < MAX_ROW_SIZE; y++) {
            const terms: Word[] = new Array();
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
                    terms.push({
                        axis: searchedAxis,
                        origin: this.tileHandlerService.transposeIfVertical(searchedAxis, { x, y }),
                        content: element,
                    });
                    x += element.length;
                } else {
                    x++;
                }
            }

            if (terms.length === 0) boundedTerms.push(new Array());
            else boundedTerms.push(this.getBoundedTerms(searchedAxis, terms));
        }

        return boundedTerms;
    }

    getBoundedTerms(searchedAxis: AXIS, terms: Word[]): BoundedTerm[] {
        const boundedTerms: BoundedTerm[] = new Array();
        for (const [i, term] of terms.entries()) {
            let nPrefix = 0;
            let nSuffix = 0;
            const nextTerm = terms[i + 1];
            const prevTerm = terms[i - 1];

            const currentTermOrigin = searchedAxis === AXIS.HORIZONTAL ? term.origin.x : term.origin.y;

            let previousTermOrigin = 0;
            if (prevTerm) previousTermOrigin = searchedAxis === AXIS.HORIZONTAL ? prevTerm.origin.x : prevTerm.origin.y;

            if (i === 0) {
                nPrefix = currentTermOrigin;
                nSuffix = nextTerm ? this.getCountOfEmptyTiles(searchedAxis, i, terms) : MAX_ROW_SIZE - (currentTermOrigin + term.content.length);
            } else if (i === terms.length - 1) {
                nPrefix = currentTermOrigin - (previousTermOrigin + prevTerm.content.length) - 1;
                nSuffix = MAX_ROW_SIZE - (currentTermOrigin + term.content.length);
            } else {
                nPrefix = currentTermOrigin - (previousTermOrigin + prevTerm.content.length) - 1;
                nSuffix = this.getCountOfEmptyTiles(searchedAxis, i, terms);
            }
            boundedTerms.push({ word: term, prefixTiles: nPrefix, suffixTiles: nSuffix });
        }
        return boundedTerms;
    }

    getCountOfEmptyTiles(axis: AXIS, index: number, terms: Word[]): number {
        const tempIndex = index;
        const currentWord: Word = terms[tempIndex];

        let occupiedCells = (axis === AXIS.HORIZONTAL ? currentWord.origin.x : currentWord.origin.y) + currentWord.content.length;

        for (let i = tempIndex + 1; i < terms.length; i++) {
            occupiedCells += terms[i].content.length;
        }

        return MAX_ROW_SIZE - occupiedCells;
    }

    getPrefixPlacement(placement: Placement, prefix: Substring, index: number) {
        let ctr = 0;
        for (const letter of prefix.content) {
            placement.letters.push({
                content: letter,
                position: this.tileHandlerService.transposeIfVertical(placement.axis, { x: prefix.position + ctr, y: index }),
            });
            ctr++;
        }
    }

    getSuffixPlacement(placement: Placement, suffix: Substring, index: number) {
        for (const letter of suffix.content) {
            for (let j = suffix.position; j < MAX_ROW_SIZE; j++) {
                const vec = this.tileHandlerService.transposeIfVertical(placement.axis, { x: j, y: index });
                /* istanbul ignore else */
                if (this.tileHandlerService.isEmptyTile(vec)) {
                    placement.letters.push({ content: letter, position: vec });
                    suffix.position = j + 1;
                    break;
                }
            }
        }
    }

    findAxisPlacements(boundedTerms: BoundedTerm[][], wordAxis: AXIS): boolean {
        for (let i = 0; i < MAX_ROW_SIZE; i++) {
            if (boundedTerms[i].length !== 0) {
                for (const validTerm of boundedTerms[i]) {
                    for (const arrangement of this.permutations.keys()) {
                        for (let indexArr = arrangement.length; indexArr >= 0; indexArr--) {
                            const prefixPos = indexArr;
                            const suffixPos = arrangement.length - indexArr;
                            /* istanbul ignore else */
                            if (prefixPos <= validTerm.prefixTiles && suffixPos <= validTerm.suffixTiles) {
                                const wordPrefix = arrangement.slice(0, prefixPos);
                                const wordSuffix = arrangement.slice(prefixPos);

                                if (this.dictionaryService.dictionaryPermutations.has(wordPrefix + validTerm.word.content)) {
                                    const prefix: Substring = {
                                        content: wordPrefix,
                                        position: (wordAxis === AXIS.HORIZONTAL ? validTerm.word.origin.x : validTerm.word.origin.y) - prefixPos,
                                    };

                                    const suffix: Substring = {
                                        content: wordSuffix,
                                        position:
                                            (wordAxis === AXIS.HORIZONTAL ? validTerm.word.origin.x : validTerm.word.origin.y) +
                                            validTerm.word.content.length,
                                    };

                                    const placement: Placement = {
                                        axis: wordAxis,
                                        letters: new Array(),
                                    };

                                    this.getPrefixPlacement(placement, prefix, i);
                                    this.getSuffixPlacement(placement, suffix, i);

                                    if (this.addPlacementToPotentialPlacements(placement)) return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
