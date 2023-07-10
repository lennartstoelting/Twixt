import { Graph } from "./graph";

// -------------------------------------------------
// global variables
// -------------------------------------------------

class Model {
    mainGraph: Graph;
    history: Graph[];

    constructor(tilesAcross: number, yellowStarts: boolean) {
        this.mainGraph = new Graph(tilesAcross, yellowStarts);
        this.history = [];
    }

    tryPlacingPin(x: number, y: number): boolean {
        let currGraph = this.mainGraph.clone();
        let pinPlaced = this.mainGraph.addNode({ x: x, y: y });
        if (!pinPlaced) return false;
        this.history.push(currGraph);
        return true;
    }

    undoMove(): boolean {
        if (this.history.length == 0) {
            return false;
        }
        this.mainGraph = this.history.pop();
        return true;
    }
}

export default Model;
