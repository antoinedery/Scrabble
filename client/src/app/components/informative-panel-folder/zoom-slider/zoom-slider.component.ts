import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { TEXT_DIMENSION } from '@app/classes/constants/constants';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { ZoomSliderService } from '@app/services/zoom-slider.service';
@Component({
    selector: 'app-zoom-slider',
    templateUrl: './zoom-slider.component.html',
    styleUrls: ['./zoom-slider.component.scss'],
})
export class ZoomSliderComponent {
    initialSliderValue = TEXT_DIMENSION.DEFAULT;
    minSliderValue = TEXT_DIMENSION.SIZE_MIN;
    maxSliderValue = TEXT_DIMENSION.SIZE_MAX;

    constructor(private mousePlacementService: MousePlacementService, private zoomSliderService: ZoomSliderService) {}

    updateValueOnSlide(event: MatSliderChange): void {
        if (!event.value) return;
        this.zoomSliderService.updateFontSize(event.value);
        this.mousePlacementService.cancelPlacement();
    }
}
