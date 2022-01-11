import { Injectable } from '@angular/core';
import { ROW_LETTER_POSSIBILITIES } from '@app/classes/constants/constants';
import { AXIS } from '@app/classes/enums/axis';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { Placement } from '@app/classes/interfaces/placement-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';
import { TileHandlerService } from '@app/services/tile-handler.service';

@Injectable({
    providedIn: 'root',
})
export class MessageCreatorService {
    constructor(private tileHandlerService: TileHandlerService) {}

    getContentToOutput(placement: Placement): string {
        const vecCtr = {
            x: placement.letters[0].position.x,
            y: placement.letters[0].position.y,
        };
        const lastPos = {
            x: placement.letters[placement.letters.length - 1].position.x,
            y: placement.letters[placement.letters.length - 1].position.y,
        };
        this.tileHandlerService.incrementVector(placement.axis, lastPos);
        let contentToOuput = '!placer ';

        contentToOuput += this.getVerticalAxisLetter(vecCtr.y);
        contentToOuput += (vecCtr.x + 1).toString();
        contentToOuput += placement.axis === AXIS.HORIZONTAL ? 'h ' : 'v ';

        while (!this.tileHandlerService.isEqual(lastPos, vecCtr)) {
            contentToOuput += this.isInPlacement(vecCtr, placement.letters);
            this.tileHandlerService.incrementVector(placement.axis, vecCtr);
        }
        return contentToOuput;
    }

    getVerticalAxisLetter(yPosition: number): string {
        for (const [index, letter] of ROW_LETTER_POSSIBILITIES.entries()) {
            if (index === yPosition) {
                return letter;
            }
        }
        return '';
    }

    isInPlacement(vec: Vec2, letters: PlacedLetter[]): string | undefined {
        for (const letter of letters) {
            if (this.tileHandlerService.isEqual(letter.position, vec)) {
                return letter.content;
            }
        }
        return this.tileHandlerService.getLetterOnTile(vec);
    }
}
