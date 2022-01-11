import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MouseButton } from '@app/classes/enums/enums';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { LetterRackComponent } from '@app/components/letter-rack-area-folder/letter-rack/letter-rack.component';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { PlayAreaComponent } from '@app/components/play-area-folder/play-area/play-area.component';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mousePlacementService: MousePlacementService;
    let playerSettingsService: PlayerSettingsService;
    let selectGameModeService: SelectGameModeService;

    const PIXEL_NUMBER = 700;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, LetterRackComponent, TileComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectGameMode should create', () => {
        expect(component).toBeTruthy();
    });

    it('canvas width should return', () => {
        const expectedCanvasWidth = PIXEL_NUMBER / window.devicePixelRatio;
        expect(component.width).toEqual(expectedCanvasWidth);
    });

    it('canvas height should return', () => {
        const expectedCanvasHeight = PIXEL_NUMBER / window.devicePixelRatio;
        expect(component.height).toEqual(expectedCanvasHeight);
    });

    it('buttonDetect should return undefined if no arrow is placed before keyboard press', () => {
        const buttonEvent = {
            key: '',
        } as KeyboardEvent;
        expect(component.buttonDetect(buttonEvent)).toBeUndefined();
    });

    it('buttonDetect should call cancelPreviousPlacedLetter on backspace press', () => {
        mousePlacementService = TestBed.inject(MousePlacementService);
        mousePlacementService.arrowAlreadyPlaced = true;

        const cancelPreviousPlacedLetter = spyOn(mousePlacementService, 'cancelPreviousPlacedLetter');
        const buttonEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(cancelPreviousPlacedLetter).toHaveBeenCalled();
    });

    it('buttonDetect should call cancelPlacement on escape press', () => {
        mousePlacementService = TestBed.inject(MousePlacementService);
        mousePlacementService.arrowAlreadyPlaced = true;

        const cancelPlacement = spyOn(mousePlacementService, 'cancelPlacement');
        const buttonEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(cancelPlacement).toHaveBeenCalled();
    });

    it('buttonDetect should call endTurnWithPlacementConfirmation on escape press', () => {
        mousePlacementService = TestBed.inject(MousePlacementService);
        mousePlacementService.arrowAlreadyPlaced = true;

        const confirmMousePlacement = spyOn(mousePlacementService, 'confirmPlayerPlacement');
        const buttonEvent = {
            key: 'Enter',
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(confirmMousePlacement).toHaveBeenCalled();
    });

    it('buttonDetect should call addLetter on key press', () => {
        mousePlacementService = TestBed.inject(MousePlacementService);
        mousePlacementService.arrowAlreadyPlaced = true;

        const addLetter = spyOn(mousePlacementService, 'addLetter');
        const buttonEvent = {
            key: 'A',
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(addLetter).toHaveBeenCalled();
    });

    it('onMouseClick should assign mouseEventReceiver if player is playing', () => {
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        const mouseEventHandlerService = TestBed.inject(MouseEventHandlerService);
        playerSettingsService.hasToPlay = true;
        selectGameModeService.isSoloModeChosen = true;
        const buttonEvent = {
            button: MouseButton.Left,
        } as MouseEvent;
        component.onMouseClick(buttonEvent);
        expect(mouseEventHandlerService.currentMouseEventReceiver).toBe(MouseEventReceiver.Board);
    });

    it('onMouseClick should return undefined if player is not playing', () => {
        playerSettingsService = TestBed.inject(PlayerSettingsService);
        selectGameModeService = TestBed.inject(SelectGameModeService);
        const mouseEventHandlerService = TestBed.inject(MouseEventHandlerService);
        playerSettingsService.hasToPlay = false;
        selectGameModeService.isOnlinePlayerTurn = false;
        const buttonEvent = {
            button: MouseButton.Left,
        } as MouseEvent;
        component.onMouseClick(buttonEvent);
        expect(mouseEventHandlerService.currentMouseEventReceiver).not.toBe(MouseEventReceiver.Board);
    });
});
