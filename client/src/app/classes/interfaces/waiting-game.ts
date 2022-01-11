import { Time } from '@app/classes/interfaces/time';
import { DictionaryDetails } from './dictionary-details';

export interface WaitingGame {
    playerName: string;
    timer: Time;
    dictionary: DictionaryDetails;
    bonus: boolean;
    socketId: string;
    isLog2990ModeChosen: boolean;
}
