import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAX_VALUE_TIMER_MINUTE, MINIMAL_DOUBLE_DIGIT, ONE_MINUTE, TIMER_CHANGE_VALUE } from '@app/classes/constants/constants';
import { DictionaryDetails } from '@app/classes/interfaces/dictionary-details';
import { Time } from '@app/classes/interfaces/time';
import { WaitingGame } from '@app/classes/interfaces/waiting-game';
import { StepperModalComponent } from '@app/components/create-game-folder/stepper-modal/stepper-modal.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DictionaryNameValidatorService } from '@app/services/dictionary-name-validator.service';
import { DictionaryService } from '@app/services/dictionary.service';
import { NameValidatorService } from '@app/services/name-validator.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-settings',
    templateUrl: './game-settings.component.html',
    styleUrls: ['./game-settings.component.scss'],
})
export class GameSettingsComponent implements OnInit, OnDestroy {
    @ViewChild('decrementButton') decrementButton: ElementRef;
    @ViewChild('incrementButton') incrementButton: ElementRef;
    @ViewChild('time') time: ElementRef;
    playerName: string = '';
    timer: Time = { minute: 1, second: 0 };
    shuffleBonus: boolean = false;
    currentDictionary: DictionaryDetails = { title: 'Français', description: 'Description par défaut' };
    createWaitingGameSubscription: Subscription;

    constructor(
        public nameValidatorService: NameValidatorService,
        private stepperModalComponent: StepperModalComponent,
        private turnHandlerService: TurnHandlerService,
        private playAreaService: PlayAreaService,
        public dictionaryNameValidatorService: DictionaryNameValidatorService,
        private dictionaryService: DictionaryService,
        private clientSocketService: ClientSocketService,
        private selectGameModeService: SelectGameModeService,
    ) {}

    ngOnInit() {
        this.createWaitingGameSubscription = this.stepperModalComponent.createWaitingGameObservable.subscribe(() => {
            const waitingGame: WaitingGame = {
                playerName: this.playerName,
                timer: this.timer,
                dictionary: this.currentDictionary,
                bonus: this.shuffleBonus,
                socketId: this.clientSocketService.socket.id,
                isLog2990ModeChosen: this.selectGameModeService.isLOG2990ModeChosen,
            };
            this.clientSocketService.createRoom(waitingGame);
            this.clientSocketService.sendCreatedGame(waitingGame);
        });
    }

    ngOnDestroy() {
        this.createWaitingGameSubscription.unsubscribe();
    }

    assignTempPlayerName(name: string) {
        this.playerName = name;
    }

    printTime(): void {
        this.time.nativeElement.innerHTML =
            this.timer.second < MINIMAL_DOUBLE_DIGIT
                ? this.timer.minute.toString() + ':0' + this.timer.second.toString()
                : this.timer.minute.toString() + ':' + this.timer.second.toString();
        this.turnHandlerService.obtainTime(this.timer);
    }

    incrementClock(): void {
        this.timer.second += TIMER_CHANGE_VALUE;
        if (this.timer.second / ONE_MINUTE === 1) {
            this.timer.second = 0;
            this.timer.minute++;
            this.decrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute >= MAX_VALUE_TIMER_MINUTE) {
            this.incrementButton.nativeElement.disabled = true;
        }
        this.printTime();
    }

    decrementClock(): void {
        this.timer.second -= TIMER_CHANGE_VALUE;
        if (this.timer.second === -TIMER_CHANGE_VALUE) {
            this.timer.second = TIMER_CHANGE_VALUE;
            this.timer.minute--;
            this.incrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute === 0 && this.timer.second <= TIMER_CHANGE_VALUE) {
            this.decrementButton.nativeElement.disabled = true;
        }
        this.printTime();
    }
    toggleBonus(): void {
        this.shuffleBonus = !this.shuffleBonus;
        this.playAreaService.randomize = !this.playAreaService.randomize;
    }

    getDictionaryTitle(dictionary: DictionaryDetails): void {
        this.currentDictionary = { title: dictionary.title, description: dictionary.description };
        this.dictionaryService.dictionaryName = dictionary.title;
    }

    updateDictionary(): void {
        this.clientSocketService.updateDictionaryList();
    }
}
