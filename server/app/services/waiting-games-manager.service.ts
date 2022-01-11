import { WaitingGame } from 'app/classes/interfaces/waiting-game';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';
import * as io from 'socket.io';
import { Service } from 'typedi';

declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class WaitingGamesManagerService {
    classicModeWaitingGames: Map<string, WaitingGame> = new Map<string, WaitingGame>();
    log2990ModeWaitingGames: Map<string, WaitingGame> = new Map<string, WaitingGame>();

    addWaitingGame(socket: ASocket, game: WaitingGame): void {
        if (game.isLog2990ModeChosen) this.log2990ModeWaitingGames.set(game.socketId, game);
        else this.classicModeWaitingGames.set(game.socketId, game);

        let waitingGames: WaitingGame[] = [];
        waitingGames = this.convertMapToArray(game.isLog2990ModeChosen);

        socket.broadcast.emit('hereAreTheWaitingGames', waitingGames, game.isLog2990ModeChosen);
    }

    convertMapToArray(isModeLog2990Chosen: boolean): WaitingGame[] {
        const waitingsGamesArray: WaitingGame[] = [];
        if (isModeLog2990Chosen) {
            for (const waitingGame of this.log2990ModeWaitingGames) {
                waitingsGamesArray.push(waitingGame[1]);
            }
        } else {
            for (const waitingGame of this.classicModeWaitingGames) {
                waitingsGamesArray.push(waitingGame[1]);
            }
        }
        return waitingsGamesArray;
    }

    sendWaitingGames(socket: ASocket, isLog2990ModeChosen: boolean): void {
        let waitingGames: WaitingGame[] = [];
        waitingGames = this.convertMapToArray(isLog2990ModeChosen);
        socket.emit('hereAreTheWaitingGames', waitingGames, isLog2990ModeChosen);
    }

    deleteWaitingGame(sio: io.Server, gameHostSocketId: string): void {
        let isLog2990ModeChosen = false;
        if (this.log2990ModeWaitingGames.has(gameHostSocketId)) {
            this.log2990ModeWaitingGames.delete(gameHostSocketId);
            isLog2990ModeChosen = true;
        } else this.classicModeWaitingGames.delete(gameHostSocketId);

        let waitingGames: WaitingGame[] = [];
        waitingGames = this.convertMapToArray(isLog2990ModeChosen);
        sio.sockets.emit('hereAreTheWaitingGames', waitingGames, isLog2990ModeChosen);
    }
}
