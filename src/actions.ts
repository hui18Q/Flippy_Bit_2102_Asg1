import { flipBit, moveAllTargets } from "./state";
import { Action, State } from "./types";

//create a class
export class FlipDigit implements Action {
    constructor(public readonly index: number) {}
    //exp: new FlipDigit(3) => index=3, which means the 4th bit will be flipped
    apply(state: State): State {
        if (state.gameEnd) {return state;} //if game end dont let user change bit, just return the same state

        return { //else return a new state with the flipped bit
            ...state,
            digitBank: flipBit( //call the flipbit function to flip bit and return
                state.digitBank, //acces the type state
                this.index, //take the index stored in new FlipDigit(3) => index=3
            ),
        };
    }
}

export class Tick implements Action {
    apply(state: State): State {
        if (state.gameEnd) { return state }

        return{
            ...state,
            allCurrentTargetsInPlay: moveAllTargets(state.allCurrentTargetsInPlay),
        };
    }
}