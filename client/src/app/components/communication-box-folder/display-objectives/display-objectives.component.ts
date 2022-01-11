import { Component, OnDestroy, OnInit } from '@angular/core';
import { Objective } from '@app/classes/interfaces/objectives';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-display-objectives',
    templateUrl: './display-objectives.component.html',
    styleUrls: ['./display-objectives.component.scss'],
})
export class DisplayObjectivesComponent implements OnInit, OnDestroy {
    privatePlayerObjective: Objective[] = [];
    publicObjectives: Objective[] = [];
    objectiveSubscription1: Subscription;
    objectiveSubscription2: Subscription;

    constructor(private playerSettingsService: PlayerSettingsService) {}

    ngOnInit(): void {
        Array.from(this.playerSettingsService.privateObjective, (element) => {
            this.privatePlayerObjective.push(element[1]);
        });

        Array.from(this.playerSettingsService.publicObjectives, (element) => {
            this.publicObjectives.push(element[1]);
        });

        this.objectiveSubscription1 = this.playerSettingsService.privatePlayerObjectiveObservable.subscribe((value) => {
            this.privatePlayerObjective = [];
            Array.from(value, (element) => {
                this.privatePlayerObjective.push(element[1]);
            });
        });

        this.objectiveSubscription2 = this.playerSettingsService.publicObjectivesObservable.subscribe((value) => {
            this.publicObjectives = [];
            Array.from(value, (element) => {
                this.publicObjectives.push(element[1]);
            });
        });
    }

    ngOnDestroy(): void {
        /* istanbul ignore else*/
        if (this.objectiveSubscription1) this.objectiveSubscription1.unsubscribe();
        /* istanbul ignore else*/
        if (this.objectiveSubscription2) this.objectiveSubscription2.unsubscribe();
    }
}
