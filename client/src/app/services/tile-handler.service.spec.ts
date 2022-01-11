import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';
import { BonusValue, Color, Text } from '@app/classes/enums/board-game-enums';
import { PlayAreaService } from '@app/services/play-area.service';
import { TileHandlerService } from '@app/services/tile-handler.service';

describe('TileHandlerService', () => {
    let service: TileHandlerService;
    let playAreaService: PlayAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TileHandlerService);
        playAreaService = TestBed.inject(PlayAreaService);
    });

    it('addBorder should push vector in playArea placedLetters', () => {
        const vec = { x: 0, y: 0 };
        service.addBorder(vec);
        expect(playAreaService.placedLettersCoordinates).toEqual([vec]);
    });

    it('popBorder should remove last vector in playArea placedLetters', () => {
        const vec = { x: 0, y: 0 };
        playAreaService.placedLettersCoordinates = [vec];
        service.popBorder();
        expect(playAreaService.placedLettersCoordinates).toEqual([]);
    });

    it('resetBorders should remove all vectors in playArea placedLetters', () => {
        const vec1 = { x: 0, y: 0 };
        const vec2 = { x: 0, y: 1 };
        playAreaService.placedLettersCoordinates = [vec1, vec2];
        service.resetBorders();
        expect(playAreaService.placedLettersCoordinates).toEqual([]);
    });

    it('isEmptyTile should be true if empty at position', () => {
        const vec = { x: 0, y: 0 };
        expect(service.isEmptyTile(vec)).toBeTrue();
    });

    it('getLetterOnTile should return undefined if empty at position', () => {
        const vec = { x: 0, y: 0 };
        expect(service.getLetterOnTile(vec)).toBeUndefined();
    });

    it('getLetterOnTile should return undefined if empty at position', () => {
        spyOn(service, 'isEmptyTile').and.returnValue(false);
        const vec = { x: 0, y: 0 };
        expect(service.getLetterOnTile(vec)).toEqual('');
    });

    it('getTransposedTile should return correct letter if empty at position', () => {
        service.placeLetter({
            content: 'a',
            position: { x: 1, y: 0 },
        });
        const vec = { x: 0, y: 1 };
        expect(service.getTransposedTile(AXIS.VERTICAL, vec)).toEqual('a');
    });

    it('getBonusOnTile should return correct bonus type', () => {
        const vec = { x: 0, y: 0 };
        expect(service.getBonusOnTile(vec)).toEqual(BonusValue.TW);
    });

    it('placeLetter should place to correct letter at position', () => {
        const placedLetter = {
            content: 'a',
            position: { x: 0, y: 0 },
        };
        service.placeLetter(placedLetter);
        expect(playAreaService.boardGame[0][0].letter).toEqual('A');
        expect(playAreaService.boardGame[0][0].text).toEqual('A');
        expect(playAreaService.boardGame[0][0].backgroundColor).toEqual(Color.Tile);
    });

    it('placeNewLetter should place and return the correct letter at position', () => {
        const newLetter = service.placeNewLetter('a', { x: 0, y: 0 });
        expect(playAreaService.boardGame[0][0].letter).toEqual('A');
        expect(playAreaService.boardGame[0][0].text).toEqual('A');
        expect(playAreaService.boardGame[0][0].backgroundColor).toEqual(Color.Tile);
        expect(newLetter.content).toEqual('a');
        expect(newLetter.position.x).toEqual(0);
        expect(newLetter.position.y).toEqual(0);
    });

    it('tile should not be empty at position', () => {
        const vec = { x: 0, y: 0 };
        const placedLetter = {
            content: 'a',
            position: vec,
        };
        service.placeLetter(placedLetter);
        expect(service.isEmptyTile(vec)).toBeFalse();
    });

    it('resetBonusTile should not reset if position is out of bounds', () => {
        const isVectorInBounds = spyOn(service, 'isVectorInBounds');
        const vec = { x: -1, y: 0 };
        service.resetBonusTile(vec);
        expect(isVectorInBounds).toHaveBeenCalled();
    });

    it('resetBonusTile should put the original TW square at given position', () => {
        const vec = { x: 0, y: 0 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[0][0].letter).toEqual('');
        expect(playAreaService.boardGame[0][0].text).toEqual(Text.TripleWord);
        expect(playAreaService.boardGame[0][0].backgroundColor).toEqual(Color.TripleWord);
    });

    it('resetBonusTile should put the original DW squares at give position', () => {
        const vec = { x: 1, y: 1 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[1][1].letter).toEqual('');
        expect(playAreaService.boardGame[1][1].text).toEqual(Text.DoubleWord);
        expect(playAreaService.boardGame[1][1].backgroundColor).toEqual(Color.DoubleWord);
    });

    it('resetBonusTile should put the original TL squares at given position', () => {
        const vec = { x: 5, y: 5 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[5][5].letter).toEqual('');
        expect(playAreaService.boardGame[5][5].text).toEqual(Text.TripleLetter);
        expect(playAreaService.boardGame[5][5].backgroundColor).toEqual(Color.TripleLetter);
    });

    it('resetBonusTile should put the original DL squares at given position', () => {
        const vec = { x: 6, y: 6 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[6][6].letter).toEqual('');
        expect(playAreaService.boardGame[6][6].text).toEqual(Text.DoubleLetter);
        expect(playAreaService.boardGame[6][6].backgroundColor).toEqual(Color.DoubleLetter);
    });

    it('resetBonusTile should put a blank tile if given position is not a bonus tile', () => {
        const vec = { x: 0, y: 1 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[0][1].letter).toEqual('');
        expect(playAreaService.boardGame[0][1].text).toEqual(Text.EmptyText);
        expect(playAreaService.boardGame[0][1].backgroundColor).toEqual(Color.EmptySquare);
    });

    it('resetBonusTile should put the star in the center of the board if given position is center', () => {
        const vec = { x: 7, y: 7 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).toBeFalse();

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[7][7].letter).toEqual('');
        expect(playAreaService.boardGame[7][7].text).toEqual(Text.Star);
        expect(playAreaService.boardGame[7][7].backgroundColor).toEqual(Color.Star);
    });

    it('placeLetters should put list of letters on board', () => {
        const vecOne = { x: 0, y: 0 };
        const vecTwo = { x: 0, y: 1 };
        const placedLetters = [
            {
                content: 'a',
                position: vecOne,
            },
            {
                content: 'a',
                position: vecTwo,
            },
        ];
        service.placeLetters(placedLetters);
        expect(service.isEmptyTile(vecOne)).toBeFalse();
        expect(service.isEmptyTile(vecTwo)).toBeFalse();
    });

    it('remove placement should reset tiles for multiple positions', () => {
        const vecOne = { x: 0, y: 0 };
        const vecTwo = { x: 0, y: 1 };
        const placedLetters = [
            {
                content: 'a',
                position: vecOne,
            },
            {
                content: 'a',
                position: vecTwo,
            },
        ];
        service.placeLetter(placedLetters[0]);
        service.placeLetter(placedLetters[1]);
        expect(service.isEmptyTile(vecOne)).toBeFalse();
        expect(service.isEmptyTile(vecTwo)).toBeFalse();
        service.removePlacement(placedLetters);
        expect(service.isEmptyTile(vecOne)).toBeTrue();
        expect(service.isEmptyTile(vecTwo)).toBeTrue();
    });

    it('palceArrow should place right arrow correctly', () => {
        const vecOne = { x: 0, y: 0 };
        service.placeArrow(AXIS.HORIZONTAL, vecOne);
        expect(playAreaService.boardGame[0][0].letter).toEqual('');
        expect(playAreaService.boardGame[0][0].text).toEqual(Text.ArrowRight);
        expect(playAreaService.boardGame[0][0].backgroundColor).toEqual(Color.Arrow);
    });

    it('palceArrow should place down arrow correctly', () => {
        const vecOne = { x: 0, y: 0 };
        service.placeArrow(AXIS.VERTICAL, vecOne);
        expect(playAreaService.boardGame[0][0].letter).toEqual('');
        expect(playAreaService.boardGame[0][0].text).toEqual(Text.ArrowDown);
        expect(playAreaService.boardGame[0][0].backgroundColor).toEqual(Color.Arrow);
    });

    it('incrementVector should increment x position of vector by one', () => {
        const tmpVec = { x: 0, y: 0 };
        service.incrementVector(AXIS.HORIZONTAL, tmpVec);
        expect(tmpVec.x).toEqual(1);
    });

    it('incrementVector should increment y position of vector by one', () => {
        const tmpVec = { x: 0, y: 0 };
        service.incrementVector(AXIS.VERTICAL, tmpVec);
        expect(tmpVec.y).toEqual(1);
    });

    it('decrementVector should decrement x position of vector by one', () => {
        const tmpVec = { x: 1, y: 0 };
        service.decrementVector(AXIS.HORIZONTAL, tmpVec);
        expect(tmpVec.x).toEqual(0);
    });

    it('decrementVector should decrement y position of vector by one', () => {
        const tmpVec = { x: 0, y: 1 };
        service.decrementVector(AXIS.VERTICAL, tmpVec);
        expect(tmpVec.y).toEqual(0);
    });

    it('isEqual should be true if vectors should be equal', () => {
        const tmpVecOne = { x: 0, y: 0 };
        const tmpVecTwo = { x: 0, y: 0 };
        expect(service.isEqual(tmpVecOne, tmpVecTwo)).toBeTrue();
    });

    it('isEqual should be false if vectors are not be equal', () => {
        const tmpVecOne = { x: 1, y: 0 };
        const tmpVecTwo = { x: 0, y: 0 };
        expect(service.isEqual(tmpVecOne, tmpVecTwo)).toBeFalse();
    });

    it('isPositionInBoardRange should be true if position is in range', () => {
        expect(service.isPositionInBoardRange(1)).toBeTrue();
    });

    it('isPositionInBoardRange should be false if position is lower than 0', () => {
        const lowPosition = -1;
        expect(service.isPositionInBoardRange(lowPosition)).toBeFalse();
    });

    it('isPositionInBoardRange should be false if position is higher than 14', () => {
        const lowPosition = 15;
        expect(service.isPositionInBoardRange(lowPosition)).toBeFalse();
    });

    it('isVectorInBounds should be true if vector is in bounds', () => {
        const tmpVec = { x: 0, y: 0 };
        expect(service.isVectorInBounds(tmpVec)).toBeTrue();
    });

    it('isVectorInBounds should be false if vector is out of bounds', () => {
        const tmpVec = { x: -1, y: 0 };
        expect(service.isVectorInBounds(tmpVec)).toBeFalse();
    });

    it('isVectorInBounds should return transposed vector if vertical', () => {
        const tmpVec = { x: 1, y: 2 };
        const expectedResult = { x: 2, y: 1 };
        expect(service.transposeIfVertical(AXIS.VERTICAL, tmpVec)).toEqual(expectedResult);
    });

    it('isVectorInBounds should return same vector if horizontal', () => {
        const tmpVec = { x: 1, y: 2 };
        const expectedResult = { x: 1, y: 2 };
        expect(service.transposeIfVertical(AXIS.HORIZONTAL, tmpVec)).toEqual(expectedResult);
    });
});
