import { ActivePlayerService } from '@app/services/active-player.service';
import { PlayerRackHandlerService } from '@app/services/player-rack-handler.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';

describe('PlayerRackHandlerService', () => {
    let service: PlayerRackHandlerService;
    let activePlayerService: ActivePlayerService;
    let letterReserveService: LetterReserveService;

    beforeEach(() => {
        service = Container.get(PlayerRackHandlerService);
        activePlayerService = Container.get(ActivePlayerService);
        letterReserveService = Container.get(LetterReserveService);
    });

    it('refillPlayerRack should call refillRack', () => {
        const spy = Sinon.spy(service, 'refillRack');
        activePlayerService.activePlayerRack = [];
        service.refillPlayerRack();
        expect(spy.calledOnceWith(activePlayerService.activePlayerRack)).to.equal(true);
        spy.restore();
    });

    it('reinsertLetter should reinsert given normal letter in rack', () => {
        letterReserveService.createReserve();
        const letterToInsert = 'a';
        activePlayerService.activePlayerRack = [];
        service.reinsertLetter(letterToInsert);

        expect(activePlayerService.activePlayerRack[0].letter).to.equal('A');
        expect(activePlayerService.activePlayerRack[0].score).to.equal(1);
    });

    it('reinsertLetter should reinsert given white letter in rack', () => {
        const letterToInsert = 'A';
        activePlayerService.activePlayerRack = [];
        service.reinsertLetter(letterToInsert);

        expect(activePlayerService.activePlayerRack[0].letter).to.equal('*');
        expect(activePlayerService.activePlayerRack[0].score).to.equal(0);
    });

    it('reinsertPlacement should reinsert given letters in rack', () => {
        const placedLetters = [
            {
                content: 'A',
                position: { x: 0, y: 0 },
            },
            {
                content: 'a',
                position: { x: 0, y: 1 },
            },
        ];
        activePlayerService.activePlayerRack = [];
        service.reinsertPlacement(placedLetters);

        expect(activePlayerService.activePlayerRack[0].letter).to.equal('*');
        expect(activePlayerService.activePlayerRack[0].score).to.equal(0);
        expect(activePlayerService.activePlayerRack[1].letter).to.equal('A');
        expect(activePlayerService.activePlayerRack[1].score).to.equal(1);
    });

    it('checkIsLetterInRack should return true if white letter is in letter rack', () => {
        const letterToCheck = 'L';
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: '*', score: 1 });
        expect(service.checkIsLetterInRack(letterToCheck)).to.equal(true);
    });

    it('checkIsLetterInRack should return true if normal letter is in letter rack', () => {
        const letterToCheck = 'l';
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: 'L', score: 1 });
        expect(service.checkIsLetterInRack(letterToCheck)).to.equal(true);
    });

    it('checkIsLetterInRack should return false if normal letter is not in letter rack', () => {
        const letterToCheck = 'l';
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: 'I', score: 1 });
        expect(service.checkIsLetterInRack(letterToCheck)).to.equal(false);
    });

    it("removeLetterFromPlayerRack should remove letter from the active player's rack", () => {
        const letterToCheck = 'l';
        activePlayerService.activePlayerRack = [];
        activePlayerService.activePlayerRack.push({ letter: 'I', score: 1 });
        service.removeLetterFromPlayerRack(letterToCheck);
        expect(activePlayerService.activePlayerRack[0]).to.not.equal(letterToCheck);
    });
});
