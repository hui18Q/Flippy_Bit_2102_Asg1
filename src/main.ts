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
    switchMap, //Switch from one Observable to another
    take, //Only accept a certain number of values
} from "rxjs";

import { flipDigit$ } from "./observables";
import { initialState, reduceState } from "./state";
import { State } from "./types";
import { render } from "./view";

/**
 * Creates the Observable that stores and updates the game state.
 *
 * @returns Observable of State
 */

///define state$()     return observable of state
export const state$ = (): Observable<State> => {
//flipDigit$ produces a FlipDigit Action when the user presses keys 1-8

    return flipDigit$().pipe(
        //scan remembers the previous State and produces a new State
        //every time an Action is emitted
        scan(
            reduceState,
            initialState,
        ),

        //emit initialState first, so the 8 digits show 00000000
        //before the user presses any key
        startWith(initialState), //so when game start, 00000000 will be displayed, then when user press key 1-8, the corresponding bit will be flipped and new state will be displayed
    );
};


// The following simply runs your main function on window load.  Make sure to leave it in place.
// You should not need to change this, beware if you are.
if (typeof window !== "undefined") {
    // Observable: wait for first user click
    const click$ = fromEvent(
        document.body,
        "mousedown",
    ).pipe(
        take(1),
    );
    //Create an Observable from mouse-down events on the webpage body.
    //take(1) means only take the first emitted value, then stop listening.


    click$
        .pipe(
            switchMap(() => state$()),
        )
        .subscribe(render());

    //after the first click, switch to the state$() Observable.
    //subscribe listens to every State emitted by state$()
    //and passes the State to render() to update the SVG.
}