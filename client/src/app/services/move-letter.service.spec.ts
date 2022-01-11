import { TestBed } from '@angular/core/testing';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { LetterReserveService } from './letter-reserve.service';
import { MoveLetterService } from './move-letter.service';
import { PlayerSettingsService } from './local-players/current-player/player-settings.service';

describe('MoveLetterService', () => {
    let service: MoveLetterService;
    let playerSettingsService: PlayerSettingsService;
    let letterReserveService: LetterReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MoveLetterService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        letterReserveService = TestBed.inject(LetterReserveService);
        playerSettingsService.letters = letterReserveService.assignLettersToPlayer();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('moveLetterFromKeyboardEvent from MoveLetterService should call moveLetterRight', () => {
        const moveLetterRightSpy = spyOn(service, 'moveLetterRight');
        const buttonEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        service.moveLetterFromKeyboardEvent(buttonEvent, 1);
        expect(moveLetterRightSpy).toHaveBeenCalled();
    });

    it('moveLetterFromKeyboardEvent from MoveLetterService should call moveLetterLeft', () => {
        const moveLetterLeftSpy = spyOn(service, 'moveLetterLeft');
        const buttonEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        service.moveLetterFromKeyboardEvent(buttonEvent, 1);
        expect(moveLetterLeftSpy).toHaveBeenCalled();
    });

    it('moveLetterFromMouseEvent from MoveLetterService should call moveLetterRight', () => {
        const moveLetterRightSpy = spyOn(service, 'moveLetterRight');
        const mouseEvent = {
            deltaY: 1,
        } as WheelEvent;
        service.moveLetterFromMouseEvent(mouseEvent, 1);
        expect(moveLetterRightSpy).toHaveBeenCalled();
    });

    it('moveLetterFromMouseEvent from MoveLetterService should call moveLetterLeft', () => {
        const moveLetterLeftSpy = spyOn(service, 'moveLetterLeft');
        const mouseEvent = {
            deltaY: -1,
        } as WheelEvent;
        service.moveLetterFromMouseEvent(mouseEvent, 1);
        expect(moveLetterLeftSpy).toHaveBeenCalled();
    });

    it('moveLetterRight from MoveLetterService should move first letter of rack to second position', () => {
        const expectedSecondTile = playerSettingsService.letters[0].letter;
        service.moveLetterRight(0);
        expect(playerSettingsService.letters[1].letter).toBe(expectedSecondTile);
    });

    it('moveLetterRight from MoveLetterService should move last letter of rack to first position', () => {
        const expectedFirstTile = playerSettingsService.letters[6].letter;
        service.moveLetterRight(LETTERS_RACK_SIZE - 1);
        expect(playerSettingsService.letters[0].letter).toBe(expectedFirstTile);
    });

    it('moveLetterLeft from MoveLetterService should move first letter of rack to last position', () => {
        const expectedLastTile = playerSettingsService.letters[0].letter;
        service.moveLetterLeft(0);
        expect(playerSettingsService.letters[6].letter).toBe(expectedLastTile);
    });

    it('moveLetterLeft from MoveLetterService should move second letter of rack to first position', () => {
        const expectedFirstTile = playerSettingsService.letters[1].letter;
        service.moveLetterLeft(1);
        expect(playerSettingsService.letters[0].letter).toBe(expectedFirstTile);
    });
});
