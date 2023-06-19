import { Graph } from "./graph";

// -------------------------------------------------
// global variables
// -------------------------------------------------

var tilesAcrossDefault = 6;

class Model {
    mainGraph: Graph;
    history: Graph[];
    // yellowComp: boolean;
    // redComp: boolean;

    constructor() {
        this.mainGraph = new Graph(tilesAcrossDefault, true);
        this.history = [];
    }

    // these things might need to move
    restartGame(yellowStarts: boolean) {
        this.mainGraph = new Graph(tilesAcrossDefault, yellowStarts);
        this.history = [];
    }

    tryPlacingPin(x: number, y: number) {
        let currGraph = this.mainGraph.clone();
        let pinPlaced = this.mainGraph.tryAddingNode(x, y);
        if (!pinPlaced) return false;
        this.history.push(currGraph);
        return true;
    }

    undoMove() {
        if (this.history.length == 0) {
            return false;
        }
        this.mainGraph = this.history.pop();
        return true;
    }
}

export default Model;
