import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { Tile } from '@app/classes/interfaces/tile';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Service } from 'typedi';

@Service()
export class RackHandlerService {
    constructor(public letterReserveService: LetterReserveService) {}

    refillRack(tiles: Tile[]) {
        const numberOfTilesToFill = LETTERS_RACK_SIZE - tiles.length;
        for (let index = 0; index < numberOfTilesToFill; index++) {
            const tile = this.letterReserveService.pickTile();
            /* istanbul ignore else*/
            if (tile) tiles.push(tile);
        }
    }

    removeLetterFromRack(tiles: Tile[], letter: string) {
        for (const [index, aLetter] of tiles.entries()) {
            if (letter === letter.toUpperCase()) {
                /* istanbul ignore else*/
                if (aLetter.letter === '*') {
                    tiles.splice(index, 1);
                    return;
                }
            } else {
                /* istanbul ignore else*/
                if (letter.toUpperCase() === aLetter.letter) {
                    tiles.splice(index, 1);
                    return;
                }
            }
        }
    }
}
