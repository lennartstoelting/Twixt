import { Graph, pointInDirectionOfIndex } from "./graph";

class View {
    board: HTMLCanvasElement;
    tileSize: number;
    private boardSideLength: number;
    private borderRadius: number;
    private corners: number[];

    private ctx: CanvasRenderingContext2D;

    private whosTurn: HTMLElement;
    private boardContainer: HTMLDivElement;

    constructor() {
        this.whosTurn = document.getElementById("whos-turn");
        this.boardContainer = document.getElementById("board-container") as HTMLDivElement;
        this.borderRadius = 3;
    }

    public drawBoard(graph: Graph, gridlines: boolean, blockades: boolean): void {
        this._createCanvas(graph);
        this._drawBackground();
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();

        graph.matrix.forEach((column, x) => {
            column.forEach((node, y) => {
                if (node == 3) return;

                let nodeCenterX = x * this.tileSize + this.tileSize / 2;
                let nodeCenterY = y * this.tileSize + this.tileSize / 2;

                // draw hole or pin
                this.ctx.beginPath();
                this.ctx.arc(nodeCenterX, nodeCenterY, this.tileSize / 6, 0, 2 * Math.PI);
                this.ctx.fillStyle = node == 0 ? "black" : node & 1 ? "yellow" : "red";
                this.ctx.fill();

                // draw bridges
                this.ctx.lineWidth = this.tileSize / 12;
                this.ctx.strokeStyle = node == 0 ? "black" : node & 1 ? "yellow" : "red";
                let bridges = node >> graph.bridgeBitsOffset;
                if (!bridges) return;

                for (let i = 0; i < 8; i++) {
                    if (!(bridges & (2 ** i))) continue;

                    let connectedCoord = pointInDirectionOfIndex(x, y, i);

                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeCenterX, nodeCenterY);
                    this.ctx.lineTo(connectedCoord[0] * this.tileSize + this.tileSize / 2, connectedCoord[1] * this.tileSize + this.tileSize / 2);
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
        this.board.style.boxShadow = "5px 5px 20px gray";
        this.board.style.borderRadius = this.borderRadius + "%";
        this.board.style.margin = "1%";
        this.board.width = this.boardContainer.clientWidth * 0.98;
        this.board.height = this.boardContainer.clientHeight * 0.98;
        this.boardContainer.innerHTML = "";
        this.boardContainer.appendChild(this.board);

        this.ctx = this.board.getContext("2d");
        this.boardSideLength = this.board.clientWidth;
        this.tileSize = this.boardSideLength / graph.matrix.length;
    }

    private _drawBackground(): void {
        this.ctx.beginPath();
        this.ctx.fillStyle = "blue";
        this.ctx.roundRect(0, 0, this.board.clientWidth, this.board.clientWidth, this.board.clientWidth * (this.borderRadius / 100));
        this.ctx.stroke();
        this.ctx.fill();
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
}

export default View;
