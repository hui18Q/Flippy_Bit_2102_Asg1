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

const DEMO_TARGET_VALUES: ReadonlyArray<number> = [0x13, 0x2F, 0x08]; //hard code forminimal game
export const spawn$ =(): Observable<Action> => from(DEMO_TARGET_VALUES) //from convert array to observable : [12, 2F, 08] -> 12 -> 2A -> 08
.pipe(concatMap((value, index) => of(new SpawnTarget(`target-${index}`, value,),) //concatmap atkes the value 1by1, then new spawntarget create, then of wrap into another observable
.pipe(delay( Constants.DEMO_SPAWN_INTERVAL_MS,),),),); //wait 1.5 sec bfr emit