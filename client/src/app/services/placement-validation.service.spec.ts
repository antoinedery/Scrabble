import { TestBed } from '@angular/core/testing';
import { TEMP_DICTIONARY } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { BonusType } from '@app/classes/enums/board-game-enums';
import { BonusLetter } from '@app/classes/interfaces/letter-interfaces';
import { Placement, ScoredPlacement, UnscoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { ScoredWord, UnscoredWord } from '@app/classes/interfaces/word-interfaces';
import { DictionaryService } from '@app/services/dictionary.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { PlayAreaService } from './play-area.service';

const verticalPlacement: Placement = {
    axis: AXIS.VERTICAL,
    letters: [
        { content: 'a', position: { x: 13, y: 9 } },
        { content: 'l', position: { x: 13, y: 10 } },
        { content: 'l', position: { x: 13, y: 11 } },
        { content: 'e', position: { x: 13, y: 12 } },
        { content: 's', position: { x: 13, y: 13 } },
    ],
};

const sevenLettersPlacement: Placement = {
    axis: AXIS.HORIZONTAL,
    letters: [
        { content: 'e', position: { x: 7, y: 13 } },
        { content: 'n', position: { x: 8, y: 13 } },
        { content: 'v', position: { x: 9, y: 13 } },
        { content: 'i', position: { x: 10, y: 13 } },
        { content: 'r', position: { x: 11, y: 13 } },
        { content: 'o', position: { x: 12, y: 13 } },
        { content: 'n', position: { x: 13, y: 13 } },
    ],
};

describe('PlacementValidationService', () => {
    let service: PlacementValidationService;
    let tileHandlerService: TileHandlerService;
    let playAreaService: PlayAreaService;
    let dictionaryService: DictionaryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlacementValidationService);
        tileHandlerService = TestBed.inject(TileHandlerService);
        dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDictionary(TEMP_DICTIONARY);
        playAreaService = TestBed.inject(PlayAreaService);
        playAreaService.initialiseBoardCaseList();
    });

    it('getValidatedPlacement should call getScoredPlacement if unscoredPlacement is valid', () => {
        const getScoredPlacement = spyOn(service, 'getScoredPlacement');
        spyOn(service, 'getUnscoredPlacement').and.returnValue({
            placement: {
                axis: AXIS.VERTICAL,
                letters: [],
            },
            words: [],
        });
        service.getValidatedPlacement({
            axis: AXIS.VERTICAL,
            letters: [],
        });
        expect(getScoredPlacement).toHaveBeenCalled();
    });
    it('getValidatedPlacement should not call getScoredPlacement if unscoredPlacement is undefined', () => {
        const getScoredPlacement = spyOn(service, 'getScoredPlacement');
        spyOn(service, 'getUnscoredPlacement').and.returnValue(undefined);
        expect(
            service.getValidatedPlacement({
                axis: AXIS.VERTICAL,
                letters: [],
            }),
        ).toBeUndefined();
        expect(getScoredPlacement).not.toHaveBeenCalled();
    });
    it('should return the correct ScoredPlacement with an added bonus of 50 points for a placement of 7 letters', () => {
        const unscoredPlacement: UnscoredPlacement = {
            placement: sevenLettersPlacement,
            words: [
                {
                    word: {
                        axis: AXIS.HORIZONTAL,
                        origin: { x: 7, y: 13 },
                        content: 'environ',
                    },
                    bonuses: [],
                },
                {
                    word: {
                        axis: AXIS.VERTICAL,
                        origin: { x: 7, y: 12 },
                        content: 'le',
                    },
                    bonuses: [],
                },
            ],
        };
        const scoredPlacement: ScoredPlacement = {
            placement: sevenLettersPlacement,
            words: [
                {
                    word: {
                        axis: AXIS.HORIZONTAL,
                        origin: { x: 7, y: 13 },
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
        expect(service.getScoredPlacement(unscoredPlacement)).toEqual(scoredPlacement);
    });
    it('should modify the totalScore and words properties of ScoredPlacement correctly for a list of UnscoredWord', () => {
        const unscoredWords: UnscoredWord[] = [
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 6, y: 9 },
                    content: 'negligea',
                },
                bonuses: [{ content: 'a', bonus: { type: BonusType.LETTER, value: 3 } }],
            },
            {
                word: {
                    axis: AXIS.HORIZONTAL,
                    origin: { x: 5, y: 13 },
                    content: 'meurtries',
                },
                bonuses: [{ content: 's', bonus: { type: BonusType.WORD, value: 2 } }],
            },
            {
                word: {
                    axis: AXIS.VERTICAL,
                    origin: { x: 13, y: 9 },
                    content: 'alles',
                },
                bonuses: [
                    { content: 'a', bonus: { type: BonusType.LETTER, value: 3 } },
                    { content: 's', bonus: { type: BonusType.WORD, value: 2 } },
                ],
            },
        ];
        const scoredPlacement: ScoredPlacement = {
            placement: verticalPlacement,
            words: new Array(),
            totalScore: 0,
        };
        service.addWordsScores(unscoredWords, scoredPlacement);
        const expectedTotalScore = 46;
        expect(scoredPlacement.totalScore).toEqual(expectedTotalScore);
    });
    it('should modify the .score property of a ScoredWord correctly for a word bonus and a letter bonus', () => {
        const scoredWord: ScoredWord = {
            word: {
                axis: AXIS.HORIZONTAL,
                origin: { x: 6, y: 9 },
                content: 'negligea',
            },
            score: 10,
        };
        const bonifiedLetter: BonusLetter[] = [
            {
                content: 'e',
                bonus: { type: BonusType.WORD, value: 3 },
            },
            {
                content: 'a',
                bonus: { type: BonusType.LETTER, value: 2 },
            },
        ];
        service.addWordBonuses(scoredWord, bonifiedLetter);
        const expectedWordScore = 33;
        expect(scoredWord.score).toEqual(expectedWordScore);
    });
    it('should modify the .score property of a ScoredWord correctly for a letter bonus', () => {
        const scoredWord: ScoredWord = {
            word: {
                axis: AXIS.HORIZONTAL,
                origin: { x: 6, y: 9 },
                content: 'negligea',
            },
            score: 10,
        };
        const bonifiedLetter: BonusLetter = {
            content: 'e',
            bonus: { type: BonusType.LETTER, value: 2 },
        };
        service.addLetterBonus(scoredWord, bonifiedLetter);
        const expectedWordScore = 11;
        expect(scoredWord.score).toEqual(expectedWordScore);
    });
    it('getUnscoredPlacement should return correct unscored placement if placement is valid', () => {
        tileHandlerService.placeLetter({ content: 'l', position: { x: 1, y: 0 } });
        const placedLetter = { content: 'e', position: { x: 2, y: 0 } };
        const placement = {
            axis: AXIS.HORIZONTAL,
            letters: [placedLetter],
        };
        expect(service.getUnscoredPlacement(placement)).toEqual({
            placement: {
                axis: AXIS.HORIZONTAL,
                letters: [placedLetter],
            },
            words: [
                {
                    word: {
                        axis: AXIS.HORIZONTAL,
                        origin: { x: 1, y: 0 },
                        content: 'le',
                    },
                    bonuses: [],
                },
            ],
        });
    });
    it('getUnscoredPlacement should return undefined if placement is invalid', () => {
        tileHandlerService.placeLetter({ content: 'z', position: { x: 0, y: 0 } });
        const placedLetter = { content: 'e', position: { x: 1, y: 0 } };
        const placement = {
            axis: AXIS.VERTICAL,
            letters: [placedLetter],
        };
        expect(service.getUnscoredPlacement(placement)).toBeUndefined();
    });
    it('getUnscoredPlacement should return undefined if no words are founds', () => {
        const placement = {
            axis: AXIS.VERTICAL,
            letters: [{ content: 'e', position: { x: 0, y: 0 } }],
        };
        expect(service.getUnscoredPlacement(placement)).toBeUndefined();
    });
    it('getAxisWords should return true if word is found on same axis', () => {
        tileHandlerService.placeLetter({ content: 'l', position: { x: 0, y: 1 } });
        const placedLetter = { content: 'e', position: { x: 0, y: 2 } };
        service.placement = {
            axis: AXIS.VERTICAL,
            letters: [placedLetter],
        };
        service.initialiseContainers();
        service.addLetter(placedLetter);

        expect(service.getAxisWords(AXIS.VERTICAL, new Array())).toBeTrue();
    });
    it('getAxisWords should return true if word is found on opposite axis', () => {
        tileHandlerService.placeLetter({ content: 'l', position: { x: 2, y: 1 } });
        tileHandlerService.placeLetter({ content: 's', position: { x: 3, y: 2 } });
        const placedLetter = { content: 'e', position: { x: 2, y: 2 } };
        service.placement = {
            axis: AXIS.VERTICAL,
            letters: [placedLetter],
        };
        service.initialiseContainers();
        expect(service.getAxisWords(AXIS.HORIZONTAL, new Array())).toBeTrue();
    });
    it('getTerm should return the correct word', () => {
        tileHandlerService.placeLetter({ content: 'l', position: { x: 0, y: 1 } });
        tileHandlerService.placeLetter({ content: 's', position: { x: 0, y: 3 } });
        const placedLetter = { content: 'e', position: { x: 0, y: 2 } };
        service.placement = {
            axis: AXIS.VERTICAL,
            letters: [placedLetter],
        };
        service.letterContainer = new Map();
        service.addLetter(placedLetter);
        expect(service.getTerm(AXIS.VERTICAL, { x: 0, y: 2 })).toEqual({
            axis: AXIS.VERTICAL,
            content: 'les',
            origin: { x: 0, y: 1 },
        });
    });
    it('isInPlacement should return the correct string at the position if horizontal', () => {
        const inputVec = { x: 0, y: 0 };
        const placedLetter = { content: '', position: inputVec };
        service.placement = {
            axis: AXIS.HORIZONTAL,
            letters: [placedLetter],
        };
        service.initialiseContainers();
        service.addLetter(placedLetter);
        expect(service.isInPlacement(AXIS.HORIZONTAL, inputVec)).toEqual('');
    });
    it('isInPlacement should return the correct string at the position if vertical', () => {
        const inputVec = { x: 0, y: 0 };
        const placedLetter = { content: '', position: inputVec };
        service.placement = {
            axis: AXIS.VERTICAL,
            letters: [placedLetter],
        };
        service.initialiseContainers();
        service.addLetter(placedLetter);
        expect(service.isInPlacement(AXIS.VERTICAL, inputVec)).toEqual('');
    });
    it('isInPlacement should return undefined if position is not in map', () => {
        const inputVec = { x: 0, y: 0 };
        service.initialiseContainers();
        service.placement = {
            axis: AXIS.VERTICAL,
            letters: [],
        };
        expect(service.isInPlacement(AXIS.VERTICAL, inputVec)).toBeUndefined();
    });
    it('should return the correct array of bonuses for a placed letter of a placement for which the axis is the same as the searched axis', () => {
        const placedLetter = { content: '', position: { x: 0, y: 0 } };
        service.placement = {
            axis: AXIS.HORIZONTAL,
            letters: [placedLetter],
        };
        service.bonusesContainer = new Map();
        const bonusType = { type: BonusType.WORD, value: 0 };
        const bonusLetter = { content: '', bonus: bonusType };
        service.bonusesContainer.set(placedLetter, bonusLetter);
        expect(service.getWordBonuses(AXIS.HORIZONTAL, placedLetter)).toEqual([bonusLetter]);
    });
    it('getWordBonuses should return the correct bonus for a placement for which the axis is not the same as the searched axis', () => {
        const placedLetter = { content: '', position: { x: 0, y: 0 } };
        service.placement = {
            axis: AXIS.HORIZONTAL,
            letters: [placedLetter],
        };
        service.bonusesContainer = new Map();
        const bonusType = { type: BonusType.WORD, value: 0 };
        const bonusLetter = { content: '', bonus: bonusType };
        service.bonusesContainer.set(placedLetter, bonusLetter);
        expect(service.getWordBonuses(AXIS.VERTICAL, placedLetter)).toEqual([bonusLetter]);
    });

    it('getWordBonuses should return an empty bonus array for a placed letter of a placement for which there are no bonuses', () => {
        service.bonusesContainer = new Map();
        service.placement = {
            axis: AXIS.HORIZONTAL,
            letters: [],
        };
        expect(service.getWordBonuses(AXIS.VERTICAL, { content: '', position: { x: 0, y: 0 } })).toEqual([]);
    });
});
