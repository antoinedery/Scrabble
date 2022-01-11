// Disable de lint autorisé par chargés
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { BonusName, BonusType, BonusValue, Color, Text } from '@app/classes/enums/board-game-enums';
import { Command, CommandDescription } from '@app/classes/enums/enums';
import { ObjectiveDescription } from '@app/classes/enums/objective-descriptions';
import { BonusStruct } from '@app/classes/interfaces/board-game-interfaces';
import { IDictionary } from '@app/classes/interfaces/dictionary';
import { Objective } from '@app/classes/interfaces/objectives';
import { PlayerScore } from '@app/classes/interfaces/player-score';

export const INPUT_BOX = {
    MAX_LENGTH: 512,
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

export const MESSAGES_MAP: Map<Command, number> = new Map();
MESSAGES_MAP.set(Command.Insert, 0);
MESSAGES_MAP.set(Command.Exchange, 1);
MESSAGES_MAP.set(Command.SkipTurn, 2);
MESSAGES_MAP.set(Command.Leave, 3);
MESSAGES_MAP.set(Command.Debug, 4);
MESSAGES_MAP.set(Command.Reserve, 5);
MESSAGES_MAP.set(Command.Help, 6);

export const HELP_MAP: Map<Command, CommandDescription> = new Map();
HELP_MAP.set(Command.Insert, CommandDescription.Insert);
HELP_MAP.set(Command.Exchange, CommandDescription.Exchange);
HELP_MAP.set(Command.SkipTurn, CommandDescription.SkipTurn);
HELP_MAP.set(Command.Leave, CommandDescription.Leave);
HELP_MAP.set(Command.Debug, CommandDescription.Debug);
HELP_MAP.set(Command.Reserve, CommandDescription.Reserve);

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

export const CANVAS_DIMENSIONS = {
    default_height: 700 / window.devicePixelRatio,
    DEFAULT_WIDTH: 700 / window.devicePixelRatio,
    CASE_SIZE: 700 / window.devicePixelRatio / 15,
    BORDER_START: 700 / window.devicePixelRatio / 15 / 11,
};

export const BOARD_GAME = {
    SQUARES_IN_COLUMN: 15,
    SQUARES_IN_ROW: 15,
    NUMBER_OF_DOUBLE_LETTER: 24,
    NUMBER_OF_DOUBLE_WORD: 16,
    NUMBER_OF_TRIPLE_LETTER: 12,
    NUMBER_OF_TRIPLE_WORD: 8,
    CENTER_POSITION: 7,
};

export const TEXT_DIMENSION = {
    SIZE_MIN: 10,
    SIZE_MAX: 17,
    DEFAULT: 13.5,
};

export const TEST_HELPER = {
    HEIGHT: 100,
    WIDTH: 100,
};

export const SLIDER_VALUE = {
    MIN_MAX_VALUE: 50,
};

export const CANVAS_FONTSIZE = {
    STAR: 10,
    SQUARE: 11,
    HEADER: 13,
    FONT_SIZE_DIVIDER: 480,
    LETTER_DIVIDER: 200,
    LETTER_YPOS_DIVIDER: 3,
    HEADER_ROW_SIZE: 25,
    HEADER_COLUMN_SIZE: 20,
    LINE_HEIGHT: 10,
    LETTER_SIZE_MULTIPLIER: 2.5,
};

export const TILE_DIMENSION = {
    DEFAULT_DIMENSION: 40,
};

export const SQUARE = {
    SQUARE_NUMBER: 15,
};

export const MIN_WORDS_DICTIONARY = 4;

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

export const LETTERS_RACK_SIZE = 7;
export const PLAYER_NAME_LENGTH = {
    MINIMUM_LENGTH: 2,
    MAXIMUM_LENGTH: 20,
};

export const DICTIONARY_TITLE_MAX_LENGTH = 100;

export const VIRTUAL_PLAYER_ACTION_PROBABILITY = {
    END_TURN_PROBABILITY: 10,
    CHANGE_LETTER_PROBABILITY: 10,
};

export const VIRTUAL_PLAYER_SCORE_PROBABILITY = {
    LOW_RANGE_POINTS: 40,
    MEDIUM_RANGE_POINTS: 70,
};

export const MAX_VALUE_TIMER_MINUTE = 5;
export const MINIMAL_DOUBLE_DIGIT = 10;
export const TIMER_CHANGE_VALUE = 30;
export const MAX_VALUE_SECOND = 59;
export const ONE_MINUTE = 60;
export const ONE_SECOND_MS = 1000;
export const THREE_SECONDS_MS = 3000;
export const MINIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS = 3000;
export const MAXIMAL_ACTION_TIME_VIRTUAL_PLAYER_MS = 20000;

export const PERCENT = 100;
export const MAX_PLACEMENT_BONUS = 50;
export const MAX_ROW_SIZE = 15;

export const BONUS_MAP = new Map();
BONUS_MAP.set(BonusValue.DL, { type: BonusType.LETTER, value: 2 });
BONUS_MAP.set(BonusValue.TL, { type: BonusType.LETTER, value: 3 });
BONUS_MAP.set(BonusValue.DW, { type: BonusType.WORD, value: 2 });
BONUS_MAP.set(BonusValue.TW, { type: BonusType.WORD, value: 3 });

export const ASCII_A = 65;

export const MAX_END_TURN = 6;

export const MIDDLE_TILE_POSITION = { x: 7, y: 7 };

export const WORD_ORIENTATION_PROBABILITY = 0.5;

export const HALF_PROBABILITY = 50;

export const QUIT_DELAY_MS = 5000;

export const RANDOM_NUMBER_GENERATOR = {
    GENERATE_RANDOM_NUMBER: (minValue: number, maxValue: number) => {
        return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    },
};

export const ROW_LETTER_POSSIBILITIES: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];
export const COLUMN_NUMBER_POSSIBILITIES: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
export const ORIENTATION_POSSIBILITIES = {
    horizontal: 'h',
    vertical: 'v',
};
export const CENTRAL_SQUARE = {
    row: 'h',
    column: '8',
};
export const NOT_FOUND = -1;
export const INVALID_COMMAND = 7;
export const COMMAND_ARGUMENTS_MIN_SIZE = 3;
export const COMMAND_ARGUMENTS_MAX_SIZE = 4;
export const COMMAND_ARGUMENTS_POSSIBLE_SIZES = [COMMAND_ARGUMENTS_MIN_SIZE, COMMAND_ARGUMENTS_MAX_SIZE];
export enum RowColumnMinMaxSize {
    SmallestRowPossible = 0,
    BiggestRowPossible = 14,
    SmallestColumnPossible = 0,
    BiggestColumnPossible = 14,
}

