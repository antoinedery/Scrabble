import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientSocketService } from '@app/services/client-socket.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { VirtualPlayerCreatorService } from '@app/services/virtual-player-creator.service';
@Component({
    selector: 'app-virtual-player-creator',
    templateUrl: './virtual-player-creator.component.html',
    styleUrls: ['./virtual-player-creator.component.scss'],
})
export class VirtualPlayerCreatorComponent {
    beginnerSelection: string = 'card';
    expertSelection: string = 'card';
    virtualPlayerName: string = '';
    selectedDifficulty: string = '';
    connectedServer: boolean = true;
    constructor(
        private matDialog: MatDialog,
        private nameValidatorService: NameValidatorService,
        private virtualPlayerCreatorService: VirtualPlayerCreatorService,
        public clientSocketService: ClientSocketService,
        private chgref: ChangeDetectorRef,
    ) {
        this.clientSocketService.connectedServerObservable.subscribe((value) => {
            this.connectedServer = value;
            this.chgref.detectChanges();
        });
    }

    selectBotDifficulty(difficulty: string): void {
        this.beginnerSelection = difficulty === 'Easy' ? (this.beginnerSelection = 'card-selected') : (this.beginnerSelection = 'card');
        this.expertSelection = difficulty === 'Expert' ? (this.expertSelection = 'card-selected') : (this.expertSelection = 'card');
        this.selectedDifficulty = difficulty;
    }

    assignTempPlayerName(name: string) {
        this.virtualPlayerName = name;
    }

    closeModal(): void {
        this.matDialog.closeAll();
    }

    confirmCreation(): void {
        if (
            this.virtualPlayerName.length === 0 ||
            !this.nameValidatorService.playerNameIsValid ||
            this.virtualPlayerCreatorService.checkNameExist(this.virtualPlayerName) ||
            this.selectedDifficulty === ''
        )
            return;
        this.clientSocketService.sendPlayerToAdd({ name: this.virtualPlayerName, difficulty: this.selectedDifficulty });
        this.closeModal();
    }
}
