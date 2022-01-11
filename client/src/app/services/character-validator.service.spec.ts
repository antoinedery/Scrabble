import { TestBed } from '@angular/core/testing';
import { CharacterValidatorService } from './character-validator.service';

describe('CharacterValidatorService', () => {
    let service: CharacterValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CharacterValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('checkIsALetter should return true if parameter is a letter ', () => {
        const nameIsValid = service.checkIsALetter('A');
        expect(nameIsValid).toBe(true);
    });

    it('checkIsANumber should return true if parameter is a digit ', () => {
        const nameIsValid = service.checkIsANumber('10');
        expect(nameIsValid).toBe(true);
    });
});
