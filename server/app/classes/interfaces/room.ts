import { GameParameters } from '@app/classes/interfaces/game-parameters';
import { Player } from '@app/classes/interfaces/player';

export interface Room {
    gameCreator: Player;
    guestPlayer: Player;
    gameParameters: GameParameters;
}
