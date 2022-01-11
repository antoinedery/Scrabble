import { DictionaryService } from '@app/services/dictionary.service';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';

describe('DictionaryService', () => {
    let service: DictionaryService;

    beforeEach(() => {
        service = Container.get(DictionaryService);
    });

    it('initDictionary dictionary should call createDictionary', () => {
        const createDictionarySpy = Sinon.stub(service, 'createDictionary');
        service.path = './app/assets/dictionaryManagerTesting/';
        service.initDictionary({ title: 'Français', description: '' });
        expect(createDictionarySpy.calledOnce).to.equal(true);
    });

    it('dictionary should return true when word is found', () => {
        const expectedScore = 5;
        service.dictionaryMap.set('aller', expectedScore);
        const word = 'aller';
        expect(service.contains(word)).to.equal(true);
    });

    it('dictionary should return false when word is not found', () => {
        const word = 'abc';
        expect(service.contains(word)).to.equal(false);
    });

    it('dictionary should return value for corresponding word', () => {
        const expectedScore = 5;
        service.dictionaryMap.set('aller', expectedScore);
        const word = 'aller';
        expect(service.getValue(word)).to.equal(expectedScore);
    });

    it('dictionary should return undefined for invalid word', () => {
        const word = 'abc';
        expect(service.getValue(word)).to.equal(undefined);
    });
});
