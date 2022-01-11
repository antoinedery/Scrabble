import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Time } from '@app/classes/interfaces/time';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Component({
    selector: 'app-countdown-timer',
    templateUrl: './countdown-timer.component.html',
    styleUrls: ['./countdown-timer.component.scss'],
})
export class CountdownTimerComponent implements OnInit {
    timerValues: Time;

    constructor(private turnHandlerService: TurnHandlerService, private chgDecRef: ChangeDetectorRef) {
        this.timerValues = { minute: turnHandlerService.timeValue.minute, second: turnHandlerService.timeValue.second };
    }

    ngOnInit() {
        this.selectGameMode();
    }

    selectGameMode(): void {
        this.turnHandlerService.timeChange.subscribe((value) => {
            this.timerValues = value;
            this.chgDecRef.detectChanges();
        });
    }
}
