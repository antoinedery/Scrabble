import { ChangeDetectorRef, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LETTERS_RACK_SIZE } from '@app/classes/constants/constants';
import { MouseEventReceiver } from '@app/classes/enums/mouse-event-receiver';
import { Tile } from '@app/classes/interfaces/tile';
import { TileComponent } from '@app/components/letter-rack-area-folder/tile/tile.component';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { DisplayMessageService } from '@app/services/display-message.service';
import { PlayerSettingsService } from '@app/services/local-players/current-player/player-settings.service';
import { MouseEventHandlerService } from '@app/services/mouse-event-handler.service';
import { MoveLetterService } from '@app/services/move-letter.service';
import { SelectGameModeService } from '@app/services/select-game-mode.service';
import { SelectLetterService } from '@app/services/select-letter.service';

@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent {
    @ViewChild('changeBtn') changeBtn: ElementRef;
    @ViewChild('letterRack') letterRack: ElementRef;
    @ViewChildren(TileComponent) tilesComponents: QueryList<TileComponent>;
    selectedLetterIndex = 0;
    coveredLetterCounter = 0;
    showButtons: boolean = false;
    lettersList: Tile[] = [];

    constructor(
        private playerSettingsService: PlayerSettingsService,
        private changeLetterService: ChangeLetterService,
        private selectLetterService: SelectLetterService,
        private moveLetterService: MoveLetterService,
        private mouseEventHandlerService: MouseEventHandlerService,
        public selectGameModeService: SelectGameModeService,
        private clientSocketService: ClientSocketService,
        private chgDecRef: ChangeDetectorRef,
        private displayMessageService: DisplayMessageService,
    ) {
        this.lettersList = this.playerSettingsService.letters;
        this.playerSettingsService.lettersChange.subscribe((value) => {
            this.lettersList = value;
            this.chgDecRef.detectChanges();
        });

        this.selectLetterService.changeLetterButtonIsShownObs.subscribe((value) => {
            this.showButtons = value;
            this.chgDecRef.detectChanges();
        });
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
    }

    @HostListener('window:click', ['$event'])
    unselectTiles(event: Event) {
        const tileArray: (EventTarget | null)[] = [];
        this.tilesComponents.forEach((tile) => {
            tileArray.push(tile.elementRef.nativeElement.childNodes[0].firstChild);
            tileArray.push(tile.elementRef.nativeElement.childNodes[0].lastChild);
        });
        if (event.target === this.letterRack.nativeElement || tileArray.includes(event.target)) return;
        this.cancelAllSelections();
    }

    @HostListener('window:keydown', ['$event'])
    selectLetterFromKeyboard(event: KeyboardEvent) {
        if (
            document.querySelector('#input-box') === document.activeElement ||
            this.mouseEventHandlerService.currentMouseEventReceiver === MouseEventReceiver.Board
        )
            return;
        {
            /* istanbul ignore else */
            if ((/^[A-Za-z]+$/.test(event.key) || event.key === '*') && event.key.length === 1) {
                this.cancelSelectionsToChange();
                this.findSelectedLetterIndex(event.key);
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                this.cancelSelectionsToChange();
                for (const [index, tile] of this.tilesComponents.toArray().entries()) {
                    /* istanbul ignore else */
                    if (tile.isSelectedToMove) {
                        this.moveLetterService.moveLetterFromKeyboardEvent(event, index);
                        break;
                    }
                }
            }
        }
    }

    @HostListener('window:mousewheel', ['$event'])
    moveLetterFromMouseWheel(event: WheelEvent) {
        if (this.mouseEventHandlerService.currentMouseEventReceiver !== MouseEventReceiver.LetterRack) return;
        for (const tile of this.tilesComponents.toArray()) {
            /* istanbul ignore else */
            if (tile.isSelectedToMove) {
                this.cancelSelectionsToChange();
                break;
            }
        }
        for (const [index, tile] of this.tilesComponents.toArray().entries()) {
            /* istanbul ignore else */
            if (tile.isSelectedToMove) {
                this.moveLetterService.moveLetterFromMouseEvent(event, index);
                break;
            }
        }
    }

    selectTileToMove(letter: string, letterIndex: number): void {
        this.mouseEventHandlerService.currentMouseEventReceiver = MouseEventReceiver.LetterRack;
        this.cancelAllSelections();
        this.selectedLetterIndex = letterIndex;
        this.tilesComponents.toArray()[this.selectedLetterIndex].decorateTileToMove();
    }

    findSelectedLetterIndex(letter: string): void {
        for (const tile of this.tilesComponents.toArray()) {
            if (tile.letter === letter.toUpperCase() && tile.isSelectedToMove) {
                this.selectedLetterIndex = tile.letterIndex;
                if (tile.letterIndex === this.tilesComponents.length - 1) {
                    this.selectedLetterIndex = -1;
                }
                tile.unselectTileToMove();
                break;
            } else {
                this.selectedLetterIndex = -1;
                tile.unselectTileToMove();
            }
        }
        this.selectLetterNextOccurrence(letter);
    }

    selectLetterNextOccurrence(letter: string): void {
        this.coveredLetterCounter++;
        for (let i = this.selectedLetterIndex + 1; i < this.tilesComponents.length; i++) {
            /* istanbul ignore else */
            if (this.tilesComponents.toArray()[i].letter === letter.toUpperCase() && !this.tilesComponents.toArray()[i].isSelectedToMove) {
                this.tilesComponents.toArray()[i].decorateTileToMove();
                this.selectedLetterIndex = this.tilesComponents.toArray()[i].letterIndex;
                this.coveredLetterCounter = 0;
                break;
            }
            /* istanbul ignore else */
            if (i === LETTERS_RACK_SIZE - 1) {
                this.selectedLetterIndex = -1;
                /* istanbul ignore else */
                if (this.coveredLetterCounter < LETTERS_RACK_SIZE) this.selectLetterNextOccurrence(letter);
            }
        }
    }

    selectGameMode(): void {
        if (this.selectGameModeService.isSoloModeChosen) this.changeLettersSolo();
        else this.changeLetterMulti();
    }
    changeLettersSolo(): void {
        this.changeLetterService.validateLetterChange();
        this.cancelAllSelections();
        this.showButtons = false;
    }

    changeLetterMulti(): void {
        if (this.selectGameModeService.isOnlinePlayerTurn) {
            const tempString = JSON.stringify(Array.from(this.changeLetterService.lettersToChange));
            this.clientSocketService.exchangeLettersUsingMouseSelection(tempString);
        } else this.displayMessageService.addMessageList('system', "Erreur : Ce n'est pas votre tour de jouer.");
    }

    cancelSelectionsToChange(): void {
        const tileArray = this.tilesComponents.toArray();
        for (const tile of tileArray) {
            tile.unselectTileToChange();
            tile.isSelectedToChange = false;
        }
        this.changeLetterService.lettersToChange.clear();
    }

    cancelSelectionsToMove(): void {
        const tileArray = this.tilesComponents.toArray();
        for (const tile of tileArray) {
            tile.unselectTileToMove();
            tile.isSelectedToMove = false;
        }
    }

    cancelAllSelections(): void {
        this.cancelSelectionsToChange();
        this.cancelSelectionsToMove();
    }
}
