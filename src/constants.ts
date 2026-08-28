/**
 * Fixed configuration values for Flippy Bit. 
 * 
 * canvas size, target size, tick rate, fall speed, starting lives, check-line position.
 *
 * Kept in one module so gameplay tuning (speeds, sizes, rates) never
 * requires touching logic code. All values are `as const` so their
 * literal types flow through the rest of the program.
 */

/** Logical drawing surface. The SVG `viewBox` is set to match this. */
//SVG Game Screen
export const Viewport = {CANVAS_WIDTH: 600, CANVAS_HEIGHT: 400,} as const;

//falling target box size 
export const Target = {WIDTH: 64, HEIGHT: 36,} as const;

//main game settings
export const Constants = {
    //Number of bits in the player's answer row (an 8-bit number). */
    DIGIT_COUNT: 8,
    //Simulation step; ~60 steps/second for smooth motion. */
    TICK_RATE_MS: 16, //starter update every half second
    //Vertical distance a target travels per tick, in pixels. 
    FALL_SPEED: 2,
    //Starting value of `healthReserve` (lives). */
    START_LIVES: 3,
    /**
     * Y position of the check line. A target is judged against the
     * player's answer at the moment it crosses this line.
     */
    CHECK_LINE_Y: 300,
} as const;
