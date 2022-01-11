import { BOARD_GAME, FACTORY_METHOD_GENERATOR, SQUARE, TABLE_BONUS_CASE_COORDINATES } from '@app/classes/constants/constants';
import { BonusName } from '@app/classes/enums/board-game-enums';
import { BonusStruct, Square } from '@app/classes/interfaces/board-game-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import * as io from 'socket.io';
import { Service } from 'typedi';
@Service()
export class PlayAreaService {
    tableBonus: BonusStruct[] = JSON.parse(JSON.stringify(TABLE_BONUS_CASE_COORDINATES));
    nameArray: string[] = [];
    randomNumber: number;

    boardGame: Square[][] = [];
    coordinates: Vec2 = { x: 0, y: 0 };

    getRandomNumber(minValue: number, maxValue: number): number {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    }

    randomizeBoard(randomize: boolean, sio: io.Server, roomID: string): void {
        if (randomize) {
            for (const bonusCaseName of TABLE_BONUS_CASE_COORDINATES) {
                if (bonusCaseName.name !== BonusName.Star) this.nameArray.push(bonusCaseName.name);
            }
            for (const bonusName of this.tableBonus) {
                this.randomNumber = this.getRandomNumber(0, this.nameArray.length - 1);
                bonusName.name = this.nameArray[this.randomNumber];
                this.nameArray.splice(this.randomNumber, 1);
            }
            this.initialiseBoardCaseList();
        } else {
            this.tableBonus = JSON.parse(JSON.stringify(TABLE_BONUS_CASE_COORDINATES));
            this.initialiseBoardCaseList();
        }
        sio.to(roomID).emit('launchGame', this.boardGame);
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
}
