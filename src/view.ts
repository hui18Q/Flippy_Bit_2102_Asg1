import {Constants, Target, Viewport} from "./constants";
import { State, FallingTargetView } from "./types";

// Rendering (side effects) define SVG helper functions, which will appear on the webpage
/**
 * Brings an SVG element to the foreground.
 * @param elem SVG element to bring to the foreground
 */

//function, receive elem, which is a type of SVGElement(exp: <rect>/<text>)
const bringToForeground = (elem: SVGElement): void => {
    elem.parentNode?.appendChild(elem);
    //If elem.parentNode exists, call appendChild(elem)
};
//bringToForeground() moves an SVG element to the front visually.
//elem: specific DOM, .parentNode: finds the direct html element that contains elem
//?. checks if parent exists, it is a optional chaining operator
//.appendChild(elem) puts elem inside the parent and moves elem
//to the end of the list of children, which visually brings it to the front.

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGElement): void => {
    elem.setAttribute("visibility", "visible"); //set the visibility of the SVG attribute to visible,
    bringToForeground(elem); //call bringToForeground() to move the elem to the front visually
};
//show(element) -> make visible -> bring to front

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGElement): void => {elem.setAttribute("visibility", "hidden",);};

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element
 * for valid element names and properties.
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
    //Record<property name string, value string>
    //= {} means default value is an empty object
    //exp: createSvgElement(namespace, "rect"), then props = {}
): SVGElement => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    //create elem with namespace and name in memory, save it as a type SVGElement
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v),);
    //Object.entries is a built-in function
    //example: { x: "10", y: "20"} becomes [["x", "10"], ["y", "20"]]
    //.forEach runs for every pair [k, v] k = property name, v = property value
    //then: elem.setAttribute("x", "10"), elem.setAttribute("y", "20")
    return elem;//after setAttribute, expected output could be: /<rect width="200" height="100" fill="deepskyblue" rx="10">
};

/*
createSvgElement(...)
        ↓
create SVG element
        ↓
set all its attributes
        ↓
return SVG element
*/

/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */

