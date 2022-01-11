import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { PlayerPropertiesService } from '@app/services/local-players/player-properties.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { Subject } from 'rxjs';

export abstract class PlayerPlacement {
    scoreObservable: Subject<number> = new Subject<number>();

    constructor(public playerPropertiesService: PlayerPropertiesService, public tileHandlerService: TileHandlerService) {}

    placeLetterFromRack(letter: PlacedLetter) {
        this.tileHandlerService.placeLetter(letter);
        this.playerPropertiesService.removeLetterFromRack(letter.content);
    }
}
