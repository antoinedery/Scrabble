// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { CANVAS_DIMENSIONS, MIDDLE_TILE_POSITION } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { TileHandlerService } from '@app/services/tile-handler.service';

describe('MousePlacementService', () => {
    let service: MousePlacementService;
    let tileHandlerService: TileHandlerService;
    let playerSettingsService: PlayerSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MousePlacementService);
        tileHandlerService = TestBed.inject(TileHandlerService);
        playerSettingsService = TestBed.inject(PlayerSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isPixelInRange should return true when pixel is in range', () => {
        expect(service.isPixelInRange(CANVAS_DIMENSIONS.CASE_SIZE)).toBeTrue();
    });

    it('isPixelInRange should return false when pixel is out of range', () => {
        expect(service.isPixelInRange(0 - CANVAS_DIMENSIONS.CASE_SIZE)).toBeFalse();
    });

    it('convertPixeltoBoardPosition should return to correct position', () => {
        const pixelnUpperLeftCornerTile = CANVAS_DIMENSIONS.CASE_SIZE - 1;
        expect(service.convertPixelToBoardPosition(pixelnUpperLeftCornerTile)).toEqual(0);
    });

    it('getGridPosition should return undefined if x pixel is not board range', () => {
        const pixelOutOfBounds = -1;
        const outOfRangeVec = { x: pixelOutOfBounds, y: 0 };
        expect(service.getGridPosition(outOfRangeVec)).toBeUndefined();
    });

    it('getGridPosition should return undefined if y pixel is not board range', () => {
        const pixelOutOfBounds = -1;
        const outOfRangeVec = { x: 0, y: pixelOutOfBounds };
        expect(service.getGridPosition(outOfRangeVec)).toBeUndefined();
    });

    it('getGridPosition should return undefined if tile is not empty at clicked position', () => {
        const pixelnUpperLeftCornerTile = CANVAS_DIMENSIONS.CASE_SIZE - 1;
        const clickedPos = { x: pixelnUpperLeftCornerTile, y: pixelnUpperLeftCornerTile };
        tileHandlerService.placeLetter({ content: 'a', position: { x: 0, y: 0 } });
        expect(service.getGridPosition(clickedPos)).toBeUndefined();
    });

    it('getGridPosition should return board position if tile is empty at clicked position', () => {
        const pixelnUpperLeftCornerTile = CANVAS_DIMENSIONS.CASE_SIZE - 1;
        const clickedPos = { x: pixelnUpperLeftCornerTile, y: pixelnUpperLeftCornerTile };
        const boardPos = service.getGridPosition(clickedPos);
        if (boardPos) {
            expect(boardPos.x).toEqual(0);
            expect(boardPos.y).toEqual(0);
        }
    });

    it('placeArrowAtPosition does not place arrow if position is undefined', () => {
        const arrowHandler = spyOn(service, 'handleArrow');
        const invalidPixel = 0 - CANVAS_DIMENSIONS.CASE_SIZE;
        const clickedPos = { x: invalidPixel, y: invalidPixel };
        service.placeArrowAtPosition(clickedPos);
        expect(arrowHandler).not.toHaveBeenCalled();
    });

    it('placeArrowAtPosition places arrow if position is valid', () => {
        const arrowHandler = spyOn(service, 'handleArrow');
        const pixelnUpperLeftCornerTile = CANVAS_DIMENSIONS.CASE_SIZE - 1;
        const clickedPos = { x: pixelnUpperLeftCornerTile, y: pixelnUpperLeftCornerTile };
        service.placeArrowAtPosition(clickedPos);
        expect(arrowHandler).toHaveBeenCalled();
    });

    it('handleArrow should not handle an already placed arrow if no arrow was already placed', () => {
        const areVectorsEqual = spyOn(tileHandlerService, 'isEqual');
        const resetBonusTile = spyOn(tileHandlerService, 'resetBonusTile');
        const upperLeftTile = { x: 0, y: 0 };
        expect(service.arrowAlreadyPlaced).toBeFalse();
        service.handleArrow(upperLeftTile);
        expect(service.arrowAlreadyPlaced).toBeTrue();
        expect(resetBonusTile).not.toHaveBeenCalled();
        expect(areVectorsEqual).not.toHaveBeenCalled();
    });

    it('handleArrow should inverseArrowAxis if arrow was already placed at clicked position', () => {
        const inverseArrowAxis = spyOn(service, 'inverseArrowAxis');
        const resetBonusTile = spyOn(tileHandlerService, 'resetBonusTile');
        expect(service.arrowAlreadyPlaced).toBeFalse();
        service.handleArrow({ x: 0, y: 0 });
        expect(service.arrowAlreadyPlaced).toBeTrue();
        expect(resetBonusTile).not.toHaveBeenCalled();
        service.handleArrow({ x: 0, y: 0 });
        expect(inverseArrowAxis).toHaveBeenCalled();
        expect(resetBonusTile).not.toHaveBeenCalled();
    });

    it('handleArrow should reset bonus if arrow was not already placed at clicked position', () => {
        const inverseArrowAxis = spyOn(service, 'inverseArrowAxis');
        const resetBonusTile = spyOn(tileHandlerService, 'resetBonusTile');

        expect(service.arrowAlreadyPlaced).toBeFalse();
        service.handleArrow({ x: 0, y: 0 });
        expect(service.arrowAlreadyPlaced).toBeTrue();

        service.handleArrow({ x: 1, y: 0 });
        expect(inverseArrowAxis).not.toHaveBeenCalled();
        expect(resetBonusTile).toHaveBeenCalled();
    });

    it('inverseArrowAxis should inverse horizontal arrow axis to vertical', () => {
        expect(service.arrowAlreadyPlaced).toBeFalse();
        service.handleArrow({ x: 0, y: 0 });
        expect(service.arrowAlreadyPlaced).toBeTrue();
        service.inverseArrowAxis();
        expect(service.markerAxis).toEqual(AXIS.VERTICAL);
    });

    it('inverseArrowAxis should inverse vertical arrow axis to horizontal', () => {
        expect(service.arrowAlreadyPlaced).toBeFalse();
        service.handleArrow({ x: 0, y: 0 });
        expect(service.arrowAlreadyPlaced).toBeTrue();
        service.inverseArrowAxis();
        expect(service.markerAxis).toEqual(AXIS.VERTICAL);
        service.inverseArrowAxis();
        expect(service.markerAxis).toEqual(AXIS.HORIZONTAL);
    });

    it('isInCurrentPlacement should return true if position is in current placement', () => {
        const vec = { x: 0, y: 0 };
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isInCurrentPlacement(vec)).toBeTrue();
    });

    it('isInCurrentPlacement should return false if position is not in current placement', () => {
        const vec = { x: 1, y: 0 };
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isInCurrentPlacement(vec)).toBeFalse();
    });

    it('isPlacementPositionValid should return true if center tile is empty and placed letters touch it', () => {
        service.isCenterTileEmpty = true;
        service.placedLetters = [
            { content: 'l', position: { x: MIDDLE_TILE_POSITION.x - 1, y: MIDDLE_TILE_POSITION.y } },
            { content: 'a', position: MIDDLE_TILE_POSITION },
        ];
        service.lettersValidities = [false, false];
        expect(service.isPlacementPositionValid()).toBeTrue();
    });

    it('isPlacementPositionValid should return true if placed letters touch an existing tile', () => {
        service.isCenterTileEmpty = false;
        service.placedLetters = [{ content: 'a', position: MIDDLE_TILE_POSITION }];
        service.lettersValidities = [true];
        expect(service.isPlacementPositionValid()).toBeTrue();
    });

    it('isPlacementPositionValid should return false if center is occupied and no letter is touching existing ones', () => {
        service.isCenterTileEmpty = false;
        service.placedLetters = [{ content: 'a', position: MIDDLE_TILE_POSITION }];
        service.lettersValidities = [false];
        expect(service.isPlacementPositionValid()).toBeFalse();
    });

    it('isPlacedLetterTouchingBoardLetter should return false if vector is out of bounds', () => {
        const vec = { x: -1, y: 0 };
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isTouchingBoardLetter(vec)).toBeFalse();
    });

    it('isPlacedLetterTouchingBoardLetter should return false if vector is in placement', () => {
        const vec = { x: 0, y: 0 };
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isTouchingBoardLetter(vec)).toBeFalse();
    });

    it('isPlacedLetterTouchingBoardLetter should return false if tile at position is empty', () => {
        const vec = { x: 1, y: 0 };
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isTouchingBoardLetter(vec)).toBeFalse();
    });

    it('isPlacedLetterTouchingBoardLetter should return true if tile at position has a letter', () => {
        tileHandlerService.placeLetter({ content: 'a', position: { x: 1, y: 0 } });
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        expect(service.isTouchingBoardLetter({ x: 1, y: 0 })).toBeTrue();
    });

    it('addLetterValidity should push true for a letter that is touching a board letter', () => {
        tileHandlerService.placeLetter({ content: 'a', position: { x: 1, y: 0 } });
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        service.addLetterValidity({ x: 0, y: 0 });
        expect(service.lettersValidities[0]).toBeTrue();
    });

    it('addLetterValidity should push true for a letter that is touching a board letter', () => {
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        service.addLetterValidity({ x: 0, y: 0 });
        expect(service.lettersValidities[0]).toBeFalse();
    });

    it('cancelPlacement should remove and reinsert letters if there are placed letters', () => {
        const removePlacement = spyOn(tileHandlerService, 'removePlacement');
        const reinsertPlacement = spyOn(playerSettingsService, 'reinsertPlacement');
        const resetProperties = spyOn(service, 'resetProperties');
        service.placedLetters = [{ content: 'a', position: { x: 0, y: 0 } }];
        service.markerPosition = { x: 1, y: 0 };
        service.markerAxis = AXIS.HORIZONTAL;
        tileHandlerService.placeLetters(service.placedLetters);
        tileHandlerService.placeArrow(service.markerAxis, service.markerPosition);
        service.cancelPlacement();
        expect(removePlacement).toHaveBeenCalled();
        expect(reinsertPlacement).toHaveBeenCalled();
        expect(resetProperties).toHaveBeenCalled();
    });

    it('cancelPlacement should remove arrow only if there was no placed letter', () => {
        const removePlacement = spyOn(tileHandlerService, 'removePlacement');
        const reinsertPlacement = spyOn(playerSettingsService, 'reinsertPlacement');
        service.markerPosition = { x: 1, y: 0 };
        service.markerAxis = AXIS.HORIZONTAL;
        tileHandlerService.placeArrow(service.markerAxis, service.markerPosition);
        service.cancelPlacement();
        expect(removePlacement).not.toHaveBeenCalled();
        expect(reinsertPlacement).not.toHaveBeenCalled();
    });

    it('resetProperties should call the proper functions', () => {
        const resetBonusTile = spyOn(tileHandlerService, 'resetBonusTile');
        const initPlacedLetters = spyOn(service, 'initPlacedLetters');
        const initValidLetters = spyOn(service, 'initValidLetters');
        const initMarkerPosition = spyOn(service, 'initMarkerPosition');
        const initBoardWasClicked = spyOn(service, 'initBoardWasClicked');
        service.resetProperties();
        expect(resetBonusTile).toHaveBeenCalled();
        expect(initPlacedLetters).toHaveBeenCalled();
        expect(initValidLetters).toHaveBeenCalled();
        expect(initMarkerPosition).toHaveBeenCalled();
        expect(initBoardWasClicked).toHaveBeenCalled();
    });

    it('cancelPreviousPlacedLetter should return false if there is no placed letter', () => {
        expect(service.cancelPreviousPlacedLetter()).toBeFalse();
    });

    it('cancelPreviousPlacedLetter should return true if previous letter was canceled', () => {
        const letterOne = { content: 'a', position: { x: 1, y: 0 } };
        tileHandlerService.placeLetter(letterOne);
        service.placedLetters.push(letterOne);
        service.markerAxis = AXIS.HORIZONTAL;
        expect(service.cancelPreviousPlacedLetter()).toBeTrue();
    });

    it('cancelPreviousPlacedLetter should return true if previous letter was canceled', () => {
        const letterOne = { content: 'a', position: { x: 1, y: 0 } };
        tileHandlerService.placeLetter(letterOne);
        service.placedLetters.push(letterOne);
        service.markerAxis = AXIS.HORIZONTAL;
        expect(service.cancelPreviousPlacedLetter()).toBeTrue();
    });

    it('placeLetterOnMarkerPosition removes letter from rack', () => {
        const removeLetterFromRack = spyOn(playerSettingsService, 'removeLetterFromRack');
        service.markerPosition = { x: 0, y: 0 };
        service.placeLetterOnMarkerPosition('a');
        expect(removeLetterFromRack).toHaveBeenCalled();
    });

    it('placeMarkerOnNextAvailableTile should place marker on next valid position', () => {
        tileHandlerService.placeLetter({ content: 'a', position: { x: 1, y: 0 } });
        service.markerPosition = { x: 0, y: 0 };
        service.markerAxis = AXIS.HORIZONTAL;
        service.placeMarkerOnNextAvailableTile();
        expect(service.markerPosition).toEqual({ x: 2, y: 0 });
    });

    it('addLetter should return undefined if marker position is out of bounds', () => {
        expect(service.addLetter('')).toBeUndefined();
    });

    it('addLetter should return if input is not a rack', () => {
        spyOn(playerSettingsService, 'checkIsLetterInRack').and.returnValue(false);
        expect(service.addLetter('')).toBeUndefined();
    });

    it('addLetter should return undefined if input is not a letter', () => {
        spyOn(tileHandlerService, 'isVectorInBounds').and.returnValue(false);
        spyOn(playerSettingsService, 'checkIsLetterInRack').and.returnValue(false);
        expect(service.addLetter('ad')).toBeUndefined();
    });

    it('addLetter calls placeLetterOnMarkerPosition and placeMarkerOnNextAvailableTile', () => {
        spyOn(tileHandlerService, 'isVectorInBounds').and.returnValue(true);
        spyOn(playerSettingsService, 'checkIsLetterInRack').and.returnValue(true);
        const placeLetterOnMarkerPosition = spyOn(service, 'placeLetterOnMarkerPosition');
        const placeMarkerOnNextAvailableTile = spyOn(service, 'placeMarkerOnNextAvailableTile');
        service.addLetter('a');
        expect(placeLetterOnMarkerPosition).toHaveBeenCalled();
        expect(placeMarkerOnNextAvailableTile).toHaveBeenCalled();
    });

    it('handleArrowAtPosition should returns undefined if there are placed letters', () => {
        service.placedLetters.push({ content: 'a', position: { x: 0, y: 0 } });
        expect(service.handleArrowAtPosition({ x: 1, y: 0 })).toBeUndefined();
    });

    it('handleArrowAtPosition should call placeArrowAtPosition if there are no placed letters', () => {
        const placeArrowAtPosition = spyOn(service, 'placeArrowAtPosition');
        service.handleArrowAtPosition({ x: 0, y: 0 });
        expect(placeArrowAtPosition).toHaveBeenCalled();
    });

    it('confirmPlayerPlacement should return undefined if position of placement is invalid', () => {
        spyOn(service, 'isPlacementPositionValid').and.returnValue(false);
        expect(service.confirmPlayerPlacement()).toBeUndefined();
    });

    it('confirmPlayerPlacement should return placement if position of placement is valid', () => {
        service.markerAxis = AXIS.HORIZONTAL;
        service.placedLetters = [{ position: { x: 0, y: 0 }, content: 'a' }];
        spyOn(service, 'isPlacementPositionValid').and.returnValue(true);
        service.confirmPlayerPlacement();
        expect(service.placement).toEqual({ axis: AXIS.HORIZONTAL, letters: [{ position: { x: 0, y: 0 }, content: 'a' }] });
    });
});
