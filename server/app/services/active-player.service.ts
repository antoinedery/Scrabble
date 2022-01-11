import { Tile } from '@app/classes/interfaces/tile';
import { Service } from 'typedi';
import { RoomDataService } from './room-data.service';

@Service()
export class ActivePlayerService {
    activePlayerRack: Tile[] = [];
    playerName: string = '';
    playerScore: number = 0;
    socketID: string = '';

    constructor(private roomDataService: RoomDataService) {}

    assignAttributes(socketID: string, letterRack?: Tile[]): void {
        if (letterRack) this.activePlayerRack = letterRack;
        this.socketID = socketID;
        if (this.roomDataService.gameCreator.socketID === socketID) {
            this.playerScore = this.roomDataService.gameCreator.playerScore;
            this.playerName = this.roomDataService.gameCreator.playerName;
            if (!letterRack) this.activePlayerRack = this.roomDataService.gameCreator.letterRack;
        } else {
            this.playerScore = this.roomDataService.guestPlayer.playerScore;
            this.playerName = this.roomDataService.guestPlayer.playerName;
            /* istanbul ignore else */
            if (!letterRack) this.activePlayerRack = this.roomDataService.guestPlayer.letterRack;
        }
    }

    overwriteActualPlayerAttributes(): void {
        if (this.roomDataService.gameCreator.socketID === this.socketID) {
            this.roomDataService.gameCreator.letterRack = this.activePlayerRack;
            this.roomDataService.gameCreator.playerScore = this.playerScore;
        } else {
            this.roomDataService.guestPlayer.letterRack = this.activePlayerRack;
            this.roomDataService.guestPlayer.playerScore = this.playerScore;
        }
    }
}
