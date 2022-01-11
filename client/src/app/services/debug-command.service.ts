import { Injectable } from '@angular/core';
import { ASCII_A, LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { ScoredPlacement } from '@app/classes/interfaces/placement-interfaces';
import { DisplayMessageService } from '@app/services/display-message.service';

@Injectable({
    providedIn: 'root',
})
export class DebugCommandService {
    constructor(private displayMessageService: DisplayMessageService) {}

    displayVirtualPlayerWords(scoredPlacement: ScoredPlacement): void {
        let placedLetter = '';
        for (const letter of scoredPlacement.placement.letters) {
            placedLetter += String.fromCharCode(letter.position.y + ASCII_A) + (letter.position.x + 1) + ':' + letter.content.toUpperCase() + '  ';
        }
        this.displayMessageService.addMessageList('system', placedLetter + '(' + scoredPlacement.totalScore + ')');

        for (const word of scoredPlacement.words) {
            let upperCaseWord = '';
            for (const letter of word.word.content) {
                upperCaseWord += letter.toUpperCase();
            }
            this.displayMessageService.addMessageList('system', upperCaseWord + ' ' + '(' + word.score + ')');
        }
        /* istanbul ignore else */
        if (scoredPlacement.placement.letters.length === LETTERS_RACK_SIZE) this.displayMessageService.addMessageList('system', 'Bingo! (50)');
        this.displayMessageService.addMessageList('system', '');
    }
}
