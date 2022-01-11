import { Injectable } from '@angular/core';

import { BOARD_GAME, FACTORY_METHOD_GENERATOR } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { BonusValue, Color, Text } from '@app/classes/enums/board-game-enums';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { PlayAreaService } from '@app/services/play-area.service';

@Injectable({
    providedIn: 'root',
})
export class TileHandlerService {
    constructor(private playAreaService: PlayAreaService) {}

    isEmptyTile(vec: Vec2) {
        return this.playAreaService.boardGame[vec.y][vec.x].letter === '';
    }

    getLetterOnTile(vec: Vec2): string | undefined {
        if (this.isEmptyTile(vec)) return;
        return this.playAreaService.boardGame[vec.y][vec.x].letter.toLowerCase();
    }

    getTransposedTile(axis: AXIS, inputVec: Vec2): string | undefined {
        const vec = this.transposeIfVertical(axis, inputVec);
        return this.getLetterOnTile(vec);
    }

    getBonusOnTile(vec: Vec2): BonusValue {
        return this.playAreaService.boardGame[vec.y][vec.x].bonusType;
    }

    placeLetter(letter: PlacedLetter) {
        const removeAccent = letter.content.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const upperCaseLetter = removeAccent.toUpperCase();
        this.playAreaService.boardGame[letter.position.y][letter.position.x].letter = upperCaseLetter;
        this.playAreaService.boardGame[letter.position.y][letter.position.x].text = upperCaseLetter;
        this.playAreaService.boardGame[letter.position.y][letter.position.x].backgroundColor = Color.Tile;
    }

    placeNewLetter(letter: string, vec: Vec2): PlacedLetter {
        const newLetter = {
            content: letter,
            position: vec,
        };
        this.placeLetter(newLetter);
        return newLetter;
    }

    placeLetters(letters: PlacedLetter[]) {
        for (const letter of letters) this.placeLetter(letter);
    }

    addBorder(vec: Vec2) {
        this.playAreaService.placedLettersCoordinates.push(vec);
    }

    popBorder() {
        this.playAreaService.placedLettersCoordinates.pop();
    }

    resetBorders() {
        this.playAreaService.placedLettersCoordinates = [];
    }

    resetBonusTile(vec: Vec2) {
        if (!this.isVectorInBounds(vec)) return;
        const previousBonus = this.playAreaService.boardGame[vec.y][vec.x].bonusType;
        switch (previousBonus) {
            case BonusValue.DL: {
                this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.DOUBLE_LETTER_FACTORY();
                break;
            }
            case BonusValue.DW: {
                this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.DOUBLE_WORD_FACTORY();
                break;
            }
            case BonusValue.TL: {
                this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.TRIPLE_LETTER_FACTORY();
                break;
            }
            case BonusValue.TW: {
                this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.TRIPLE_WORD_FACTORY();
                break;
            }
            default:
                this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.EMPTY_FACTORY();
        }
        if (vec.x === BOARD_GAME.CENTER_POSITION && vec.y === BOARD_GAME.CENTER_POSITION) {
            this.playAreaService.boardGame[vec.y][vec.x] = FACTORY_METHOD_GENERATOR.STAR_FACTORY();
        }
    }

    removePlacement(placedLetters: PlacedLetter[]) {
        for (const letter of placedLetters) this.resetBonusTile(letter.position);
    }

    placeArrow(axis: AXIS, vec: Vec2) {
        this.playAreaService.boardGame[vec.y][vec.x].backgroundColor = Color.Arrow;
        this.playAreaService.boardGame[vec.y][vec.x].letter = '';
        this.playAreaService.boardGame[vec.y][vec.x].text = axis === AXIS.HORIZONTAL ? Text.ArrowRight : Text.ArrowDown;
    }

    incrementVector(axis: AXIS, vec: Vec2) {
        if (axis === AXIS.HORIZONTAL) vec.x += 1;
        else vec.y += 1;
    }

    decrementVector(axis: AXIS, vec: Vec2) {
        if (axis === AXIS.HORIZONTAL) vec.x -= 1;
        else vec.y -= 1;
    }

    isEqual(leftVec: Vec2, rightVec: Vec2): boolean {
        return leftVec.x === rightVec.x && rightVec.y === leftVec.y;
    }

    isPositionInBoardRange(position: number): boolean {
        return position >= 0 && position < BOARD_GAME.SQUARES_IN_COLUMN;
    }

    isVectorInBounds(vec: Vec2): boolean {
        return this.isPositionInBoardRange(vec.x) && this.isPositionInBoardRange(vec.y);
    }

    transposeIfVertical(axis: AXIS, vec: Vec2): Vec2 {
        if (axis === AXIS.VERTICAL) return { x: vec.y, y: vec.x };
        return vec;
    }
}
