import { Action, Bit, DigitBank, State, FallingTargetView } from "./types";
import { Target, Viewport, Constants } from "./constants";

export const initialState: State = {
    digitBank: [0, 0, 0, 0, 0, 0, 0, 0],
    allCurrentTargetsInPlay: [],
    gameEnd: false,
    score: 0,
    elapsedMs: 0,
    paused: false,
    healthReserve: 1,
};

//Return a new DigitBank so the previous State remains unchanged.
export const flipBit = (bank: DigitBank, index: number): DigitBank =>
    bank.map((bit, currentIndex) =>
        currentIndex === index ? (bit === 0 ? 1 : 0) : bit,
    );

// Interpret the eight binary digits as one numeric value.
export const digitBankValue = (bank: DigitBank): number =>
    bank.reduce<number>((total, bit) => total * 2 + bit, 0);

export const reduceState = (state: State, action: Action): State =>
    action.apply(state);

// Move every target immutably using the speed for the current game time.
export const moveTarget = (
    target: FallingTargetView,
    fallSpeed: number,
): FallingTargetView => ({
    ...target,
    y: target.y + fallSpeed,
});

export const moveAllTargets = (
    targets: ReadonlyArray<FallingTargetView>,
    fallSpeed: number,
): ReadonlyArray<FallingTargetView> =>
    targets.map(target => moveTarget(target, fallSpeed));

// Only the lowest unresolved target is eligible for comparison.
export const lowestTarget = (
    targets: ReadonlyArray<FallingTargetView>,
): FallingTargetView | undefined =>
    targets.length === 0
        ? undefined
        : targets.reduce((lowest, target) =>
              target.y > lowest.y ? target : lowest,
          );

export const hasReachedCheckLine = (target: FallingTargetView): boolean =>
    target.y + Target.HEIGHT >= Constants.CHECK_LINE_Y;

export const targetMatchesDigitBank = (
    bank: DigitBank,
    target: FallingTargetView,
): boolean => digitBankValue(bank) === target.value;

// Filtering creates a new target list instead of mutating the existing one.
export const removeTargetById = (
    targets: ReadonlyArray<FallingTargetView>,
    id: string,
): ReadonlyArray<FallingTargetView> =>
    targets.filter(target => target.id !== id);

// Remove targets that are no longer relevant to the visible play area.
export const removeTargetsOutsideCanvas = (
    targets: ReadonlyArray<FallingTargetView>,
): ReadonlyArray<FallingTargetView> =>
    targets.filter(target => target.y <= Viewport.CANVAS_HEIGHT);

// Increase difficulty with survival time while keeping an upper speed limit.
export const fallSpeedForElapsedTime = (elapsedMs: number): number =>
    Math.min(
        Constants.FALL_SPEED +
            Math.floor(elapsedMs / Constants.SPEED_UP_EVERY_MS) *
                Constants.SPEED_INCREMENT,
        Constants.MAX_FALL_SPEED,
    );
