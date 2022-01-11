import { AXIS } from '@app/classes/enums/axis';
import { PlacedLetter } from '@app/classes/interfaces/letter-interfaces';
import { ScoredWord, UnscoredWord } from '@app/classes/interfaces/word-interfaces';

export interface Placement {
    axis: AXIS;
    letters: PlacedLetter[];
}

export interface UnscoredPlacement {
    placement: Placement;
    words: UnscoredWord[];
}

export interface ScoredPlacement {
    placement: Placement;
    words: ScoredWord[];
    totalScore: number;
}
