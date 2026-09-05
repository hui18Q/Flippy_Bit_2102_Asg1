import { Action, Bit, DigitBank, State, FallingTargetView } from "./types";
import { Target, Viewport, Constants } from "./constants";

// Initial values used whenever a fresh game State stream starts.
export const initialState: State = {
    digitBank: [0, 0, 0, 0, 0, 0, 0, 0],
    allCurrentTargetsInPlay: [],
    gameEnd: false,
    score: 0,
    elapsedMs: 0,
    paused: false,
    healthReserve: 1,
};

/*
 * Flips one position in the DigitBank and returns a new array so the
 * previous State remains unchanged.
 */
export const flipBit = (bank: DigitBank, index: number): DigitBank =>
    bank.map((bit, currentIndex) =>
        currentIndex === index ? (bit === 0 ? 1 : 0) : bit,
    );

/*
 * Converts the 8-bit DigitBank into its numeric value for comparison with
 * a hexadecimal target.
 */
export const digitBankValue = (bank: DigitBank): number =>
    bank.reduce<number>((total, bit) => total * 2 + bit, 0);

/**
 * Applies an incoming Action to the current State.
 * Used by scan() to produce each successive game State.
 */
export const reduceState = (state: State, action: Action): State =>
    action.apply(state);

/**
 * Returns a new target with its vertical position advanced by the current
 * fall speed.
 */
export const moveTarget = (
    target: FallingTargetView,
    fallSpeed: number,
): FallingTargetView => ({
    ...target,
    y: target.y + fallSpeed,
});

/**
 * Moves every active target without mutating the existing target array.
 */
export const moveAllTargets = (
    targets: ReadonlyArray<FallingTargetView>,
    fallSpeed: number,
): ReadonlyArray<FallingTargetView> =>
    targets.map(target => moveTarget(target, fallSpeed));

/**
 * Finds the lowest unresolved target because only that target may be
 * compared with the player's DigitBank.
 */
export const lowestTarget = (
    targets: ReadonlyArray<FallingTargetView>,
): FallingTargetView | undefined =>
    targets.length === 0
        ? undefined
        : targets.reduce((lowest, target) =>
              target.y > lowest.y ? target : lowest,
          );

/**
 * Checks whether the bottom edge of a target has reached the check line.
 */
export const hasReachedCheckLine = (target: FallingTargetView): boolean =>
    target.y + Target.HEIGHT >= Constants.CHECK_LINE_Y;

/**
 * Compares the numeric DigitBank value with the target's hexadecimal value.
 */
export const targetMatchesDigitBank = (
    bank: DigitBank,
    target: FallingTargetView,
): boolean => digitBankValue(bank) === target.value;

/**
 * Removes a resolved target by returning a filtered target array.
 */
export const removeTargetById = (
    targets: ReadonlyArray<FallingTargetView>,
    id: string,
): ReadonlyArray<FallingTargetView> =>
    targets.filter(target => target.id !== id);

/**
 * Removes targets that have moved beyond the visible play area.
 */
export const removeTargetsOutsideCanvas = (
    targets: ReadonlyArray<FallingTargetView>,
): ReadonlyArray<FallingTargetView> =>
    targets.filter(target => target.y <= Viewport.CANVAS_HEIGHT);

/**
 * Calculates the current fall speed from survival time and caps it at the
 * configured maximum speed.
 */
export const fallSpeedForElapsedTime = (elapsedMs: number): number =>
    Math.min(
        Constants.FALL_SPEED +
            Math.floor(elapsedMs / Constants.SPEED_UP_EVERY_MS) *
                Constants.SPEED_INCREMENT,
        Constants.MAX_FALL_SPEED,
    );
