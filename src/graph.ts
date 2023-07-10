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

    matrix: number[][];

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.yellowsTurn = yellowsTurn;
        this.gameWon = 0;
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
     * nodeA.x, nodeA.y = coords of the original node to be added
     *
     */
    addNode(nodeA: any): boolean {
        // if it's an empty hole, place a pin
        if (this.matrix[nodeA.x][nodeA.y] != 0) return false;
        this.matrix[nodeA.x][nodeA.y] = this.yellowsTurn ? 1 : 2;

        // now check for bridges in all directions
        let bridgeAdded: boolean = false; // to know if the win condition needs to be cheked
        for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
            let nodeB = pointInDirectionOfIndex(nodeA.x, nodeA.y, directionIndex);

            // if outside or a corner or not the same color
            if (
                this.matrix[nodeB.x] == undefined ||
                this.matrix[nodeB.x][nodeB.y] == undefined ||
                this.matrix[nodeB.x][nodeB.y] == 3 ||
                !((this.matrix[nodeB.x][nodeB.y] & 3) == (this.matrix[nodeA.x][nodeA.y] & 3))
            ) {
                continue;
            }

            if (this.checkForBlockades(nodeA, nodeB)) continue;
            // add edge in both directions
            this.matrix[nodeA.x][nodeA.y] |= (2 ** directionIndex) << 2;
            let otherDirection = directionIndex & 1 ? (directionIndex + 3) % 8 : (directionIndex + 5) % 8;
            this.matrix[nodeB.x][nodeB.y] |= (2 ** otherDirection) << 2;
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
        let topLeftX = Math.min(nodeA.x, nodeB.x);
        let topLeftY = Math.min(nodeA.y, nodeB.y);
        let bottomRightX = Math.max(nodeA.x, nodeB.x);
        let bottomRightY = Math.max(nodeA.y, nodeB.y);

        // go over the 6 nodes in the rectangle, skipping the ones the original bridge is connecting
        for (let rectY = topLeftY; rectY <= bottomRightY; rectY++) {
            for (let rectX = topLeftX; rectX <= bottomRightX; rectX++) {
                if ((rectX == nodeA.x && rectY == nodeA.y) || (rectX == nodeB.x && rectY == nodeB.y)) continue;

                // only check the nodes that have bridges
                let bridges = this.matrix[rectX][rectY] >> 2;
                if (!bridges) continue;

                // go over each bridge and check for intersection with the original one
                for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
                    if (!(bridges & (2 ** directionIndex))) continue;

                    let outsideRect = pointInDirectionOfIndex(rectX, rectY, directionIndex);
                    if (intersects(nodeA.x, nodeA.y, nodeB.x, nodeB.y, rectX, rectY, outsideRect.x, outsideRect.y)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    checkWinCondition(): void {
        console.log("checking win condition...");
        // let nodeQueue = new Set<Node>();
        // for (let i = 1; i < this.tilesAcross - 1; i++) {
        //     let startNode = this.yellowsTurn ? this.getNode(i, 0) : this.getNode(0, i);
        //     if ((this.yellowsTurn && startNode.state != 1) || (!this.yellowsTurn && startNode.state != 2)) continue;
        //     nodeQueue.add(startNode);
        // }

        // let connectionFound: boolean = false;
        // nodeQueue.forEach((node) => {
        //     if (connectionFound) return;
        //     if ((this.yellowsTurn && node.y == this.tilesAcross - 1) || (!this.yellowsTurn && node.x == this.tilesAcross - 1)) {
        //         connectionFound = true;
        //         return;
        //     }
        //     node.edges.forEach((node) => {
        //         nodeQueue.add(node);
        //     });
        // });
        // if (connectionFound) {
        //     this.gameWon = this.yellowsTurn ? 1 : 2;
        // }
    }
}

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
export function pointInDirectionOfIndex(x: number, y: number, directionIndex: number) {
    let newX = (directionIndex & 2 ? 1 : 2) * (directionIndex & 4 ? -1 : 1);
    let newY = (directionIndex & 2 ? 2 : 1) * (directionIndex & 1 ? -1 : 1);

    return { x: x + newX, y: y + newY };
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
