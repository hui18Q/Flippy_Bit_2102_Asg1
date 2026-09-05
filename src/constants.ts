export const Viewport = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
} as const;

export const Target = {
    WIDTH: 64,
    HEIGHT: 36,
} as const;

//keep shared game settings
export const Constants = {
    DIGIT_COUNT: 8,
    TICK_RATE_MS: 16,
    FALL_SPEED: 1,
    CHECK_LINE_Y: 300,
    SPEED_UP_EVERY_MS: 10000,
    SPEED_INCREMENT: 0.5,
    MAX_FALL_SPEED: 4,
} as const;
// Number keys map from left to right across the eight DigitBank cells.
export const DIGIT_KEYS: ReadonlyArray<string> = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
];
