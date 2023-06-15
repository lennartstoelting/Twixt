import { Graph, State } from "./graph";

// -------------------------------------------------
// global variables
// -------------------------------------------------

// game logic
const tilesAcross: number = 16;
var graph: Graph = new Graph(tilesAcross, true);

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
// dom elements and Event listeners
// -------------------------------------------------

const boardContainer = document.getElementById("board-container");
const turnInfo = document.getElementById("turn-info");
// game-buttons
const restartGameButton: HTMLElement = document.getElementById("restart-game");
const undoMoveButton: HTMLElement = document.getElementById("undo-move");
// debug-buttons
const toggleGridlinesButton: HTMLElement = document.getElementById("toggle-gridlines");
const toggleBlockadesButton: HTMLElement = document.getElementById("toggle-blockades");
// start / restart game modal
var startGameModal = document.getElementById("startGameModal");
var startGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
var yellowStartsButton = document.getElementById("yellow-starts");
var redStartsButton = document.getElementById("red-starts");
// game won modal
var gameWonModal = document.getElementById("gameWonModal");
var gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
var winnerInfo = document.getElementById("winner-info");
var restartGameAgainButton: HTMLElement = document.getElementById("restart-game-again");
var keepPlayingButton: HTMLElement = document.getElementById("keep-playing");

window.addEventListener("resize", drawBoard);

restartGameButton.addEventListener("click", () => {
    startGameModal.style.display = "block";
});
undoMoveButton.addEventListener("click", () => {
    console.log("not yet implemented");
});
toggleGridlinesButton.addEventListener("click", () => {
    showGridlines = !showGridlines;
    drawBoard();
});
toggleBlockadesButton.addEventListener("click", () => {
    showBlockades = !showBlockades;
    drawBoard();
});

startGameModalCloseButton.addEventListener("click", () => {
    startGameModal.style.display = "none";
});
yellowStartsButton.addEventListener("click", () => {
    restartGame(true);
});
redStartsButton.addEventListener("click", () => {
    restartGame(false);
});

gameWonModalCloseButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
});
restartGameAgainButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
    startGameModal.style.display = "block";
});
keepPlayingButton.addEventListener("click", () => {
    gameWonModal.style.display = "none";
});

drawBoard();
startGameModal.style.display = "block";

// -------------------------------------------------
// player interactions
// -------------------------------------------------

function restartGame(yellowStarts: boolean) {
    graph = new Graph(tilesAcross, true);
    graph.yellowsTurn = yellowStarts;
    startGameModal.style.display = "none";
    gameWonModalShown = false;
    drawBoard();
}

// -------------------------------------------------
// refresh drawing of canvas
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
