import { Injectable } from '@angular/core';
import { OBJECTIVES, OBJECTIVE_1, OBJECTIVE_8, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerPropertiesService } from '@app/services/local-players/player-properties.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerSettingsService extends PlayerPropertiesService {
    gameModeIsSelected: boolean = false;
    virtualPlayerNameSetterObservable: Subject<unknown> = new Subject();

    constructor(public characterValidatorService: CharacterValidatorService, public letterReserveService: LetterReserveService) {
        super(characterValidatorService, letterReserveService);
    }

    assignPrivateObjectiveToVirtualPlayer(objectivesTaken: number[]): number[] {
        this.privateObjective = new Map();
        let privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        while (objectivesTaken.includes(privateObjective)) {
            privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        }
        this.privateObjective.set(privateObjective, OBJECTIVES[privateObjective - 1]);
        objectivesTaken.push(privateObjective);
        return objectivesTaken;
    }

    getVirtualPlayerRack(): string[] {
        const letterRack: string[] = new Array();

        for (const letter of this.letters) {
            if (letter.letter === '*') {
                letter.letter = 'A';
                letter.score = 1;
            }
            letterRack.push(letter.letter);
        }
        return letterRack;
    }

    setPropertiesForGameConversion(playerInfos: PlayerInfos) {
        playerInfos.isMyTurn = false;
        this.hasToPlayObservable.next(false);
        this.virtualPlayerNameSetterObservable.next();
        super.setPropertiesForGameConversion(playerInfos);
    }
}
