import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TIMER_CHANGE_VALUE } from '@app/classes/constants/constants';
import { GameSettingsComponent } from '@app/components/create-game-folder/game-settings/game-settings.component';
import { NameValidatorComponent } from '@app/components/create-game-folder/name-validator/name-validator.component';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlayAreaService } from '@app/services/play-area.service';

describe('GameSettingsComponent', () => {
    let component: GameSettingsComponent;
    let playAreaService: PlayAreaService;
    let fixture: ComponentFixture<GameSettingsComponent>;
    let stepperModalComponent: StepperModalComponent;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSettingsComponent, MatStepper, NameValidatorComponent],
            providers: [StepperModalComponent],
            imports: [
                FormsModule,
                MatStepperModule,
                MatDialogModule,
                RouterTestingModule,
                MatSlideToggleModule,
                MatMenuModule,
                BrowserAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSettingsComponent);
        playAreaService = TestBed.inject(PlayAreaService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        stepperModalComponent = TestBed.inject(StepperModalComponent);
        clientSocketService = TestBed.inject(ClientSocketService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('createWaitingGame should be call from subscribe', () => {
        const createRoomSpy = spyOn(clientSocketService, 'createRoom');
        const sendCreatedGameSpy = spyOn(clientSocketService, 'sendCreatedGame');
        stepperModalComponent.createWaitingGameObservable.next();
        expect(createRoomSpy).toHaveBeenCalled();
        expect(sendCreatedGameSpy).toHaveBeenCalled();
    });

    it('assignTempPlayerName should correctly assign the players name', () => {
        const playerName = 'name';
        component.assignTempPlayerName(playerName);
        expect(component.playerName).toEqual(playerName);
    });

    it('toggleBonus function should invert ', () => {
        playAreaService.randomize = true;
        component.toggleBonus();
        expect(playAreaService.randomize).toBe(false);
    });

    it('printTime function should display the time correctly', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_CHANGE_VALUE;
        component.printTime();
        expect(component.time.nativeElement.innerHTML).toBe('1:30');
    });

    it('printTime function should display the time correctly if seconds < 10', () => {
        component.timer.minute = 1;
        component.timer.second = 9;
        component.printTime();
        expect(component.time.nativeElement.innerHTML).toBe('1:09');
    });

    it('incrementClock function increases time value by 30 seconds upon each click', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.incrementClock();
        expect(component.timer.minute).toBe(1);
        expect(component.timer.second).toBe(TIMER_CHANGE_VALUE);
        expect(component.decrementButton.nativeElement.disabled).toBe(false);
    });

    it('incrementClock function increases minute value by 1 if seconds equal 60', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_CHANGE_VALUE;
        component.incrementClock();
        expect(component.timer.minute).toBe(2);
        expect(component.timer.second).toBe(0);
        expect(component.decrementButton.nativeElement.disabled).toBe(false);
    });

    it('incrementClock function disables increment button when minute equal 5', () => {
        component.timer.minute = 4;
        component.timer.second = TIMER_CHANGE_VALUE;
        component.incrementClock();
        expect(component.incrementButton.nativeElement.disabled).toBe(true);
    });

    it('printTime function should be called when increment button is clicked', () => {
        const printTimeSpy = spyOn(component, 'printTime');
        component.incrementClock();
        expect(printTimeSpy).toHaveBeenCalled();
    });

    it('decrementClock function decreases time value by 30 seconds upon each click', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_CHANGE_VALUE;
        component.decrementClock();
        expect(component.timer.minute).toBe(1);
        expect(component.timer.second).toBe(0);
        expect(component.incrementButton.nativeElement.disabled).toBe(false);
    });

    it('decrementClock function decreases minute value by 1 if seconds decreases past 0', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.decrementClock();
        expect(component.timer.minute).toBe(0);
        expect(component.timer.second).toBe(TIMER_CHANGE_VALUE);
        expect(component.incrementButton.nativeElement.disabled).toBe(false);
    });

    it('decrementClock function disables decrement button when minute equal 0 and seconds equal to 30', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.decrementClock();
        expect(component.decrementButton.nativeElement.disabled).toBe(true);
    });

    it('printTime function should be called when decrement button is clicked', () => {
        const printTimeSpy = spyOn(component, 'printTime');
        component.decrementClock();
        expect(printTimeSpy).toHaveBeenCalled();
    });

    it('getDictionaryTitle should assign the correct dictionary name', () => {
        const dictionary = { title: 'titre', description: 'description' };
        component.currentDictionary = { title: '', description: '' };
        component.getDictionaryTitle({ title: 'titre', description: 'description' });
        expect(component.currentDictionary).toEqual(dictionary);
    });

    it('dictionaryList should be updated when dictionary choice button is clicked', () => {
        const updateDictionaryListSpy = spyOn(clientSocketService, 'updateDictionaryList');
        const getDictionaryButton = fixture.debugElement.query(By.css('#title-container')).nativeElement;
        getDictionaryButton.click();
        expect(updateDictionaryListSpy).toHaveBeenCalled();
    });
});
