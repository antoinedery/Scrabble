import { TestBed } from '@angular/core/testing';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { ReserveInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Reserve, Tile } from '@app/classes/interfaces/tile';
import { LetterReserveService } from '@app/services/letter-reserve.service';

describe('LetterReserveService', () => {
    let service: LetterReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LetterReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('decrementTileQuantity should decrease letter quantity', () => {
        const reserve: Reserve = { tile: { letter: 'A', score: 2 }, quantity: 2 };
        service.decrementTileQuantity(reserve);
        expect(service.getLetterQuantity('A')).toEqual(1);
    });

    it('decrementTileQuantity should return 0 when letter quantity is zero', () => {
        const reserve: Reserve = { tile: { letter: 'A', score: 2 }, quantity: 1 };
        service.decrementTileQuantity(reserve);
        expect(service.getLetterQuantity('A')).toEqual(0);
    });

    it('assignLettersToPlayer function should return seven tiles', () => {
        const selectedTiles: Tile[] = service.assignLettersToPlayer();
        expect(selectedTiles.length).toEqual(LETTERS_RACK_SIZE);
    });

    it('getLetterQuantity should return the current quantity of a letter', () => {
        service.letterReserve.set('A', { tile: { letter: 'A', score: 1 }, quantity: 2 });
        const expectedLetterQuantity = 2;
        expect(service.getLetterQuantity('A')).toBe(expectedLetterQuantity);
    });

    it('getLetterQuantity should return 0 when every letter is on letter rack or on board', () => {
        const reserve = { tile: { letter: 'A', score: 1 }, quantity: 1 };
        service.letterReserve.set('A', reserve);
        service.decrementTileQuantity(reserve);
        const expectedLetterQuantity = 0;
        expect(service.getLetterQuantity('A')).toBe(expectedLetterQuantity);
    });

    it('getLetterQuantity should return undefined when letter is not in the reserve', () => {
        expect(service.getLetterQuantity('É')).toBe(undefined);
    });

    it('getLetterScore should return 1 when letter is A', () => {
        expect(service.getLetterScore('A')).toBe(1);
    });

    it('getLetterScore should return undefined when letter is not in the reserve', () => {
        expect(service.getLetterScore('É')).toBe(undefined);
    });

    it('should return undefined tile if letter reserve is empty', () => {
        service.letterReserveTotalSize = 0;
        const returnedTile = service.pickTile();
        expect(returnedTile).toBe(undefined);
    });

    it('should return undefined tile if letter is undefined', () => {
        service.letterReserve.clear();
        const returnedTile = service.pickTile();
        expect(returnedTile).toBe(undefined);
    });

    it('letter quantity should increase when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).toEqual(previousQuantity + 1);
    });

    it('letter quantity should return undefined when letter does not exist in the reserve', () => {
        const previousQuantity = service.getLetterQuantity('É');
        expect(previousQuantity).toBeUndefined();
    });

    it('insertLetterInReserve should increase letter quantity when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).toEqual(previousQuantity + 1);
    });

    it('insertTileInReserve should not be increased when letter inserted does not exist in the reserve', () => {
        const insertedTile: Tile = { letter: 'É', score: 2 };
        const previousQuantity = service.getLetterQuantity('É');
        service.insertTileInReserve(insertedTile);
        expect(previousQuantity).toBeUndefined();
    });

    it('letter quantity should increase when letter is inserted in reserve', () => {
        const insertedTile: Tile = { letter: 'A', score: 2 };
        const previousQuantity = service.getLetterQuantity('A');
        service.insertTileInReserve(insertedTile);
        if (previousQuantity) expect(service.getLetterQuantity('A')).toEqual(previousQuantity + 1);
    });

    it('letter quantity should not be increased when letter inserted does not exist in the reserve', () => {
        const insertedTile: Tile = { letter: 'É', score: 2 };
        const previousQuantity = service.getLetterQuantity('É');
        service.insertTileInReserve(insertedTile);
        expect(previousQuantity).toBeUndefined();
    });

    it('pickTilesArray should return correct array size', () => {
        const expectedArraySize = 1;
        const newTiles = service.pickTilesArray(expectedArraySize);
        expect(newTiles.length).toEqual(expectedArraySize);
    });

    it('createUsedReserve should assign correct reserve size', () => {
        const expectedReserveSize = 5;
        const reserveString = '[["A",{"tile":{"letter":"A","score":1},"quantity":8}]]';
        const reserveInfos: ReserveInfos = { reserve: reserveString, size: expectedReserveSize };
        service.createUsedReserve(reserveInfos);
        expect(service.letterReserveTotalSize).toEqual(expectedReserveSize);
    });
});
