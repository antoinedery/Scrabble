import { BonusType } from '@app/classes/enums/board-game-enums';
import { Vec2 } from '@app/classes/interfaces/vec2';

export interface Bonus {
    type: BonusType;
    value: number;
}

export interface BonusLetter {
    content: string;
    bonus: Bonus;
}

export interface PlacedLetter {
    content: string;
    position: Vec2;
}

export interface BoundedLetter {
    position: number;
    content: string;
}
