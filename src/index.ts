import { Graph, Node, State } from "./graph";

// -------------------------------------------------

var turnInfo = document.getElementById("info");
const board: any = document.getElementById("board");
const ctx: any = board.getContext("2d");
const boardSideLength: number = board.clientWidth;
const tilesAcross: number = 10;

var currGraph: Graph = new Graph(tilesAcross, true);
const tileSize: number = boardSideLength / currGraph.tilesAcross;
const corner = [tileSize, tileSize + tileSize / 4, boardSideLength - tileSize, boardSideLength - tileSize - tileSize / 4];

var showGridlines: boolean;
const toggleGridlinesButton: HTMLElement = document.getElementById("toggleGridlines");
toggleGridlinesButton.addEventListener("click", () => {
    showGridlines = !showGridlines;
    drawBoard();
});

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var restartButton = document.getElementById("restart");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var yellowStarts = document.getElementById("yellow-starts");
yellowStarts.addEventListener("click", () => {
    restartGame(true);
});
var redStarts = document.getElementById("red-starts");
redStarts.addEventListener("click", () => {
    restartGame(false);
});

// When the user clicks on the button, open the modal
restartButton.onclick = function () {
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.addEventListener("click", () => {
    modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

const undoButton: HTMLElement = document.getElementById("undo");
undoButton.addEventListener("click", () => {
    console.log("undoing last move (coming soon)");
    // TODO
    // implement tracking the played moves and being able to revert those changes
});

// -------------------------------------------------

board.addEventListener("click", (event: { currentTarget: { getBoundingClientRect: () => any }; clientX: number; clientY: number }) => {
    // calculate which tile was clicked from global coordinates to matrix coordinates
    var rect = event.currentTarget.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / tileSize);
    var y = Math.floor((event.clientY - rect.top) / tileSize);
    // the corners of the playing field
    if ((x == 0 || x == currGraph.tilesAcross - 1) && (y == 0 || y == currGraph.tilesAcross - 1)) return;
    // console.log("clicked hole: (x: " + x + ", y: " + y + ")");

    let nodePlayed = currGraph.tryPlayingNode(x, y);
    if (nodePlayed) {
        drawBoard();
    }
});

// -------------------------------------------------

function drawBoard() {
    ctx.clearRect(0, 0, boardSideLength, boardSideLength);

    // probably redundant in the future
    if (showGridlines) {
        ctx.beginPath();
        for (let l = 0; l <= boardSideLength; l += tileSize) {
            ctx.moveTo(l, 0);
            ctx.lineTo(l, boardSideLength);
            ctx.moveTo(0, l);
            ctx.lineTo(boardSideLength, l);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    // finish lines on all four sides
    ctx.lineWidth = tileSize / 6;
    ctx.beginPath();
    ctx.strokeStyle = "#ffffaa";
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(corner[0], corner[3]);
    ctx.moveTo(corner[2], corner[1]);
    ctx.lineTo(corner[2], corner[3]);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#ff4444";
    ctx.moveTo(corner[1], corner[0]);
    ctx.lineTo(corner[3], corner[0]);
    ctx.moveTo(corner[1], corner[2]);
    ctx.lineTo(corner[3], corner[2]);
    ctx.stroke();

    // draw holes and pins and bridges
    currGraph.nodeList.forEach((node) => {
        // center point of node
        let tileCenterX = node.x * tileSize + tileSize / 2;
        let tileCenterY = node.y * tileSize + tileSize / 2;

        ctx.fillStyle = node.state;
        ctx.strokeStyle = node.state;
        ctx.lineWidth = tileSize / 12;

        // draw hole or pin
        ctx.beginPath();
        ctx.arc(tileCenterX, tileCenterY, tileSize / 6, 0, 2 * Math.PI);
        ctx.fill();

        // draw bridges
        node.edges.forEach((edge) => {
            ctx.beginPath();
            ctx.moveTo(tileCenterX, tileCenterY);
            ctx.lineTo(edge.x * tileSize + tileSize / 2, edge.y * tileSize + tileSize / 2);
            ctx.stroke();
        });

        // draw blockades (temp)
        ctx.strokeStyle = "#000000";
        node.blockades.forEach((block) => {
            ctx.beginPath();
            ctx.moveTo(tileCenterX, tileCenterY);
            ctx.lineTo(block.x * tileSize + tileSize / 2, block.y * tileSize + tileSize / 2);
            ctx.stroke();
        });
    });

    turnInfo.innerHTML = "It's " + (currGraph.yellowsTurn ? "yellow" : "red") + "'s turn";
}

function restartGame(yellowStarts: boolean) {
    currGraph = new Graph(tilesAcross, true);
    currGraph.yellowsTurn = yellowStarts;
    modal.style.display = "none";
    drawBoard();
}

drawBoard();
modal.style.display = "block";
