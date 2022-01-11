// Disable de lint autorisé par chargés
/* eslint-disable @typescript-eslint/naming-convention */
import { BonusName, BonusType, BonusValue, Color, Text } from '@app/classes/enums/board-game-enums';
import { ObjectiveDescription } from '@app/classes/enums/objective-descriptions';
import { BonusStruct } from '@app/classes/interfaces/board-game-interfaces';
import { Objective } from '@app/classes/interfaces/objectives';
import { PlayerName } from '@app/classes/interfaces/player-name';
import { PlayerScore } from '@app/classes/interfaces/player-score';

export const CREATE_GAME = {
    constructRoom: () => {
        return {
            gameCreator: { playerName: '', socketID: '', letterRack: [], playerScore: 0, isMyTurn: false, privateObjective: new Map() },
            guestPlayer: { playerName: '', socketID: '', letterRack: [], playerScore: 0, isMyTurn: false, privateObjective: new Map() },
            gameParameters: {
                timer: { minute: 1, second: 0 },
                shuffleBonus: false,
                dictionary: { title: '', description: '' },
                isLog2990ModeChosen: false,
            },
        };
    },
};

export const NOT_FOUND = -1;
export const QUIT_GAME_DELAY = 5000;
export const ONE_MINUTE = 60;
export const THREE_SECONDS_MS = 3000;
export const MAX_PLACEMENT_BONUS = 50;

export const LETTERS_RACK_SIZE = 7;

export const BOARD_GAME = {
    SQUARES_IN_COLUMN: 15,
    SQUARES_IN_ROW: 15,
    NUMBER_OF_DOUBLE_LETTER: 24,
    NUMBER_OF_DOUBLE_WORD: 16,
    NUMBER_OF_TRIPLE_LETTER: 12,
    NUMBER_OF_TRIPLE_WORD: 8,
    CENTER_POSITION: 7,
};

export const RANDOM_NUMBER_GENERATOR = {
    GENERATE_RANDOM_NUMBER: (minValue: number, maxValue: number) => {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    },
};

export const INPUT_OBJECTIVE = {
    VOWELS: 'AEIOUYÀÂÈÉÊÎÙÛaeiouyàâéèêîôùû',
};
export const OBJECTIVE_BOUNDARIES = {
    MAX_OCC_VOWELS: 3,
    MAX_OCC_WORDS: 3,
    MAX_OCC_MOVES_MEDIUM: 3,
    MAX_OCC_MOVES_HARD: 4,
    MAX_OCC_LETTERS: 5,
    MAX_OCC_BONUS_SQUARE: 2,
};

export const OBJECTIVES: Objective[] = [];
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE1, score: 15, fullfilled: false });
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE2, score: 10, fullfilled: false });
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE3, score: 20, fullfilled: false });
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE4, score: 25, fullfilled: false });
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE5, score: 30, fullfilled: false });
OBJECTIVES.push({
    description: ObjectiveDescription.OBJECTIVE6,
    score: 40,
    fullfilled: false,
});
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE7, score: 15, fullfilled: false });
OBJECTIVES.push({ description: ObjectiveDescription.OBJECTIVE8, score: 30, fullfilled: false });

export const OBJECTIVE_1 = 1;
export const OBJECTIVE_2 = 2;
export const OBJECTIVE_3 = 3;
export const OBJECTIVE_4 = 4;
export const OBJECTIVE_5 = 5;
export const OBJECTIVE_6 = 6;
export const OBJECTIVE_7 = 7;
export const OBJECTIVE_8 = 8;

