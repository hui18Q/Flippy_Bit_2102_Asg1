/**
 * Observable sources for Flippy Bit.
 *
 * Each export is a stream of {@link Action}s. `main.ts` merges them and
 * folds the result over the state with `scan`, so adding a new input to
 * the game is just adding another `Observable<Action>` here.
 */

import {
    type Observable,
    concatMap,
    defer,
    delay,
    filter,
    from,
    fromEvent,
    interval,
    map,
    of,
} from "rxjs";

import { Constants } from "./constants";
import { FlipDigit, SpawnTarget, Tick } from "./state";
import type { Action } from "./types";

/** Fixed-rate clock that drives the simulation forward. */
export const tick$: Observable<Action> = interval(Constants.TICK_RATE_MS).pipe(
    map(elapsed => new Tick(elapsed)),
);

/**
 * Keyboard control: number keys 1-8 flip the digit in that column.
 * `indexOf` returns -1 for any other key, which `filter` drops.
 *
 * TODO (Mon 31): add a mouse stream that emits FlipDigit when a digit
 * cell is clicked, and merge it in `main.ts`.
 */
const DIGIT_KEYS: ReadonlyArray<string> = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
];

// `defer` delays touching `document` until something subscribes, which
// keeps this module importable in a non-DOM context (e.g. unit tests).
export const flipDigit$: Observable<Action> = defer(() =>
    fromEvent<KeyboardEvent>(document, "keydown"),
).pipe(
    map(event => DIGIT_KEYS.indexOf(event.key)),
    filter(index => index >= 0),
    map(index => new FlipDigit(index)),
);

/**
 * TEMPORARY demo spawner.
 *
 * Emits a fixed hex sequence, one target every two seconds, so the
 * falling mechanic is visible while it is being built.
 *
 * TODO (Mon 31): replace with a random 1-3 second gap and PRNG values,
 * and make the game speed up the longer the player survives.
 */
const DEMO_TARGET_VALUES: ReadonlyArray<number> = [0x13, 0x2f, 0x08, 0xa1, 0x5c,];

export const spawn$: Observable<Action> = from(DEMO_TARGET_VALUES).pipe(
    concatMap(value => of(new SpawnTarget(value)).pipe(delay(2000))),
);
