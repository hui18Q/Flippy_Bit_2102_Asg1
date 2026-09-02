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
    TICK_RATE_MS: 500, // Might need to change this! One tick every 500 milliseconds/0.5sec.
} as const;

//DIGIT_KEYS is an array of strings representing the valid keyboard ks for digits 1 to 8.
export const DIGIT_KEYS: ReadonlyArray<string> = [ "1", "2", "3", "4", "5", "6", "7", "8",];