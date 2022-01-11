export interface Tile {
    letter: string;
    score: number;
}

export interface Reserve {
    tile: Tile;
    quantity: number;
}
