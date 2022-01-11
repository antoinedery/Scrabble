import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Reserve, Tile } from '@app/classes/interfaces/tile';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';

describe('LetterReserveService', () => {
    let service: LetterReserveService;

    beforeEach(() => {
        service = Container.get(LetterReserveService);
        service.createReserve();
    });

    it('decrementTileQuantity should decrease letter quantity', () => {
        const reserve: Reserve = { tile: { letter: 'A', score: 2 }, quantity: 2 };
        service.decrementTileQuantity(reserve);
        expect(service.getLetterQuantity('A')).to.equal(1);
    });

    it('decrementTileQuantity should return 0 when letter quantity is zero', () => {
        const reserve: Reserve = { tile: { letter: 'A', score: 2 }, quantity: 1 };
        service.decrementTileQuantity(reserve);
        expect(service.getLetterQuantity('A')).to.equal(0);
    });

    it('assignLettersToPlayer function should return seven tiles', () => {
        const selectedTiles: Tile[] = service.assignLettersToPlayer();
        expect(selectedTiles.length).to.equal(LETTERS_RACK_SIZE);
    });

    it('getLetterQuantity should return the current quantity of a letter', () => {
        service.letterReserve.set('A', { tile: { letter: 'A', score: 1 }, quantity: 2 });
        const expectedLetterQuantity = 2;
        expect(service.getLetterQuantity('A')).to.equal(expectedLetterQuantity);
    });

    it('getLetterQuantity should return 0 when every letter is on letter rack or on board', () => {
        const reserve = { tile: { letter: 'A', score: 1 }, quantity: 1 };
        service.letterReserve.set('A', reserve);
        service.decrementTileQuantity(reserve);
        const expectedLetterQuantity = 0;
        expect(service.getLetterQuantity('A')).to.equal(expectedLetterQuantity);
    });

    it('getLetterQuantity should return undefined when letter is not in the reserve', () => {
        expect(service.getLetterQuantity('É')).to.equal(undefined);
    });

    it('getLetterScore should return 1 when letter is A', () => {
        expect(service.getLetterScore('A')).to.equal(1);
    });

    it('getLetterScore should return undefined when letter is not in the reserve', () => {
        expect(service.getLetterScore('É')).to.equal(undefined);
    });

    it('should return undefined tile if letter reserve is empty', () => {
        service.letterReserveTotalSize = 0;
        const returnedTile = service.pickTile();
        expect(returnedTile).to.equal(undefined);
    });

    it('should return undefined tile if letter is undefined', () => {
        service.letterReserve.clear();
        const returnedTile = service.pickTile();
        expect(returnedTile).to.equal(undefined);
    });

    it('letter quantity should increase when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).to.equal(previousQuantity + 1);
    });

    it('letter quantity should return undefined when letter does not exist in the reserve', () => {
        const previousQuantity = service.getLetterQuantity('É');
        expect(previousQuantity).to.equal(undefined);
    });

    it('insertLetterInReserve should increase letter quantity when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).to.equal(previousQuantity + 1);
    });

    it('insertTileInReserve should not be increased when letter inserted does not exist in the reserve', () => {
        const insertedTile: Tile = { letter: 'É', score: 2 };
        const previousQuantity = service.getLetterQuantity('É');
        service.insertTileInReserve(insertedTile);
        expect(previousQuantity).to.equal(undefined);
    });

    it('letter quantity should increase when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).to.equal(previousQuantity + 1);
    });

    it('letter quantity should not be increased when letter inserted does not exist in the reserve', () => {
        const insertedTile: Tile = { letter: 'É', score: 2 };
        const previousQuantity = service.getLetterQuantity('É');
        service.insertTileInReserve(insertedTile);
        expect(previousQuantity).to.equal(undefined);
    });

    it('pickTilesArray should return empty array size', () => {
        const expectedArraySize = 0;
        expect(service.pickTilesArray(expectedArraySize)).to.have.lengthOf(expectedArraySize);
    });

    it('pickTilesArray should return a tile array', () => {
        const tile: Tile = { letter: 'A', score: 1 };
        const forcedReturnedValue: Tile = tile;
        const spy = Sinon.stub(service, 'pickTile').returns(forcedReturnedValue);
        const expectedTileArray: Tile[] = [];
        for (let i = 0; i < LETTERS_RACK_SIZE; i++) {
            expectedTileArray.push(tile);
        }
        expect(service.pickTilesArray(LETTERS_RACK_SIZE)).to.deep.equal(expectedTileArray);
        spy.restore();
    });
});
