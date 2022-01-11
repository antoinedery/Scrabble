import { IDictionary } from '@app/classes/interfaces/dictionary';
import { Tile } from '@app/classes/interfaces/tile';
import { Time } from './time';

export interface MultiPlayerGameInfos {
    existingPlayer: PlayerInfos;
    quittingPlayer: PlayerInfos;
    publicObjectives: string;
    turnHandlerInfos: TurnHandlerInfos;
    dataInfos: DataInfos;
}

export interface PlayerInfos {
    name: string;
    letterRack: Tile[];
    playerScore: number;
    isMyTurn: boolean;
    privateObjective: string;
}

export interface TurnHandlerInfos {
    turnsPassed: number;
    timeValue: Time;
    gameEnded: boolean;
}

export interface ReserveInfos {
    reserve: string;
    size: number;
}

export interface DataInfos {
    reserveInfos: ReserveInfos;
    dictionary: IDictionary;
}
