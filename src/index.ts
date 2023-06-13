import { Graph, State } from "./graph";

// -------------------------------------------------

// game logic
const tilesAcross: number = 8;
var graph: Graph = new Graph(tilesAcross, true);
console.log(Graph);

// visuals
var board: any;
var ctx: any;
var boardSideLength: number;
var tileSize: number;
var corners: number[];
var showGridlines: boolean;
var showBlockades: boolean;
var gameWonModalShown: boolean; // has the player already seen the game won Modal and wanted to keep playing?

// -------------------------------------------------

const boardContainer = document.getElementById("board-container");
window.addEventListener("resize", drawBoard);
const turnInfo = document.getElementById("turn-info");
drawBoard();

// game-buttons
const restartGameButton: HTMLElement = document.getElementById("restart-game");
restartGameButton.addEventListener("click", () => {
    // open startGameModal
    startGameModal.style.display = "block";
});
const undoMoveButton: HTMLElement = document.getElementById("undo-move");
undoMoveButton.addEventListener("click", () => {
    console.log("not yet implemented");
});

// debug-buttons
const toggleGridlinesButton: HTMLElement = document.getElementById("toggle-gridlines");
toggleGridlinesButton.addEventListener("click", () => {
    showGridlines = !showGridlines;
    drawBoard();
});
const toggleBlockadesButton: HTMLElement = document.getElementById("toggle-blockades");
toggleBlockadesButton.addEventListener("click", () => {
    showBlockades = !showBlockades;
    drawBoard();
});

// start / restart game Modal
var startGameModal = document.getElementById("startGameModal");
var startGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
startGameModalCloseButton.addEventListener("click", () => {
    startGameModal.style.display = "none";
});
var yellowStartsButton = document.getElementById("yellow-starts");
yellowStartsButton.addEventListener("click", () => {
    restartGame(true);
});
var redStartsButton = document.getElementById("red-starts");
redStartsButton.addEventListener("click", () => {
    restartGame(false);
});
startGameModal.style.display = "block";

// game won Modal
var gameWonModal = document.getElementById("gameWonModal");
var gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
gameWonModalCloseButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
});
var winnerInfo = document.getElementById("winner-info");
var restartGameAgainButton: HTMLElement = document.getElementById("restart-game-again");
restartGameAgainButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
    startGameModal.style.display = "block";
});
var keepPlayingButton: HTMLElement = document.getElementById("keep-playing");
keepPlayingButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
});

// -------------------------------------------------

function drawBoard() {
    turnInfo.innerHTML = "It's " + (graph.yellowsTurn ? "yellow" : "red") + "'s turn";
    boardContainer.innerHTML = "";

    createCanvas();
    if (showGridlines) {
        drawGridlines();
    }
    drawFinishLines();

    graph.nodeList.forEach((node) => {
        let nodeCenterX = node.x * tileSize + tileSize / 2;
        let nodeCenterY = node.y * tileSize + tileSize / 2;

        // draw hole or pin
        ctx.beginPath();
        ctx.arc(nodeCenterX, nodeCenterY, tileSize / 6, 0, 2 * Math.PI);
        ctx.fillStyle = node.state;
        ctx.fill();

        // draw bridges
        ctx.lineWidth = tileSize / 12;
        ctx.strokeStyle = node.state;
        node.edges.forEach((edge) => {
            ctx.beginPath();
            ctx.moveTo(nodeCenterX, nodeCenterY);
            ctx.lineTo(edge.x * tileSize + tileSize / 2, edge.y * tileSize + tileSize / 2);
            ctx.stroke();
        });

        // draw blockade
        if (!showBlockades) return;
        ctx.strokeStyle = "black";
        node.blockades.forEach((block) => {
            ctx.beginPath();
            ctx.moveTo(nodeCenterX, nodeCenterY);
            ctx.lineTo(block.x * tileSize + tileSize / 2, block.y * tileSize + tileSize / 2);
            ctx.stroke();
        });
    });
}

function createCanvas() {
    board = document.createElement("canvas");
    board.id = "board";
    board.style.background = "blue";
    board.style.boxShadow = "5px 5px 20px gray";
    board.style.borderRadius = "3%";
    board.style.margin = "1%";
    board.width = boardContainer.clientWidth * 0.98;
    board.height = boardContainer.clientHeight * 0.98;
    board.addEventListener("click", boardClicked);
    boardContainer.appendChild(board);

    ctx = board.getContext("2d");
    boardSideLength = board.clientWidth;
    tileSize = boardSideLength / graph.tilesAcross;
}

function drawGridlines() {
    ctx.beginPath();
    for (let l = 0; l <= boardSideLength; l += tileSize) {
        ctx.moveTo(l, 0);
        ctx.lineTo(l, boardSideLength);
        ctx.moveTo(0, l);
        ctx.lineTo(boardSideLength, l);
    }
    ctx.lineWidth = tileSize / 25;
    ctx.strokeStyle = "white";
    ctx.stroke();
}

function drawFinishLines() {
    corners = [tileSize, tileSize + tileSize / 4, boardSideLength - tileSize, boardSideLength - tileSize - tileSize / 4];

    ctx.lineWidth = tileSize / 6;
    ctx.beginPath();
    ctx.strokeStyle = "#ff4444";
    ctx.moveTo(corners[0], corners[1]);
    ctx.lineTo(corners[0], corners[3]);
    ctx.moveTo(corners[2], corners[1]);
    ctx.lineTo(corners[2], corners[3]);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#ffffaa";
    ctx.moveTo(corners[1], corners[0]);
    ctx.lineTo(corners[3], corners[0]);
    ctx.moveTo(corners[1], corners[2]);
    ctx.lineTo(corners[3], corners[2]);
    ctx.stroke();
}

function boardClicked(event: { currentTarget: { getBoundingClientRect: () => any }; clientX: number; clientY: number }) {
    // calculate which tile was clicked from global coordinates to matrix coordinates
    var rect = event.currentTarget.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / tileSize);
    var y = Math.floor((event.clientY - rect.top) / tileSize);
    // the corners of the playing field
    if ((x == 0 || x == graph.tilesAcross - 1) && (y == 0 || y == graph.tilesAcross - 1)) return;
    // console.log("clicked hole: (x: " + x + ", y: " + y + ")");

    let nodePlayed = graph.tryPlayingNode(x, y);
    if (nodePlayed) {
        drawBoard();
    }
    if (graph.gameWon != State.empty && !gameWonModalShown) {
        winnerInfo.innerHTML = graph.gameWon + " won!";
        gameWonModal.style.display = "block";
        gameWonModalShown = true;
    }
}

function restartGame(yellowStarts: boolean) {
    graph = new Graph(tilesAcross, true);
    graph.yellowsTurn = yellowStarts;
    startGameModal.style.display = "none";
    gameWonModalShown = false;
    drawBoard();
}
