import { Tile } from '@app/classes/interfaces/tile';
import { RoomDataService } from '@app/services/room-data.service';
import { expect } from 'chai';
import { Container } from 'typedi';
import { ActivePlayerService } from './active-player.service';

describe('ActivePlayerService', () => {
    let service: ActivePlayerService;
    let roomDataService: RoomDataService;

    beforeEach(async () => {
        service = Container.get(ActivePlayerService);
        roomDataService = Container.get(RoomDataService);
    });

    it('assignAttributes should assign gameCreator data but the letter rack from roomDataService to attributes of ActivePlayerService', () => {
        const socketID = '123';
        const expectedScore = 50;
        const expectedName = 'Bob';
        const expectedLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        roomDataService.gameCreator.socketID = socketID;
        roomDataService.gameCreator.playerScore = expectedScore;
        roomDataService.gameCreator.playerName = expectedName;
        roomDataService.gameCreator.letterRack = [];
        service.assignAttributes(socketID, expectedLetterRack);
        expect(service.playerScore).to.equal(expectedScore);
        expect(service.playerName).to.equal(expectedName);
        expect(service.activePlayerRack).to.deep.equal(expectedLetterRack);
    });

    it('assignAttributes should assign gameCreator data from roomDataService to attributes of ActivePlayerService', () => {
        const socketID = '123';
        const expectedScore = 50;
        const expectedName = 'Bob';
        const expectedLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        roomDataService.gameCreator.socketID = socketID;
        roomDataService.gameCreator.playerScore = expectedScore;
        roomDataService.gameCreator.playerName = expectedName;
        roomDataService.gameCreator.letterRack = expectedLetterRack;
        service.assignAttributes(socketID);
        expect(service.playerScore).to.equal(expectedScore);
        expect(service.playerName).to.equal(expectedName);
        expect(service.activePlayerRack).to.deep.equal(expectedLetterRack);
    });

    it('assignAttributes should assign guestPlayer data from roomDataService to attributes of ActivePlayerService', () => {
        const socketID = '123';
        const expectedScore = 50;
        const expectedName = 'Bob';
        const expectedLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        roomDataService.gameCreator.socketID = '';
        roomDataService.guestPlayer.socketID = socketID;
        roomDataService.guestPlayer.playerScore = expectedScore;
        roomDataService.guestPlayer.playerName = expectedName;
        roomDataService.guestPlayer.letterRack = expectedLetterRack;
        service.assignAttributes(socketID);
        expect(service.playerScore).to.equal(expectedScore);
        expect(service.playerName).to.equal(expectedName);
        expect(service.activePlayerRack).to.deep.equal(expectedLetterRack);
    });

    it('overwriteActualPlayerAttributes should overwrite roomDataService gameCreator data by ActivePlayerService data', () => {
        const socketID = '123';
        const expectedScore = 50;
        const expectedLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        service.socketID = socketID;
        service.playerScore = expectedScore;
        service.activePlayerRack = expectedLetterRack;
        roomDataService.gameCreator.socketID = socketID;
        roomDataService.gameCreator.playerScore = 0;
        roomDataService.gameCreator.letterRack = [];
        service.overwriteActualPlayerAttributes();
        expect(roomDataService.gameCreator.playerScore).to.equal(expectedScore);
        expect(roomDataService.gameCreator.letterRack).to.deep.equal(expectedLetterRack);
    });

    it('overwriteActualPlayerAttributes should overwrite roomDataService guestPlayer data by ActivePlayerService data', () => {
        const socketID = '123';
        const expectedScore = 50;
        const expectedLetterRack: Tile[] = [
            { letter: 'A', score: 1 },
            { letter: 'B', score: 1 },
        ];
        service.socketID = socketID;
        service.playerScore = expectedScore;
        service.activePlayerRack = expectedLetterRack;
        roomDataService.gameCreator.socketID = '';
        roomDataService.guestPlayer.playerScore = 0;
        roomDataService.guestPlayer.letterRack = [];
        service.overwriteActualPlayerAttributes();
        expect(roomDataService.guestPlayer.playerScore).to.equal(expectedScore);
        expect(roomDataService.guestPlayer.letterRack).to.deep.equal(expectedLetterRack);
    });
});
