import { Injectable } from '@angular/core';
import { TEST_HELPER } from '@app/classes/constants/constants';

@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    canvas: HTMLCanvasElement;
    drawCanvas: HTMLCanvasElement;
    selectionCanvas: HTMLCanvasElement;

    constructor() {
        this.canvas = this.createCanvas(TEST_HELPER.WIDTH, TEST_HELPER.HEIGHT);
        this.drawCanvas = this.createCanvas(TEST_HELPER.WIDTH, TEST_HELPER.HEIGHT);
        this.selectionCanvas = this.createCanvas(TEST_HELPER.WIDTH, TEST_HELPER.HEIGHT);
    }

    private createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}
