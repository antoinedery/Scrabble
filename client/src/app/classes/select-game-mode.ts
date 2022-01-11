import { SelectGameModeService } from '@app/services/select-game-mode.service';

export abstract class SelectGameMode {
    isSoloModeChosen: boolean = false;

    constructor(protected selectGameModeService: SelectGameModeService) {
        this.subGameMode();
    }

    subGameMode(): void {
        this.selectGameModeService.soloModeObservable.subscribe((value) => {
            this.isSoloModeChosen = value;
        });
    }
}
