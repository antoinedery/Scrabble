import { Injectable } from '@angular/core';
import {
    BOARD_GAME,
    CANVAS_DIMENSIONS,
    CANVAS_FONTSIZE,
    FACTORY_METHOD_GENERATOR,
    SQUARE,
    TABLE_BONUS_CASE_COORDINATES,
    TEXT_DIMENSION,
} from '@app/classes/constants/constants';
import { BonusName } from '@app/classes/enums/board-game-enums';
import { BonusStruct, Square } from '@app/classes/interfaces/board-game-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { SelectGameMode } from '@app/classes/select-game-mode';
import { ZoomSliderService } from '@app/services/zoom-slider.service';
import { Subject } from 'rxjs';
import { SelectGameModeService } from './select-game-mode.service';

@Injectable({
    providedIn: 'root',
})
export class PlayAreaService extends SelectGameMode {
    baseCanvas: CanvasRenderingContext2D;
    previewCanvas: CanvasRenderingContext2D;
    headerCanvas: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    tableBonus: BonusStruct[] = JSON.parse(JSON.stringify(TABLE_BONUS_CASE_COORDINATES));
    nameArray: string[] = [];
    randomize: boolean = false;
    randomNumber: number;

    canvasWidth: number = CANVAS_DIMENSIONS.DEFAULT_WIDTH;
    canvasHeight: number = CANVAS_DIMENSIONS.default_height;

    tileW: number = CANVAS_DIMENSIONS.DEFAULT_WIDTH / SQUARE.SQUARE_NUMBER;
    tileH: number = CANVAS_DIMENSIONS.default_height / SQUARE.SQUARE_NUMBER;
    textSize = TEXT_DIMENSION.DEFAULT;
    cols = SQUARE.SQUARE_NUMBER;
    rows = SQUARE.SQUARE_NUMBER;
    boardGame: Square[][] = [];
    coordinates: Vec2 = { x: 0, y: 0 };
    boardGameUpdatedObservable: Subject<boolean> = new Subject();

    placedLettersCoordinates: Vec2[] = [];
    borderStartX = CANVAS_DIMENSIONS.BORDER_START;
    borderStartY = CANVAS_DIMENSIONS.BORDER_START;
    borderW = CANVAS_DIMENSIONS.CASE_SIZE - CANVAS_DIMENSIONS.BORDER_START * 2;
    borderH = CANVAS_DIMENSIONS.CASE_SIZE - CANVAS_DIMENSIONS.BORDER_START * 2;

    constructor(private zoomSliderService: ZoomSliderService, public selectGameModeService: SelectGameModeService) {
        super(selectGameModeService);
        this.subGameMode();
        this.randomizeBoard();
        this.subSlider();
        this.drawBoardGameIfSoloMode();
    }

    drawBoardGameIfSoloMode() {
        /* istanbul ignore else*/
        if (!this.isSoloModeChosen) {
            this.boardGameUpdatedObservable.subscribe(() => {
                this.drawGameBoard();
            });
        }
    }

    subSlider(): void {
        this.zoomSliderService.fontSize.subscribe((value) => {
            this.textSize = value;
        });
    }

