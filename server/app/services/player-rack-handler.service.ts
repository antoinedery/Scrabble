import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { ActivePlayerService } from '@app/services/active-player.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { RackHandlerService } from '@app/services/rack-handler.service';
import { Service } from 'typedi';

@Service()
export class PlayerRackHandlerService extends RackHandlerService {
    constructor(private activePlayerService: ActivePlayerService, public letterReserveService: LetterReserveService) {
        super(letterReserveService);
    }

    refillPlayerRack() {
        this.refillRack(this.activePlayerService.activePlayerRack);
    }

    reinsertPlacement(placedLetters: PlacedLetter[]) {
        for (const letter of placedLetters) this.reinsertLetter(letter.content);
    }

    reinsertLetter(letter: string) {
        if (letter === letter.toUpperCase()) {
            this.activePlayerService.activePlayerRack.push({ letter: '*', score: 0 });
        } else {
            const letterContent = letter.toUpperCase();
            const letterScore = this.letterReserveService.getLetterScore(letterContent);
            /* istanbul ignore else*/
            if (letterScore) this.activePlayerService.activePlayerRack.push({ letter: letterContent, score: letterScore });
        }
    }

    checkIsLetterInRack(letter: string): boolean {
        for (const aLetter of this.activePlayerService.activePlayerRack) {
            if (letter === letter.toUpperCase()) {
                /* istanbul ignore else*/
                if (aLetter.letter === '*') {
                    return true;
                }
            } else {
                /* istanbul ignore else*/
                if (letter.toUpperCase() === aLetter.letter) {
                    return true;
                }
            }
        }
        return false;
    }

    removeLetterFromPlayerRack(letter: string) {
        this.removeLetterFromRack(this.activePlayerService.activePlayerRack, letter);
    }
}
