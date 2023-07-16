// export class Node {
//     x: number;
//     y: number;
//     state: number;
//     edges: Node[];
//     blockades: Set<Node>;
//     id: number;

//     constructor(x: number, y: number, tilesAcross: number, state: number) {
//         this.x = x;
//         this.y = y;
//         this.state = state;
//         this.edges = [];
//         this.blockades = new Set<Node>();
//         this.id = y * tilesAcross + x;
//     }
// }

// -------------------------------------------------

/**
 * for understanding the bitwise operations
 * https://www.w3schools.com/js/js_bitwise.asp
 */

export class Graph {
    yellowsTurn: boolean;
    gameWon: number;
    evaluation: number;

    bridgeBitsOffset: number;
    matrix: number[][];

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.yellowsTurn = yellowsTurn;
        this.gameWon = 0;
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

    /**
     * adding nodes and checking for intersections follows the pattern
     * nodeA = coords of the original node to be added
     *
     */
    addNode(nodeA: number[]): boolean {
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

            if (this.checkForBlockades(nodeA, nodeB)) continue;
            // add edge in both directions
            this.matrix[nodeA[0]][nodeA[1]] |= (2 ** directionIndex) << 2;
            let otherDirection = directionIndex & 1 ? (directionIndex + 3) % 8 : (directionIndex + 5) % 8;
            this.matrix[nodeB[0]][nodeB[1]] |= (2 ** otherDirection) << 2;
            bridgeAdded = true;
        }

        if (bridgeAdded) {
            this.checkWinCondition();
        }

        this.yellowsTurn = !this.yellowsTurn;
        return true;
    }

    checkForBlockades(nodeA: any, nodeB: any): boolean {
        // establish the bounding rectangle that contains the bridge connection
        let topLeftX = Math.min(nodeA[0], nodeB[0]);
        let topLeftY = Math.min(nodeA[1], nodeB[1]);
        let bottomRightX = Math.max(nodeA[0], nodeB[0]);
        let bottomRightY = Math.max(nodeA[1], nodeB[1]);

        // go over the 6 nodes in the rectangle, skipping the ones the original bridge is connecting
        for (let rectY = topLeftY; rectY <= bottomRightY; rectY++) {
            for (let rectX = topLeftX; rectX <= bottomRightX; rectX++) {
                if ((rectX == nodeA[0] && rectY == nodeA[1]) || (rectX == nodeB[0] && rectY == nodeB[1])) continue;

                // only check the nodes that have bridges
                let bridges = this.matrix[rectX][rectY] >> this.bridgeBitsOffset;
                if (!bridges) continue;

                // go over each bridge and check for intersection with the original one
                for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
                    if (!(bridges & (2 ** directionIndex))) continue;

                    let outsideRect = pointInDirectionOfIndex(rectX, rectY, directionIndex);
                    if (intersects(nodeA[0], nodeA[1], nodeB[0], nodeB[1], rectX, rectY, outsideRect[0], outsideRect[1])) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    checkWinCondition(): void {
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

            // check if current node in stack has mor nodes connected
            let bridges = this.matrix[x][y] >> this.bridgeBitsOffset;
            if (!bridges) return;

            for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (2 ** directionIndex))) continue;
                let next = pointInDirectionOfIndex(x, y, directionIndex);
                nodeIdQueue.add(next[0] + next[1] * this.matrix.length);
            }
        });
        if (connectionFound) {
            this.gameWon = this.yellowsTurn ? 1 : 2;
        }
    }
}

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
// TODO everywhere this function gets called, it's within a loop. Analyzing those and putting them in here could bundle some functionality better
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
