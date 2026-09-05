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

export const flipDigit$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        map(event => DIGIT_KEYS.indexOf(event.key)),
        filter(index => index >= 0),
        map(index => new FlipDigit(index)),
    );
export const tick$ = (): Observable<Action> =>
    interval(Constants.TICK_RATE_MS).pipe(map(() => new Tick()));

const randomTargetValue = (): number => Math.floor(Math.random() * 256);

export const spawn$ = (): Observable<Action> =>
    defer(() => timer(randomSpawnDelay())) // defer recalculates the random delay for every new spawn cycle.
        .pipe(
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

const randomSpawnDelay = (): number => 1000 + Math.floor(Math.random() * 2001);

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

export const restart$ = (): Observable<KeyboardEvent> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter(event => event.code === "KeyR"),
    );

export const pause$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter(event => event.code === "KeyP"),
        map(() => new TogglePause()),
    );

export const randomBonus = (): boolean => Math.random() < 0.2;
