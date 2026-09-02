import {
    filter,
    fromEvent,
    map,
    Observable,
} from "rxjs";

import { DIGIT_KEYS } from "./constants";
import { FlipDigit } from "./actions";
import { Action } from "./types";

//takes no argument because because the event target (document) and action logic are fixed
export const flipDigit$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>( //ruen keyboard event, listen to keydown event, and return an observable of Action
        document,
        "keydown",
    ).pipe(
        map(event => DIGIT_KEYS.indexOf(event.key)), //indexOf is the index or the array, event.key is exact character value of the physical key the user just pressed on their keyboard
        filter(index => index >= 0),                 //exp:event.key=3, the indexOf("3") returns 2.
        map(index => new FlipDigit(index)),
    );
    //user clicks a key on keyboard, then enter pipe, map finds the key index, filter checks the index, then map flips the index digit using FlipDigit class, the class will access the flipbit function to flip the bit and return a new state.