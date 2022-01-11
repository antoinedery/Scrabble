import { DictionaryDetails } from './dictionary-details';

export interface Time {
    minute: number;
    second: number;
}

export interface GameParameters {
    // gameHostName: string;
    timer: Time;
    shuffleBonus: boolean;
    dictionary: DictionaryDetails;
    isLog2990ModeChosen: boolean;
}
