/**
 * Unit tests for the pure state layer.
 *
 * These are written to guide development: each new behaviour in
 * state.ts should be described here first, then implemented.
 */

import { describe, expect, it } from "vitest";

import {
    digitBankValue,
    flipBit,
    initialState,
    reduceState,
    FlipDigit,
    SpawnTarget,
    Tick,
} from "../src/state";
import type { DigitBank } from "../src/types";

// `state$` is the composition root wired up in main.ts.
import { state$ } from "../src/main";

describe("state$", () => {
    it("is a function", () => {
        expect(state$).toBeInstanceOf(Function);
    });
});

describe("digitBankValue", () => {
    it("reads an all-zero bank as 0", () => {
        expect(digitBankValue([0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
    });

    it("reads an all-one 8-bit bank as 255", () => {
        expect(digitBankValue([1, 1, 1, 1, 1, 1, 1, 1])).toBe(255);
    });

    it("treats index 0 as the most significant bit", () => {
        expect(digitBankValue([1, 0, 0, 0, 0, 0, 0, 0])).toBe(128);
    });
});

describe("flipBit", () => {
    it("flips only the targeted digit", () => {
        const bank: DigitBank = [0, 0, 0, 0, 0, 0, 0, 0];
        expect(flipBit(bank, 3)).toEqual([0, 0, 0, 1, 0, 0, 0, 0]);
    });

    it("is its own inverse", () => {
        const bank: DigitBank = [1, 0, 1, 0, 1, 0, 1, 0];
        expect(flipBit(flipBit(bank, 2), 2)).toEqual(bank);
    });

    it("does not mutate the input", () => {
        const bank: DigitBank = [0, 0, 0, 0, 0, 0, 0, 0];
        flipBit(bank, 0);
        expect(bank).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });
});

describe("Tick", () => {
    it("advances game time by one", () => {
        expect(new Tick(0).apply(initialState).time).toBe(1);
    });

    it("is a no-op once the game has ended", () => {
        const ended = { ...initialState, gameEnd: true };
        expect(new Tick(0).apply(ended)).toBe(ended);
    });

    it("moves every target downward", () => {
        const spawned = new SpawnTarget(0x0f).apply(initialState);
        const [before] = spawned.allCurrentTargetsInPlay;
        const [after] = new Tick(0).apply(spawned).allCurrentTargetsInPlay;
        expect(after.y).toBeGreaterThan(before.y);
    });
});

describe("FlipDigit", () => {
    it("flips the digit at the given column", () => {
        const next = new FlipDigit(0).apply(initialState);
        expect(next.digitBank[0]).toBe(1);
    });
});

describe("reduceState", () => {
    it("applies an action to the state", () => {
        expect(reduceState(initialState, new Tick(0)).time).toBe(1);
    });
});
