/**
 * Flippy Bit - FRP entry point.
 *
 * The architecture mirrors the Asteroids example from the course notes:
 *
 *   - every input is an `Observable<Action>` (see observable.ts)
 *   - `merge` combines them into one stream of actions
 *   - `scan` folds each action over the immutable `State` (see state.ts)
 *   - a single `subscribe` performs all rendering side effects (view.ts)
 *
 * Keeping the fold pure means the whole simulation can be driven and
 * tested without a browser.
 *
 * men with hats
 */

import "./style.css";

import { type Observable, merge, scan } from "rxjs";

import { flipDigit$, spawn$, tick$ } from "./observable";
import { initialState, reduceState } from "./state";
import type { State } from "./types";
import { render } from "./view";

/**
 * The single game stream: merge every action source and fold it over
 * the state, emitting a fresh immutable `State` on every event.
 */
export const state$ = (): Observable<State> =>
    merge(tick$, flipDigit$, spawn$).pipe(scan(reduceState, initialState));

// Run the game on page load. `render()` builds the SVG scaffold once and
// returns the per-frame renderer that the subscription feeds.
if (typeof window !== "undefined") {
    state$().subscribe(render());
}
