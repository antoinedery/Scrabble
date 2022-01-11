import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Time } from '@app/classes/interfaces/time';
import { ClientSocketService } from '@app/services/client-socket.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { CountdownTimerComponent } from './countdown-timer.component';

describe('CountdownTimerComponent', () => {
    let component: CountdownTimerComponent;
    let fixture: ComponentFixture<CountdownTimerComponent>;
    let turnHandlerService: TurnHandlerService;
    let selectGameModeService: SelectGameModeService;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CountdownTimerComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CountdownTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        turnHandlerService = TestBed.inject(TurnHandlerService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        clientSocketService = TestBed.inject(ClientSocketService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectGameMode should update timerValue variable if in solo mode', () => {
        selectGameModeService.isSoloModeChosen = true;
        const expectedTimeValue: Time = { minute: 0, second: 58 };
        const twoSecondsMS = 2000;
        component.ngOnInit();
        turnHandlerService.resetTimer();
        let timerValue = { minute: 1, second: 0 };
        turnHandlerService.timeChange.subscribe((value) => {
            timerValue = value;
        });
        jasmine.clock().tick(twoSecondsMS);
        expect(timerValue.minute).toEqual(expectedTimeValue.minute);
        expect(timerValue.second).toEqual(expectedTimeValue.second);
    });

    it('timerValue variable should be updated when the timer runs', () => {
        selectGameModeService.isSoloModeChosen = false;

        component.selectGameMode();
        const expectedTimeValue: Time = { minute: 1, second: 0 };
        clientSocketService.timeChange.next(expectedTimeValue);

        expect(component.timerValues.minute).toEqual(expectedTimeValue.minute);
        expect(component.timerValues.second).toEqual(expectedTimeValue.second);
    });
});
