//Only accept a certain number of values
//allows other file to use(import) this object
export const Viewport = 
{
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
} as const; //makes the object value fixed

export const Target = 
{
    WIDTH: 64,
    HEIGHT: 36,
} as const;

//define game constants
export const Constants = {
    DIGIT_COUNT: 8, //binary ans -> 00000000 - 8 digits ttl
    TICK_RATE_MS: 16, //  One tick every 16 milliseconds (~62.5 FPS)/62 ticks per sec
    FALL_SPEED: 1, // 1 pixel per tick, adds 1 pixel to the target's y position
    CHECK_LINE_Y: 300, //check line y position
    DEMO_SPAWN_INTERVAL_MS: 1500 //1.5sec per spawn
} as const;

//DIGIT_KEYS is an array of strings representing the valid keyboard ks for digits 1 to 8.
export const DIGIT_KEYS: ReadonlyArray<string> = [ "1", "2", "3", "4", "5", "6", "7", "8",];