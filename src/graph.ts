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
    tilesAcross: number;

    yellowsTurn: boolean;
    gameWon: number;
    evaluation: number;

    matrix: number[][];

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.yellowsTurn = yellowsTurn;
        this.tilesAcross = tilesAcross;
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
        let clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.matrix = structuredClone(this.matrix);
        return clonedGraph;
    }

    tryAddingNode(x: number, y: number): boolean {
        if (this.matrix[x][y] != 0) return false;
        this.matrix[x][y] = this.yellowsTurn ? 1 : 2;

        // connect bridges
        let bridgeAdded: boolean = false;
        for (let i = 0; i < 8; i++) {
            let next = pointInDirectionOfIndex(x, y, i);

            // if outside or a corner or not the same color
            if (
                this.matrix[next.x] == undefined ||
                this.matrix[next.x][next.y] == undefined ||
                this.matrix[next.x][next.y] == 3 ||
                !((this.matrix[next.x][next.y] & 3) == (this.matrix[x][y] & 3))
            ) {
                continue;
            }

            /**
             * TODO check for collisions
             * looks the easiest
             * https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
             * potentially better explained
             * https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
             */

            for (let i = Math.min(y, next.y); i <= Math.max(y, next.y); i++) {
                for (let j = Math.min(x, next.x); j <= Math.max(x, next.x); j++) {
                    // skip when it's one of the original connecting nodes
                    if ((j == x && i == y) || (j == next.x && i == next.y)) continue;

                    let bridges = this.matrix[j][i] >> 2;
                    if (!bridges) continue;
                    console.log(`checking for intersections at: ${[j, i]}`);

                    for (let k = 0; k < 8; k++) {
                        if (!(bridges & (2 ** k))) continue;

                        let connectedCoord = pointInDirectionOfIndex(j, i, k);
                        let intersection = intersects(x, y, next.x, next.y, j, i, connectedCoord.x, connectedCoord.y);
                        if (intersection) console.log(`${[j, i]} is blocking this connection`);
                    }
                }
            }

            // add edge in both directions
            this.matrix[x][y] |= (2 ** i) << 2;
            let otherDirection = i & 1 ? (i + 3) % 8 : (i + 5) % 8;
            this.matrix[next.x][next.y] |= (2 ** otherDirection) << 2;
            bridgeAdded = true;
        }

        if (bridgeAdded) {
            this.checkWinCondition();
        }

        this.yellowsTurn = !this.yellowsTurn;
        return true;
    }

    // only adds an Edge if the connections isn't blocked
    // TODO add a check that ensures the edge that is being added is exactly one knight move away to prevent future bugs
    /*
    addEdge(node: Node, potNode: Node): boolean {
        let xDirectionPositive = potNode.x - node.x > 0;
        let yDirectionPositive = potNode.y - node.y > 0;

        /*
         *   vdownv       ^up^
         *
         *   node    potNode2
         *   node1   potNode1
         *   node2   potNode
         *
         *   applicable in other rotations
         *
        let node1 = this.getNode(potNode.x + (xDirectionPositive ? -1 : 1), potNode.y + (yDirectionPositive ? -1 : 1));
        let potNode1 = this.getNode(node.x + (xDirectionPositive ? 1 : -1), node.y + (yDirectionPositive ? 1 : -1));

        let node2 = this.getNode(node1.x * 2 - node.x, node1.y * 2 - node.y);
        let potNode2 = this.getNode(potNode1.x * 2 - potNode.x, potNode1.y * 2 - potNode.y);

        // check for collisions
        if (node1.blockades.has(potNode2) || potNode1.blockades.has(node2) || node1.blockades.has(potNode1)) {
            return false;
        }

        const addBlockade = (nodeA: Node, nodeB: Node) => {
            nodeA.blockades.add(nodeB);
            nodeB.blockades.add(nodeA);
        };
        addBlockade(node, node1);
        addBlockade(node1, potNode);
        addBlockade(potNode, potNode1);
        addBlockade(potNode1, node);

        // add bridge both ways
        node.edges.push(potNode);
        potNode.edges.push(node);
        return true;
    }
    */

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
