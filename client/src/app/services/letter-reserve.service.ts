import { Injectable } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { ReserveInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Reserve, Tile } from '@app/classes/interfaces/tile';
import letterReserveFile from '@assets/lettersDistribution.json';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LetterReserveService {
    letterReserve: Map<string, Reserve>;
    letterReserveTotalSize: number;
    letterReserveTotalSizeObservable: Subject<number> = new Subject<number>();

    constructor() {
        this.createReserve();
    }

    createUsedReserve(reserveInfos: ReserveInfos) {
        this.letterReserve = new Map(JSON.parse(reserveInfos.reserve));
        this.letterReserveTotalSize = reserveInfos.size;
    }

    createReserve() {
        this.letterReserve = new Map<string, Reserve>();
        this.letterReserveTotalSize = 0;
        letterReserveFile.reserve.forEach((element) => {
            /* istanbul ignore else */
            if (element.quantity > 0) {
                const reserve: Reserve = { tile: { letter: element.letter, score: element.score }, quantity: element.quantity };
                this.letterReserve.set(element.letter, reserve);
                this.letterReserveTotalSize += reserve.quantity;
            }
        });
        this.letterReserveTotalSizeObservable.next(this.letterReserveTotalSize);
    }

    assignLettersToPlayer(): Tile[] {
        return this.pickTilesArray(LETTERS_RACK_SIZE);
    }

    decrementTileQuantity(reserve: Reserve): void {
        /* istanbul ignore else */
        if (reserve.quantity >= 1) {
            const updatedReserveValue = { tile: { letter: reserve.tile.letter, score: reserve.tile.score }, quantity: reserve.quantity - 1 };
            this.letterReserve.set(reserve.tile.letter, updatedReserveValue);
            this.letterReserveTotalSize--;
            this.letterReserveTotalSizeObservable.next(this.letterReserveTotalSize);
        }
    }

    getLetterQuantity(letter: string): number | undefined {
        const letterInReserve = this.letterReserve.get(letter);
        if (letterInReserve !== undefined) {
            return letterInReserve.quantity;
        }
        return undefined;
    }

    getLetterScore(letter: string): number | undefined {
        const letterInReserve = this.letterReserve.get(letter);
        if (letterInReserve) {
            return letterInReserve.tile.score;
        }
        return undefined;
    }

    insertTileInReserve(tile: Tile): void {
        const currentTile = this.letterReserve.get(tile.letter);
        if (currentTile) {
            const reserve: Reserve = { tile: { letter: tile.letter, score: tile.score }, quantity: currentTile.quantity + 1 };
            this.letterReserve.set(reserve.tile.letter, reserve);
            this.letterReserveTotalSize++;
            this.letterReserveTotalSizeObservable.next(this.letterReserveTotalSize);
        }
    }

    pickTile(): Tile | undefined {
        let randomTile;
        let randomIndex;
        let letterAtIndex;

        do {
            randomIndex = Math.floor(Math.random() * this.letterReserve.size);
            letterAtIndex = Array.from(this.letterReserve.keys())[randomIndex];
            randomTile = this.letterReserve.get(letterAtIndex);
            if (this.letterReserveTotalSize === 0) return;
            if (randomTile === undefined) break;
            if (randomTile.quantity > 0) break;
        } while (randomTile.quantity === 0);

        if (randomTile) {
            this.decrementTileQuantity(randomTile);
            return randomTile.tile;
        } else return;
    }

    pickTilesArray(numberTiles: number): Tile[] {
        const newTiles: Tile[] = [];
        for (let i = 0; i < numberTiles; i++) {
            const newTile = this.pickTile();
            if (newTile) {
                newTiles.push(newTile);
            }
        }
        return newTiles;
    }
}
