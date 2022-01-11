import { TestBed } from '@angular/core/testing';
import { SelectGameModeService } from './select-game-mode.service';

describe('SelectGameModeService', () => {
    let service: SelectGameModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectGameModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
