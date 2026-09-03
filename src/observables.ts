import {
    filter,
    fromEvent,
    interval,
    map,
    Observable,
    concatMap, //do 1by1
    delay,
    from, //same as of, but will unwrap iterables
    of, //wraps static data into observable stream, if give array will treat as single delivery
    defer, //Create observable when someone subscribe
    repeat, //when observable complete, subscribe again
    timer, //similar to interval, but wait 1 sec -> emit -> complete
    scan,
} from "rxjs";

import { DIGIT_KEYS, Constants } from "./constants";
import { FlipDigit, Tick , SpawnTarget} from "./actions";
import { Action } from "./types";

//takes no argument because because the event target (document) and action logic are fixed
export const flipDigit$ = (): Observable<Action> =>
    fromEvent<KeyboardEvent>( document, "keydown", //ruen keyboard event, listen to keydown event, and return an observable of Action
    ).pipe(
        map(event => DIGIT_KEYS.indexOf(event.key)), //indexOf is the index or the array, event.key is exact character value of the physical key the user just pressed on their keyboard
        filter(index => index >= 0),                 //exp:event.key=3, the indexOf("3") returns 2.
        map(index => new FlipDigit(index)),
    );//user clicks a key on keyboard, then enter pipe, map finds the key index, filter checks the index, then map flips the index digit using FlipDigit class, the class will access the flipbit function to flip the bit and return a new state.
export const tick$ = (): Observable<Action> =>interval(Constants.TICK_RATE_MS,)
.pipe(map(() => new Tick()),);

const randomTargetValue = (): number => Math.floor(Math.random() * 256); //*256 to get value from 46-255

export const spawn$ = (): Observable<Action> => defer(() =>timer(randomSpawnDelay(),),)
.pipe(repeat(), 
      scan( targetIndex => targetIndex + 1, -1), //start from -1, so the target index become 0 and enter map, and next loop when timer produce 0, scan rmb the targetIndex is 0, will +q become 1
      map(index =>new SpawnTarget(`target-${index}`,randomTargetValue(),), ),); //index id from targetIndex

const randomSpawnDelay = (): number => 1000 + Math.floor(Math.random() * 2001); //math.random returns random decimal 0-1, then *2001 to become 0-2000. ect, then math.floor remove decimal part and add 1000 = 1000-3000(1-3sec)

export const mouseFlipDigit$ =
    (): Observable<Action> =>fromEvent<MouseEvent>(document, "mousedown")
    .pipe( map(event => event.target instanceof Element ? event.target.getAttribute( "data-fb-digit-index" ): null,),
           map(index => index === null ? -1 : Number(index),), //convert "string" to number, -1 is invalid digit
           filter(index => index >= 0), //remove invalid clicks
           map(index => new FlipDigit(index),),
        );

export const restart$ =
    (): Observable<KeyboardEvent> => fromEvent<KeyboardEvent>(document,"keydown")
    .pipe( filter(event => event.code === "KeyR"), );