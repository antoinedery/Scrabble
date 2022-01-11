import { ApplicationRef, Injectable } from '@angular/core';
import { PLAYER_NAME_LENGTH } from '@app/classes/constants/constants';
import { VirtualPlayerDifficulty } from '@app/classes/enums/enums';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';
import { Subject } from 'rxjs';
import { GameManagerService } from './game-manager.service';
import { VirtualPlayerSettingsService } from './local-players/virtual-player/virtual-player-settings.service';

@Injectable({
    providedIn: 'root',
})
export class NameValidatorService extends CharacterValidatorService {
    playerNameIsValid: boolean = false;
    playerFirstCharacterIsValid: boolean = false;
    playerEveryCharacterIsValid: boolean = false;
    playerNameLengthIsValid: boolean = false;
    nameChange: Subject<string> = new Subject<string>();

    constructor(
        private playerSettingsService: PlayerSettingsService,
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private gameManagerService: GameManagerService,
        private applicationRef: ApplicationRef,
        private virtualPlayerCreatorService: VirtualPlayerCreatorService,
    ) {
        super();
        this.virtualPlayerSettingsService.virtualPlayerNameSetterObservable.subscribe(() => {
            this.selectVirtualPlayerName();
        });
    }

    validatePlayerName(playerName: string): void {
        this.validateNameFirstCharacter(playerName);
        this.validateNameLength(playerName);
        this.validateNameEveryCharacter(playerName);
        this.setPlayerName(playerName);
        this.applicationRef.tick();
    }

    setPlayerName(playerName: string): void {
        this.playerNameIsValid =
            this.validateNameFirstCharacter(playerName) && this.validateNameLength(playerName) && this.validateNameEveryCharacter(playerName);
        if (!this.playerNameIsValid) return;
        this.playerSettingsService.name = playerName;
    }

    validateNameLength(playerName: string): boolean {
        if (playerName.length < PLAYER_NAME_LENGTH.MINIMUM_LENGTH || playerName.length > PLAYER_NAME_LENGTH.MAXIMUM_LENGTH)
            return (this.playerNameLengthIsValid = false);
        return (this.playerNameLengthIsValid = true);
    }

    validateNameFirstCharacter(playerName: string): boolean {
        if (!this.checkIsALetter(playerName[0])) return (this.playerFirstCharacterIsValid = false);
        return (this.playerFirstCharacterIsValid = true);
    }

    validateNameEveryCharacter(playerName: string): boolean {
        for (const letter of playerName) {
            if (!this.checkIsALetter(letter) && !this.checkIsANumber(letter)) return (this.playerEveryCharacterIsValid = false);
        }
        return (this.playerEveryCharacterIsValid = true);
    }

    selectVirtualPlayerName(): void {
        do {
            if (this.gameManagerService.virtualPlayerDifficulty === VirtualPlayerDifficulty.Beginner) {
                const randomNameIndex = Math.floor(Math.random() * this.virtualPlayerCreatorService.beginnerVirtualPlayersNames.length);
                this.virtualPlayerSettingsService.name = this.virtualPlayerCreatorService.beginnerVirtualPlayersNames[randomNameIndex];
            } else {
                const randomNameIndex = Math.floor(Math.random() * this.virtualPlayerCreatorService.expertVirtualPlayersNames.length);
                this.virtualPlayerSettingsService.name = this.virtualPlayerCreatorService.expertVirtualPlayersNames[randomNameIndex];
            }
        } while (this.virtualPlayerSettingsService.name.toUpperCase() === this.playerSettingsService.name.toUpperCase());
        this.nameChange.next(this.virtualPlayerSettingsService.name);
    }
}
