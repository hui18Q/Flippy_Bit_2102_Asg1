import {
    flipBit,
    moveAllTargets,
    lowestTarget,
    removeTargetById,
    targetMatchesDigitBank,
    hasReachedCheckLine,
    removeTargetsOutsideCanvas,
    fallSpeedForElapsedTime,
    initialState,
} from "./state";
import { Action, State, FallingTargetView } from "./types";
import { Target, Viewport, Constants } from "./constants";

/**
 * Represents a player request to flip one binary digit.
 * Input is ignored while the game is paused or finished.
 */
export class FlipDigit implements Action {
    constructor(public readonly index: number) {}

    apply(state: State): State {
        // Ignore player input while the game is paused or finished.
        return state.gameEnd || state.paused
            ? state
            : {
                  ...state,
                  digitBank: flipBit(state.digitBank, this.index),
              };
    }
}

/**
 * Resolves the current lowest target.
 * A correct match removes the target and updates the score.
 * An unmatched target at the check line ends the game.
 */
const resolveTarget = (
    state: State,
    movedState: State,
    movedTargets: ReadonlyArray<FallingTargetView>,
    lowest: FallingTargetView,
): State =>
    targetMatchesDigitBank(state.digitBank, lowest)
        ? {
              ...movedState,
              digitBank: initialState.digitBank,
              allCurrentTargetsInPlay: removeTargetById(
                  movedTargets,
                  lowest.id,
              ),
              //Bonus targets award two points instead of one.
              score: state.score + (lowest.isBonus ? 2 : 1),
          }
        : {
              ...movedState,
              healthReserve: 0,
              gameEnd: true,
          };

/**
 * Checks whether the current lowest target is ready to be resolved.
 * Higher targets remain ignored until the lowest one is resolved.
 */
const resolveLowestTarget = (
    state: State,
    movedState: State,
    movedTargets: ReadonlyArray<FallingTargetView>,
): State => {
    const lowest = lowestTarget(movedTargets);

    return !lowest ||
        (!targetMatchesDigitBank(state.digitBank, lowest) &&
            !hasReachedCheckLine(lowest))
        ? movedState
        : resolveTarget(state, movedState, movedTargets, lowest);
};

/**
 * Advances one active game tick by updating elapsed time, moving targets,
 * removing obsolete targets and resolving the lowest target if necessary.
 */
const applyActiveTick = (state: State): State => {
    const nextElapsedMs = state.elapsedMs + Constants.TICK_RATE_MS;

    const fallSpeed = fallSpeedForElapsedTime(nextElapsedMs);

    const movedTargets = removeTargetsOutsideCanvas(
        moveAllTargets(state.allCurrentTargetsInPlay, fallSpeed),
    );

    const movedState: State = {
        ...state,
        elapsedMs: nextElapsedMs,
        allCurrentTargetsInPlay: movedTargets,
    };

    return resolveLowestTarget(state, movedState, movedTargets);
};

/**
 * Represents one timer tick of the game.
 * Paused or finished games return the existing State unchanged.
 */
export class Tick implements Action {
    apply(state: State): State {
        //Pausing freezes movement and elapsed game time.
        return state.gameEnd || state.paused ? state : applyActiveTick(state);
    }
}

/**
 * Adds a newly generated falling target to the active target list.
 * Spawn actions are ignored while gameplay is paused or finished.
 */
export class SpawnTarget implements Action {
    constructor(
        public readonly id: string,
        public readonly value: number,
        public readonly isBonus: boolean,
    ) {}

    apply(state: State): State {
        // Discard spawn actions while the game cannot progress.
        return state.gameEnd || state.paused
            ? state
            : {
                  ...state,
                  allCurrentTargetsInPlay: [
                      ...state.allCurrentTargetsInPlay,
                      {
                          id: this.id,
                          value: this.value,
                          x: Viewport.CANVAS_WIDTH / 2 - Target.WIDTH / 2,
                          y: -Target.HEIGHT,
                          isBonus: this.isBonus,
                      },
                  ],
              };
    }
}

/**
 * Toggles the paused State while the game is active.
 * Game-over State cannot be paused or resumed.
 */
export class TogglePause implements Action {
    apply(state: State): State {
        return state.gameEnd ? state : { ...state, paused: !state.paused };
    }
}
