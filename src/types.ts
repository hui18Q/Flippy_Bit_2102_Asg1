export type Bit = 0 | 1;

export type DigitBank = ReadonlyArray<Bit>;

// State is immutable; Actions create a new State instead of mutating this one.
export type State = Readonly<{
    digitBank: DigitBank;
    allCurrentTargetsInPlay: ReadonlyArray<FallingTargetView>;
    gameEnd: boolean;
    score: number;
    elapsedMs: number;
    paused: boolean;
    healthReserve: number;
}>;

// Every game event transforms the current State into the next State.
export interface Action {
    apply(state: State): State;
}

export type FallingTargetView = Readonly<{
    id: string;
    value: number;
    x: number;
    y: number;
    isBonus: boolean;
}>;
