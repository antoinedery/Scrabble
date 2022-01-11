import { Injectable } from '@angular/core';
import { DEFAULT_CLASSIC_PLAYERS, DEFAULT_LOG2990_PLAYERS } from '@app/classes/constants/constants';
import { PlayerScore } from '@app/classes/interfaces/player-score';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class LeaderboardService {
    leaderBoardClassic: PlayerScore[] = DEFAULT_CLASSIC_PLAYERS;
    leaderBoardLog2990: PlayerScore[] = DEFAULT_LOG2990_PLAYERS;
    constructor(clientSocketService: ClientSocketService) {
        clientSocketService.playerScoreListObservable.subscribe((value) => {
            /* istanbul ignore else */
            if (value[0].mode === 'Classic') this.leaderBoardClassic = [];
            else if (value[0].mode === 'Log2990') this.leaderBoardLog2990 = [];
            for (const score of value) {
                /* istanbul ignore else */
                if (score.mode === 'Classic') {
                    this.leaderBoardClassic.push(score);
                } else if (score.mode === 'Log2990') {
                    this.leaderBoardLog2990.push(score);
                }
            }
        });
    }
}
