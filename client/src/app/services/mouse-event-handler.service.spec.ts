import { TestBed } from '@angular/core/testing';

import { MouseEventHandlerService } from './mouse-event-handler.service';

describe('MouseEventHandlerService', () => {
    let service: MouseEventHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseEventHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
