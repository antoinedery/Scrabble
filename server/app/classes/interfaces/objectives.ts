import { ObjectiveDescription } from '@app/classes/enums/objective-descriptions';

export interface Objective {
    description: ObjectiveDescription;
    score: number;
    fullfilled: boolean;
}
