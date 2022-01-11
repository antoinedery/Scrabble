import { IDictionary } from '@app/classes/interfaces/dictionary';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { expect } from 'chai';
import * as fs from 'fs';
import * as Sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { Container } from 'typedi';
import { DictionaryManagerService } from './dictionary-manager.service';

describe('DictionaryManagerService', () => {
    let service: DictionaryManagerService;

    const testingPath = './app/assets/dictionaryManagerTesting/';

    beforeEach(() => {
        service = Container.get(DictionaryManagerService);
        service.path = testingPath;
        service.initializeDictionaryList();
    });

    it('initializeDictionaryList should populate dictionaryList and add French dictionary at the beginning of list (if)', (done) => {
        const expectedFrenchDictionary: DictionaryDetails = { title: 'Français', description: '' };
        const expectedOtherDictionary: IDictionary = { title: 'mockDictionaryTesting', description: '', words: [] };
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.handleNewDictionary(expectedOtherDictionary, socketStub as unknown as SocketIO.Socket);
        service.initializeDictionaryList();

        expect(service.dictionaryList[0]).to.deep.equal(expectedFrenchDictionary);
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        done();
        updateClientDictionaryStub.restore();
        service.removeDictionary(expectedOtherDictionary.title, socketStub as unknown as SocketIO.Socket);
    });

    it('initializeDictionaryList should call readdirSync from filesystem', () => {
        const readdirSpy = Sinon.spy(fs, 'readdirSync');
        service.initializeDictionaryList();
        expect(readdirSpy.calledWith(testingPath)).to.equal(true);
        readdirSpy.restore();
    });

    it('initializeDictionaryList should call readFileSync from filesystem', () => {
        const fakeDirectoryPath = testingPath + 'Français.json';
        const readFileSyncSpy = Sinon.spy(fs, 'readFileSync');
        service.initializeDictionaryList();
        expect(readFileSyncSpy.calledWith(fakeDirectoryPath, Sinon.match.any)).to.equal(true);
        readFileSyncSpy.restore();
    });

    it('handleNewDictionary should create directory if it does not already exist and create file afterwards', () => {
        const inexistentPath = './app/assets/inexistentPath/';
        const existsSyncStub = Sinon.stub(fs, 'existsSync').returns(false);
        const writeFileSyncStub = Sinon.stub(fs, 'writeFileSync');
        const mkdirSyncStub = Sinon.stub(fs, 'mkdirSync');
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');
        const dictionary: IDictionary = { title: 'title', description: 'description', words: [] };

        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.handleNewDictionary(dictionary, socketStub as unknown as SocketIO.Socket);
        expect(mkdirSyncStub.calledWith(inexistentPath, Sinon.match.any));
        expect(writeFileSyncStub.calledWith(inexistentPath + dictionary.title + '.json', JSON.stringify(dictionary)));
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        writeFileSyncStub.restore();
        mkdirSyncStub.restore();
        existsSyncStub.restore();
        updateClientDictionaryStub.restore();
    });

    it('editDictionary should edit file name and dictionary details', () => {
        const previousDetails: DictionaryDetails = { title: 'Français', description: '' };
        const newDetails: DictionaryDetails = { title: 'After', description: '' };
        const previousFilePath = testingPath + previousDetails.title + '.json';
        const readFileSyncSpy = Sinon.spy(fs, 'readFileSync');
        const unlinkSyncStub = Sinon.stub(fs, 'unlinkSync');
        const writeFileSyncStub = Sinon.stub(fs, 'writeFileSync');
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');

        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.editDictionary(previousDetails, newDetails, socketStub as unknown as SocketIO.Socket);
        expect(unlinkSyncStub.calledWith(previousFilePath));
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        unlinkSyncStub.restore();
        writeFileSyncStub.restore();
        updateClientDictionaryStub.restore();
        readFileSyncSpy.restore();
    });

    it('editDictionary should return undefined if file index is not found', () => {
        const getIndexOfDictionaryStub = Sinon.stub(service, 'getIndexOfDictionary').returns(undefined);
        const previousDetails: DictionaryDetails = { title: 'Français', description: '' };
        const newDetails: DictionaryDetails = { title: 'After', description: '' };
        const readFileSyncStub = Sinon.stub(fs, 'readFileSync');
        const writeFileSyncStub = Sinon.stub(fs, 'writeFileSync');
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        expect(service.editDictionary(previousDetails, newDetails, socketStub as unknown as SocketIO.Socket)).to.equal(undefined);

        getIndexOfDictionaryStub.restore();
        writeFileSyncStub.restore();
        readFileSyncStub.restore();
    });

    it('removeDictionary should call unlinkSync from fileSystem which deletes the file', () => {
        const filePath = testingPath + 'Français.json';
        const unlinkSyncStub = Sinon.stub(fs, 'unlinkSync');
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');

        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.removeDictionary('Français', socketStub as unknown as SocketIO.Socket);
        expect(unlinkSyncStub.calledWith(filePath));
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        unlinkSyncStub.restore();
        updateClientDictionaryStub.restore();
    });

    it('removeDictionary should return undefined if file index is not found', () => {
        const getIndexOfDictionaryStub = Sinon.stub(service, 'getIndexOfDictionary').returns(undefined);
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        expect(service.removeDictionary('Français', socketStub as unknown as SocketIO.Socket)).to.equal(undefined);
        getIndexOfDictionaryStub.restore();
    });

    it('clearList should call unlinkSync from fileSystem and not clear default dictionary', () => {
        service.dictionaryList = [{ title: 'Français', description: '' }];
        const filePath = testingPath + 'Français.json';
        const unlinkSyncStub = Sinon.stub(fs, 'unlinkSync');
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');

        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.clearList(socketStub as unknown as SocketIO.Socket);
        expect(unlinkSyncStub.calledWith(filePath));
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        expect(service.dictionaryList.length).to.equal(1);
        unlinkSyncStub.restore();
        updateClientDictionaryStub.restore();
    });

    it('clearList should call unlinkSync from fileSystem and clear the dictionaryList array (other than default dictionary)', () => {
        service.dictionaryList = [
            { title: 'Français', description: '' },
            { title: 'English', description: '' },
        ];
        const filePath = testingPath + 'English.json';
        const unlinkSyncStub = Sinon.stub(fs, 'unlinkSync');
        const updateClientDictionaryStub = Sinon.stub(service, 'updateClientDictionary');

        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        service.clearList(socketStub as unknown as SocketIO.Socket);
        expect(unlinkSyncStub.calledWith(filePath));
        expect(updateClientDictionaryStub.calledWith(socketStub as unknown as SocketIO.Socket));
        expect(service.dictionaryList.length).to.equal(1);
        unlinkSyncStub.restore();
        updateClientDictionaryStub.restore();
    });

    it('updateClientDictionary should emit the dictionaryList array', () => {
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
            broadcast: {
                emit: (eventName: string, args: unknown[]) => {
                    return eventName + args;
                },
            },
        };
        const emitStub = Sinon.stub(socketStub as unknown as SocketIO.Socket, 'emit');
        service.updateClientDictionary(socketStub as unknown as SocketIO.Socket);
        expect(emitStub.calledWith('updateClientDictionary', service.dictionaryList));
        emitStub.restore();
    });

    it('downloadDictionary should call readFileSync and emit the file', () => {
        const filePath = testingPath + 'Français.json';
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        const readFileSyncSpy = Sinon.spy(fs, 'readFileSync');
        const emitStub = Sinon.stub(socketStub as unknown as SocketIO.Socket, 'emit');
        service.downloadDictionary('Français', socketStub as unknown as SocketIO.Socket);
        expect(readFileSyncSpy.calledWith(filePath, Sinon.match.any));
        expect(emitStub.calledWith('receiveDictionary', Sinon.match.any));
        readFileSyncSpy.restore();
        emitStub.restore();
    });

    it('sendDictionaryToClient should call readFileSync and emit the file', () => {
        const socketStub = {
            emit: (eventName: string, ...arg: unknown[]) => {
                return eventName + arg;
            },
        };
        const readFileSyncSpy = Sinon.spy(fs, 'readFileSync');
        const emitStub = Sinon.stub(socketStub as unknown as SocketIO.Socket, 'emit');
        service.sendDictionaryToClient('Français', socketStub as unknown as SocketIO.Socket);
        expect(readFileSyncSpy.calledWith('Français', Sinon.match.any));
        expect(emitStub.calledWith('sendDictionaryToClient', Sinon.match.any));
        readFileSyncSpy.restore();
        emitStub.restore();
    });

    it('getIndexOfDictionary should return the index of the dictionary in the list if it exists', () => {
        service.dictionaryList = [{ title: 'Français', description: '' }];
        const dictionaryTitle = 'Français';
        expect(service.getIndexOfDictionary(dictionaryTitle)).to.equal(0);
    });

    it('getIndexOfDictionary should return undefined if dictionary is not in the list exists', () => {
        service.dictionaryList = [{ title: 'Français', description: '' }];
        const dictionaryTitle = 'UndefinedTitle';
        expect(service.getIndexOfDictionary(dictionaryTitle)).to.equal(undefined);
    });
});
