import { Injectable } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Objective } from '@app/classes/interfaces/objectives';
import { Tile } from '@app/classes/interfaces/tile';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerPropertiesService {
    name: string = '';
    hasToPlay: boolean = false;
    hasToPlayObservable: Subject<boolean> = new Subject<boolean>();
    letters: Tile[] = [];
    rackSizeObservable: Subject<number> = new Subject<number>();
    score: number = 0;
    privateObjective: Map<number, Objective> = new Map();
    constructor(public characterValidatorService: CharacterValidatorService, public letterReserveService: LetterReserveService) {}

    refillRack() {
        const numberOfTilesToFill = LETTERS_RACK_SIZE - this.letters.length;
        for (const letter of this.letterReserveService.pickTilesArray(numberOfTilesToFill)) {
            this.letters.push(letter);
        }
    }

    removeLetterFromRack(letter: string) {
        this.removeLetterFromGivenRack(this.letters, letter);
    }

    removeLetterFromGivenRack(rack: Tile[], letter: string) {
        const letterIndex = this.getLetterIndex(rack, letter);
        if (letterIndex === undefined) return false;
        this.letters.splice(letterIndex, 1);
        return true;
    }

    getLetterIndex(rack: Tile[], letter: string): number | undefined {
        for (const [index, aLetter] of rack.entries()) {
            if (letter === letter.toUpperCase()) {
                /* istanbul ignore else*/
                if (aLetter.letter === '*') {
                    return index;
                }
            } else {
                /* istanbul ignore else*/
                if (this.characterValidatorService.removeLetterAccent(letter.toUpperCase()) === aLetter.letter) {
                    return index;
                }
            }
        }
        return;
    }

    setPropertiesForGameConversion(playerInfos: PlayerInfos) {
        this.privateObjective = new Map(JSON.parse(playerInfos.privateObjective));
        this.letters = playerInfos.letterRack;
        this.score = playerInfos.playerScore;
        this.hasToPlay = playerInfos.isMyTurn;
    }
}
