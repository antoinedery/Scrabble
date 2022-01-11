import { ApplicationRef, Injectable } from '@angular/core';
import { BEGINNER_BOT_NAMES, EXPERT_BOT_NAMES } from '@app/classes/constants/constants';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerCreatorService {
    beginnerVirtualPlayersNames: string[] = BEGINNER_BOT_NAMES;
    expertVirtualPlayersNames: string[] = EXPERT_BOT_NAMES;

    constructor(clientSocketService: ClientSocketService, applicationRef: ApplicationRef) {
        clientSocketService.playerNameListObservable.subscribe((value) => {
            this.beginnerVirtualPlayersNames = [];
            this.expertVirtualPlayersNames = [];
            for (const player of value) {
                /* istanbul ignore else */
                if (player.difficulty === 'Easy') this.beginnerVirtualPlayersNames.push(player.name);
                else if (player.difficulty === 'Expert') this.expertVirtualPlayersNames.push(player.name);
            }
            applicationRef.tick();
        });
    }

    checkNameExist(nameToAdd: string): boolean {
        for (const name of this.beginnerVirtualPlayersNames) {
            if (name.toUpperCase() === nameToAdd.toUpperCase()) return true;
        }

        for (const name of this.expertVirtualPlayersNames) {
            if (name.toUpperCase() === nameToAdd.toUpperCase()) return true;
        }
        return false;
    }
}
