import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { LeaderboardService } from '@app/services/leaderboard.service';

@Component({
    selector: 'app-score-modal',
    templateUrl: './score-modal.component.html',
    styleUrls: ['./score-modal.component.scss'],
})
export class ScoreModalComponent {
    @ViewChild(MatStepper) stepper: MatStepper;
    verifyClassic: boolean = false;

    constructor(private matDialog: MatDialog, public leaderboardService: LeaderboardService) {}

    setMode(mode: boolean): void {
        this.verifyClassic = mode;
        this.stepper.next();
    }

    closeModal(): void {
        this.matDialog.closeAll();
    }
}
