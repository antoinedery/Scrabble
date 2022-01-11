import { TestBed } from '@angular/core/testing';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { DisplayWaitingGamesService } from './display-waiting-games.service';

describe('DisplayWaitingGamesService', () => {
    let service: DisplayWaitingGamesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DisplayWaitingGamesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addCreatedGame should add a game into waitingGames', () => {
        const game: WaitingGame = {
            playerName: 'abc',
            timer: { minute: 1, second: 0 },
            dictionary: { title: 'Français', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        const waitingGames: WaitingGame[] = [];
        waitingGames.push(game);
        service.addCreatedGame(waitingGames);
        expect(service.waitingGames).toEqual(waitingGames);
    });
});
