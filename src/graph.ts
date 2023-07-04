export class Node {
    x: number;
    y: number;
    state: number;
    edges: Node[];
    blockades: Set<Node>;
    id: number;

    constructor(x: number, y: number, tilesAcross: number, state: number) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.edges = [];
        this.blockades = new Set<Node>();
        this.id = y * tilesAcross + x;
    }
}

// -------------------------------------------------

export class Graph {
    yellowsTurn: boolean;
    tilesAcross: number;
    nodeList: Node[];
    gameWon: number;
    evaluation: number;

    matrix: number[][];

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.nodeList = [];
        this.yellowsTurn = yellowsTurn;
        this.tilesAcross = tilesAcross;
        this.gameWon = 0;
        this.matrix = Array(tilesAcross)
            .fill(0)
            .map(() => Array(tilesAcross).fill(0));

        // create all nodes in empty state
        for (let y = 0; y < tilesAcross; y++) {
            for (let x = 0; x < tilesAcross; x++) {
                if ((x == 0 || x == tilesAcross - 1) && (y == 0 || y == tilesAcross - 1)) {
                    // the corners of the playing field
                    this.matrix[x][y] = 3;
                    continue;
                }
                this.nodeList.push(new Node(x, y, tilesAcross, 0));
            }
        }
    }

    clone(): Graph {
        let clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.nodeList = structuredClone(this.nodeList);
        clonedGraph.matrix = structuredClone(this.matrix);
        return clonedGraph;
    }

    tryAddingNode(x: number, y: number): boolean {
        if (this.matrix[x][y] != 0) return false;
        this.matrix[x][y] = this.yellowsTurn ? 1 : 2;

        // connect bridges
        let bridgeAdded: boolean = false;
        for (let i = 0; i < 8; i++) {
            let newCoord = numberToXY(i);

            let potX = x + newCoord[0];
            let potY = y + newCoord[1];

            // if outside or a corner or not the same color
            // TODO rework this later on!!
            if (
                this.matrix[potX] == undefined ||
                this.matrix[potX][potY] == undefined ||
                this.matrix[potX][potY] == 3 ||
                !((this.matrix[potX][potY] & 3) == (this.matrix[x][y] & 3))
            ) {
                continue;
            }

            // TODO check for collisions

            // add edge in both directions
            this.matrix[x][y] |= (2 ** i) << 4;
            let otherDirection = i & 1 ? (i + 3) % 8 : (i + 5) % 8;
            this.matrix[potX][potY] |= (2 ** otherDirection) << 4;
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

// gets a value between 0 and 7 and returns the corresponding x and y direction
export function numberToXY(value: number): number[] {
    let x = (value & 2 ? 1 : 2) * (value & 4 ? -1 : 1);
    let y = (value & 2 ? 2 : 1) * (value & 1 ? -1 : 1);

    return [x, y];
}