export const FACTORY_METHOD_GENERATOR = {
    EMPTY_FACTORY: () => {
        return { backgroundColor: Color.EmptySquare, letter: '', text: '', bonusType: BonusValue.XX };
    },
    DOUBLE_LETTER_FACTORY: () => {
        return { backgroundColor: Color.DoubleLetter, letter: '', text: Text.DoubleLetter, bonusType: BonusValue.DL };
    },
    DOUBLE_WORD_FACTORY: () => {
        return { backgroundColor: Color.DoubleWord, letter: '', text: Text.DoubleWord, bonusType: BonusValue.DW };
    },
    TRIPLE_LETTER_FACTORY: () => {
        return { backgroundColor: Color.TripleLetter, letter: '', text: Text.TripleLetter, bonusType: BonusValue.TL };
    },
    TRIPLE_WORD_FACTORY: () => {
        return { backgroundColor: Color.TripleWord, letter: '', text: Text.TripleWord, bonusType: BonusValue.TW };
    },
    STAR_FACTORY: () => {
        return { backgroundColor: Color.Star, letter: '', text: Text.Star, bonusType: BonusValue.DW };
    },
};

export const SQUARE = {
    SQUARE_NUMBER: 15,
};

export const TABLE_BONUS_CASE_COORDINATES: BonusStruct[] = [
    { name: BonusName.DL, coordinates: { x: 3, y: 0 } },
    { name: BonusName.DL, coordinates: { x: 11, y: 0 } },
    { name: BonusName.DL, coordinates: { x: 6, y: 2 } },
    { name: BonusName.DL, coordinates: { x: 8, y: 2 } },
    { name: BonusName.DL, coordinates: { x: 0, y: 3 } },
    { name: BonusName.DL, coordinates: { x: 7, y: 3 } },
    { name: BonusName.DL, coordinates: { x: 14, y: 3 } },
    { name: BonusName.DL, coordinates: { x: 2, y: 6 } },
    { name: BonusName.DL, coordinates: { x: 6, y: 6 } },
    { name: BonusName.DL, coordinates: { x: 8, y: 6 } },
    { name: BonusName.DL, coordinates: { x: 12, y: 6 } },
    { name: BonusName.DL, coordinates: { x: 3, y: 7 } },
    { name: BonusName.DL, coordinates: { x: 11, y: 7 } },
    { name: BonusName.DL, coordinates: { x: 2, y: 8 } },
    { name: BonusName.DL, coordinates: { x: 6, y: 8 } },
    { name: BonusName.DL, coordinates: { x: 8, y: 8 } },
    { name: BonusName.DL, coordinates: { x: 12, y: 8 } },
    { name: BonusName.DL, coordinates: { x: 0, y: 11 } },
    { name: BonusName.DL, coordinates: { x: 7, y: 11 } },
    { name: BonusName.DL, coordinates: { x: 14, y: 11 } },
    { name: BonusName.DL, coordinates: { x: 6, y: 12 } },
    { name: BonusName.DL, coordinates: { x: 8, y: 12 } },
    { name: BonusName.DL, coordinates: { x: 3, y: 14 } },
    { name: BonusName.DL, coordinates: { x: 11, y: 14 } },
    // 16 cases DW
    { name: BonusName.DW, coordinates: { x: 1, y: 1 } },
    { name: BonusName.DW, coordinates: { x: 13, y: 1 } },
    { name: BonusName.DW, coordinates: { x: 2, y: 2 } },
    { name: BonusName.DW, coordinates: { x: 12, y: 2 } },
    { name: BonusName.DW, coordinates: { x: 3, y: 3 } },
    { name: BonusName.DW, coordinates: { x: 11, y: 3 } },
    { name: BonusName.DW, coordinates: { x: 4, y: 4 } },
    { name: BonusName.DW, coordinates: { x: 10, y: 4 } },
    { name: BonusName.DW, coordinates: { x: 4, y: 10 } },
    { name: BonusName.DW, coordinates: { x: 10, y: 10 } },
    { name: BonusName.DW, coordinates: { x: 3, y: 11 } },
    { name: BonusName.DW, coordinates: { x: 11, y: 11 } },
    { name: BonusName.DW, coordinates: { x: 2, y: 12 } },
    { name: BonusName.DW, coordinates: { x: 12, y: 12 } },
    { name: BonusName.DW, coordinates: { x: 1, y: 13 } },
    { name: BonusName.DW, coordinates: { x: 13, y: 13 } },
    // 12 cases TL
    { name: BonusName.TL, coordinates: { x: 5, y: 1 } },
    { name: BonusName.TL, coordinates: { x: 9, y: 1 } },
    { name: BonusName.TL, coordinates: { x: 1, y: 5 } },
    { name: BonusName.TL, coordinates: { x: 5, y: 5 } },
    { name: BonusName.TL, coordinates: { x: 9, y: 5 } },
    { name: BonusName.TL, coordinates: { x: 13, y: 5 } },
    { name: BonusName.TL, coordinates: { x: 1, y: 9 } },
    { name: BonusName.TL, coordinates: { x: 5, y: 9 } },
    { name: BonusName.TL, coordinates: { x: 9, y: 9 } },
    { name: BonusName.TL, coordinates: { x: 13, y: 9 } },
    { name: BonusName.TL, coordinates: { x: 5, y: 13 } },
    { name: BonusName.TL, coordinates: { x: 9, y: 13 } },
    // 8 cases TW
    { name: BonusName.TW, coordinates: { x: 0, y: 0 } },
    { name: BonusName.TW, coordinates: { x: 7, y: 0 } },
    { name: BonusName.TW, coordinates: { x: 14, y: 0 } },
    { name: BonusName.TW, coordinates: { x: 0, y: 7 } },
    { name: BonusName.TW, coordinates: { x: 14, y: 7 } },
    { name: BonusName.TW, coordinates: { x: 0, y: 14 } },
    { name: BonusName.TW, coordinates: { x: 7, y: 14 } },
    { name: BonusName.TW, coordinates: { x: 14, y: 14 } },
    // 1 cases Star
    { name: BonusName.Star, coordinates: { x: 7, y: 7 } },
];

