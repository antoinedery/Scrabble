import { ONE_MINUTE, ONE_SECOND_MS, THREE_SECONDS_MS } from '@app/classes/constants/constants';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { PlayerRackHandlerService } from '@app/services/player-rack-handler.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Service } from 'typedi';
import { ActivePlayerService } from './active-player.service';
import { LetterReserveService } from './letter-reserve.service';
import { ObjectivesValidationService } from './objectives-validation.service';
import { PlayAreaService } from './play-area.service';
import { RoomDataService } from './room-data.service';

declare type ASocket = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

@Service()
export class PlayerPlacementConfirmationService {
    constructor(
        private playerRackHandlerService: PlayerRackHandlerService,
        private placementValidationService: PlacementValidationService,
        private tileHandlerService: TileHandlerService,
        private turnHandlerService: TurnHandlerService,
        private activePlayerService: ActivePlayerService,
        private letterReserveService: LetterReserveService,
        private playAreaService: PlayAreaService,
        private objectivesValidationService: ObjectivesValidationService,
        private roomDataService: RoomDataService,
    ) {}

    confirmPlayerPlacement(placement: Placement, socket: ASocket, sio: io.Server, roomID: string, message: string) {
        let timeoutValue = THREE_SECONDS_MS;
        const timerValue = (this.turnHandlerService.counter.minute * ONE_MINUTE + this.turnHandlerService.counter.second) * ONE_SECOND_MS;
        /* istanbul ignore else */
        if (timerValue <= timeoutValue) timeoutValue = (timerValue / ONE_SECOND_MS - 1) * ONE_SECOND_MS;
        setTimeout(() => {
            const scoredPlacement = this.placementValidationService.getValidatedPlacement(placement);
            if (scoredPlacement) {
                /* istanbul ignore else */
                if (this.roomDataService.isLog2990ModeChosen)
                    this.objectivesValidationService.validateObjectives(scoredPlacement, timerValue, sio, socket);

                this.activePlayerService.playerScore += scoredPlacement.totalScore;
                this.playerRackHandlerService.refillPlayerRack();
                this.tileHandlerService.placeLetters(scoredPlacement.placement.letters);
                this.activePlayerService.overwriteActualPlayerAttributes();

                socket.broadcast.to(roomID).emit('hereIsANewMessage', message, this.activePlayerService.playerName);
                sio.to(roomID).emit('hereIsAPlayerScore', this.activePlayerService.playerScore, socket.id);
                sio.to(roomID).emit('hereIsLetterRackSize', this.activePlayerService.activePlayerRack.length, socket.id);
                sio.to(roomID).emit('hereIsTheReserveSize', this.letterReserveService.letterReserveTotalSize);
                socket.broadcast.to(roomID).emit('hereIsTheBoardUpdated', this.playAreaService.boardGame);
            } else {
                /* istanbul ignore else */
                if (this.roomDataService.isLog2990ModeChosen) this.objectivesValidationService.resetObjectiveCounters();
                this.playerRackHandlerService.reinsertPlacement(placement.letters);
                socket.emit('hereIsTheBoardUpdated', this.playAreaService.boardGame);
            }
            socket.emit('hereIsYourLetterRack', this.activePlayerService.activePlayerRack);
            socket.emit('allowPlayerToPlay');
            this.turnHandlerService.resetTurnsPassed();
        }, timeoutValue);
        socket.emit('preventPlayerFromPlaying');
    }
}
