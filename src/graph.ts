/**
 * for understanding the bitwise operations
 * https://www.w3schools.com/js/js_bitwise.asp
 */

export class Graph {
    matrix: number[][];

    yellowsTurn: boolean;
    gameOver: number; // yellow won = 1, red won = 2, yellow got cut off = 4, red got cut off = 8 (not yet final)
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

        if (bridgeAdded) {
            this._checkWinCondition();
        }

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

    private _checkWinCondition(): void {
        // because of the weird behaviour of sets, it will get the id of a node instead of the coordinates
        // let id = x + y * tilesAcross;
        let nodeIdQueue = new Set<number>();

        for (let i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn) {
                if ((this.matrix[i][0] & 3) == 1) {
                    nodeIdQueue.add(i + 0 * this.matrix.length);
                }
            } else {
                if ((this.matrix[0][i] & 3) == 2) {
                    nodeIdQueue.add(0 + i * this.matrix.length);
                }
            }
        }
        if (nodeIdQueue.size == 0) return;

        let connectionFound: boolean = false;
        nodeIdQueue.forEach((nodeId) => {
            if (connectionFound) return;

            // translate id to coords
            let x = nodeId % this.matrix.length;
            let y = Math.floor(nodeId / this.matrix.length);

            // check if the other side has been reached
            if ((this.yellowsTurn && y == this.matrix.length - 1) || (!this.yellowsTurn && x == this.matrix.length - 1)) {
                connectionFound = true;
                return;
            }

            // check if the opponent has been cut off
            // still some bugs left
            if (this.yellowsTurn && y == this.matrix.length - 2 && (x == 0 || this.matrix.length - 1)) {
                console.log("Rot kann nicht mehr gewinnen");
            }
            if (!this.yellowsTurn && x == this.matrix.length - 2 && (y == 0 || this.matrix.length - 1)) {
                console.log("Gelb kann nicht mehr gewinnen");
            }

            // check if current node in stack has more nodes connected
            let bridges = this.matrix[x][y] >> this.bridgeBitsOffset;
            if (!bridges) return;

            for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (2 ** directionIndex))) continue;
                let next = pointInDirectionOfIndex(x, y, directionIndex);
                nodeIdQueue.add(next[0] + next[1] * this.matrix.length);
            }
        });

        if (!connectionFound) return;
        this.gameOver |= this.yellowsTurn ? 1 : 2;
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
