import {
    filter,
    fromEvent,
    interval,
    map,
    Observable,
    concatMap, //do 1by1
    delay,
    from, //same as of, but will unwrap iterables
    of //wraps static data into observable stream, if give array will treat as single delivery
} from "rxjs";

import { DIGIT_KEYS, Constants } from "./constants";
import { FlipDigit, Tick , SpawnTarget} from "./actions";
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
export const tick$ = (): Observable<Action> =>interval(Constants.TICK_RATE_MS,)
.pipe(map(() => new Tick()),);

export const spawn$ =(): Observable<Action> => interval(Constants.DEMO_SPAWN_INTERVAL_MS)//produce every 1.5sec overtime
.pipe( map(index => new SpawnTarget( `target-${index}`, randomTargetValue(), ),),);

const randomTargetValue = (): number => Math.floor(Math.random() * 256); //math.random returns random decimal 0-1, then *256 to become 46.95 to 255. ect, then math.floor remove decimal part