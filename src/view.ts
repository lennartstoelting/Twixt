import { Graph, State } from "./graph";

class View {
    board: any;
    ctx: any;
    boardSideLength: number;
    tileSize: number;
    corners: number[];

    turnInfo: HTMLElement;
    boardContainer: HTMLElement;

    constructor() {
        this.turnInfo = document.getElementById("turn-info");
        this.boardContainer = document.getElementById("board-container");
    }

    drawBoard(graph: Graph, gridlines: boolean, blockades: boolean) {
        this.turnInfo.innerHTML = "It's " + (graph.yellowsTurn ? "yellow" : "red") + "'s turn";
        this.boardContainer.innerHTML = "";

        this._createCanvas(graph);
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();

        graph.nodeList.forEach((node) => {
            let nodeCenterX = node.x * this.tileSize + this.tileSize / 2;
            let nodeCenterY = node.y * this.tileSize + this.tileSize / 2;

            // draw hole or pin
            this.ctx.beginPath();
            this.ctx.arc(nodeCenterX, nodeCenterY, this.tileSize / 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = node.state;
            this.ctx.fill();

            // draw bridges
            this.ctx.lineWidth = this.tileSize / 12;
            this.ctx.strokeStyle = node.state;
            node.edges.forEach((edge) => {
                this.ctx.beginPath();
                this.ctx.moveTo(nodeCenterX, nodeCenterY);
                this.ctx.lineTo(edge.x * this.tileSize + this.tileSize / 2, edge.y * this.tileSize + this.tileSize / 2);
                this.ctx.stroke();
            });

            // draw blockade
            if (!blockades) return;
            this.ctx.strokeStyle = "black";
            node.blockades.forEach((block) => {
                this.ctx.beginPath();
                this.ctx.moveTo(nodeCenterX, nodeCenterY);
                this.ctx.lineTo(block.x * this.tileSize + this.tileSize / 2, block.y * this.tileSize + this.tileSize / 2);
                this.ctx.stroke();
            });
        });
    }

    _createCanvas(graph: Graph) {
        this.board = document.createElement("canvas");
        this.board.id = "board";
        this.board.style.background = "blue";
        this.board.style.boxShadow = "5px 5px 20px gray";
        this.board.style.borderRadius = "3%";
        this.board.style.margin = "1%";
        this.board.width = this.boardContainer.clientWidth * 0.98;
        this.board.height = this.boardContainer.clientHeight * 0.98;
        // this.board.addEventListener("click", this.boardClicked);
        this.boardContainer.appendChild(this.board);

        this.ctx = this.board.getContext("2d");
        this.boardSideLength = this.board.clientWidth;
        this.tileSize = this.boardSideLength / graph.tilesAcross;
    }

    _drawGridlines() {
        this.ctx.beginPath();
        for (let l = 0; l <= this.boardSideLength; l += this.tileSize) {
            this.ctx.moveTo(l, 0);
            this.ctx.lineTo(l, this.boardSideLength);
            this.ctx.moveTo(0, l);
            this.ctx.lineTo(this.boardSideLength, l);
        }
        this.ctx.lineWidth = this.tileSize / 25;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
    }

    _drawFinishLines() {
        this.corners = [
            this.tileSize,
            this.tileSize + this.tileSize / 4,
            this.boardSideLength - this.tileSize,
            this.boardSideLength - this.tileSize - this.tileSize / 4,
        ];

        this.ctx.lineWidth = this.tileSize / 6;
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#ff4444";
        this.ctx.moveTo(this.corners[0], this.corners[1]);
        this.ctx.lineTo(this.corners[0], this.corners[3]);
        this.ctx.moveTo(this.corners[2], this.corners[1]);
        this.ctx.lineTo(this.corners[2], this.corners[3]);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#ffffaa";
        this.ctx.moveTo(this.corners[1], this.corners[0]);
        this.ctx.lineTo(this.corners[3], this.corners[0]);
        this.ctx.moveTo(this.corners[1], this.corners[2]);
        this.ctx.lineTo(this.corners[3], this.corners[2]);
        this.ctx.stroke();
    }
}

export default View;
