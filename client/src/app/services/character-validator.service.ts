import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CharacterValidatorService {
    removeLetterAccent(character: string): string {
        return character.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    checkIsALetter(character: string): boolean {
        return /[a-zA-Z]/.test(character);
    }

    checkIsANumber(character: string): boolean {
        return /[0-9]/.test(character);
    }
}
