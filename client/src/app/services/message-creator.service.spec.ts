import { TestBed } from '@angular/core/testing';
import { AXIS } from '@app/classes/enums/axis';

import { MessageCreatorService } from '@app/services/message-creator.service';

describe('MessageCreatorService', () => {
    let service: MessageCreatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MessageCreatorService);
    });

    it('getVerticalAxisLetter should return correct letter at position', () => {
        expect(service.getVerticalAxisLetter(0)).toEqual('a');
    });

    it('getVerticalAxisLetter should return correct null string if position is non-existant', () => {
        const invalidPos = -1;
        expect(service.getVerticalAxisLetter(invalidPos)).toEqual('');
    });

    it('isInPlacement should return letter in placement if position is in placmeent', () => {
        const vec = { x: 0, y: 0 };
        const placedLetters = [{ content: 'a', position: vec }];
        expect(service.isInPlacement(vec, placedLetters)).toEqual('a');
    });

    it('isInPlacement should return letter on tile if position is not in placmeent', () => {
        const vec = { x: 0, y: 1 };
        const placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isInPlacement(vec, placedLetters)).toBeUndefined();
    });

    it('getContentToOutput should correct output for a horizontal placement', () => {
        const placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.getContentToOutput({ axis: AXIS.HORIZONTAL, letters: placedLetters })).toEqual('!placer a1h a');
    });

    it('getContentToOutput should correct output for a vertical placement', () => {
        const placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.getContentToOutput({ axis: AXIS.VERTICAL, letters: placedLetters })).toEqual('!placer a1v a');
    });
});
