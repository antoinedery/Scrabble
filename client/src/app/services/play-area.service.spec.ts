import { fakeAsync, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/services/canvas-test-helper';
import { PlayAreaService } from '@app/services/play-area.service';
import { ZoomSliderService } from '@app/services/zoom-slider.service';

describe('PlayAreaService', () => {
    let service: PlayAreaService;
    let canvasTestHelper: CanvasTestHelper;
    let zoomSliderService: ZoomSliderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayAreaService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        zoomSliderService = TestBed.inject(ZoomSliderService);
        service.canvas = canvasTestHelper.canvas;
        service.baseCanvas = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCanvas = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('subcribe should be called if soloModeIsChosen', () => {
        spyOn(service, 'drawGameBoard');
        service.isSoloModeChosen = false;
        service.boardGameUpdatedObservable.next();
        expect(service.drawGameBoard).toHaveBeenCalled();
    });

    it('clearCanvas should clear the whole canvas', () => {
        service.clearCanvas(service.baseCanvas);
        const pixelBuffer = new Uint32Array(service.baseCanvas.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('getRandomNumber should return a value between min and max', () => {
        const minValue = 0;
        const maxValue = 2;
        const expectedMaxNumber = 2;
        expect(service.getRandomNumber(minValue, maxValue)).toBeLessThanOrEqual(expectedMaxNumber);
    });

    it('randomizeBoard should initialiseBoardCaseList on initial board state', () => {
        const testTable = service.tableBonus;
        service.randomize = false;
        service.randomizeBoard();

        expect(service.tableBonus).toEqual(testTable);
    });

    it('randomizeBoard should initialiseBoardCaseList on randomized board state', () => {
        const testTable: string[] = [];
        const testRandomizedTable: string[] = [];

        for (const bonusCaseName of service.tableBonus) {
            testTable.push(bonusCaseName.name);
        }
        service.randomize = true;
        service.randomizeBoard();

        for (const bonusCaseName of service.tableBonus) {
            testRandomizedTable.push(bonusCaseName.name);
        }
        expect(testTable).not.toEqual(testRandomizedTable);
    });

    it('font size should be updated when slider is moved (subscribe)', fakeAsync(() => {
        const expectedCanvasHeight = 15;
        zoomSliderService.updateFontSize(expectedCanvasHeight);
        expect(service.textSize).toEqual(expectedCanvasHeight);
    }));

    it('drawGrid should be draw the grid', fakeAsync(() => {
        service.drawGrid();
        const pixelBuffer = new Uint32Array(service.baseCanvas.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(true);
    }));

    it('drawSquare should color squares', fakeAsync(() => {
        service.placedLettersCoordinates = [{ x: 0, y: 0 }];
        service.drawSquare();
        const squarePixelValue = 25;
        const pixelBuffer = new Uint32Array(
            service.baseCanvas.getImageData(squarePixelValue, squarePixelValue, service.canvas.width, service.canvas.height).data.buffer,
        );
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(true);
    }));

    it('isInPlacement should return true if vector is in placement', fakeAsync(() => {
        const vec = { x: 0, y: 0 };
        service.placedLettersCoordinates = [vec];
        expect(service.isInPlacement(vec)).toBeTrue();
    }));

    it('isInPlacement should return false if vector is not in placement', fakeAsync(() => {
        const vec = { x: 0, y: 0 };
        service.placedLettersCoordinates = [];
        expect(service.isInPlacement(vec)).toBeFalse();
    }));
});
