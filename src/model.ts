import { Graph } from "./graph";

// -------------------------------------------------
// global variables
// -------------------------------------------------

class Model {
    mainGraph: Graph;
    history: Graph[];
    yellowAI: boolean;
    redAI: boolean;

    constructor(tilesAcross: number, yellowStarts: boolean, yellowAI: boolean, redAI: boolean) {
        this.mainGraph = new Graph(tilesAcross, yellowStarts);
        this.history = [];
        this.yellowAI = yellowAI;
        this.redAI = redAI;
    }

    tryPlayingNode(x: number, y: number): boolean {
        let currGraph = this.mainGraph.clone();
        let pinPlaced = this.mainGraph.playNode([x, y]);
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
