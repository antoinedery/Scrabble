import { TestBed } from '@angular/core/testing';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { PlayerNameComparatorService } from './player-name-comparator.service';

describe('PlayerNameComparatorService', () => {
    let service: PlayerNameComparatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerNameComparatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('receiveGame should store the game received and the name of the player', () => {
        const game: WaitingGame = {
            playerName: 'abcd',
            timer: { minute: 1, second: 0 },
            dictionary: { title: 'Français', description: '' },
            bonus: false,
            socketId: '123456789',
            isLog2990ModeChosen: false,
        };
        service.receiveGame(game);
        expect(service.game).toEqual(game);
        expect(service.opponentPlayerName).toEqual(game.playerName);
    });

    it('comparePlayerNames should compare both playernames', () => {
        const currentPlayerName = 'abcd';
        service.opponentPlayerName = 'abcd';
        service.comparePlayerNames(currentPlayerName);
        expect(service.areNameIdentical).toBeTrue();
    });
});
