import {
    filter,
    fromEvent,
    interval,
    map,
    Observable,
    defer,
    repeat,
    timer,
    scan,
} from "rxjs";

import { DIGIT_KEYS, Constants } from "./constants";
import { FlipDigit, Tick, SpawnTarget, TogglePause } from "./actions";
import { Action } from "./types";

/**
 * Converts valid number-key presses into FlipDigit Actions.
 * Keys 1-8 correspond to the eight DigitBank positions.
 */
export const flipDigit$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        map(event => DIGIT_KEYS.indexOf(event.key)),
        filter(index => index >= 0),
        map(index => new FlipDigit(index)),
    );

/**
 * Emits Tick Actions at the configured interval to drive game movement.
 */
export const tick$ = (): Observable<Action> =>
    interval(Constants.TICK_RATE_MS).pipe(map(() => new Tick()));

/**
 * Generates a target value in the 8-bit range 0-255.
 */
const randomTargetValue = (): number => Math.floor(Math.random() * 256);

/**
 * Generates a random delay between 1 and 3 seconds for the next target.
 */
const randomSpawnDelay = (): number => 1000 + Math.floor(Math.random() * 2001);

/**
 * Creates falling-target Actions using a new random delay, target value and
 * bonus status for each spawn cycle.
 */
export const spawn$ = (): Observable<Action> =>
    // defer recalculates the random delay for every new spawn cycle.
    defer(() => timer(randomSpawnDelay())).pipe(
        repeat(),
        scan(targetIndex => targetIndex + 1, -1),
        map(
            index =>
                new SpawnTarget(
                    `target-${index}`,
                    randomTargetValue(),
                    randomBonus(),
                ),
        ),
    );

/**
 * Converts clicks on DigitBank SVG elements into FlipDigit Actions.
 * Clicks outside digit elements are filtered out.
 */
export const mouseFlipDigit$ = (): Observable<Action> =>
    fromEvent<MouseEvent>(document, "mousedown").pipe(
        map(event =>
            event.target instanceof Element
                ? event.target.getAttribute("data-fb-digit-index")
                : null,
        ),
        map(index => (index === null ? -1 : Number(index))),
        filter(index => index >= 0),
        map(index => new FlipDigit(index)),
    );

/**
 * Emits whenever R is pressed so main.ts can replace the current game
 * stream with a fresh one.
 */
export const restart$ = (): Observable<KeyboardEvent> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter(event => event.code === "KeyR"),
    );

/**
 * Converts P key presses into TogglePause Actions.
 */
export const pause$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter(event => event.code === "KeyP"),
        map(() => new TogglePause()),
    );

/**
 * Gives each newly spawned target a 20% chance of being a bonus target.
 */
const randomBonus = (): boolean => Math.random() < 0.2;
