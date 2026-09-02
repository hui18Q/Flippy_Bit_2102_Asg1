import { flipBit, moveAllTargets, lowestTarget, removeTargetById, targetMatchesDigitBank, hasReachedCheckLine } from "./state";
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
        
    const movedTargets = moveAllTargets(state.allCurrentTargetsInPlay); //move every current target down first
    const lowest = lowestTarget(movedTargets); //find the lowest target after movement

        //if there is no target, or the lowest target has not reached the line yet, just save the moved targets
        if (!lowest || !hasReachedCheckLine(lowest))
        {
            return {...state, allCurrentTargetsInPlay: movedTargets}; //continue move
        }

        //the lowest target reached the line
        //check if player's binary value matches it
        if (targetMatchesDigitBank(state.digitBank, lowest)) 
        {
            return {...state, 
                    allCurrentTargetsInPlay: removeTargetById( movedTargets, lowest.id),};
        }           //correct answer: remove that target

        //wrong answer:end the game
        return {
            ...state,
            allCurrentTargetsInPlay: movedTargets,
            gameEnd: true,
        };
    }
}