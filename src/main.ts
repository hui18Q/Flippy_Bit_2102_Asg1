/**
 * Entry point: wires every Observable stream into the single state$
 * pipeline and subscribes render() to it. This is the only file that
 * starts a subscription; every other file stays pure.
 */

import "./style.css";

import {
    fromEvent,
    Observable,
    scan,
    startWith,
    switchMap,
    take,
    merge,
} from "rxjs";

import {
    flipDigit$,
    tick$,
    spawn$,
    mouseFlipDigit$,
    restart$,
    pause$,
} from "./observables";
import { initialState, reduceState } from "./state";
import { State } from "./types";
import { render } from "./view";

/**
 * Creates the Observable that stores and updates the game state.
 * Combines all gameplay Actions and accumulates them into immutable State,
 * using merge() and scan().
 *
 * @returns Observable of State
 */
export const state$ = (): Observable<State> => {
    return merge(
        tick$(),
        flipDigit$(),
        spawn$(),
        mouseFlipDigit$(),
        pause$(),
    ).pipe(scan(reduceState, initialState), startWith(initialState));
};

/**
 * The first click starts the game.
 * Pressing R replaces it with a fresh State$ stream without page reload.
 */
if (typeof window !== "undefined") {
    // The first click activates the game; R starts a fresh State stream.
    const click$ = fromEvent(document.body, "mousedown").pipe(take(1));

    click$
        .pipe(
            switchMap(() =>
                restart$().pipe(
                    startWith(null),
                    switchMap(() => state$()),
                ),
            ),
        )
        .subscribe(render());
}
