import { Injectable } from '@angular/core';
import { OBJECTIVES, OBJECTIVE_1, OBJECTIVE_8, RANDOM_NUMBER_GENERATOR } from '@app/classes/constants/constants';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { PlayerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Objective } from '@app/classes/interfaces/objectives';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Tile } from '@app/classes/interfaces/tile';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { PlayerPropertiesService } from '@app/services/local-players/player-properties.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerSettingsService extends PlayerPropertiesService {
    lettersChange: Subject<Tile[]> = new Subject<Tile[]>();
    publicObjectives: Map<number, Objective> = new Map();

    privatePlayerObjectiveObservable: Subject<Map<number, Objective>> = new Subject();
    publicObjectivesObservable: Subject<Map<number, Objective>> = new Subject();

    constructor(public characterValidatorService: CharacterValidatorService, public letterReserveService: LetterReserveService) {
        super(characterValidatorService, letterReserveService);
    }

    assignObjectives(): number[] {
        this.privateObjective = new Map();
        this.publicObjectives = new Map();
        const objectivesTaken = this.assignPrivateObjectiveToPlayer();
        return this.assignPublicObjectives(objectivesTaken);
    }

    resetAllFullfilledProperties(): void {
        for (const obj of OBJECTIVES) {
            obj.fullfilled = false;
        }
    }

    assignPrivateObjectiveToPlayer(): number[] {
        this.privateObjective.clear();
        const privateObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
        this.privateObjective.set(privateObjective, OBJECTIVES[privateObjective - 1]);

        this.privatePlayerObjectiveObservable.next(this.privateObjective);
        const objectivesTaken: number[] = [];
        objectivesTaken.push(privateObjective);
        return objectivesTaken;
    }

    assignPublicObjectives(objectivesTaken: number[]): number[] {
        this.publicObjectives.clear();
        for (let i = 0; i < 2; i++) {
            let publicObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
            while (objectivesTaken.includes(publicObjective)) {
                publicObjective = RANDOM_NUMBER_GENERATOR.GENERATE_RANDOM_NUMBER(OBJECTIVE_1, OBJECTIVE_8);
            }
            this.publicObjectives.set(publicObjective, OBJECTIVES[publicObjective - 1]);
            objectivesTaken.push(publicObjective);
        }
        this.publicObjectivesObservable.next(this.publicObjectives);
        return objectivesTaken;
    }

    checkIsLetterInRack(letter: string): boolean {
        return this.getLetterIndex(this.letters, letter) !== undefined;
    }

    reinsertPlacement(placedLetters: PlacedLetter[]) {
        for (const letter of placedLetters) this.reinsertLetter(letter.content);
    }

    reinsertLetter(letter: string) {
        if (letter === letter.toUpperCase()) {
            this.letters.push({ letter: '*', score: 0 });
        } else {
            const letterContent = letter.toUpperCase();
            const letterScore = this.letterReserveService.getLetterScore(letterContent);
            /* istanbul ignore else*/
            if (letterScore) this.letters.push({ letter: letterContent, score: letterScore });
        }
    }

    removePlacementFromRack(placement: Placement) {
        for (const letter of placement.letters) {
            this.removeLetterFromRack(letter.content);
        }
    }

    getNumberOfBlankLettersInLetterRack(): number {
        const letterRack = this.letters;
        let counter = 0;
        for (const tile of letterRack) {
            if (tile.letter === '*') counter++;
        }
        return counter;
    }

    setPropertiesForGameConversionSettings(playerInfos: PlayerInfos, publicObjectives: string) {
        this.publicObjectives = new Map(JSON.parse(publicObjectives));
        this.name = playerInfos.name;
        playerInfos.isMyTurn = true;
        this.hasToPlayObservable.next(true);
        this.setPropertiesForGameConversion(playerInfos);
        this.lettersChange.next(this.letters);
    }
}
