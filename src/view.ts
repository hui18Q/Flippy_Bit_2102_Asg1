/**
 * Rendering layer for Flippy Bit.
 *
 * This is the ONLY module allowed to touch the DOM. `render` builds the
 * static scaffold once, then returns a function that is called with each
 * new State to reconcile the SVG to it. Every custom data hook uses the
 * `data-fb-` prefix required by the spec, and colours are uppercase hex.
 */

import { Constants, Target, Viewport } from "./constants";
import type { DigitBank, FallingTargetView, State } from "./types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/** Create an SVG element and set the given attributes on it. */
const createSvgElement = (
    name: string,
    props: Record<string, string> = {},
): SVGElement => {
    const elem = document.createElementNS(SVG_NAMESPACE, name) as SVGElement;
    Object.entries(props).forEach(([key, value]) =>
        elem.setAttribute(key, value),
    );
    return elem;
};

/** Set several attributes on an existing element. */
const setAttributes = (elem: Element, props: Record<string, string>): void => {
    Object.entries(props).forEach(([key, value]) =>
        elem.setAttribute(key, value),
    );
};

/**
 * Wire up the canvas and return the per-frame render function.
 *
 * Handles to the eight digit cells are captured in a closure so each
 * frame only updates their fill and text instead of rebuilding them.
 */
export const render = (): ((s: State) => void) => {
    const svg = document.querySelector("#svgCanvas") as SVGSVGElement;
    const gameOver = document.querySelector("#gameOver") as SVGGElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;

    svg.setAttribute(
        "viewBox",
        `0 0 ${Viewport.CANVAS_WIDTH} ${Viewport.CANVAS_HEIGHT}`,
    );

    // The check line the player must beat - drawn once.
    svg.appendChild(
        createSvgElement("line", {
            x1: "0",
            y1: `${Constants.CHECK_LINE_Y}`,
            x2: `${Viewport.CANVAS_WIDTH}`,
            y2: `${Constants.CHECK_LINE_Y}`,
            stroke: "#FF0044",
            "stroke-width": "2",
            "stroke-dasharray": "6 4",
        }),
    );

    // Build the eight digit cells once, keeping handles for updates.
    const digitWidth = Viewport.CANVAS_WIDTH / Constants.DIGIT_COUNT;
    const digitCells = Array.from(
        { length: Constants.DIGIT_COUNT },
        (_unused, i) => {
            const rect = createSvgElement("rect", {
                x: `${i * digitWidth + 4}`,
                y: `${Viewport.CANVAS_HEIGHT - 50}`,
                width: `${digitWidth - 8}`,
                height: "40",
            });
            const label = createSvgElement("text", {
                x: `${i * digitWidth + digitWidth / 2}`,
                y: `${Viewport.CANVAS_HEIGHT - 22}`,
                "text-anchor": "middle",
                "font-family": "monospace",
            });
            const group = createSvgElement("g", {
                "data-fb-digit-index": `${i}`,
            });
            group.appendChild(rect);
            group.appendChild(label);
            svg.appendChild(group);
            return { rect, label };
        },
    );

    const updateDigitRow = (bank: DigitBank): void =>
        digitCells.forEach(({ rect, label }, i) => {
            rect.setAttribute("fill", bank[i] ? "#4CAF50" : "#EF9A9A");
            label.textContent = `${bank[i]}`;
        });

    // Find the SVG node for a target, creating it on first sighting.
    const targetNode = (t: FallingTargetView): SVGGElement => {
        const existing = svg.querySelector(`g[data-fb-target-id="${t.id}"]`);
        if (existing) return existing as SVGGElement;

        const rect = createSvgElement("rect", {
            width: `${Target.WIDTH}`,
            height: `${Target.HEIGHT}`,
            rx: "6",
            fill: "#FFFFFF",
        });
        const label = createSvgElement("text", {
            "text-anchor": "middle",
            "font-family": "monospace",
        });
        const group = createSvgElement("g", {
            "data-fb-target-id": t.id,
        });
        group.appendChild(rect);
        group.appendChild(label);
        svg.appendChild(group);
        return group as SVGGElement;
    };

    return (s: State) => {
        updateDigitRow(s.digitBank);
        scoreText.textContent = `${s.score}`;

        s.allCurrentTargetsInPlay.forEach(t => {
            const group = targetNode(t);
            const rect = group.querySelector("rect") as SVGRectElement;
            const label = group.querySelector("text") as SVGTextElement;
            setAttributes(rect, { x: `${t.x}`, y: `${t.y}` });
            setAttributes(label, {
                x: `${t.x + Target.WIDTH / 2}`,
                y: `${t.y + Target.HEIGHT / 2 + 5}`,
            });
            // Targets are shown in hex; the player answers in binary.
            label.textContent = t.value.toString(16).toUpperCase();
        });

        // Delete SVG nodes for targets that left play this tick.
        s.exit.forEach(t =>
            svg.querySelector(`g[data-fb-target-id="${t.id}"]`)?.remove(),
        );

        gameOver.setAttribute("visibility", s.gameEnd ? "visible" : "hidden");
    };
};
