export type Bit = 0 | 1;

export type DigitBank = ReadonlyArray<Bit>;

//define state, the blueprint
// State processing
export type State = Readonly<{ //create a ts type called state, Readonly means cannot change this state, but can create a new state using {...state, gameEnd:true}
    digitBank: DigitBank; //the style 'state' must contain digitBank, which is an array of 0/1, so should be digitBank: [0,0,0,0,0,0,0,0]
    allCurrentTargetsInPlay: ReadonlyArray<FallingTargetView>; // an array of FallingTargetView, allCurrentTargetsInPlay: [FallingTargetView,FallingTargetView,...]
    gameEnd: boolean; // gameEnd: true/false
    score: number;
    elapsedMs: number; //how long this game has been running
    paused: boolean;
}>;

//Any Action must have a function apply, Action: FlipDigit/Tick/Spawntarget/Restart
export interface Action 
{
    apply(state: State): State; //receive state & return state
}

export type FallingTargetView =
    Readonly<{
        id: string;
        value: number;
        x: number;
        y: number;
    }>;