import { flipBit, moveAllTargets, lowestTarget, removeTargetById, targetMatchesDigitBank, hasReachedCheckLine, removeTargetsOutsideCanvas, fallSpeedForElapsedTime } from "./state";
import { Action, State, FallingTargetView} from "./types";
import {Target, Viewport, Constants} from "./constants";

//create a class
export class FlipDigit implements Action {
    constructor(public readonly index: number) {}//exp: new FlipDigit(3) => index=3, which means the 4th bit will be flipped
    
    apply(state: State): State {
        return state.gameEnd || state.paused //if game end dont let user change bit, just return the same state //else return a new state with the flipped bit
            ? state
            : {
                ...state,
                digitBank: flipBit( ////call the flipbit function to flip bit and return
                    state.digitBank, ////acces the type state
                    this.index, ////take the index stored in new FlipDigit(3) => index=3
                ),
            };
    }
}

const resolveReachedTarget = (
    state: State,
    movedState: State,
    movedTargets: ReadonlyArray<FallingTargetView>,
    lowest: FallingTargetView,
): State =>
    targetMatchesDigitBank(
        state.digitBank,
        lowest,
    )
        ? {
              ...movedState,
              allCurrentTargetsInPlay:
                  removeTargetById(
                      movedTargets,
                      lowest.id,
                  ),
              score: state.score + (lowest.isBonus ? 2:1),
          }
        : {
              ...movedState,
              gameEnd: true,
          };

const resolveLowestTarget = (
    state: State,
    movedState: State,
    movedTargets: ReadonlyArray<FallingTargetView>,
): State => {
    const lowest =
        lowestTarget(movedTargets);

    return !lowest ||
        !hasReachedCheckLine(lowest)
        ? movedState
        : resolveReachedTarget(
              state,
              movedState,
              movedTargets,
              lowest,
          );
};

const applyActiveTick = (
    state: State,
): State => {
    const nextElapsedMs =
        state.elapsedMs +
        Constants.TICK_RATE_MS;

    const fallSpeed =
        fallSpeedForElapsedTime(
            nextElapsedMs,
        );

    const movedTargets =
        removeTargetsOutsideCanvas(
            moveAllTargets(
                state
                    .allCurrentTargetsInPlay,
                fallSpeed,
            ),
        );

    const movedState: State = {
        ...state,
        elapsedMs: nextElapsedMs,
        allCurrentTargetsInPlay:
            movedTargets,
    };

    return resolveLowestTarget(
        state,
        movedState,
        movedTargets,
    );
};

export class Tick implements Action {
   apply(state: State): State {
    return state.gameEnd || state.paused
        ? state
        : applyActiveTick(state);
}}

export class SpawnTarget implements Action {
    constructor(
        public readonly id: string,
        public readonly value: number,
        public readonly isBonus: boolean,
    ) {}

    apply(state: State): State {
    return state.gameEnd || state.paused? state :
    {...state,
     allCurrentTargetsInPlay: [...state.allCurrentTargetsInPlay,
                    {
                        id: this.id,
                        value: this.value,
                        x:Viewport.CANVAS_WIDTH / 2 - Target.WIDTH / 2,
                        y: -Target.HEIGHT,
                        isBonus: this.isBonus,
                    },
                ],
            };
    }
}

export class TogglePause implements Action {
    apply(state: State): State { return state.gameEnd ? state:
    { ...state, paused:!state.paused}; //false → true → false → true...
    }}