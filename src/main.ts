/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
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
 *
 * @returns Observable of State
 */
//Combines all gameplay Actions and accumulates them into immutable State.
export const state$ = (): Observable<State> => {
    return merge(
        tick$(),
        flipDigit$(),
        spawn$(),
        mouseFlipDigit$(),
        pause$(),
    ).pipe(scan(reduceState, initialState), startWith(initialState));
};

if (typeof window !== "undefined") {
    // The first click activates the game; R starts a fresh State stream.
    const click$ = fromEvent(document.body, "mousedown") 
        .pipe(take(1));

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
