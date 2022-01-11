import { TestBed } from '@angular/core/testing';
import { TurnHandlerInfos } from '@app/classes/interfaces/multi-player-game-infos';
import { Tile } from '@app/classes/interfaces/tile';
import { Time } from '@app/classes/interfaces/time';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { VirtualPlayerSettingsService } from '@app/services/local-players/virtual-player/virtual-player-settings.service';
// import { UniqueLetterPlacingService } from '@app/services/unique-letter-placing.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';
import { DisplayMessageService } from './display-message.service';
import { LetterReserveService } from './letter-reserve.service';
// import { EndGameService } from './end-game.service';

describe('TurnHandlerService', () => {
    let service: TurnHandlerService;
    let playerSettingsService: PlayerSettingsService;
    let virtualPlayerSettingsService: VirtualPlayerSettingsService;
    let turnHandlerService: TurnHandlerService;
    let letterReserveService: LetterReserveService;
    let displayMessageService: DisplayMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TurnHandlerService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        virtualPlayerSettingsService = TestBed.inject(VirtualPlayerSettingsService);
        letterReserveService = TestBed.inject(LetterReserveService);
        displayMessageService = TestBed.inject(DisplayMessageService);
        turnHandlerService = TestBed.inject(TurnHandlerService);
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('switchTurn should make virtual player able to play if it is now players turn to play', () => {
        playerSettingsService.hasToPlay = true;
        virtualPlayerSettingsService.hasToPlay = false;
        service.endTurn();
        expect(playerSettingsService.hasToPlay).toEqual(false);
        expect(virtualPlayerSettingsService.hasToPlay).toEqual(true);
    });

    it('switchTurn should make player able to play if it is now virtual players turn to play', () => {
        playerSettingsService.hasToPlay = false;
        virtualPlayerSettingsService.hasToPlay = true;
        service.endTurn();
        expect(playerSettingsService.hasToPlay).toEqual(true);
        expect(virtualPlayerSettingsService.hasToPlay).toEqual(false);
    });

    it('endTurn should call switchTurn', () => {
        const switchTurnSpy = spyOn(service, 'switchTurn');
        service.endTurn();
        expect(switchTurnSpy).toHaveBeenCalled();
    });

    it('endTurn should call endGame when max number of turns reached', () => {
        const endGameSpy = spyOn(turnHandlerService, 'endGame');
        turnHandlerService.turnsPassedCounter = 6;
        service.endTurn();
        expect(endGameSpy).toHaveBeenCalled();
    });

    it('setInterval should change timer value when called', () => {
        service.startTimer(1, 0);
        expect(service.timer).toBeDefined();
    });

    it('setInterval should change minute and second values when called', () => {
        const expectedTimeValue: Time = { minute: 0, second: 58 };
        const twoSecondsMS = 2000;
        let timerValue = { minute: 1, second: 0 };
        service.timeChange.subscribe((value) => {
            timerValue = value;
        });
        service.startTimer(1, 0);
        jasmine.clock().tick(twoSecondsMS);
        expect(timerValue.minute).toEqual(expectedTimeValue.minute);
        expect(timerValue.second).toEqual(expectedTimeValue.second);
    });

    it('endTurn should be called when values are at 0:00', () => {
        const endTurnSpy = spyOn(service, 'endTurn');
        const overOneMinuteMS = 61000;
        service.startTimer(1, 0);
        jasmine.clock().tick(overOneMinuteMS);
        expect(endTurnSpy).toHaveBeenCalled();
    });

    it('cancelPlacement should be called when player is playing and timr is finished', () => {
        const mousePlacementService = TestBed.inject(MousePlacementService);
        const cancelPlacement = spyOn(mousePlacementService, 'cancelPlacement');
        playerSettingsService.hasToPlay = true;
        const overOneMinuteMS = 61000;
        service.startTimer(1, 0);
        jasmine.clock().tick(overOneMinuteMS);
        expect(cancelPlacement).toHaveBeenCalled();
    });

    it('endTurn should be called 20 seconds after virtual player turn starts', () => {
        const endTurnSpy = spyOn(service, 'endTurn');
        virtualPlayerSettingsService.hasToPlay = true;
        const twentySecondMS = 61000;
        service.startTimer(1, 0);
        jasmine.clock().tick(twentySecondMS);
        expect(endTurnSpy).toHaveBeenCalled();
    });

    it('resetTimer function should clear the interval and restart the timer', () => {
        const startTimerSpy = spyOn(service, 'startTimer');
        service.resetTimer();
        expect(startTimerSpy).toHaveBeenCalled();
    });

    it('clearTimer should reset time on timer', () => {
        let timerValue = { minute: 1, second: 0 };

        service.timeChange.subscribe((value) => {
            timerValue = value;
        });
        service.clearTimer();
        expect(timerValue.minute).toEqual(0);
        expect(timerValue.second).toEqual(0);
    });

    it('endGameVerify should verify when max number of turns reached', () => {
        service.turnsPassedCounter = 6;
        expect(service.endGameVerify()).toEqual(true);
    });

    it('endGameVerify should verify when letter reserve and player letters empty', () => {
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();

        letterReserveService.letterReserveTotalSize = 0;
        expect(service.endGameVerify()).toEqual(false);
    });

    it('endGameVerify should verify when letter reserve and virtual player letters empty', () => {
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters.length = 0;
        letterReserveService.letterReserveTotalSize = 0;
        expect(service.endGameVerify()).toEqual(true);
    });

    it('endGameVerify should verify when letter reserve is empty and not player letters', () => {
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        letterReserveService.letterReserveTotalSize = 0;
        expect(service.endGameVerify()).toEqual(false);
    });

    it('getLettersAsString should return string of remaining letters', () => {
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 1 });
        lettersOnRack.push({ letter: 'C', score: 1 });
        lettersOnRack.push({ letter: 'D', score: 1 });
        lettersOnRack.push({ letter: 'E', score: 1 });

        expect(service.getLettersAsString(lettersOnRack)).toEqual('abcde');
    });

    it('displayEndGameStatistics should display string of remaining letters', () => {
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        displayMessageService.messagesList = [];
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });

        playerSettingsService.letters = lettersOnRack;
        service.displayEndGameStatistics();
        expect(displayMessageService.messagesList[0].text).toEqual('Fin de partie - Lettres restantes');
        expect(displayMessageService.messagesList[1].text).toEqual(`${playerSettingsService.name} : a`);
    });

    it('resetTurnsPassed should reinitialise turns passed counter', () => {
        service.turnsPassedCounter = 4;
        service.resetTurnsPassed();
        expect(service.turnsPassedCounter).toEqual(0);
    });

    it('incrementTurnsPassed should increase turns passed counter by 1', () => {
        service.turnsPassedCounter = 4;
        const expectedCount = 5;
        service.incrementTurnsPassed();
        expect(service.turnsPassedCounter).toEqual(expectedCount);
    });

    it('findWinnerPlayer should indicate a tie', () => {
        virtualPlayerSettingsService.score = 7;
        playerSettingsService.score = 7;
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).toEqual('equal');
    });

    it('findWinnerPlayer should indicate if virtual player won', () => {
        virtualPlayerSettingsService.score = 7;
        playerSettingsService.score = 6;
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).toEqual(virtualPlayerSettingsService.name);
    });

    it('findWinnerPlayer should indicate if player won', () => {
        virtualPlayerSettingsService.score = 6;
        playerSettingsService.score = 7;
        service.findWinnerPlayer();
        expect(service.winnerPlayerName).toEqual(playerSettingsService.name);
    });

    it('endGame should end both player turns', () => {
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        service.turnsPassedCounter = 6;
        service.endGame();
        expect(playerSettingsService.hasToPlay).toEqual(false);
        expect(virtualPlayerSettingsService.hasToPlay).toEqual(false);
    });

    it('endGameScoreBonus should update player score', () => {
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        playerSettingsService.letters.length = 0;
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 2 });
        lettersOnRack.push({ letter: 'C', score: 3 });

        virtualPlayerSettingsService.letters = lettersOnRack;
        service.endGameScoreBonus();
        const maxTurnCounter = 6;
        expect(service.totalLetterScore).toEqual(maxTurnCounter);
    });

    it('endGameScoreBonus should update virtual player score', () => {
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters = letterReserveService.assignLettersToPlayer();
        virtualPlayerSettingsService.letters.length = 0;
        const lettersOnRack: Tile[] = [];
        lettersOnRack.push({ letter: 'A', score: 1 });
        lettersOnRack.push({ letter: 'B', score: 2 });
        lettersOnRack.push({ letter: 'C', score: 3 });

        playerSettingsService.letters = lettersOnRack;
        service.endGameScoreBonus();
        const maxTurnCounter = 6;
        expect(service.totalLetterScore).toEqual(maxTurnCounter);
    });

    it('setPropertiesForGameConversion should return undefined if isMyTurn is set to true', () => {
        const turnHandlerInfos: TurnHandlerInfos = {
            turnsPassed: 1,
            timeValue: { minute: 1, second: 0 },
            gameEnded: false,
        };

        expect(service.setPropertiesForGameConversion(turnHandlerInfos, true)).toBeUndefined();
    });

    it('setPropertiesForGameConversion should call endGame if endGameVerify returns true', () => {
        const turnHandlerInfos: TurnHandlerInfos = {
            turnsPassed: 1,
            timeValue: { minute: 1, second: 0 },
            gameEnded: false,
        };
        spyOn(service, 'endGameVerify').and.returnValue(true);
        const endGameSpy = spyOn(service, 'endGame');
        service.setPropertiesForGameConversion(turnHandlerInfos, false);
        expect(endGameSpy).toHaveBeenCalled();
    });
});
