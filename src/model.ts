import { Graph } from "./graph";

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

    public tryPlayingNode(x: number, y: number): boolean {
        let currGraph = this.mainGraph.clone();
        let pinPlaced = this.mainGraph.playNode([x, y]);
        if (!pinPlaced) return false;
        this.history.push(currGraph);

        return true;
    }

    public undoMove(): boolean {
        if (this.history.length == 0) {
            return false;
        }
        this.mainGraph = this.history.pop();
        return true;
    }

    // maybe move this to an extra test.ts file
    public runPerformance(...args: any) {
        for (let i = 0; i < args.length; i++) {
            console.log(args[i]);
            console.time(args[i].name);
            for (let j = 0; j < 1000000000; j++) {
                args[i];
            }
            console.timeEnd(args[i].name);
        }
    }

    public testPerformance() {
        this.runPerformance(this.mainGraph.clone);
    }

    // alpha beta pruning mit iterative deepening
    // dazu lookup/transposition table
    // vielleicht run-lenght encoding zum sparen von Speicher

    // mehr evaluation in graph als nur die Faktenbasierte
    // also eigene heuristik überlegen
}

export default Model;
