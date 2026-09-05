/**
 * One binary digit controlled by the player.
 */
export type Bit = 0 | 1;

/**
 * Immutable 8-bit representation of the player's current answer.
 */
export type DigitBank = ReadonlyArray<Bit>;

/**
 * Complete immutable game State accumulated by the State Observable.
 */
export type State = Readonly<{
    digitBank: DigitBank;
    allCurrentTargetsInPlay: ReadonlyArray<FallingTargetView>;
    gameEnd: boolean;
    score: number;
    elapsedMs: number;
    paused: boolean;
    healthReserve: number;
}>;

/**
 * Contract implemented by events that transform one State into the next.
 */
export interface Action {
    apply(state: State): State;
}

/**
 * Runtime data needed to update and render one falling target.
 */
export type FallingTargetView = Readonly<{
    id: string;
    value: number;
    x: number;
    y: number;
    isBonus: boolean;
}>;