    clearCanvas(canvas: CanvasRenderingContext2D): void {
        canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    getRandomNumber(minValue: number, maxValue: number): number {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    }

    randomizeBoard(): void {
        if (this.randomize) {
            for (const bonusCaseName of TABLE_BONUS_CASE_COORDINATES) {
                if (bonusCaseName.name !== BonusName.Star) this.nameArray.push(bonusCaseName.name);
            }
            for (const bonusName of this.tableBonus) {
                this.randomNumber = this.getRandomNumber(0, this.nameArray.length - 1);
                bonusName.name = this.nameArray[this.randomNumber];
                this.nameArray.splice(this.randomNumber, 1);
            }
            this.randomize = false;
            this.initialiseBoardCaseList();
        } else {
            this.tableBonus = JSON.parse(JSON.stringify(TABLE_BONUS_CASE_COORDINATES));
            this.initialiseBoardCaseList();
        }
    }
    initialiseBoardCaseList(): void {
        for (let indexY = 0; indexY < SQUARE.SQUARE_NUMBER; indexY++) {
            this.boardGame[indexY] = [];
            for (let indexX = 0; indexX < SQUARE.SQUARE_NUMBER; indexX++) {
                for (const bonusCaseCoordinate of this.tableBonus) {
                    const isCoordinateValid = bonusCaseCoordinate.coordinates.x === indexX && bonusCaseCoordinate.coordinates.y === indexY;
                    if (!isCoordinateValid) {
                        this.boardGame[indexY][indexX] = FACTORY_METHOD_GENERATOR.EMPTY_FACTORY();
                        continue;
                    }
                    if (bonusCaseCoordinate.name === BonusName.DL) {
                        this.boardGame[indexY][indexX] = FACTORY_METHOD_GENERATOR.DOUBLE_LETTER_FACTORY();
                        break;
                    }
                    if (bonusCaseCoordinate.name === BonusName.DW) {
                        this.boardGame[indexY][indexX] = FACTORY_METHOD_GENERATOR.DOUBLE_WORD_FACTORY();
                        break;
                    }
                    if (bonusCaseCoordinate.name === BonusName.TL) {
                        this.boardGame[indexY][indexX] = FACTORY_METHOD_GENERATOR.TRIPLE_LETTER_FACTORY();
                        break;
                    }
                    if (bonusCaseCoordinate.name === BonusName.TW) {
                        this.boardGame[indexY][indexX] = FACTORY_METHOD_GENERATOR.TRIPLE_WORD_FACTORY();
                        break;
                    }
                }
            }
        }
        this.boardGame[BOARD_GAME.CENTER_POSITION][BOARD_GAME.CENTER_POSITION] = FACTORY_METHOD_GENERATOR.STAR_FACTORY();
    }

    drawGameBoard(): void {
        this.clearCanvas(this.baseCanvas);
        this.drawSquare();
        this.drawGrid();
        this.drawHeader();
    }

    drawGrid(): void {
        // Horizontal lines
        for (let x = 0; x <= CANVAS_DIMENSIONS.default_height; x += CANVAS_DIMENSIONS.CASE_SIZE) {
            this.baseCanvas.beginPath();
            this.baseCanvas.moveTo(x, 0);
            this.baseCanvas.lineTo(x, this.canvasHeight);
            this.baseCanvas.stroke();
        }

        // Vertical lines
        for (let y = 0; y <= CANVAS_DIMENSIONS.DEFAULT_WIDTH; y += CANVAS_DIMENSIONS.CASE_SIZE) {
            this.baseCanvas.beginPath();
            this.baseCanvas.moveTo(0, y);
            this.baseCanvas.lineTo(this.canvasHeight, y);
            this.baseCanvas.stroke();
        }
    }

    drawSquare(): void {
        this.baseCanvas.fillStyle = '#FFFFFF';

        for (let squareY = 0; squareY < BOARD_GAME.SQUARES_IN_COLUMN; squareY++) {
            for (let squareX = 0; squareX < BOARD_GAME.SQUARES_IN_COLUMN; squareX++) {
                // Get the square color
                const xPos = squareX * this.tileW;
                const yPos = squareY * this.tileH;

                if (this.isInPlacement({ x: squareX, y: squareY })) {
                    // Color the square with the placed letter border
                    this.baseCanvas.fillStyle = '#000000';
                    this.baseCanvas.fillRect(xPos, yPos, this.tileW, this.tileH);
                    this.baseCanvas.clearRect(xPos + this.borderStartX, yPos + this.borderStartY, this.borderW, this.borderH);
                    this.baseCanvas.fillStyle = this.boardGame[squareY][squareX].backgroundColor;
                    this.baseCanvas.fillRect(xPos + this.borderStartX, yPos + this.borderStartY, this.borderW, this.borderH);
                } else {
                    // Color the square with no placed letter border
                    this.baseCanvas.fillStyle = this.boardGame[squareY][squareX].backgroundColor;
                    this.baseCanvas.fillRect(xPos, yPos, this.tileW, this.tileH);
                }

                // Write text in square
                this.baseCanvas.fillStyle = '#000000';
                const splitText = this.boardGame[squareY][squareX].text.split('\n');

                if (splitText.length === 1) {
                    this.baseCanvas.font = (this.textSize * CANVAS_FONTSIZE.LETTER_SIZE_MULTIPLIER).toString() + 'px Tahoma';
                    const lineHeight = this.textSize * CANVAS_FONTSIZE.LETTER_SIZE_MULTIPLIER;
                    const letterWidth = this.baseCanvas.measureText(splitText[0]).width;
                    this.baseCanvas.fillText(
                        splitText[0],
                        xPos + (this.tileW - letterWidth) / 2,
                        yPos + this.tileH / 2 + lineHeight / CANVAS_FONTSIZE.LETTER_YPOS_DIVIDER,
                    );
                } else {
                    for (let i = 0; i < splitText.length; i++) {
                        this.baseCanvas.font = this.textSize.toString() + 'px Tahoma';
                        const textWidth = this.baseCanvas.measureText(splitText[i]).width;
                        this.baseCanvas.fillText(splitText[i], xPos + (this.tileW - textWidth) / 2, yPos + this.tileH / 2 + i * this.textSize);
                    }
                }
            }
        }
    }

    isInPlacement(vec: Vec2): boolean {
        for (const position of this.placedLettersCoordinates) {
            if (position.x === vec.x && position.y === vec.y) {
                return true;
            }
        }
        return false;
    }

    drawHeader(): void {
        const fontSize = CANVAS_FONTSIZE.HEADER * (this.canvasWidth / CANVAS_FONTSIZE.FONT_SIZE_DIVIDER);
        this.baseCanvas.font = fontSize.toString() + 'px Tahoma';
        this.headerCanvas.font = fontSize.toString() + 'px Tahoma';
        this.headerCanvas.fillStyle = '#0000000';

        // Write column name (from 1 to 15)
        for (let x = 1; x < this.cols + 1; x++) {
            const xPos = CANVAS_FONTSIZE.HEADER_ROW_SIZE + this.tileW * (x - 1);
            const textWidth = this.baseCanvas.measureText(String(x)).width;
            this.headerCanvas.fillText(String(x), xPos + (this.tileW - textWidth) / 2, CANVAS_FONTSIZE.HEADER_COLUMN_SIZE);
        }

        // Write row name (from A to O)
        for (let y = 0; y < this.rows + 1; y++) {
            const yPos = CANVAS_FONTSIZE.HEADER_ROW_SIZE + this.tileH * y;
            this.headerCanvas.fillText(String.fromCharCode(y + 'A'.charCodeAt(0)), 0, yPos + (this.tileH - fontSize));
        }
    }
}
