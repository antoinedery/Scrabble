import { Tile } from '@app/classes/interfaces/tile';
import { Objective } from './objectives';

export interface Player {
    playerName: string;
    socketID: string;
    letterRack: Tile[];
    playerScore: number;
    isMyTurn: boolean;
    privateObjective: Map<number, Objective>;
}
