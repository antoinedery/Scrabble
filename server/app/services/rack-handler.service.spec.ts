import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { RackHandlerService } from '@app/services/rack-handler.service';
import { expect } from 'chai';
import { Container } from 'typedi';

describe('RackHandlerService', () => {
    let service: RackHandlerService;

    beforeEach(() => {
        service = Container.get(RackHandlerService);
    });

    it('refillRack should refill rack to a size of seven tiles', () => {
        const tiles: Tile[] = [];
        expect(tiles.length).to.equal(0);
        service.refillRack(tiles);
        expect(tiles.length).to.equal(LETTERS_RACK_SIZE);
    });

    it('removeLetterFromRack should remove white letter from rack', () => {
        const letterToCheck = 'L';
        const letters = [];
        letters.push({ letter: '*', score: 1 });
        service.removeLetterFromRack(letters, letterToCheck);
        expect(letters.length).to.equal(0);
    });

    it('removeLetterFromRack should remove normal letter from rack', () => {
        const letterToCheck = 'l';
        const letters = [];
        letters.push({ letter: 'L', score: 1 });
        service.removeLetterFromRack(letters, letterToCheck);
        expect(letters.length).to.equal(0);
    });
});
