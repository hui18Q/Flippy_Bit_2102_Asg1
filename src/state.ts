/**
 * Pure state layer for Flippy Bit.
 *
 * Contains the initial state, small pure helpers for working with the
 * DigitBank, and the `Action` classes that describe every possible
 * state transition. No RxJS and no DOM here - this module is fully
 * unit-testable in isolation (see tests/main.test.ts).
 * 
 * MAIN pure game logic
 * 
 * 
 */

import { Constants, Target, Viewport } from "./constants";
import type { Action, Bit, DigitBank, FallingTargetView, State } from "./types";

//A fresh, all-zero answer row of the required width.
export const INITIAL_DIGIT_BANK: DigitBank = Array.from(
    { length: Constants.DIGIT_COUNT },
    () => 0 as Bit,
);
//the game begins with
export const initialState: State = {
    time: 0,
    digitBank: INITIAL_DIGIT_BANK,
    allCurrentTargetsInPlay: [],
    healthReserve: Constants.START_LIVES,
    score: 0,
    gameEnd: false,
    exit: [],
};

/* -------------------------------------------------------------------- */
/* Pure helpers                                                         */
/* -------------------------------------------------------------------- */

/**
 * Interpret a DigitBank as an unsigned binary number.
 * Index 0 is the most significant bit, so we fold left doubling the
 * running total and adding each bit: 0b1000_0000 -> 128.
 */
//converts the player's binary digits into a normal number
export const digitBankValue = (bank: DigitBank): number =>
    bank.reduce<number>((total, bit) => total * 2 + bit, 0);

//Return a new DigitBank with the bit at `index` inverted, flips 1 binary digit
export const flipBit = (bank: DigitBank, index: number): DigitBank =>
    bank.map((bit, i) => (i === index ? ((bit ^ 1) as Bit) : bit)); //creates new array

//Move 1 target downward
const descend = (t: FallingTargetView): FallingTargetView => ({
    ...t,
    y: t.y + Constants.FALL_SPEED,
});

// A target is irrelevant once it has fallen past the canvas, checks whether a target has gone below the screen. 
const hasLeftPlay = (t: FallingTargetView): boolean => t.y > Viewport.CANVAS_HEIGHT;

/* -------------------------------------------------------------------- */
/* Actions                                                              */
/* -------------------------------------------------------------------- */

/**
 * One step of game time: every target falls, and any target that has
 * left the play area is moved into `exit` for the view to clean up.
 *
 * TODO (Sun 30): judge the lowest unresolved target as it crosses
 * `Constants.CHECK_LINE_Y` - match => score + 1 and resolve it, miss =>
 * lose a life / end the game.
 */
export class Tick implements Action { //game update
    constructor(public readonly elapsed: number) {}

    apply(s: State): State {
        if (s.gameEnd) return s; //dont change anything
        const moved = s.allCurrentTargetsInPlay.map(descend); //move every target downward
        return {
            ...s,
            time: s.time + 1,
            allCurrentTargetsInPlay: moved.filter(t => !hasLeftPlay(t)), //keeps only the target on screen
            exit: moved.filter(hasLeftPlay), //puts targets that left the screen into exit
        };
    }
}

// Flip one digit in the player's answer row. 
export class FlipDigit implements Action {
    constructor(public readonly index: number) {}

    apply(s: State): State {
        return s.gameEnd? s: {
                  ...s,
                  digitBank: flipBit(s.digitBank, this.index),
                  exit: [],};
    }
}

/**
 * Add a new target at the top of the screen.
 *
 * TODO (Mon 31): `value` should come from a pure seeded PRNG threaded
 * through the state, and `id` should use that PRNG rather than `time`.
 */
export class SpawnTarget implements Action {
    constructor(public readonly value: number) {}

    apply(s: State): State {
        if (s.gameEnd) return s;
        const spawned: FallingTargetView = {
            id: `target-${s.time}-${s.allCurrentTargetsInPlay.length}`,
            value: this.value,
            x: Viewport.CANVAS_WIDTH / 2 - Target.WIDTH / 2,
            y: -Target.HEIGHT,
            resolved: false,
        };
        return {
            ...s,
            allCurrentTargetsInPlay: [...s.allCurrentTargetsInPlay, spawned],
            exit: [],
        };
    }
}

/**
 * Fold an action over the current state.
 * This is the reducer passed to `scan` in the main stream.
 */
export const reduceState = (s: State, action: Action): State => action.apply(s);
