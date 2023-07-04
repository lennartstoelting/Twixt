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

    constructor(tilesAcross: number, yellowsTurn: boolean) {
        this.nodeList = [];
        this.yellowsTurn = yellowsTurn;
        this.tilesAcross = tilesAcross;
        this.gameWon = 0;

        // create all nodes in empty state
        for (let y = 0; y < tilesAcross; y++) {
            for (let x = 0; x < tilesAcross; x++) {
                if ((x == 0 || x == tilesAcross - 1) && (y == 0 || y == tilesAcross - 1)) continue; // the corners of the playing field
                this.nodeList.push(new Node(x, y, tilesAcross, 0));
            }
        }
    }

    clone(): Graph {
        let clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.nodeList = structuredClone(this.nodeList);
        return clonedGraph;
    }

    getNode(x: number, y: number): Node {
        return this.nodeList.find((node) => {
            return node.x == x && node.y == y;
        });
    }

    tryAddingNode(x: number, y: number): boolean {
        let node = this.getNode(x, y);

        if (node.state != 0) return false;

        node.state = this.yellowsTurn ? 1 : 2;

        let bridgeAdded: boolean = false;
        for (let i = 0; i < 8; i++) {
            // calculate x and y of all 8 potential (knight)moves
            let iInBinary = ("000" + i.toString(2)).slice(-3);
            let potentialX = node.x + (iInBinary[0] == "0" ? 1 : 2) * (iInBinary[1] == "0" ? -1 : 1);
            let potentialY = node.y + (iInBinary[0] == "0" ? 2 : 1) * (iInBinary[2] == "0" ? 1 : -1);

            // potentialNode is one out of the 8 surrounding neighbours that might have the same color and could be connected
            let potentialNode = this.getNode(potentialX, potentialY);
            if (!potentialNode) continue;
            if (potentialNode.state != node.state) continue;

            let edgeAdded = this.addEdge(node, potentialNode);
            if (!edgeAdded) {
                console.log("Edge to potential Node (" + potentialNode.x + ", " + potentialNode.y + ") couldn't be added");
                continue;
            }
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
    addEdge(node: Node, potentialNode: Node): boolean {
        let xDirectionPositive = potentialNode.x - node.x > 0;
        let yDirectionPositive = potentialNode.y - node.y > 0;

        /*
         *   vdownv       ^up^
         *
         *   node    potentialNode2
         *   node1   potentialNode1
         *   node2   potentialNode
         *
         *   applicable in other rotations
         */
        let node1 = this.getNode(potentialNode.x + (xDirectionPositive ? -1 : 1), potentialNode.y + (yDirectionPositive ? -1 : 1));
        let potentialNode1 = this.getNode(node.x + (xDirectionPositive ? 1 : -1), node.y + (yDirectionPositive ? 1 : -1));

        let node2 = this.getNode(node1.x * 2 - node.x, node1.y * 2 - node.y);
        let potentialNode2 = this.getNode(potentialNode1.x * 2 - potentialNode.x, potentialNode1.y * 2 - potentialNode.y);

        // check for collisions
        if (node1.blockades.has(potentialNode2) || potentialNode1.blockades.has(node2) || node1.blockades.has(potentialNode1)) {
            return false;
        }

        const addBlockade = (nodeA: Node, nodeB: Node) => {
            nodeA.blockades.add(nodeB);
            nodeB.blockades.add(nodeA);
        };
        addBlockade(node, node1);
        addBlockade(node1, potentialNode);
        addBlockade(potentialNode, potentialNode1);
        addBlockade(potentialNode1, node);

        // add bridge both ways
        node.edges.push(potentialNode);
        potentialNode.edges.push(node);
        return true;
    }

    checkWinCondition(): void {
        let nodeQueue = new Set<Node>();
        for (let i = 1; i < this.tilesAcross - 1; i++) {
            let startNode = this.yellowsTurn ? this.getNode(i, 0) : this.getNode(0, i);
            if ((this.yellowsTurn && startNode.state != 1) || (!this.yellowsTurn && startNode.state != 2)) continue;
            nodeQueue.add(startNode);
        }

        let connectionFound: boolean = false;
        nodeQueue.forEach((node) => {
            if (connectionFound) return;
            if ((this.yellowsTurn && node.y == this.tilesAcross - 1) || (!this.yellowsTurn && node.x == this.tilesAcross - 1)) {
                connectionFound = true;
                return;
            }
            node.edges.forEach((node) => {
                nodeQueue.add(node);
            });
        });
        if (connectionFound) {
            this.gameWon = this.yellowsTurn ? 1 : 2;
        }
    }
}
