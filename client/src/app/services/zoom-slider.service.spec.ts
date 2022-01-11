import { fakeAsync, TestBed } from '@angular/core/testing';
import { ZoomSliderService } from '@app/services/zoom-slider.service';

describe('ZoomSliderService', () => {
    let service: ZoomSliderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ZoomSliderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('updateSize function should should update size when slider is moved', fakeAsync(() => {
        const sliderValue = 700;
        let expectedSizeValue = 0;
        service.fontSize.subscribe((value) => {
            expectedSizeValue = value;
        });
        service.updateFontSize(sliderValue);
        expect(expectedSizeValue).toEqual(sliderValue);
    }));
});
