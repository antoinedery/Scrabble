import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ZoomSliderService {
    fontSize: Subject<number> = new Subject<number>();

    updateFontSize(sliderValue: number): void {
        this.fontSize.next(sliderValue);
    }
}
