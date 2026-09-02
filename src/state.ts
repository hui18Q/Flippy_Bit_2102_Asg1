import { Action, Bit, DigitBank, State } from "./types";

//a object with type (state) create starting state,  and is the actual starting game (actual value) instead of a blueprint
export const initialState: State = {
    digitBank: [0, 0, 0, 0, 0, 0, 0, 0],
    gameEnd: false,
};

//create function flipbit, takes bank & index as parameters, return type DigitBank(array), which produced by 
export const flipBit = (    //flipBit([0,0,0,0,0,0,0,0], 3) => [0,0,0,1,0,0,0,0] note: index is 0-based, so index 3 is the 4th bit
    bank: DigitBank,
    index: number,
): DigitBank =>
    bank.map((bit, currentIndex) =>  //bit=current value, currentIndex=current position 
        currentIndex === index //check is the current index is the one that user wanted to flip
            ? bit === 0 ? 1 : 0 //if yes flip the bit from 0 to 1 , else flip from 1 to 0
            : bit, //if not the one user wanted to flip, just remain the same value
    );

//Convert binary to decimal exp: 00010011 -> 19
export const digitBankValue = (
    bank: DigitBank,
): number =>
    bank.reduce<number>(
        (total, bit) => total * 2 + bit, //current total start with 0, then take the bit value*2 + current bit value
        0,
    );

export const reduceState = (
    state: State,
    action: Action,
): State =>
    action.apply(state); //return new state