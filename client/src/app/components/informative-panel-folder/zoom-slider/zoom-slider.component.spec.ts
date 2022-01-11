import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { ZoomSliderService } from '@app/services/zoom-slider.service';
import { ZoomSliderComponent } from './zoom-slider.component';

describe('ZoomSliderComponent', () => {
    let component: ZoomSliderComponent;
    let fixture: ComponentFixture<ZoomSliderComponent>;
    let zoomSliderService: ZoomSliderService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ZoomSliderComponent],
            imports: [MatSliderModule, FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ZoomSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        zoomSliderService = TestBed.inject(ZoomSliderService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update value when slider is moved', fakeAsync(() => {
        spyOn(zoomSliderService, 'updateFontSize');
        const matSliderSource = fixture.debugElement.nativeElement.querySelector('mat-slider');
        const fakeEvent: MatSliderChange = { source: matSliderSource, value: 15 };
        component.updateValueOnSlide(fakeEvent);
        expect(zoomSliderService.updateFontSize).toHaveBeenCalled();
    }));

    it('updateValueOnSlide should return undefined if value is null', fakeAsync(() => {
        spyOn(zoomSliderService, 'updateFontSize');
        const matSliderSource = fixture.debugElement.nativeElement.querySelector('mat-slider');
        const fakeEvent: MatSliderChange = { source: matSliderSource, value: null };
        expect(component.updateValueOnSlide(fakeEvent)).toBeUndefined();
    }));
});
