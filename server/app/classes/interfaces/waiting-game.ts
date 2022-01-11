import { DictionaryDetails } from './dictionary-details';
import { Time } from './time';

export interface WaitingGame {
    playerName: string;
    timer: Time;
    dictionary: DictionaryDetails;
    bonus: boolean;
    socketId: string;
    isLog2990ModeChosen: boolean;
}
