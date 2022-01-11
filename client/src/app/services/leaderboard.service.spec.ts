import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { ClientSocketService } from './client-socket.service';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
    let service: LeaderboardService;
    let clientSocketService: ClientSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        });
        service = TestBed.inject(LeaderboardService);
        clientSocketService = TestBed.inject(ClientSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('player scores array should be populated from subscribe', () => {
        const playerScoreArray: PlayerScore[] = [];
        playerScoreArray.push({ name: 'playerName', score: 1, mode: 'Classic' });
        clientSocketService.playerScoreListObservable.next(playerScoreArray);
        expect(service.leaderBoardClassic.length).toEqual(1);
    });

    it('player scores array should be populated from subscribe', () => {
        const playerScoreArray: PlayerScore[] = [];
        playerScoreArray.push({ name: 'playerName', score: 1, mode: 'Log2990' });
        clientSocketService.playerScoreListObservable.next(playerScoreArray);
        expect(service.leaderBoardLog2990.length).toEqual(1);
    });
});
