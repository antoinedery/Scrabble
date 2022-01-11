export enum Command {
    Insert = '!placer',
    Exchange = '!échanger',
    SkipTurn = '!passer',
    Leave = '!abandonner',
    Debug = '!debug',
    Reserve = '!reserve',
    Help = '!aide',
}

export enum CommandDescription {
    Insert = 'Permet de placer une lettre dans le plateau du jeu.',
    Exchange = "Permet d'échanger une ou plusieurs lettres du chevalet." +
        ' Pour activer cette commande, il faut faire un clic droit de la souris sur le chevalet.',
    SkipTurn = 'Permet de passer son tour.',
    Leave = "Permet d'abandonner votre partie.",
    Debug = 'Permet de (dés)activer les affichages de débogage qui sont des informations relatives aux choix de jeu faits par les JV.',
    Reserve = "Permet d'afficher en ordre alphabétique le contenu de la réserve.",
    Help = "Permet d'afficher un court texte d'aide qui liste l'ensemble des commandes disponibles et explique brièvement leur utilisation.",
}

export enum MouseButton {
    Left,
    Middle,
    Right,
    Back,
    Forward,
}

export enum ActivePlayer {
    Player,
    VirtualPlayer,
}

export enum VirtualPlayerDifficulty {
    None,
    Beginner,
    Expert,
}

export enum GameModes {
    ClassicMode = 'Classic',
    Log2990Mode = 'Log2990',
}
