import { BonusValue } from '@app/classes/enums/board-game-enums';
import { Vec2 } from './vec2';
export interface Square {
    backgroundColor: string;
    letter: string;
    text: string;
    bonusType: BonusValue;
}
export interface BonusStruct {
    name: string;
    coordinates: Vec2;
}
