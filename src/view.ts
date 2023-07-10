import { Graph, pointInDirectionOfIndex } from "./graph";

class View {
    board: any;
    ctx: any;
    boardSideLength: number;
    tileSize: number;
    corners: number[];

    whosTurn: HTMLElement;
    boardContainer: HTMLElement;

    constructor() {
        this.whosTurn = document.getElementById("whos-turn");
        this.boardContainer = document.getElementById("board-container");
    }

    drawBoard(graph: Graph, gridlines: boolean, blockades: boolean): void {
        this._createCanvas(graph);
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();

        graph.matrix.forEach((column, x) => {
            column.forEach((entry, y) => {
                if (entry == 3) return;

                let nodeCenterX = x * this.tileSize + this.tileSize / 2;
                let nodeCenterY = y * this.tileSize + this.tileSize / 2;

                // draw hole or pin
                this.ctx.beginPath();
                this.ctx.arc(nodeCenterX, nodeCenterY, this.tileSize / 6, 0, 2 * Math.PI);
                this.ctx.fillStyle = this._numberToColor(entry);
                this.ctx.fill();

                // draw bridges
                this.ctx.lineWidth = this.tileSize / 12;
                this.ctx.strokeStyle = this._numberToColor(entry);
                let bridges = entry >> graph.bridgeBitsOffset;
                if (!bridges) return;

                for (let i = 0; i < 8; i++) {
                    if (!(bridges & (2 ** i))) continue;

                    let connectedCoord = pointInDirectionOfIndex(x, y, i);

                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeCenterX, nodeCenterY);
                    this.ctx.lineTo(connectedCoord.x * this.tileSize + this.tileSize / 2, connectedCoord.y * this.tileSize + this.tileSize / 2);
                    this.ctx.stroke();
                }
            });
        });

        // this line could be made shorter
        this.whosTurn.innerHTML = graph.yellowsTurn ? "yellow" : "red";
    }

    // this can probably be changed with clearRect instead of creating a whole new instance of the canvas
    private _createCanvas(graph: Graph): void {
        this.board = document.createElement("canvas");
        this.board.id = "board";
        this.board.style.background = "blue";
        this.board.style.boxShadow = "5px 5px 20px gray";
        this.board.style.borderRadius = "3%";
        this.board.style.margin = "1%";
        this.board.width = this.boardContainer.clientWidth * 0.98;
        this.board.height = this.boardContainer.clientHeight * 0.98;
        this.boardContainer.innerHTML = "";
        this.boardContainer.appendChild(this.board);

        this.ctx = this.board.getContext("2d");
        this.boardSideLength = this.board.clientWidth;
        this.tileSize = this.boardSideLength / graph.matrix.length;
    }

    private _drawGridlines(): void {
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

    private _drawFinishLines(): void {
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

    private _numberToColor(value: number): string {
        if (value == 0) {
            return "black";
        }
        if (value & 1) {
            return "yellow";
        }
        if (value & 2) {
            return "red";
        }
    }
}

export default View;
