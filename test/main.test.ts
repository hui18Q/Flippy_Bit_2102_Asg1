import { describe, expect, it } from "vitest";
import {
    digitBankValue,
    fallSpeedForElapsedTime,
    flipBit,
    hasReachedCheckLine,
    initialState,
    lowestTarget,
    moveAllTargets,
    moveTarget,
    removeTargetById,
    removeTargetsOutsideCanvas,
    targetMatchesDigitBank,
} from "../src/state";
import { FlipDigit, SpawnTarget, Tick, TogglePause } from "../src/actions";
import { Constants, Target, Viewport } from "../src/constants";
import { DigitBank, FallingTargetView, State } from "../src/types";

/**
 * Creates a target with sensible defaults so individual tests only need
 * to specify the properties relevant to that behaviour.
 */
const makeTarget = (
    overrides: Partial<FallingTargetView> = {},
): FallingTargetView => ({
    id: "target-test",
    value: 0,
    x: 100,
    y: 100,
    isBonus: false,
    ...overrides,
});

/**
 * Creates an immutable game State based on initialState for testing Actions.
 */
const makeState = (overrides: Partial<State> = {}): State => ({
    ...initialState,
    ...overrides,
});

describe("DigitBank", () => {
    it("starts as eight zero bits", () => {
        expect(initialState.digitBank).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("flips the selected bit from 0 to 1", () => {
        const result = flipBit(initialState.digitBank, 2);

        expect(result).toEqual([0, 0, 1, 0, 0, 0, 0, 0]);
    });

    it("flips the selected bit from 1 back to 0", () => {
        const bank: DigitBank = [0, 0, 1, 0, 0, 0, 0, 0];

        expect(flipBit(bank, 2)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("does not mutate the original DigitBank", () => {
        const bank: DigitBank = [0, 0, 0, 0, 0, 0, 0, 0];

        const result = flipBit(bank, 0);

        expect(bank).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
        expect(result).not.toBe(bank);
    });

    it("converts an 8-bit DigitBank into a number", () => {
        const bank: DigitBank = [0, 0, 0, 0, 0, 1, 0, 1];

        expect(digitBankValue(bank)).toBe(5);
    });
});

describe("Target helpers", () => {
    it("moves a target down by the supplied fall speed", () => {
        const target = makeTarget({ y: 50 });

        const result = moveTarget(target, 2);

        expect(result.y).toBe(52);
        expect(target.y).toBe(50);
    });

    it("moves every target without mutating the original array", () => {
        const targets = [
            makeTarget({
                id: "a",
                y: 10,
            }),
            makeTarget({
                id: "b",
                y: 20,
            }),
        ];

        const result = moveAllTargets(targets, 2);

        expect(result.map(target => target.y)).toEqual([12, 22]);

        expect(targets.map(target => target.y)).toEqual([10, 20]);
    });

    it("finds the lowest unresolved target", () => {
        const targets = [
            makeTarget({
                id: "upper",
                y: 50,
            }),
            makeTarget({
                id: "lowest",
                y: 200,
            }),
            makeTarget({
                id: "middle",
                y: 120,
            }),
        ];

        expect(lowestTarget(targets)?.id).toBe("lowest");
    });

    it("returns undefined when there are no targets", () => {
        expect(lowestTarget([])).toBeUndefined();
    });

    it("detects when a target reaches the check line", () => {
        const target = makeTarget({
            y: Constants.CHECK_LINE_Y - Target.HEIGHT,
        });

        expect(hasReachedCheckLine(target)).toBe(true);
    });

    it("does not resolve a target above the check line", () => {
        const target = makeTarget({
            y: Constants.CHECK_LINE_Y - Target.HEIGHT - 1,
        });

        expect(hasReachedCheckLine(target)).toBe(false);
    });

    it("matches a target against the DigitBank value", () => {
        const bank: DigitBank = [0, 0, 0, 0, 0, 1, 0, 1];

        const target = makeTarget({
            value: 5,
        });

        expect(targetMatchesDigitBank(bank, target)).toBe(true);
    });

    it("removes a resolved target by id", () => {
        const targets = [makeTarget({ id: "a" }), makeTarget({ id: "b" })];

        const result = removeTargetById(targets, "a");

        expect(result.map(target => target.id)).toEqual(["b"]);
    });

    it("removes targets below the canvas", () => {
        const targets = [
            makeTarget({
                id: "visible",
                y: 200,
            }),
            makeTarget({
                id: "outside",
                y: Viewport.CANVAS_HEIGHT + 1,
            }),
        ];

        const result = removeTargetsOutsideCanvas(targets);

        expect(result.map(target => target.id)).toEqual(["visible"]);
    });
});

describe("Difficulty", () => {
    it("uses the initial fall speed at the start", () => {
        expect(fallSpeedForElapsedTime(0)).toBe(Constants.FALL_SPEED);
    });

    it("increases fall speed after survival time", () => {
        expect(fallSpeedForElapsedTime(Constants.SPEED_UP_EVERY_MS)).toBe(
            Constants.FALL_SPEED + Constants.SPEED_INCREMENT,
        );
    });

    it("caps fall speed at the maximum", () => {
        expect(fallSpeedForElapsedTime(1_000_000)).toBe(
            Constants.MAX_FALL_SPEED,
        );
    });
});

describe("FlipDigit Action", () => {
    it("updates the requested digit", () => {
        const result = new FlipDigit(0).apply(initialState);

        expect(result.digitBank[0]).toBe(1);
    });

    it("ignores input while paused", () => {
        const pausedState = makeState({
            paused: true,
        });

        const result = new FlipDigit(0).apply(pausedState);

        expect(result).toBe(pausedState);
    });

    it("ignores input after game over", () => {
        const endedState = makeState({
            gameEnd: true,
        });

        expect(new FlipDigit(0).apply(endedState)).toBe(endedState);
    });
});

describe("SpawnTarget Action", () => {
    it("adds a target to the active target list", () => {
        const result = new SpawnTarget("target-1", 15, false).apply(
            initialState,
        );

        expect(result.allCurrentTargetsInPlay.length).toBe(1);

        expect(result.allCurrentTargetsInPlay[0].value).toBe(15);
    });

    it("stores bonus status on the target", () => {
        const result = new SpawnTarget("bonus-1", 10, true).apply(initialState);

        expect(result.allCurrentTargetsInPlay[0].isBonus).toBe(true);
    });

    it("spawns the target above the canvas", () => {
        const result = new SpawnTarget("target-1", 10, false).apply(
            initialState,
        );

        expect(result.allCurrentTargetsInPlay[0].y).toBe(-Target.HEIGHT);
    });

    it("does not spawn targets while paused", () => {
        const pausedState = makeState({
            paused: true,
        });

        const result = new SpawnTarget("target-1", 10, false).apply(
            pausedState,
        );

        expect(result).toBe(pausedState);
    });
});

describe("Tick Action", () => {
    it("advances elapsed game time", () => {
        const result = new Tick().apply(initialState);

        expect(result.elapsedMs).toBe(Constants.TICK_RATE_MS);
    });

    it("moves active targets downward", () => {
        const target = makeTarget({
            y: 100,
        });

        const state = makeState({
            allCurrentTargetsInPlay: [target],
        });

        const result = new Tick().apply(state);

        expect(result.allCurrentTargetsInPlay[0].y).toBeGreaterThan(target.y);
    });

    it("awards one point for a normal correct target", () => {
        const target = makeTarget({
            value: 0,
            y: Constants.CHECK_LINE_Y - Target.HEIGHT - Constants.FALL_SPEED,
            isBonus: false,
        });

        const state = makeState({
            allCurrentTargetsInPlay: [target],
        });

        const result = new Tick().apply(state);

        expect(result.score).toBe(1);
        expect(result.allCurrentTargetsInPlay.length).toBe(0);
        expect(result.gameEnd).toBe(false);
    });

    it("awards two points for a correct bonus target", () => {
        const target = makeTarget({
            value: 0,
            y: Constants.CHECK_LINE_Y - Target.HEIGHT - Constants.FALL_SPEED,
            isBonus: true,
        });

        const state = makeState({
            allCurrentTargetsInPlay: [target],
        });

        const result = new Tick().apply(state);

        expect(result.score).toBe(2);
        expect(result.allCurrentTargetsInPlay.length).toBe(0);
    });

    it("ends the game when the lowest target is incorrect", () => {
        const target = makeTarget({
            value: 1,
            y: Constants.CHECK_LINE_Y - Target.HEIGHT - Constants.FALL_SPEED,
        });

        const state = makeState({
            allCurrentTargetsInPlay: [target],
        });

        const result = new Tick().apply(state);

        expect(result.gameEnd).toBe(true);
        expect(result.healthReserve).toBe(0);
    });

    it("checks only the lowest unresolved target", () => {
        const upperTarget = makeTarget({
            id: "upper",
            value: 1,
            y: 100,
        });

        const lowestCorrectTarget = makeTarget({
            id: "lowest",
            value: 0,
            y: Constants.CHECK_LINE_Y - Target.HEIGHT - Constants.FALL_SPEED,
        });

        const state = makeState({
            allCurrentTargetsInPlay: [upperTarget, lowestCorrectTarget],
        });

        const result = new Tick().apply(state);

        expect(result.gameEnd).toBe(false);

        expect(result.allCurrentTargetsInPlay.map(target => target.id)).toEqual(
            ["upper"],
        );
    });

    it("does nothing while paused", () => {
        const pausedState = makeState({
            paused: true,
            allCurrentTargetsInPlay: [makeTarget()],
        });

        const result = new Tick().apply(pausedState);

        expect(result).toBe(pausedState);
    });
});

describe("TogglePause Action", () => {
    it("pauses an active game", () => {
        const result = new TogglePause().apply(initialState);

        expect(result.paused).toBe(true);
    });

    it("resumes a paused game", () => {
        const pausedState = makeState({
            paused: true,
        });

        const result = new TogglePause().apply(pausedState);

        expect(result.paused).toBe(false);
    });

    it("does not change a finished game", () => {
        const endedState = makeState({
            gameEnd: true,
        });

        const result = new TogglePause().apply(endedState);

        expect(result).toBe(endedState);
    });
});
