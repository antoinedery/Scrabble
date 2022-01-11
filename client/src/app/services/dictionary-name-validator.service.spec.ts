import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { ClientSocketService } from './client-socket.service';
import { DictionaryNameValidatorService } from './dictionary-name-validator.service';

describe('DictionaryNameValidatorService', () => {
    let service: DictionaryNameValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        });
        service = TestBed.inject(DictionaryNameValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateTitle should call all three title validation functions', () => {
        const validateTitleEveryCharacterSpy = spyOn(service, 'validateTitleEveryCharacter');
        service.validateTitle('title');
        expect(validateTitleEveryCharacterSpy).toHaveBeenCalled();
    });

    it('setTitleValidity should set titleIsValid to true if all validation functions return true', () => {
        service.setTitleValidity('title');
        expect(service.titleIsValid).toBeTrue();
    });

    it('validateTitleEveryCharacter should return false when it is not a letter', () => {
        expect(service.validateTitleEveryCharacter('abc/def')).toBeFalse();
    });

    it('validateTitleEveryCharacter should return false when first character is a blank space', () => {
        expect(service.validateTitleEveryCharacter(' abcdef')).toBeFalse();
    });

    it('validateTitleEveryCharacter should return true when a number is in title', () => {
        expect(service.validateTitleEveryCharacter('abc1def')).toBeTrue();
    });

    it('checkTitleExist should return true if title is already in dictionary list', () => {
        service.dictionaryList = [];
        service.dictionaryList.push({
            title: 'title1',
            description: 'description-1',
        });
        expect(service.checkTitleExist('title1')).toBeTrue();
    });

    it('checkTitleExist should return true if title is not in dictionary list', () => {
        service.dictionaryList = [];
        service.dictionaryList.push({
            title: 'title1',
            description: 'description-1',
        });
        expect(service.checkTitleExist('title2')).toBeFalse();
    });

    it('handleFile should call readAsText', () => {
        const readAsTextSpy = spyOn(service.fileReader, 'readAsText').and.callThrough();
        const mockFile = new File(['text'], '', { type: 'application/json' });
        service.handleFile(mockFile);
        expect(readAsTextSpy).toHaveBeenCalled();
    });

    it('handleFile should return undefined if size if over 10 mb', () => {
        const mockFile = new File(['text'], '', { type: 'application/json' });
        Object.defineProperty(mockFile, 'size', { value: 2e7, writable: false });
        expect(service.handleFile(mockFile)).toBeUndefined();
    });

    it('loadFile should call handleJson if file is valid', () => {
        const handleJsonSpy = spyOn(service, 'handleJson');
        service.loadFile('A');
        expect(handleJsonSpy).toHaveBeenCalled();
    });

    it('loadFile should call dictionaryValidityObservable if file is invalid', () => {
        const dictionaryValidityObservableSpy = spyOn(service.dictionaryValidityObservable, 'next');
        service.loadFile('');
        expect(dictionaryValidityObservableSpy).toHaveBeenCalled();
    });

    it('handleJson should call dictionaryValidityObservable.next with true when dictionary is valid', () => {
        spyOn(service, 'checkIsDictionary').and.returnValue(true);
        spyOn(service, 'checkTitleExist').and.returnValue(false);
        spyOn(service, 'setTitleValidity').and.returnValue(true);
        const dictionary: IDictionary = { title: 'title', description: 'description', words: [] };
        const dictionaryValidityObservableSpy = spyOn(service.dictionaryValidityObservable, 'next');
        service.handleJson(JSON.stringify(dictionary));
        expect(dictionaryValidityObservableSpy).toHaveBeenCalledWith(true);
    });

    it('handleJson should throw error and call dictionaryValidityObservable.next with false when dictionary is invalid', () => {
        spyOn(service, 'checkIsDictionary').and.returnValue(false);
        const dictionary: IDictionary = { title: ' title', description: 'description', words: [] };
        const dictionaryValidityObservableSpy = spyOn(service.dictionaryValidityObservable, 'next');
        service.handleJson(JSON.stringify(dictionary));
        expect(dictionaryValidityObservableSpy).toHaveBeenCalledWith(false);
    });

    it('checkIsDictionary should return true if dictionary is valid', () => {
        const dictionary: IDictionary = { title: 'title', description: 'description', words: ['A', 'B', 'C', 'D'] };
        expect(service.checkIsDictionary(dictionary)).toBeTrue();
    });

    it('checkIsDictionary should return false if dictionary is valid', () => {
        const dictionary: IDictionary = { title: 'title', description: 'description', words: ['1', '2', '3', '4'] };
        expect(service.checkIsDictionary(dictionary)).toBeFalse();
    });

    it('confirmUpload should return false if dictionary is valid', () => {
        const clientSocketService = TestBed.inject(ClientSocketService);
        const sendDictionaryToServerSpy = spyOn(clientSocketService, 'sendDictionaryToServer');
        service.confirmUpload();
        expect(sendDictionaryToServerSpy).toHaveBeenCalled();
    });

    it('dictionaryList should be updated by updateDictionariesObservable from clientSocketService', () => {
        const clientSocketService = TestBed.inject(ClientSocketService);
        service.dictionaryList = [];
        const expectedDictionaryList: DictionaryDetails[] = [{ title: 'title', description: 'description' }];
        clientSocketService.updateDictionariesObservable.next(expectedDictionaryList);
        expect(service.dictionaryList).toEqual(expectedDictionaryList);
    });
});
