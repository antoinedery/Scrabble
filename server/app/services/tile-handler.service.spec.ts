import { AXIS } from '@app/classes/enums/axis';
import { BonusValue, Color, Text } from '@app/classes/enums/board-game-enums';
import { PlayAreaService } from '@app/services/play-area.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { assert, expect } from 'chai';
import { Container } from 'typedi';

describe('TileHandlerService', () => {
    let service: TileHandlerService;
    let playAreaService: PlayAreaService;

    beforeEach(() => {
        service = Container.get(TileHandlerService);
        playAreaService = Container.get(PlayAreaService);
        playAreaService.initialiseBoardCaseList();
    });

    it('isEmptyTile should be true if empty at position', () => {
        const vec = { x: 0, y: 0 };
        assert.isTrue(service.isEmptyTile(vec));
    });

    it('isEmptyTile should be false if not empty at position', () => {
        const vec = { x: 0, y: 0 };
        const placedLetter = {
            content: 'a',
            position: vec,
        };
        service.placeLetter(placedLetter);
        expect(service.isEmptyTile(vec)).to.equal(false);
    });

    it('getLetterOnTile should return the letter on tile if the tile is not empty at position', () => {
        const vec = { x: 0, y: 0 };
        playAreaService.boardGame[0][0].letter = '';
        expect(service.getLetterOnTile(vec)).to.equals(undefined);
    });

    it("getLetterOnTile should return the letter on tile if it's not empty at that position", () => {
        const vec = { x: 0, y: 0 };
        playAreaService.boardGame[0][0].letter = 'A';
        expect(service.getLetterOnTile(vec)).to.equal('a');
    });

    it('getTransposedTile should return correct letter', () => {
        service.placeLetter({
            content: 'a',
            position: { x: 1, y: 0 },
        });
        const vec = { x: 0, y: 1 };
        expect(service.getTransposedTile(AXIS.VERTICAL, vec)).to.equal('a');
    });

    it('getBonusOnTile should return correct bonus type', () => {
        const vec = { x: 0, y: 0 };
        playAreaService.boardGame[0][0].bonusType = BonusValue.TW;
        expect(service.getBonusOnTile(vec)).to.equal(BonusValue.TW);
    });

    it('placeLetter should place to correct letter at position', () => {
        const placedLetter = {
            content: 'a',
            position: { x: 0, y: 0 },
        };
        service.placeLetter(placedLetter);
        expect(playAreaService.boardGame[0][0].letter).to.equal('A');
        expect(playAreaService.boardGame[0][0].text).to.equal('A');
        expect(playAreaService.boardGame[0][0].backgroundColor).to.equal(Color.Tile);
    });

    it('placeNewLetter should place and return the correct letter at position', () => {
        const newLetter = service.placeNewLetter('a', { x: 0, y: 0 });
        expect(playAreaService.boardGame[0][0].letter).to.equal('A');
        expect(playAreaService.boardGame[0][0].text).to.equal('A');
        expect(playAreaService.boardGame[0][0].backgroundColor).to.equal(Color.Tile);
        expect(newLetter.content).to.equal('a');
        expect(newLetter.position.x).to.equal(0);
        expect(newLetter.position.y).to.equal(0);
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
        expect(service.isEmptyTile(vecOne)).to.equal(false);
        expect(service.isEmptyTile(vecTwo)).to.equal(false);
    });

    it('resetBonusTile should not reset if position is out of bounds', () => {
        const vec = { x: -1, y: 0 };
        expect(service.resetBonusTile(vec));
    });

    it('resetBonusTile should put the original DL squares at given position', () => {
        const vec = { x: 6, y: 6 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[6][6].letter).to.equal('');
        expect(playAreaService.boardGame[6][6].text).to.equal(Text.DoubleLetter);
        expect(playAreaService.boardGame[6][6].backgroundColor).to.equal(Color.DoubleLetter);
    });

    it('resetBonusTile should put the original DW squares at give position', () => {
        const vec = { x: 1, y: 1 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[1][1].letter).to.equal('');
        expect(playAreaService.boardGame[1][1].text).to.equal(Text.DoubleWord);
        expect(playAreaService.boardGame[1][1].backgroundColor).to.equal(Color.DoubleWord);
    });

    it('resetBonusTile should put the original TL squares at given position', () => {
        const vec = { x: 5, y: 5 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[5][5].letter).to.equal('');
        expect(playAreaService.boardGame[5][5].text).to.equal(Text.TripleLetter);
        expect(playAreaService.boardGame[5][5].backgroundColor).to.equal(Color.TripleLetter);
    });

    it('resetBonusTile should put the original TW square at given position', () => {
        const vec = { x: 0, y: 0 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[0][0].letter).to.equal('');
        expect(playAreaService.boardGame[0][0].text).to.equal(Text.TripleWord);
        expect(playAreaService.boardGame[0][0].backgroundColor).to.equal(Color.TripleWord);
    });

    it('resetBonusTile should put a blank tile if given position is not a bonus tile', () => {
        const vec = { x: 0, y: 1 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[0][1].letter).to.equal('');
        expect(playAreaService.boardGame[0][1].text).to.equal(Text.EmptyText);
        expect(playAreaService.boardGame[0][1].backgroundColor).to.equal(Color.EmptySquare);
    });

    it('resetBonusTile should put the star in the center of the board if given position is center', () => {
        const vec = { x: 7, y: 7 };
        service.placeLetter({ content: 'a', position: vec });
        expect(service.isEmptyTile(vec)).to.equal(false);

        service.resetBonusTile(vec);
        expect(playAreaService.boardGame[7][7].letter).to.equal('');
        expect(playAreaService.boardGame[7][7].text).to.equal(Text.Star);
        expect(playAreaService.boardGame[7][7].backgroundColor).to.equal(Color.Star);
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
        expect(service.isEmptyTile(vecOne)).to.equal(false);
        expect(service.isEmptyTile(vecTwo)).to.equal(false);
        service.removePlacement(placedLetters);
        expect(service.isEmptyTile(vecOne)).to.equal(true);
        expect(service.isEmptyTile(vecTwo)).to.equal(true);
    });

    it('placeArrow should place right arrow correctly', () => {
        const vecOne = { x: 0, y: 0 };
        service.placeArrow(AXIS.HORIZONTAL, vecOne);
        expect(playAreaService.boardGame[0][0].letter).to.equal('');
        expect(playAreaService.boardGame[0][0].text).to.equal(Text.ArrowRight);
        expect(playAreaService.boardGame[0][0].backgroundColor).to.equal(Color.Arrow);
    });

    it('placeArrow should place down arrow correctly', () => {
        const vecOne = { x: 0, y: 0 };
        service.placeArrow(AXIS.VERTICAL, vecOne);
        expect(playAreaService.boardGame[0][0].letter).to.equal('');
        expect(playAreaService.boardGame[0][0].text).to.equal(Text.ArrowDown);
        expect(playAreaService.boardGame[0][0].backgroundColor).to.equal(Color.Arrow);
    });

    it('incrementVector should increment x position of vector by one', () => {
        const tmpVec = { x: 0, y: 0 };
        service.incrementVector(AXIS.HORIZONTAL, tmpVec);
        expect(tmpVec.x).to.equal(1);
    });

    it('incrementVector should increment y position of vector by one', () => {
        const tmpVec = { x: 0, y: 0 };
        service.incrementVector(AXIS.VERTICAL, tmpVec);
        expect(tmpVec.y).to.equal(1);
    });

    it('decrementVector should decrement x position of vector by one', () => {
        const tmpVec = { x: 1, y: 0 };
        service.decrementVector(AXIS.HORIZONTAL, tmpVec);
        expect(tmpVec.x).to.equal(0);
    });

    it('decrementVector should decrement y position of vector by one', () => {
        const tmpVec = { x: 0, y: 1 };
        service.decrementVector(AXIS.VERTICAL, tmpVec);
        expect(tmpVec.y).to.equal(0);
    });

    it('isEqual should be true if vectors should be equal', () => {
        const tmpVecOne = { x: 0, y: 0 };
        const tmpVecTwo = { x: 0, y: 0 };
        expect(service.isEqual(tmpVecOne, tmpVecTwo)).to.equal(true);
    });

    it('isEqual should be false if vectors are not be equal', () => {
        const tmpVecOne = { x: 1, y: 0 };
        const tmpVecTwo = { x: 0, y: 0 };
        expect(service.isEqual(tmpVecOne, tmpVecTwo)).to.equal(false);
    });

    it('isPositionInBoardRange should be true if position is in range', () => {
        expect(service.isPositionInBoardRange(1)).to.equal(true);
    });

    it('isPositionInBoardRange should be false if position is lower than 0', () => {
        const lowPosition = -1;
        expect(service.isPositionInBoardRange(lowPosition)).to.equal(false);
    });

    it('isPositionInBoardRange should be false if position is higher than 14', () => {
        const lowPosition = 15;
        expect(service.isPositionInBoardRange(lowPosition)).to.equal(false);
    });

    it('isVectorInBounds should be true if vector is in bounds', () => {
        const tmpVec = { x: 0, y: 0 };
        expect(service.isVectorInBounds(tmpVec)).to.equal(true);
    });

    it('isVectorInBounds should be false if vector is out of bounds', () => {
        const tmpVec = { x: -1, y: 0 };
        expect(service.isVectorInBounds(tmpVec)).to.equal(false);
    });

    it('transposeIfVertical should return transposed vector if vertical', () => {
        const tmpVec = { x: 1, y: 2 };
        const expectedResult = { x: 2, y: 1 };
        expect(service.transposeIfVertical(AXIS.VERTICAL, tmpVec).x).to.equal(expectedResult.x);
        expect(service.transposeIfVertical(AXIS.VERTICAL, tmpVec).y).to.equal(expectedResult.y);
    });

    it('transposeIfVertical should return same vector if horizontal', () => {
        const tmpVec = { x: 1, y: 2 };
        const expectedResult = { x: 1, y: 2 };
        expect(service.transposeIfVertical(AXIS.HORIZONTAL, tmpVec).x).to.equal(expectedResult.x);
        expect(service.transposeIfVertical(AXIS.HORIZONTAL, tmpVec).y).to.equal(expectedResult.y);
    });
});
