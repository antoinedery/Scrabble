import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChangeLetterService } from '@app/services/change-letter.service';
import { SelectLetterService } from '@app/services/select-letter.service';
import { MousePlacementService } from '@app/services/players-placements/current/mouse/mouse-placement.service';

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
    @Input() letter: string = '';
    @Input() score: number = 0;
    @Input() letterIndex: number = 0;
    @ViewChild('tile') tile: ElementRef;

    isSelectedToChange: boolean = false;
    isSelectedToMove: boolean = false;

    constructor(
        public elementRef: ElementRef,
        private changeLetterService: ChangeLetterService,
        private selectLetterService: SelectLetterService,
        public mousePlacementService: MousePlacementService,
    ) {}

    decorateTileToChange(event: Event): void {
        event.preventDefault();
        this.mousePlacementService.cancelPlacement();
        /* istanbul ignore else */
        if (this.isSelectedToMove) {
            this.isSelectedToMove = false;
            this.tile.nativeElement.classList.remove('letter-selected-move');
        }

        this.isSelectedToChange = !this.isSelectedToChange;

        if (this.isSelectedToChange) {
            this.selectLetterService.toggleChangeButtonVisibility(true);
            this.tile.nativeElement.classList.add('letter-selected-change');
            this.changeLetterService.lettersToChange.set(this.letterIndex, this.letter);
        } else this.unselectTileToChange();
    }

    decorateTileToMove(): void {
        /* istanbul ignore else */
        if (this.isSelectedToChange) {
            this.isSelectedToChange = false;
            this.unselectTileToChange();
        }
        this.isSelectedToMove = !this.isSelectedToMove;

        if (this.isSelectedToMove) {
            this.tile.nativeElement.classList.add('letter-selected-move');
        } else this.unselectTileToMove();
    }

    unselectTileToChange(): void {
        this.changeLetterService.lettersToChange.delete(this.letterIndex);
        this.tile.nativeElement.classList.remove('letter-selected-change');
        /* istanbul ignore else */
        if (this.changeLetterService.lettersToChange.size === 0) this.selectLetterService.toggleChangeButtonVisibility(false);
    }

    unselectTileToMove(): void {
        this.isSelectedToMove = false;
        this.tile.nativeElement.classList.remove('letter-selected-move');
    }
}
