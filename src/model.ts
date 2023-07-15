import { Graph, State } from "./graph";

// -------------------------------------------------
// global variables
// -------------------------------------------------

class Model {
    displayedGraph: Graph;
    history: Graph[];
    yellowAI: boolean;
    redAI: boolean;

    constructor(tilesAcross: number, yellowStarts: boolean, yellowAI: boolean, redAI: boolean) {
        this.displayedGraph = new Graph(tilesAcross, yellowStarts);
        this.history = [];
        this.yellowAI = yellowAI;
        this.redAI = redAI;
    }

    tryPlacingPin(x: number, y: number): boolean {
        let currGraph = this.displayedGraph.clone();
        let pinPlaced = this.displayedGraph.addNode(x, y);
        if (!pinPlaced) return false;
        this.history.push(currGraph);
        return true;
    }

    undoMove(): boolean {
        if (this.history.length == 0) {
            return false;
        }
        this.displayedGraph = this.history.pop();
        return true;
    }

    // returns best next move
    // make everything async so that the user interface stays responsive
    minimaxStart(depth: number): void {
        let possibleMoves = this.displayedGraph.getPossibleMoves();
        let evalArray: string[] = [];

        possibleMoves.forEach((move: number[]) => {
            let currGraph = this.displayedGraph.clone();
            currGraph.addNode(move[0], move[1]);
            evalArray.push(`move: [${move}], evaluation: ${this.minimax(depth - 1, currGraph, -Infinity, Infinity)}`);
        });

        console.log(evalArray);
    }

    // sort the graph so that pruning happens earlier
    minimax(depth: number, graph: Graph, alpha: number, beta: number): number {
        if (depth == 0 || graph.gameWon != State.empty) {
            return graph.score;
        }

        let possibleGraphs: Graph[] = [];
        graph.getPossibleMoves().forEach((move: number[]) => {
            let currGraph = graph.clone();
            currGraph.addNode(move[0], move[1]);
            possibleGraphs.push(currGraph);
        });

        if (graph.yellowsTurn) {
            let maxEval = -Infinity;
            possibleGraphs.forEach((child) => {
                let evaluation = this.minimax(depth - 1, child, alpha, beta);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) return maxEval;
            });
            return maxEval;
        } else {
            let minEval = Infinity;
            possibleGraphs.forEach((child) => {
                let evaluation = this.minimax(depth - 1, child, alpha, beta);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) return minEval;
            });
            return minEval;
        }
    }
}

export default Model;
