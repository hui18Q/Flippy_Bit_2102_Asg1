# Flippy Bit

FIT2102 Programming Paradigms — Assignment 1

Flippy Bit is a Functional Reactive Programming game implemented in
TypeScript, RxJS and SVG.

The player controls an 8-bit binary `DigitBank` and must match each falling
hexadecimal target before it reaches the check line.

## Running the Game

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite in the terminal.

## Controls

- `1`–`8`: flip the corresponding binary digit
- Mouse click: flip a digit by clicking its SVG cell
- `P`: pause or resume the game
- `R`: restart the game without refreshing the browser

The first mouse click starts the game.

## Gameplay

- Targets contain random 8-bit hexadecimal values.
- New targets spawn after a random delay of 1–3 seconds.
- Multiple targets may be on screen at the same time.
- Only the lowest unresolved target is checked against the `DigitBank`.
- A correct normal target gives `1` point.
- An incorrect target reaching the check line ends the game.
- Resolved and off-screen targets are removed.
- Falling speed increases as survival time increases.

## Advanced Features

### Pause / Resume

Press `P` to pause or resume the game.

While paused:

- falling targets stop moving
- new targets are not added to the game state
- player digit input is ignored

The paused status is stored in the immutable game `State`.

### Bonus Multiplier Targets

Some randomly generated targets are bonus targets.

Bonus targets:

- are displayed with a star and highlighted border
- use the same hexadecimal matching rules as normal targets
- award `2` points instead of `1` when matched correctly

The bonus status is stored in `FallingTargetView.isBonus`.

## Functional Reactive Design

The game uses a single Observable-based state pipeline.

```text
keyboard input ─┐
mouse input ────┤
timer ticks ────┤
target spawning ├─> merge()
pause input ────┘
                    ↓
              scan(reduceState)
                    ↓
                  State
                    ↓
                 render()
```

`merge()` combines the gameplay Action streams, while `scan()` accumulates
successive immutable game states.

Game logic and rendering are separated across the project:

- `state.ts` — pure state helper functions
- `actions.ts` — immutable state transitions
- `observables.ts` — keyboard, mouse, timing and spawning streams
- `view.ts` — SVG and DOM rendering
- `main.ts` — connects the Observable streams and renderer
- `types.ts` — game types
- `constants.ts` — shared game configuration

## Project Structure

```text
src/
├── main.ts          - connects Observable streams and starts rendering
├── types.ts         - game data types and Action interface
├── constants.ts     - shared game settings and dimensions
├── state.ts         - pure helper functions and initial State
├── actions.ts       - immutable State transitions
├── observables.ts   - keyboard, mouse, timer and spawning streams
├── view.ts          - SVG and DOM rendering
└── style.css        - game styling

test/
└── main.test.ts     - starter Vitest checks for state$

index.html           - starter SVG layout and game-over overlay
README.md            - project documentation
```

## Testing

The original starter Vitest checks are retained to verify that the main
`state$` Observable exists and is exported as a function.

Run the tests with:

```bash
npm run test:run
```

## Build and Formatting

Verify the production build with:

```bash
npm run build
```

Format the project with:

```bash
npx prettier . --write
```

## AI Assistance

ChatGPT(https://chatgpt.com/) and Claude(https://claude.com/) were used as learning and review aids during development.

ChatGPT was used to help organise and phrase this README based on my own implementation, features and design decisions. I reviewed and verified the final content.