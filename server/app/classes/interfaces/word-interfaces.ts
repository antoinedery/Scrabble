import { AXIS } from '@app/classes/enums/axis';
import { BonusLetter } from '@app/classes/interfaces/letter-interfaces';
import { Vec2 } from '@app/classes/interfaces/vec2';

export interface Word {
    axis: AXIS;
    origin: Vec2;
    content: string;
}

export interface UnscoredWord {
    word: Word;
    bonuses: BonusLetter[];
}

export interface ScoredWord {
    word: Word;
    score: number;
}

export interface BoundedTerm {
    prefixTiles: number;
    word: Word;
    suffixTiles: number;
}