export const MAX_VALUE_SECOND = 59;
export const ONE_SECOND_MS = 1000;

export const MAX_END_TURN = 6;

export const MAX_ROW_SIZE = 15;

export const BONUS_MAP = new Map();
BONUS_MAP.set(BonusValue.DL, { type: BonusType.LETTER, value: 2 });
BONUS_MAP.set(BonusValue.TL, { type: BonusType.LETTER, value: 3 });
BONUS_MAP.set(BonusValue.DW, { type: BonusType.WORD, value: 2 });
BONUS_MAP.set(BonusValue.TW, { type: BonusType.WORD, value: 3 });

export const DEFAULT_EASY_NAMES: PlayerName[] = [
    {
        name: 'Joe',
        difficulty: 'Easy',
    },
    {
        name: 'Bob',
        difficulty: 'Easy',
    },
    {
        name: 'Oscar',
        difficulty: 'Easy',
    },
];

export const DEFAULT_EXPERT_NAMES: PlayerName[] = [
    {
        name: 'Poseidon',
        difficulty: 'Expert',
    },
    {
        name: 'Zeus',
        difficulty: 'Expert',
    },
    {
        name: 'Goliath',
        difficulty: 'Expert',
    },
];
export const MAX_NUMBER_SCORES = 5;

export const DEFAULT_CLASSIC_PLAYERS: PlayerScore[] = [
    {
        name: 'Hugo',
        score: 50,
        mode: 'Classic',
    },
    {
        name: 'Levi',
        score: 75,
        mode: 'Classic',
    },
    {
        name: 'Caroline',
        score: 100,
        mode: 'Classic',
    },
    {
        name: 'Mary',
        score: 150,
        mode: 'Classic',
    },
    {
        name: 'Nikolay',
        score: 200,
        mode: 'Classic',
    },
];

export const DEFAULT_LOG2990_PLAYERS: PlayerScore[] = [
    {
        name: 'Antoine',
        score: 50,
        mode: 'LOG2990',
    },
    {
        name: 'Ahmed',
        score: 75,
        mode: 'LOG2990',
    },
    {
        name: 'Stephanie',
        score: 100,
        mode: 'LOG2990',
    },
    {
        name: 'Alexander',
        score: 150,
        mode: 'LOG2990',
    },
    {
        name: 'Anass',
        score: 200,
        mode: 'LOG2990',
    },
];

export const MAX_BUFFER_SIZE = 2e7;
