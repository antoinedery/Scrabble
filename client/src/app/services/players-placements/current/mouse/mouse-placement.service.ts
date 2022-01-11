import { Injectable } from '@angular/core';
import { CANVAS_DIMENSIONS, MIDDLE_TILE_POSITION } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { CharacterValidatorService } from '@app/services/character-validator.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MessageCreatorService } from '@app/services/message-creator.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { ObjectivesValidationService } from '@app/services/objectives-validation.service';
import { PlacementValidationService } from '@app/services/placement-validation.service';
import { PlayerPlacementConfirmationService } from '@app/services/players-placements/current/player-placement-confirmation.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { TileHandlerService } from '@app/services/tile-handler.service';
import { TurnHandlerService } from '@app/services/turn-handler.service';

@Injectable({
    providedIn: 'root',
})
export class MousePlacementService extends PlayerPlacementConfirmationService {
    markerPosition: Vec2;
    arrowAlreadyPlaced: boolean;
    markerAxis: AXIS;
    placedLetters: PlacedLetter[];
    lettersValidities: boolean[];
    isCenterTileEmpty: boolean;

    constructor(
        private characterValidatorService: CharacterValidatorService,
        private displayMessageService: DisplayMessageService,
        private messageCreatorService: MessageCreatorService,
        private mouseEventHandlerService: MouseEventHandlerService,
        public playerSettingsService: PlayerSettingsService,
        public placementValidationService: PlacementValidationService,
        public tileHandlerService: TileHandlerService,
        public turnHandlerService: TurnHandlerService,
        public selectGameModeService: SelectGameModeService,
        public objectivesValidationService: ObjectivesValidationService,
    ) {
        super(
            playerSettingsService,
            placementValidationService,
            tileHandlerService,
            turnHandlerService,
            selectGameModeService,
            objectivesValidationService,
        );
        this.initMarkerPosition();
        this.initBoardWasClicked();
        this.initPlacedLetters();
        this.initValidLetters();

        this.turnHandlerService.endTimeObservable.subscribe(() => {
            this.cancelPlacement();
        });
    }

    confirmPlayerPlacement() {
        if (!this.isPlacementPositionValid()) {
            this.displayMessageService.addMessageList(
                'system',
                'Commande impossible à réaliser : le mot ne touche aucune autre lettre déjà présente sur le plateau',
            );
            this.cancelPlacement();
            return;
        }
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
        this.placement = {
            axis: this.markerAxis,
            letters: this.placedLetters,
        };
        this.messageToOutput = this.messageCreatorService.getContentToOutput(this.placement);
        this.displayMessageService.addMessageList(this.playerSettingsService.name, this.messageToOutput);
        super.confirmPlayerPlacement();
        this.resetProperties();
    }

    initMarkerPosition() {
        this.markerPosition = { x: -1, y: -1 };
    }

    initBoardWasClicked() {
        this.arrowAlreadyPlaced = false;
    }

    initPlacedLetters() {
        this.placedLetters = new Array();
    }

    initValidLetters() {
        this.lettersValidities = new Array();
    }

    resetProperties() {
        this.tileHandlerService.resetBorders();
        this.tileHandlerService.resetBonusTile(this.markerPosition);
        this.initPlacedLetters();
        this.initValidLetters();
        this.initMarkerPosition();
        this.initBoardWasClicked();
    }

    handleArrowAtPosition(vec: Vec2) {
        if (this.placedLetters.length > 0) return;
        this.isCenterTileEmpty = this.tileHandlerService.isEmptyTile(MIDDLE_TILE_POSITION);
        this.placeArrowAtPosition(vec);
    }

    placeArrowAtPosition(vec: Vec2) {
        const gridPosition = this.getGridPosition(vec);
        /* istanbul ignore else*/
        if (!gridPosition) return;

        this.handleArrow(gridPosition);
    }

    handleArrow(vec: Vec2) {
        if (this.arrowAlreadyPlaced) {
            if (this.tileHandlerService.isEqual(this.markerPosition, vec)) {
                this.inverseArrowAxis();
                return;
            }
            this.tileHandlerService.resetBonusTile(this.markerPosition);
        }

        this.tileHandlerService.placeArrow(AXIS.HORIZONTAL, vec);
        this.markerPosition = vec;
        this.markerAxis = AXIS.HORIZONTAL;
        this.arrowAlreadyPlaced = true;
    }

    inverseArrowAxis() {
        this.markerAxis = this.markerAxis === AXIS.HORIZONTAL ? AXIS.VERTICAL : AXIS.HORIZONTAL;
        this.tileHandlerService.placeArrow(this.markerAxis, this.markerPosition);
    }

