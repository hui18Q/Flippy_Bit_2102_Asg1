import { Constants, Target, Viewport } from "./constants";
import { State, FallingTargetView } from "./types";

/**
 * Moves an SVG element to the end of its parent's children so overlays such
 * as Game Over appear above gameplay elements.
 * @param elem SVG element to bring to the foreground
 */
const bringToForeground = (elem: SVGElement): void => {
    elem.parentNode?.appendChild(elem);
};

/**
 * Makes an SVG overlay visible and brings it above the game elements.
 * @param elem SVG element to display
 */
const show = (elem: SVGElement): void => {
    elem.setAttribute("visibility", "visible");
    bringToForeground(elem);
};

/**
 * Hides an SVG overlay without removing it from the DOM.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGElement): void => {
    elem.setAttribute("visibility", "hidden");
};

/**
 * Creates an SVG element and applies its initial attributes.
 * Centralising SVG creation avoids repeating DOM setup code.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
): SVGElement => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

/**
 * Creates the fixed SVG interface once and returns the State renderer.
 * DOM side effects are kept in this view layer rather than game-State logic.
 *
 * @param s Current state
 */

export const render = (): ((state: State) => void) => {
    const svg = document.querySelector("#svgCanvas") as SVGSVGElement;

    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    svg.setAttribute(
        "viewBox",
        `0 0 ${Viewport.CANVAS_WIDTH} ${Viewport.CANVAS_HEIGHT}`,
    );

    const gameOver = document.querySelector("#gameOver") as SVGGElement;

    const checkLine = createSvgElement(svg.namespaceURI, "line", {
        x1: "0",
        x2: `${Viewport.CANVAS_WIDTH}`,
        y1: `${Constants.CHECK_LINE_Y}`,
        y2: `${Constants.CHECK_LINE_Y}`,
        stroke: "red",
        "stroke-width": "3",
        "data-fb-check-line": "true",
    });
    svg.appendChild(checkLine);

    const digitWidth = Viewport.CANVAS_WIDTH / Constants.DIGIT_COUNT;

    // Create the eight reusable DigitBank SVG cells once when render() starts.
    const digitCells = Array.from({ length: Constants.DIGIT_COUNT }).map(
        (_, index) => {
            const rect = createSvgElement(svg.namespaceURI, "rect", {
                x: `${index * digitWidth + 4}`,
                y: `${Viewport.CANVAS_HEIGHT - 50}`,
                width: `${digitWidth - 8}`,
                height: "40",
                fill: "#EF9A9A",
                stroke: "black",
                "stroke-width": "2",
                "data-fb-digit-index": `${index}`,
            });

            const text = createSvgElement(svg.namespaceURI, "text", {
                x: `${index * digitWidth + digitWidth / 2}`,
                y: `${Viewport.CANVAS_HEIGHT - 22}`,
                "text-anchor": "middle",
                "font-family": "monospace",
                fill: "black",
                "data-fb-digit-index": `${index}`,
            });

            text.textContent = "0";
            svg.appendChild(rect);
            svg.appendChild(text);
            return { rect, text };
        },
    );

    const pausedText = createSvgElement(svg.namespaceURI, "text", {
        x: `${Viewport.CANVAS_WIDTH / 2}`,
        y: "220",
        "text-anchor": "middle",
        "font-family": "monospace",
        "font-size": "32",
        fill: "black",
        visibility: "hidden",
        "data-fb-paused": "true",
    });
    pausedText.textContent = "PAUSED";
    svg.appendChild(pausedText);

    /**
     * Cache target SVG nodes by ID so they can be reused instead of recreated
     * on every State update.
     */
    const targetNodes = new Map<
        string,
        {
            rect: SVGElement;
            text: SVGElement;
        }
    >();

    const createTargetNode = (
        target: FallingTargetView,
    ): {
        rect: SVGElement;
        text: SVGElement;
    } => {
        const rect = createSvgElement(svg.namespaceURI, "rect", {
            width: `${Target.WIDTH}`,
            height: `${Target.HEIGHT}`,
            rx: "6",
            fill: "white",
            stroke: "black",
            "stroke-width": "2",
            "data-fb-target-id": target.id,
        });

        const text = createSvgElement(svg.namespaceURI, "text", {
            "text-anchor": "middle",
            "font-family": "monospace",
            fill: "black",
            "data-fb-target-id": target.id,
        });

        svg.appendChild(rect);
        svg.appendChild(text);

        const created = {
            rect,
            text,
        };

        targetNodes.set(target.id, created);

        return created;
    };

    /**
     * Reuses an existing target node when possible, otherwise creates it.
     */
    const getTargetNode = (
        target: FallingTargetView,
    ): {
        rect: SVGElement;
        text: SVGElement;
    } => {
        const existing = targetNodes.get(target.id);

        return existing ? existing : createTargetNode(target);
    };

    // Synchronise the existing SVG elements with the latest immutable State.
    return (state: State) => {
        state.allCurrentTargetsInPlay.forEach(target => {
            const { rect, text } = getTargetNode(target);
            rect.setAttribute("x", `${target.x}`);
            rect.setAttribute("y", `${target.y}`);
            text.setAttribute("x", `${target.x + Target.WIDTH / 2}`);
            text.setAttribute("y", `${target.y + Target.HEIGHT / 2 + 6}`);
            const targetValue = target.value
                .toString(16)
                .toUpperCase()
                .padStart(2, "0");
            // Visually distinguish bonus targets from normal targets.
            text.textContent = target.isBonus
                ? `⭐${targetValue}`
                : targetValue;
            rect.style.stroke = target.isBonus ? "#FFD700" : "#000000";
        });

        const activeTargetIds = new Set(
            state.allCurrentTargetsInPlay.map(target => target.id),
        );

        // Remove SVG nodes whose targets no longer exist in State.
        Array.from(targetNodes.entries())
            .filter(([id]) => !activeTargetIds.has(id))
            .forEach(([id, { rect, text }]) => {
                rect.remove();
                text.remove();
                targetNodes.delete(id);
            });

        // Update each DigitBank cell from the latest State.
        digitCells.forEach(({ rect, text }, index) => {
            const bit = state.digitBank[index];
            rect.setAttribute("fill", bit === 1 ? "#A5D6A7" : "#EF9A9A");
            text.textContent = `${bit}`;
        });

        // Reuse the starter #gameOver overlay instead of a duplicate node.
        state.gameEnd ? show(gameOver) : hide(gameOver);

        // Pause is a custom feature, so its visibility follows state.paused.
        pausedText.setAttribute(
            "visibility",
            state.paused ? "visible" : "hidden",
        );
        scoreText.textContent = `${state.score}`;
    };
};
