/**
 * Core type aliases and interfaces for Flippy Bit.
 *
 * Type of data
 * 
 * Several names here are mandated by the assignment specification and
 * must not be renamed: `DigitBank`, `FallingTargetView`, `healthReserve`,
 * `allCurrentTargetsInPlay`.
 */

/** A single binary digit in the player's answer row. */
export type Bit = 0 | 1;

/**
 * The player's current answer: an ordered row of {@link Bit}s.
 *
 * Index 0 is the most significant bit (leftmost on screen), so the row
 * reads left-to-right like a written binary number. Immutable - every
 * flip produces a brand new DigitBank rather than mutating in place.
 */
export type DigitBank = ReadonlyArray<Bit>; //player's binary number answer

/**
 * The runtime representation of one falling target.
 *
 * `value` is the decimal number the player must match. It is shown to
 * the player in base 16 (hexadecimal); the player builds the matching
 * value in binary using the DigitBank.
 */
export type FallingTargetView = Readonly<{
    id: string; //identifies which target it is
    value: number; //number player must match
    x: number; //horizontal posotion
    y: number; //vertical position
    /** True once the player has correctly matched this target. */
    resolved: boolean; //whether the target has been handled
}>;

/**
 * A discrete event that advances the game.
 *
 * Every input source (the clock, key presses, mouse clicks, ...) is
 * turned into a stream of `Action`s; the main stream folds them over
 * the {@link State} with `scan`. This mirrors the Asteroids example.
 */
export interface Action { 
    apply(s: State): State; //actions take current state & return new state
}

/**
 * The complete game state.
 *
 * This single immutable value is the accumulator of the `scan` in the
 * main stream - nothing about the running game is stored in the DOM.
 */
export type State = Readonly<{
    time: number; //number of game tick
    digitBank: DigitBank; //player's answer (8bit)
    allCurrentTargetsInPlay: ReadonlyArray<FallingTargetView>;// falling target currently on screen, Lives remaining; the game ends when this reaches 0.
    healthReserve: number;// One point per target matched since the game started. 
    score: number; //current score
    gameEnd: boolean; //Whether game is over
    /**
     * Targets removed from play during the most recent tick. The view
     * reads this to delete the corresponding SVG nodes, then it is
     * cleared. Pattern borrowed from the Asteroids example.
     */
    exit: ReadonlyArray<FallingTargetView>;
}>;