    getGridPosition(pixelVec: Vec2): Vec2 | undefined {
        /* istanbul ignore else*/
        if (!this.isPixelInRange(pixelVec.x) || !this.isPixelInRange(pixelVec.y)) return;
        const vec = {
            x: this.convertPixelToBoardPosition(pixelVec.x),
            y: this.convertPixelToBoardPosition(pixelVec.y),
        };
        if (!this.tileHandlerService.isEmptyTile(vec)) return;
        return vec;
    }

    isPixelInRange(pixel: number): boolean {
        return pixel >= 0 && pixel <= CANVAS_DIMENSIONS.DEFAULT_WIDTH;
    }

    convertPixelToBoardPosition(pixel: number): number {
        return Math.round((pixel - (pixel % CANVAS_DIMENSIONS.CASE_SIZE)) / CANVAS_DIMENSIONS.CASE_SIZE);
    }

    addLetter(inputLetter: string) {
        const letter = this.characterValidatorService.removeLetterAccent(inputLetter);

        if (
            !this.tileHandlerService.isVectorInBounds(this.markerPosition) ||
            !this.playerSettingsService.checkIsLetterInRack(letter) ||
            !this.characterValidatorService.checkIsALetter(letter)
        )
            return;

        this.placeLetterOnMarkerPosition(inputLetter);
        this.placeMarkerOnNextAvailableTile();
    }

    placeLetterOnMarkerPosition(letter: string) {
        this.addLetterValidity(this.markerPosition);
        this.tileHandlerService.addBorder(this.markerPosition);
        const newPlacedLetter = {
            content: letter,
            position: this.markerPosition,
        };
        this.placedLetters.push(newPlacedLetter);
        this.placeLetterFromRack(newPlacedLetter);
    }

    placeMarkerOnNextAvailableTile() {
        const nextMarkerPosition = { x: this.markerPosition.x, y: this.markerPosition.y };
        this.tileHandlerService.incrementVector(this.markerAxis, nextMarkerPosition);
        while (this.tileHandlerService.isVectorInBounds(nextMarkerPosition)) {
            if (this.tileHandlerService.isEmptyTile(nextMarkerPosition)) {
                this.tileHandlerService.placeArrow(this.markerAxis, nextMarkerPosition);
                break;
            }
            this.tileHandlerService.incrementVector(this.markerAxis, nextMarkerPosition);
        }
        this.markerPosition = nextMarkerPosition;
    }

    cancelPreviousPlacedLetter(): boolean {
        const letter = this.placedLetters.pop();
        if (!letter) return false;

        this.tileHandlerService.popBorder();
        this.tileHandlerService.resetBonusTile(this.markerPosition);
        this.tileHandlerService.placeArrow(this.markerAxis, letter.position);
        this.playerSettingsService.reinsertLetter(letter.content);
        this.markerPosition = letter.position;
        return true;
    }

    cancelPlacement() {
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
        if (this.placedLetters.length > 0) {
            this.tileHandlerService.removePlacement(this.placedLetters);
            this.playerSettingsService.reinsertPlacement(this.placedLetters);
        }
        this.resetProperties();
    }

    addLetterValidity(vec: Vec2) {
        const surrondingTiles: Vec2[] = new Array();
        surrondingTiles.push({ x: vec.x, y: vec.y - 1 });
        surrondingTiles.push({ x: vec.x + 1, y: vec.y });
        surrondingTiles.push({ x: vec.x, y: vec.y + 1 });
        surrondingTiles.push({ x: vec.x - 1, y: vec.y });
        for (const tile of surrondingTiles) {
            if (this.isTouchingBoardLetter(tile)) {
                this.lettersValidities.push(true);
                return;
            }
        }
        this.lettersValidities.push(false);
    }

    isTouchingBoardLetter(vec: Vec2): boolean {
        return this.tileHandlerService.isVectorInBounds(vec) && !this.isInCurrentPlacement(vec) && !this.tileHandlerService.isEmptyTile(vec);
    }

    isInCurrentPlacement(vec: Vec2): boolean {
        for (const letter of this.placedLetters) {
            if (this.tileHandlerService.isEqual(letter.position, vec)) {
                return true;
            }
        }
        return false;
    }

    isPlacementPositionValid(): boolean {
        for (const [index, isValidLetter] of this.lettersValidities.entries()) {
            if (this.isCenterTileEmpty) {
                if (this.tileHandlerService.isEqual(this.placedLetters[index].position, MIDDLE_TILE_POSITION)) return true;
            } else if (isValidLetter) return true;
        }
        return false;
    }
}
