import { TestBed } from '@angular/core/testing';
import { RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { Placement, ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { DictionaryService } from '@app/services/dictionary.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { MessageCreatorService } from '@app/services/message-creator.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { BeginnerPlacementCreatorService } from './beginner-placement-creator.service';

describe('BeginnerPlacementCreatorService', () => {
    let service: BeginnerPlacementCreatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BeginnerPlacementCreatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getPermutations should return the correct array of permutations', () => {
        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();
        spyOn(virtualPlayerSettingsService, 'getVirtualPlayerRack').and.returnValue(['a', 'b']);
        service.getStringPermutations();
        expect(Array.from(service.permutations.keys())).toEqual(['a', 'ab', 'b', 'ba']);
    });

    it('createFirstWord should call addPlacementAtStartingPosition one time for length is lower than 5 and 4 times for length higher than 5', () => {
        const addPlacementToPotentialPlacements = spyOn(service, 'addPlacementToPotentialPlacements');
        service.scoreRange = {
            min: 1,
            max: 50,
        };
        service.axes = new Array();
        service.axes.push(AXIS.HORIZONTAL);
        service.axes.push(AXIS.VERTICAL);
        service.validWords = new Map();
        service.validWords.set('las', 'las');
        service.validWords.set('aimer', 'aimer');
        service.createFirstWord();
        const MY_NUMBER = 5;
        expect(addPlacementToPotentialPlacements).toHaveBeenCalledTimes(MY_NUMBER);
    });

    it('createFirstWord should call addPlacementAtStartingPosition 4 times and break with four words with length lower than 5', () => {
        const addPlacementToPotentialPlacements = spyOn(service, 'addPlacementToPotentialPlacements');
        service.scoreRange = {
            min: 1,
            max: 50,
        };
        service.potentialPlacements = new Array();
        service.axes = new Array();
        service.axes.push(AXIS.VERTICAL);
        service.axes.push(AXIS.HORIZONTAL);
        service.validWords = new Map();
        service.validWords.set('las', 'las');
        service.validWords.set('la', 'la');
        service.validWords.set('les', 'les');
        service.validWords.set('le', 'le');
        service.createFirstWord();
        const MY_NUMBER = 4;
        expect(addPlacementToPotentialPlacements).toHaveBeenCalledTimes(MY_NUMBER);
    });

    it('createFirstWord should call break if addPlacementToPotentialPlacements return true for word length lower than 5', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();
        const addPlacementToPotentialPlacements = spyOn(service, 'addPlacementToPotentialPlacements').and.returnValue(true);
        service.scoreRange = {
            min: 1,
            max: 50,
        };
        service.potentialPlacements = new Array();
        service.axes = new Array();
        service.axes.push(AXIS.VERTICAL);
        service.axes.push(AXIS.HORIZONTAL);
        service.validWords = new Map();
        service.validWords.set('la', 'la');
        service.createFirstWord();
        expect(addPlacementToPotentialPlacements).toHaveBeenCalledTimes(1);
    });

    it('createFirstWord should call break if addPlacementToPotentialPlacements return true for word length higher than 5', () => {
        const addPlacementToPotentialPlacements = spyOn(service, 'addPlacementToPotentialPlacements').and.returnValue(true);
        service.scoreRange = {
            min: 1,
            max: 50,
        };
        service.potentialPlacements = new Array();
        service.axes = new Array();
        service.axes.push(AXIS.VERTICAL);
        service.axes.push(AXIS.HORIZONTAL);
        service.validWords = new Map();
        service.validWords.set('aimer', 'aimer');
        service.createFirstWord();
        expect(addPlacementToPotentialPlacements).toHaveBeenCalledTimes(1);
    });

    it('addPlacementAtStartingPosition should call addPlacementToPotentialPlacements and add placement to potential placements', () => {
        const addPlacementToPotentialPlacements = spyOn(service, 'addPlacementToPotentialPlacements');
        service.addPlacementAtStartingPosition(AXIS.HORIZONTAL, { x: 0, y: 0 }, 'la');
        expect(addPlacementToPotentialPlacements).toHaveBeenCalled();
    });

    it('createPlacement should call createFirstWord when middle tile is empty', () => {
        const tileHandlerService = TestBed.inject(TileHandlerService);
        spyOn(tileHandlerService, 'isEmptyTile').and.returnValue(true);
        spyOn(service, 'getExpectedWordScore').and.returnValue({ min: 0, max: 0 });
        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        virtualPlayerSettingsService.letters = [];
        const createFirstWord = spyOn(service, 'createFirstWord');
        service.createPlacement();
        expect(createFirstWord).toHaveBeenCalledTimes(1);
    });

    it('createPlacement should call getContentToOutput', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();
        spyOn(service, 'getExpectedWordScore').and.returnValue({ min: 0, max: 20 });
        const messageCreatorService = TestBed.inject(MessageCreatorService);
        const getContentToOutput = spyOn(messageCreatorService, 'getContentToOutput');

        const tileHandlerService = TestBed.inject(TileHandlerService);
        tileHandlerService.placeLetter({ content: 'a', position: { x: 7, y: 7 } });

        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        virtualPlayerSettingsService.letters = [{ letter: 'L', score: 1 }];

        service.createPlacement();
        expect(getContentToOutput).toHaveBeenCalled();
    });

    it('createPlacement should break when four possibilities are found in one axist', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();
        spyOn(service, 'getExpectedWordScore').and.returnValue({ min: 0, max: 20 });
        const tileHandlerService = TestBed.inject(TileHandlerService);
        tileHandlerService.placeLetter({ content: 'l', position: { x: 7, y: 7 } });

        const virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        virtualPlayerSettingsService.letters = [
            { letter: 'A', score: 1 },
            { letter: 'E', score: 1 },
            { letter: 'U', score: 1 },
            { letter: 'S', score: 1 },
        ];
        service.createPlacement();
        expect(service.potentialPlacements.length).toEqual(3);
    });

    it('getWordsOnAxis should find three terms in same row', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();

        const tileHandlerService = TestBed.inject(TileHandlerService);
        tileHandlerService.placeLetter({ content: 'b', position: { x: 5, y: 7 } });

        tileHandlerService.placeLetter({ content: 'a', position: { x: 7, y: 7 } });
        tileHandlerService.placeLetter({ content: 'a', position: { x: 8, y: 7 } });

        tileHandlerService.placeLetter({ content: 'c', position: { x: 10, y: 7 } });

        const middleRow = service.getWordsOnAxis(AXIS.HORIZONTAL)[7];
        expect(middleRow).toEqual([
            { prefixTiles: 5, word: { axis: AXIS.HORIZONTAL, origin: { x: 5, y: 7 }, content: 'b' }, suffixTiles: 6 },
            { prefixTiles: 0, word: { axis: AXIS.HORIZONTAL, origin: { x: 7, y: 7 }, content: 'aa' }, suffixTiles: 5 },
            { prefixTiles: 0, word: { axis: AXIS.HORIZONTAL, origin: { x: 10, y: 7 }, content: 'c' }, suffixTiles: 4 },
        ]);
    });

    it('getWordsOnAxis should find three terms in same column', () => {
        const dictionaryService = TestBed.inject(DictionaryService);
        dictionaryService.createDefaultDictionary();

        const tileHandlerService = TestBed.inject(TileHandlerService);
        tileHandlerService.placeLetter({ content: 'b', position: { x: 7, y: 5 } });

        tileHandlerService.placeLetter({ content: 'a', position: { x: 7, y: 7 } });
        tileHandlerService.placeLetter({ content: 'a', position: { x: 7, y: 8 } });

        tileHandlerService.placeLetter({ content: 'c', position: { x: 7, y: 10 } });

        const middleRow = service.getWordsOnAxis(AXIS.VERTICAL)[7];
        expect(middleRow).toEqual([
            { prefixTiles: 5, word: { axis: AXIS.VERTICAL, origin: { x: 7, y: 5 }, content: 'b' }, suffixTiles: 6 },
            { prefixTiles: 0, word: { axis: AXIS.VERTICAL, origin: { x: 7, y: 7 }, content: 'aa' }, suffixTiles: 5 },
            { prefixTiles: 0, word: { axis: AXIS.VERTICAL, origin: { x: 7, y: 10 }, content: 'c' }, suffixTiles: 4 },
        ]);
    });

    it('initializeAxes should set axes properly if horizontal probability is found', () => {
        const upperHalfProbability = 0.6;
        spyOn(Math, 'random').and.returnValue(upperHalfProbability);
        service.initializeAxes();
        expect(service.axes).toEqual([AXIS.HORIZONTAL, AXIS.VERTICAL]);
    });

    it('initializeAxes should set axes properly if vertical probability is found', () => {
        const lowerHalfProbability = 0.4;
        spyOn(Math, 'random').and.returnValue(lowerHalfProbability);
        service.initializeAxes();
        expect(service.axes).toEqual([AXIS.VERTICAL, AXIS.HORIZONTAL]);
    });

    it('getExpectedWordScore should return low score range', () => {
        const lowRangeRandomValue = 20;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(lowRangeRandomValue);
        const expectedScoreRange = { min: 1, max: 6 };
        expect(service.getExpectedWordScore()).toEqual(expectedScoreRange);
    });

    it('getExpectedWordScore should return medium score range', () => {
        const mediumRangeRandomValue = 50;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(mediumRangeRandomValue);
        const expectedScoreRange = { min: 7, max: 12 };
        expect(service.getExpectedWordScore()).toEqual(expectedScoreRange);
    });

    it('getExpectedWordScore should return high score range', () => {
        const highRangeRandomValue = 75;
        spyOn(RANDOM_NUMBER_GENERATOR, 'GENERATE_RANDOM_NUMBER').and.returnValue(highRangeRandomValue);
        const expectedScoreRange = { min: 13, max: 18 };
        expect(service.getExpectedWordScore()).toEqual(expectedScoreRange);
    });

    it('addPlacementIfPredicateIsRespected should return false if scorePlacement is not in score range', () => {
        const fakePlacement: Placement = {
            axis: AXIS.VERTICAL,
            letters: [
                { content: 'l', position: { x: 7, y: 7 } },
                { content: 'a', position: { x: 7, y: 8 } },
            ],
        };

        const scoredPlacement: ScoredPlacement = {
            placement: fakePlacement,
            words: [
                {
                    word: {
                        axis: AXIS.VERTICAL,
                        origin: { x: 7, y: 7 },
                        content: '4',
                    },
                    score: 4,
                },
            ],
            totalScore: 4,
        };
        service.addPlacementIfPredicateIsRespected(scoredPlacement);
        expect(service.addPlacementIfPredicateIsRespected(scoredPlacement)).toBeFalse();
    });
});
