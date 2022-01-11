import { AfterViewChecked, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CANVAS_DIMENSIONS } from '@app/classes/constants/constants';
import { MouseButton } from '@app/classes/enums/enums';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { PlayAreaService } from '@app/services/play-area.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewChecked {
    @ViewChild('baseCanvas', { static: false })
    baseCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('headerCanvas', { static: false })
    headerCanvas!: ElementRef<HTMLCanvasElement>;

    textSize: number = CANVAS_DIMENSIONS.DEFAULT_WIDTH;

    constructor(
        private readonly playAreaService: PlayAreaService,
        private playerSettingsService: PlayerSettingsService,
        private mousePlacementService: MousePlacementService,
        private mouseEventHandlerService: MouseEventHandlerService,
        public selectGameModeService: SelectGameModeService,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (!this.mousePlacementService.arrowAlreadyPlaced) return;
        switch (event.key) {
            case 'Backspace': {
                this.mousePlacementService.cancelPreviousPlacedLetter();
                break;
            }
            case 'Escape': {
                this.mousePlacementService.cancelPlacement();
                break;
            }
            case 'Enter': {
                this.mousePlacementService.confirmPlayerPlacement();
                break;
            }
            default:
                this.mousePlacementService.addLetter(event.key);
        }
    }

    onMouseClick(event: MouseEvent): void {
        let temp = false;
        if (this.selectGameModeService.isSoloModeChosen) {
            temp = this.playerSettingsService.hasToPlay;
        } else temp = this.selectGameModeService.isOnlinePlayerTurn;

        if (!temp || event.button !== MouseButton.Left) return;
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.Board;
        this.mousePlacementService.handleArrowAtPosition({ x: event.offsetX, y: event.offsetY });
    }

    ngAfterViewChecked(): void {
        this.playAreaService.baseCanvas = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.playAreaService.headerCanvas = this.headerCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.playAreaService.drawGameBoard();
        this.baseCanvas.nativeElement.focus();
        this.headerCanvas.nativeElement.focus();
    }

    get width(): number {
        return CANVAS_DIMENSIONS.DEFAULT_WIDTH;
    }

    get height(): number {
        return CANVAS_DIMENSIONS.default_height;
    }
}
