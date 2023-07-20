/**
 * for understanding the bitwise operations
 * https://www.w3schools.com/js/js_bitwise.asp
 */

export class Graph {
    matrix: number[][];

    yellowsTurn: boolean;
    /**
     * 0th bit = (yellow is cut off), 1st bit = (red is cut off), 2nd bit = (yellow won), 3rd bit = (red won)
     * we add to this score by doing an or operation so that the game is over when this score is 3 or higher
     * 3 means either party can't win, 4 means yellow won and 8 means red won
     */
    gameOver: number;
    evaluation: number;

    bridgeBitsOffset: number;

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.yellowsTurn = yellowsTurn;
        this.gameOver = 0;
        this.bridgeBitsOffset = 2;

        this.matrix = Array(tilesAcross)
            .fill(0)
            .map(() => Array(tilesAcross).fill(0));

        // corners, potentially easier to implement
        this.matrix[0][0] = 3;
        this.matrix[0][tilesAcross - 1] = 3;
        this.matrix[tilesAcross - 1][0] = 3;
        this.matrix[tilesAcross - 1][tilesAcross - 1] = 3;
    }

    clone(): Graph {
        let clonedGraph = new Graph(this.matrix.length, this.yellowsTurn);
        clonedGraph.matrix = structuredClone(this.matrix);
        return clonedGraph;
    }

    // maybe needs to be rewirtten because the nodes are already existing in the matrix, it's more like playing a move
    // maybe makeMove ?
    playNode(nodeA: number[]): boolean {
        // if it's an empty hole, place a pin
        if (this.matrix[nodeA[0]][nodeA[1]] != 0) return false;
        this.matrix[nodeA[0]][nodeA[1]] = this.yellowsTurn ? 1 : 2;

        // now check for bridges in all directions
        let bridgeAdded: boolean = false; // to know if the win condition needs to be cheked
        for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
            let nodeB = pointInDirectionOfIndex(nodeA[0], nodeA[1], directionIndex);

            // if outside or a corner or not the same color
            if (
                this.matrix[nodeB[0]] == undefined ||
                this.matrix[nodeB[0]][nodeB[1]] == undefined ||
                this.matrix[nodeB[0]][nodeB[1]] == 3 ||
                !((this.matrix[nodeB[0]][nodeB[1]] & 3) == (this.matrix[nodeA[0]][nodeA[1]] & 3))
            ) {
                continue;
            }

            if (this._checkForBlockades(nodeA, nodeB)) continue;
            // add edge in both directions
            this.matrix[nodeA[0]][nodeA[1]] |= (2 ** directionIndex) << 2;
            let otherDirection = directionIndex & 1 ? (directionIndex + 3) % 8 : (directionIndex + 5) % 8;
            this.matrix[nodeB[0]][nodeB[1]] |= (2 ** otherDirection) << 2;
            bridgeAdded = true;
        }

        this._checkGameOver();
        console.log(this.gameOver);

        this.yellowsTurn = !this.yellowsTurn;
        return true;
    }

    private _checkForBlockades(nodeA: any, nodeB: any): boolean {
        // establish the bounding rectangle that contains the bridge connection
        let topLeftX = Math.min(nodeA[0], nodeB[0]);
        let topLeftY = Math.min(nodeA[1], nodeB[1]);
        let bottomRightX = Math.max(nodeA[0], nodeB[0]);
        let bottomRightY = Math.max(nodeA[1], nodeB[1]);

        // collect the 4 nodes in the rectangle, skipping the ones the original bridge is connecting
        let rectNodes: number[][] = [];
        for (let rectY = topLeftY; rectY <= bottomRightY; rectY++) {
            for (let rectX = topLeftX; rectX <= bottomRightX; rectX++) {
                if ((rectX == nodeA[0] && rectY == nodeA[1]) || (rectX == nodeB[0] && rectY == nodeB[1])) continue;
                rectNodes.push([rectX, rectY]);
            }
        }

        // for the 4 Nodes, see if any of them have an intersecting bridge
        return rectNodes.some((rectNode) => {
            // only check the nodes that have bridges
            let bridges = this.matrix[rectNode[0]][rectNode[1]] >> this.bridgeBitsOffset;
            if (!bridges) return false;

            // go over each bridge and check for intersection with the original one
            for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (2 ** directionIndex))) continue;

                let outsideRectNode = pointInDirectionOfIndex(rectNode[0], rectNode[1], directionIndex);
                if (intersects(nodeA[0], nodeA[1], nodeB[0], nodeB[1], rectNode[0], rectNode[1], outsideRectNode[0], outsideRectNode[1])) {
                    return true;
                }
            }
        });
    }

    private _checkGameOver(): void {
        // because of the weird behaviour of sets, it will get the id of a node instead of the coordinates
        // let id = x + y * tilesAcross;

        // this could be made into a class wide variable that saves the connected nodes so we don't need to fetch every single one again.
        // it does need to go over the starting row again to check if any new ones have been added in the starting row
        let nodeIdQueue = this._createEdgeNodesQueue(0);
        let otherSideNodeIdQueue = this._createEdgeNodesQueue(this.matrix.length - 1);

        // gameWon : 0th bit = (yellow is cut off), 1st bit = (red is cut off), 2nd bit = (yellow won), 3rd bit = (red won)

        nodeIdQueue.forEach((nodeId) => {
            if (this.gameOver > 2) return;

            // translate id to coords
            let x = nodeId % this.matrix.length;
            let y = Math.floor(nodeId / this.matrix.length);

            // check if the other side has been reached
            if (this.yellowsTurn && y == this.matrix.length - 1) {
                this.gameOver |= 4;
                return;
            }
            if (!this.yellowsTurn && x == this.matrix.length - 1) {
                this.gameOver |= 8;
                return;
            }

            this._checkCutOff(x, y, y + 1, x + 1, this.matrix.length - 2, this.matrix.length - 2);

            this._nextNodesForSet(x, y, nodeIdQueue);
        });

        // hier noch diese Ecken einfügen, dann sollte sogar die weirde Situation mit dem cutoff abgedeckt sein, wenn man die falsche Seite entlang läuft
        // add zur othersideNodeQueueId
        //
        /** wenn gelb an der Reihe ist, dann muss man noch hinzufügen, sollten die Stellen gelb sein
         * [0, matrix.length - 2] bzw. [matrix.length - 1, matrix.length - 2]
         * wenn rot an der Reihe ist, dann muss man noch hinzufügen
         * [matrix.length - 2, 0] bzw. [matrix.length - 2, matrix.length - 1]
         */

        // das bedient bisher noch nicht alle fälle, da es auch wieder nur in eine Richtung geht.
        // man müsste also den check danach, ob die andere Seite erreicht wurde und den nach der Suche nach cutoffs, da bisher nur die oben nach undten Seite überprüft, ob das Spiel gewonnen wurde
        // könnte auch so umgeschrieben werden das die gesamte Funktion ausschließlich cutoffs berechnet um im nachhinein schaut man, ob auch eine winning connection dabei ist.
        // das set speichert ja die Ids, die umgerechnet die Koordinate ergeben. findet man also sowohl einen Punkt auf der einen Seite sowie einen auf der anderen muss es dazwischen eine Verbindung gegeben haben.
        // dabei muss man natürlich weiterhin zwei Queues machen (sowieso für die cutoff checks), sonst würde die Vermischung eventuell ein pin auf jeder seite haben aber nur weil wirs so initialisiert haben,
        // nicht weil die eine actual verbindung haben

        // the edges behing the enemy finish line
        if (this.yellowsTurn) {
            if ((this.matrix[0][this.matrix.length - 2] & 3) == 1) otherSideNodeIdQueue.add((this.matrix.length - 2) * this.matrix.length);
            if ((this.matrix[this.matrix.length - 1][this.matrix.length - 2] & 3) == 1)
                otherSideNodeIdQueue.add(this.matrix.length - 1 + (this.matrix.length - 2) * this.matrix.length);
        } else {
            if ((this.matrix[this.matrix.length - 2][0] & 3) == 2) otherSideNodeIdQueue.add(this.matrix.length - 2);
            if ((this.matrix[this.matrix.length - 2][this.matrix.length - 1] & 3) == 2)
                otherSideNodeIdQueue.add(this.matrix.length - 2 + (this.matrix.length - 1) * this.matrix.length);
        }
        otherSideNodeIdQueue.forEach((nodeId) => {
            if (this.gameOver > 2) return;

            // translate id to coords
            let x = nodeId % this.matrix.length;
            let y = Math.floor(nodeId / this.matrix.length);

            this._checkCutOff(x, y, 1, 1, y - 1, x - 1);

            this._nextNodesForSet(x, y, otherSideNodeIdQueue);
        });
    }

    private _createEdgeNodesQueue(edge: number): Set<number> {
        let IdQueue = new Set<number>();

        // hier kann man noch die Fälle ausschließen, bei denen zwar im startloch die richtige Farbe ist aber sie eh keine Brücke hat
        // von von der Startloch pin keine Brücke ausgeht müssen wir sie gar nicht zur NodeQueue hinzufügen

        // sollte ich cutoff check und winning connection check aufspalten muss das aber doch überprüft werden für den extremfall das einfach die gesamte Kante mit einzelnen pins beladen ist

        for (let i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn && (this.matrix[i][edge] & 3) == 1) {
                IdQueue.add(i + edge * this.matrix.length);
            }
            if (!this.yellowsTurn && (this.matrix[edge][i] & 3) == 2) {
                IdQueue.add(edge + i * this.matrix.length);
            }
        }

        return IdQueue;
    }

    private _checkCutOff(x: number, y: number, fromY: number, fromX: number, toY: number, toX: number): void {
        if (this.yellowsTurn && !(this.gameOver & 2) && (x == 0 || x == this.matrix.length - 1)) {
            // red is temporarly cut off
            this.gameOver |= 2;
            for (let nextY = fromY; nextY <= toY; nextY++) {
                if (!(this.matrix[x][nextY] & 1)) {
                    this.gameOver &= ~2;
                }
            }
        } else if (!this.yellowsTurn && !(this.gameOver & 1) && (y == 0 || y == this.matrix.length - 1)) {
            // yellow is temporarly cut off
            this.gameOver |= 1;
            for (let nextX = fromX; nextX <= toX; nextX++) {
                if (!(this.matrix[nextX][y] & 2)) {
                    this.gameOver &= ~1;
                }
            }
        }
    }

    private _nextNodesForSet(x: number, y: number, set: Set<number>): void {
        // check if current node in stack has more nodes connected
        let bridges = this.matrix[x][y] >> this.bridgeBitsOffset;
        if (!bridges) return;

        for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
            if (!(bridges & (2 ** directionIndex))) continue;
            let next = pointInDirectionOfIndex(x, y, directionIndex);
            set.add(next[0] + next[1] * this.matrix.length);
        }
    }
}

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
export function pointInDirectionOfIndex(x: number, y: number, directionIndex: number): number[] {
    let newX = (directionIndex & 2 ? 1 : 2) * (directionIndex & 4 ? -1 : 1);
    let newY = (directionIndex & 2 ? 2 : 1) * (directionIndex & 1 ? -1 : 1);

    return [x + newX, y + newY];
}

/**
 * https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
 */
function intersects(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
}
