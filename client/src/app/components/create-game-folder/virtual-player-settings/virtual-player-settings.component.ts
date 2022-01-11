import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VirtualPlayerDifficulty } from '@app/classes/enums/enums';
import { GameManagerService } from '@app/services/game-manager.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
import { NameValidatorService } from '@app/services/name-validator.service';

@Component({
    selector: 'app-virtual-player-settings',
    templateUrl: './virtual-player-settings.component.html',
    styleUrls: ['./virtual-player-settings.component.scss'],
})
export class VirtualPlayerSettingsComponent implements OnInit {
    @ViewChild('virtualPlayerName') virtualPlayerName: ElementRef;
    beginnerSelection: string = 'card';
    expertSelection: string = 'card';
    botName: string = '';
    playerName: string = '';

    constructor(
        private virtualPlayerSettingsService: VirtualPlayerSettingsService,
        private nameValidatorService: NameValidatorService,
        private gameManagerService: GameManagerService,
    ) {}

    ngOnInit() {
        this.nameValidatorService.nameChange.subscribe((value) => {
            this.botName = value;
        });

        this.gameManagerService.virtualPlayerDifficultyObservable.subscribe((value) => {
            this.displayBotName(value);
        });
    }

    selectBotDifficulty(difficulty: VirtualPlayerDifficulty): void {
        this.beginnerSelection =
            difficulty === VirtualPlayerDifficulty.Beginner ? (this.beginnerSelection = 'card-selected') : (this.beginnerSelection = 'card');
        this.expertSelection =
            difficulty === VirtualPlayerDifficulty.Expert ? (this.expertSelection = 'card-selected') : (this.expertSelection = 'card');

        this.gameManagerService.virtualPlayerDifficulty = difficulty;
        this.nameValidatorService.selectVirtualPlayerName();
        this.displayBotName(true);
        this.virtualPlayerSettingsService.gameModeIsSelected = true;
    }

    displayBotName(difficultyIsSelected: boolean): void {
        if (!difficultyIsSelected) {
            this.virtualPlayerName.nativeElement.style.display = 'none';
            this.virtualPlayerSettingsService.gameModeIsSelected = false;
            this.beginnerSelection = 'card';
            this.expertSelection = 'card';
        } else this.virtualPlayerName.nativeElement.style.display = 'flex';
    }
}
