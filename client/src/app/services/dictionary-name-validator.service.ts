import { ApplicationRef, Injectable } from '@angular/core';
import { DICTIONARY_TITLE_MAX_LENGTH, FORBIDDEN_SYMBOLS, MAX_DICTIONARY_SIZE, MIN_WORDS_DICTIONARY } from '@app/classes/constants/constants';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Subject } from 'rxjs';
import { CharacterValidatorService } from './character-validator.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryNameValidatorService extends CharacterValidatorService {
    titleIsValid: boolean = false;
    firstCharacterIsValid: boolean = false;
    everyTitleCharacterIsValid: boolean = false;
    titleLengthIsValid: boolean = false;
    descriptionLengthIsValid: boolean = false;
    dictionaryValidityObservable: Subject<boolean> = new Subject();
    dictionary: IDictionary = { title: '', description: '', words: [] };
    fileReader = new FileReader();

    dictionaryList: DictionaryDetails[] = [];

    constructor(private clientSocketService: ClientSocketService, private applicationRef: ApplicationRef) {
        super();
        this.dictionaryList.push({ title: 'Français', description: 'Dictionnaire par défaut' });
        clientSocketService.updateDictionariesObservable.subscribe((value) => {
            this.dictionaryList = value;
            applicationRef.tick();
        });
        this.clientSocketService.updateDictionaryList();
    }

    validateTitle(title: string): void {
        this.everyTitleCharacterIsValid = this.validateTitleEveryCharacter(title);
        this.setTitleValidity(title);
        this.applicationRef.tick();
    }

    setTitleValidity(title: string): boolean {
        return (this.titleIsValid = this.validateTitleLength(title) && this.validateTitleEveryCharacter(title));
    }

    validateTitleLength(title: string): boolean {
        return title.length >= 1 && title.length < DICTIONARY_TITLE_MAX_LENGTH;
    }

    validateTitleEveryCharacter(title: string): boolean {
        if (title[0] === ' ') return false;
        for (const letter of title) {
            if (FORBIDDEN_SYMBOLS.has(letter)) return false;
        }
        return true;
    }

    checkTitleExist(titleToAdd: string): boolean {
        for (const dictionary of this.dictionaryList) {
            if (dictionary.title.toUpperCase() === titleToAdd.toUpperCase()) return true;
        }
        return false;
    }

    handleFile(file: File): void {
        if (file.size > MAX_DICTIONARY_SIZE) {
            this.dictionaryValidityObservable.next(false);
            return;
        }
        this.fileReader.readAsText(file, 'utf-8');
        this.fileReader.onload = () => {
            this.loadFile(this.fileReader.result);
        };
    }

    loadFile(text: string | ArrayBuffer | null): void {
        if (text) this.handleJson(text.toString());
        else this.dictionaryValidityObservable.next(false);
    }

    handleJson(text: string) {
        try {
            this.dictionary = JSON.parse(text);
            if (
                this.checkIsDictionary(this.dictionary) &&
                !this.checkTitleExist(this.dictionary.title) &&
                this.setTitleValidity(this.dictionary.title)
            ) {
                this.dictionaryValidityObservable.next(true);
                return;
            }
            throw new Error();
        } catch {
            this.dictionaryValidityObservable.next(false);
        }
    }

    checkIsDictionary(dic: IDictionary): boolean {
        for (const word of dic.words) {
            for (const letter of word) {
                /* istanbul ignore else */
                if (!this.checkIsALetter(letter)) return false;
            }
        }
        return !(dic.words.length < MIN_WORDS_DICTIONARY);
    }

    confirmUpload(): void {
        this.clientSocketService.sendDictionaryToServer(this.dictionary);
    }
}