export const BEGINNER_BOT_NAMES = ['Bob', 'Joe', 'Oscar'];
export const EXPERT_BOT_NAMES = ['Poseidon', 'Zeus', 'Goliath'];

export const DEFAULT_CLASSIC_PLAYERS: PlayerScore[] = [
    {
        name: 'Stephany',
        score: 50,
        mode: 'Classic',
    },
    {
        name: 'Antoine',
        score: 40,
        mode: 'Classic',
    },
    {
        name: 'Ahmed',
        score: 30,
        mode: 'Classic',
    },
    {
        name: 'Bob',
        score: 20,
        mode: 'Classic',
    },
    {
        name: 'Joe',
        score: 10,
        mode: 'Classic',
    },
];

export const DEFAULT_LOG2990_PLAYERS: PlayerScore[] = [
    {
        name: 'Hugo',
        score: 50,
        mode: 'LOG2990',
    },
    {
        name: 'Alex',
        score: 40,
        mode: 'LOG2990',
    },
    {
        name: 'Oscar',
        score: 30,
        mode: 'LOG2990',
    },
    {
        name: 'Bob',
        score: 20,
        mode: 'LOG2990',
    },
    {
        name: 'Joe',
        score: 10,
        mode: 'LOG2990',
    },
];

export const FOUR_LETTER_WORD = 4;

export const FORBIDDEN_SYMBOLS = new Map<string, string>();
FORBIDDEN_SYMBOLS.set('\\', '\\');
FORBIDDEN_SYMBOLS.set('/', '/');
FORBIDDEN_SYMBOLS.set(':', ':');
FORBIDDEN_SYMBOLS.set('*', '*');
FORBIDDEN_SYMBOLS.set('?', '?');
FORBIDDEN_SYMBOLS.set('"', '"');
FORBIDDEN_SYMBOLS.set('<', '<');
FORBIDDEN_SYMBOLS.set('>', '>');
FORBIDDEN_SYMBOLS.set('|', '|');

export const TEMP_DICTIONARY: IDictionary = {
    title: '',
    description: '',
    words: ['aller', 'alles', 'environ', 'es', 'le', 'les', 'meurtries', 'negligea'],
};

export const MAX_DICTIONARY_SIZE = 1e7;