//creates the 8 SVG cells, define render function, update svg
export const render = (): ((state: State) => void) => {
        const svg = document.querySelector("#svgCanvas") as SVGSVGElement;
        //document.querySelector("#svgCanvas") finds the first element in the document with the id of "svgCanvas"
        //save it as a type SVGSVGElement : <svg> element
        const scoreText = document.querySelector("#scoreText") as HTMLElement;
        //viewBox = "0 0 600 400" , defines the position and dimensions of the SVG canvas
        svg.setAttribute( "viewBox", `0 0 ${Viewport.CANVAS_WIDTH} ${Viewport.CANVAS_HEIGHT}`,);
        
        
        const checkLine = createSvgElement( svg.namespaceURI, "line",
    {
        x1: "0",   //x1,y1=startline; x2y2=endline
        x2: `${Viewport.CANVAS_WIDTH}`,
        y1: `${Constants.CHECK_LINE_Y}`,
        y2: `${Constants.CHECK_LINE_Y}`,
        stroke: "red", 
        "stroke-width": "3",
        "data-fb-check-line": "true",
    },);
    svg.appendChild(checkLine);

        const digitWidth = Viewport.CANVAS_WIDTH / Constants.DIGIT_COUNT;//each digit gets: 600 / 8 = 75 pixels of horizontal space

        const digitCells = Array.from({ length: Constants.DIGIT_COUNT,
        }).map((_, index) => {
            //Array.from({ length: Constants.DIGIT_COUNT }) creates an array with 8 positions
            //.map((_, index) => ...) runs once for every position
            //index will be: 0,1,2,3,4,5,6,7
            //.map returns a NEW array:
            //[
            //  { rect, text },
            //  { rect, text },
            //  ...]

        const rect = createSvgElement(svg.namespaceURI, "rect",
            {
                x: `${index * digitWidth + 4}`,
                y: `${Viewport.CANVAS_HEIGHT -50}`,
                width: `${digitWidth - 8}`,
                height: "40",
                fill: "#EF9A9A",
                stroke: "black",
                "stroke-width": "2",
                "data-fb-digit-index": `${index}`,
            },);
            //create one SVG rectangle for one bit
            //index 0: x = 0 * 75 + 4 = 4, index 1: x = 1 * 75 + 4 = 79
            //this makes the 8 boxes appear beside each other

        const text = createSvgElement(svg.namespaceURI, "text",
            {
                x: `${index * digitWidth + digitWidth / 2}`,
                y: `${Viewport.CANVAS_HEIGHT - 22}`,
                "text-anchor": "middle",
                "font-family": "monospace",
                fill: "black",
                "data-fb-digit-index": `${index}`,
            },);//create the SVG text that will appear inside each rectangle

            text.textContent = "0"; //initial visual value for every bit is 0
            svg.appendChild(rect);
            svg.appendChild(text);//attach the rectangle and text to the SVG so they appear on the webpage
            return {rect, text,};
            //digitCells will become roughly:
            //index 0 -> { rect, text }
            //index 1 -> { rect, text }
            //...
        });

        const gameOverText = createSvgElement(svg.namespaceURI, "text",
            {
                x: `${Viewport.CANVAS_WIDTH / 2}`,
                y: "180",
                "text-anchor": "middle",
                "font-family": "monospace",
                "font-size": "32",
                fill: "black",
                visibility: "hidden",
                "data-fb-game-over": "true",
            },);
        gameOverText.textContent = "GAME OVER";
        svg.appendChild(gameOverText);

        const targetNodes = new Map<string,{rect: SVGElement; text: SVGElement;}>();
        const getTargetNode = (target: FallingTargetView)
        : {rect: SVGElement; text: SVGElement;} => {const existing = targetNodes.get(target.id);
        
        if (existing) {return existing;} //if yes just reuse
        const rect = createSvgElement(svg.namespaceURI, "rect", //if no just create
        {
            width: `${Target.WIDTH}`,
            height: `${Target.HEIGHT}`,
            rx: "6",
            fill: "white",
            stroke: "black",
            "stroke-width": "2",
            "data-fb-target-id": target.id,
        },);

        const text = createSvgElement(svg.namespaceURI, "text",
        {
            "text-anchor": "middle",
            "font-family": "monospace",
             fill: "black",
            "data-fb-target-id": target.id,
        },);

    svg.appendChild(rect);
    svg.appendChild(text);

    const created = {rect, text};
    targetNodes.set( target.id, created);
    return created;};


//update the SVG cells based on the current state when the state changes
return (state: State) => {
    state.allCurrentTargetsInPlay.forEach(target => {
        const {rect, text} = getTargetNode(target);
        rect.setAttribute("x",`${target.x}`,);
        rect.setAttribute("y",`${target.y}`,);
        text.setAttribute("x", `${target.x + Target.WIDTH / 2}`,);
        text.setAttribute("y", `${target.y + Target.HEIGHT / 2 + 6}`,);
        text.textContent = target.value.toString(16).toUpperCase().padStart(2, "0"); //padStart convert 1 character to 2 8->08
    });

    // a variable stores a set of target id
const activeTargetIds = new Set(state.allCurrentTargetsInPlay.map(target => target.id),); //takes whole target can return only the id, new set turns array ["id"] into {"id"}

    targetNodes.forEach(({ rect, text }, id) => {
        if (!activeTargetIds.has(id)) //has is used with set/map to check whether the id exist
        {
            rect.remove();
            text.remove();
            targetNodes.delete(id);
        }
    },);   
                         
    digitCells.forEach(
    ({ rect, text }, index,) => {//{ rect, text } gets the SVG elements, index tells us which digit it is
    const bit = state.digitBank[index]; //state.digitBank is the current 8-bit array, example:[0, 0, 1, 0, 0, 0, 0, 0] if index = 2, state.digitBank[2] = 1
    rect.setAttribute( "fill", bit === 1 ? "#A5D6A7" : "#EF9A9A");
    text.textContent =`${bit}`;},)//update the text shown in the SVG, if bit = 0 show "0"; if bit = 1 show "1"

    gameOverText.setAttribute("visibility",
    state.gameEnd ? "visible" : "hidden");        
    
    scoreText.textContent =`${state.score}`;};
};

