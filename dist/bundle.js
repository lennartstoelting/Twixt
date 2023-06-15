/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/graph.ts":
/*!**********************!*\
  !*** ./src/graph.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Graph: () => (/* binding */ Graph),
/* harmony export */   Node: () => (/* binding */ Node),
/* harmony export */   State: () => (/* binding */ State)
/* harmony export */ });
var State;
(function (State) {
    State["empty"] = "black";
    State["yellow"] = "Yellow";
    State["red"] = "Red";
})(State || (State = {}));
var Node = /** @class */ (function () {
    function Node(x, y, tilesAcross, state) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.edges = [];
        this.blockades = new Set();
        this.id = y * tilesAcross + x;
    }
    return Node;
}());

// -------------------------------------------------
var Graph = /** @class */ (function () {
    function Graph(tilesAcross, yellowsTurn) {
        this.nodeList = [];
        this.yellowsTurn = yellowsTurn;
        this.tilesAcross = tilesAcross;
        this.gameWon = State.empty;
        // create all nodes in empty state
        for (var y = 0; y < tilesAcross; y++) {
            for (var x = 0; x < tilesAcross; x++) {
                if ((x == 0 || x == tilesAcross - 1) && (y == 0 || y == tilesAcross - 1))
                    continue; // the corners of the playing field
                this.nodeList.push(new Node(x, y, tilesAcross, State.empty));
            }
        }
    }
    Graph.prototype.getNode = function (x, y) {
        return this.nodeList.find(function (node) {
            return node.x == x && node.y == y;
        });
    };
    Graph.prototype.tryPlayingNode = function (x, y) {
        var node = this.getNode(x, y);
        if (node.state != State.empty)
            return false;
        node.state = this.yellowsTurn ? State.yellow : State.red;
        var bridgeAdded = false;
        for (var i = 0; i < 8; i++) {
            // calculate x and y of all 8 potential (knight)moves
            var iInBinary = ("000" + i.toString(2)).slice(-3);
            var potentialX = node.x + (iInBinary[0] == "0" ? 1 : 2) * (iInBinary[1] == "0" ? -1 : 1);
            var potentialY = node.y + (iInBinary[0] == "0" ? 2 : 1) * (iInBinary[2] == "0" ? 1 : -1);
            // potentialNode is one out of the 8 surrounding neighbours that might have the same color and could be connected
            var potentialNode = this.getNode(potentialX, potentialY);
            if (!potentialNode)
                continue;
            if (potentialNode.state != node.state)
                continue;
            var edgeAdded = this.addEdge(node, potentialNode);
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
    };
    // only adds an Edge if the connections isn't blocked
    // TODO add a check that ensures the edge that is being added is exactly one knight move away to prevent future bugs
    Graph.prototype.addEdge = function (node, potentialNode) {
        var xDirectionPositive = potentialNode.x - node.x > 0;
        var yDirectionPositive = potentialNode.y - node.y > 0;
        /*
         *   vdownv       ^up^
         *
         *   node    potentialNode2
         *   node1   potentialNode1
         *   node2   potentialNode
         *
         *   applicable in other rotations
         */
        var node1 = this.getNode(potentialNode.x + (xDirectionPositive ? -1 : 1), potentialNode.y + (yDirectionPositive ? -1 : 1));
        var potentialNode1 = this.getNode(node.x + (xDirectionPositive ? 1 : -1), node.y + (yDirectionPositive ? 1 : -1));
        var node2 = this.getNode(node1.x * 2 - node.x, node1.y * 2 - node.y);
        var potentialNode2 = this.getNode(potentialNode1.x * 2 - potentialNode.x, potentialNode1.y * 2 - potentialNode.y);
        // check for collisions
        if (node1.blockades.has(potentialNode2) || potentialNode1.blockades.has(node2) || node1.blockades.has(potentialNode1)) {
            return false;
        }
        var addBlockade = function (nodeA, nodeB) {
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
    };
    Graph.prototype.checkWinCondition = function () {
        var _this = this;
        var nodeQueue = new Set();
        for (var i = 1; i < this.tilesAcross - 1; i++) {
            var startNode = this.yellowsTurn ? this.getNode(i, 0) : this.getNode(0, i);
            if ((this.yellowsTurn && startNode.state != State.yellow) || (!this.yellowsTurn && startNode.state != State.red))
                continue;
            nodeQueue.add(startNode);
        }
        var connectionFound = false;
        nodeQueue.forEach(function (node) {
            if (connectionFound)
                return;
            if ((_this.yellowsTurn && node.y == _this.tilesAcross - 1) || (!_this.yellowsTurn && node.x == _this.tilesAcross - 1)) {
                connectionFound = true;
                return;
            }
            node.edges.forEach(function (node) {
                nodeQueue.add(node);
            });
        });
        if (connectionFound) {
            this.gameWon = this.yellowsTurn ? State.yellow : State.red;
        }
    };
    return Graph;
}());



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");

// -------------------------------------------------
// global variables
// -------------------------------------------------
// game logic
var tilesAcross = 16;
var graph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
// visuals
var board;
var ctx;
var boardSideLength;
var tileSize;
var corners;
var showGridlines;
var showBlockades;
var gameWonModalShown; // has the player already seen the game won Modal and wanted to keep playing?
// -------------------------------------------------
// dom elements and Event listeners
// -------------------------------------------------
var boardContainer = document.getElementById("board-container");
var turnInfo = document.getElementById("turn-info");
// game-buttons
var restartGameButton = document.getElementById("restart-game");
var undoMoveButton = document.getElementById("undo-move");
// debug-buttons
var toggleGridlinesButton = document.getElementById("toggle-gridlines");
var toggleBlockadesButton = document.getElementById("toggle-blockades");
// start / restart game modal
var startGameModal = document.getElementById("startGameModal");
var startGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
var yellowStartsButton = document.getElementById("yellow-starts");
var redStartsButton = document.getElementById("red-starts");
// game won modal
var gameWonModal = document.getElementById("gameWonModal");
var gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
var winnerInfo = document.getElementById("winner-info");
var restartGameAgainButton = document.getElementById("restart-game-again");
var keepPlayingButton = document.getElementById("keep-playing");
window.addEventListener("resize", drawBoard);
restartGameButton.addEventListener("click", function () {
    startGameModal.style.display = "block";
});
undoMoveButton.addEventListener("click", function () {
    console.log("not yet implemented");
});
toggleGridlinesButton.addEventListener("click", function () {
    showGridlines = !showGridlines;
    drawBoard();
});
toggleBlockadesButton.addEventListener("click", function () {
    showBlockades = !showBlockades;
    drawBoard();
});
startGameModalCloseButton.addEventListener("click", function () {
    startGameModal.style.display = "none";
});
yellowStartsButton.addEventListener("click", function () {
    restartGame(true);
});
redStartsButton.addEventListener("click", function () {
    restartGame(false);
});
gameWonModalCloseButton.addEventListener("click", function () {
    gameWonModal.style.display = "none";
});
restartGameAgainButton.addEventListener("click", function () {
    gameWonModal.style.display = "none";
    startGameModal.style.display = "block";
});
keepPlayingButton.addEventListener("click", function () {
    gameWonModal.style.display = "none";
});
drawBoard();
startGameModal.style.display = "block";
// -------------------------------------------------
// player interactions
// -------------------------------------------------
function restartGame(yellowStarts) {
    graph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
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
    graph.nodeList.forEach(function (node) {
        var nodeCenterX = node.x * tileSize + tileSize / 2;
        var nodeCenterY = node.y * tileSize + tileSize / 2;
        // draw hole or pin
        ctx.beginPath();
        ctx.arc(nodeCenterX, nodeCenterY, tileSize / 6, 0, 2 * Math.PI);
        ctx.fillStyle = node.state;
        ctx.fill();
        // draw bridges
        ctx.lineWidth = tileSize / 12;
        ctx.strokeStyle = node.state;
        node.edges.forEach(function (edge) {
            ctx.beginPath();
            ctx.moveTo(nodeCenterX, nodeCenterY);
            ctx.lineTo(edge.x * tileSize + tileSize / 2, edge.y * tileSize + tileSize / 2);
            ctx.stroke();
        });
        // draw blockade
        if (!showBlockades)
            return;
        ctx.strokeStyle = "black";
        node.blockades.forEach(function (block) {
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
    for (var l = 0; l <= boardSideLength; l += tileSize) {
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
function boardClicked(event) {
    // calculate which tile was clicked from global coordinates to matrix coordinates
    var rect = event.currentTarget.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / tileSize);
    var y = Math.floor((event.clientY - rect.top) / tileSize);
    // the corners of the playing field
    if ((x == 0 || x == graph.tilesAcross - 1) && (y == 0 || y == graph.tilesAcross - 1))
        return;
    // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
    var nodePlayed = graph.tryPlayingNode(x, y);
    if (nodePlayed) {
        drawBoard();
    }
    if (graph.gameWon != _graph__WEBPACK_IMPORTED_MODULE_0__.State.empty && !gameWonModalShown) {
        winnerInfo.innerHTML = graph.gameWon + " won!";
        gameWonModal.style.display = "block";
        gameWonModalShown = true;
    }
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUFFLE9BQU87SUFDN0YsNkRBQTZEO0lBRTdELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksVUFBVSxFQUFFO1FBQ1osU0FBUyxFQUFFLENBQUM7S0FDZjtJQUNELElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSwrQ0FBVyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7UUFDcEQsVUFBVSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMvQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDckMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3R3aXh0Ly4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gU3RhdGUge1xyXG4gICAgZW1wdHkgPSBcImJsYWNrXCIsXHJcbiAgICB5ZWxsb3cgPSBcIlllbGxvd1wiLFxyXG4gICAgcmVkID0gXCJSZWRcIixcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgc3RhdGU6IFN0YXRlO1xyXG4gICAgZWRnZXM6IE5vZGVbXTtcclxuICAgIGJsb2NrYWRlczogU2V0PE5vZGU+O1xyXG4gICAgaWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgdGlsZXNBY3Jvc3M6IG51bWJlciwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmVkZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy5ibG9ja2FkZXMgPSBuZXcgU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5pZCA9IHkgKiB0aWxlc0Fjcm9zcyArIHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcbiAgICB5ZWxsb3dzVHVybjogYm9vbGVhbjtcclxuICAgIHRpbGVzQWNyb3NzOiBudW1iZXI7XHJcbiAgICBub2RlTGlzdDogTm9kZVtdO1xyXG4gICAgZ2FtZVdvbjogU3RhdGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZXNBY3Jvc3M6IG51bWJlciwgeWVsbG93c1R1cm46IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm5vZGVMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMudGlsZXNBY3Jvc3MgPSB0aWxlc0Fjcm9zcztcclxuICAgICAgICB0aGlzLmdhbWVXb24gPSBTdGF0ZS5lbXB0eTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGFsbCBub2RlcyBpbiBlbXB0eSBzdGF0ZVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNBY3Jvc3M7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRpbGVzQWNyb3NzOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgoeCA9PSAwIHx8IHggPT0gdGlsZXNBY3Jvc3MgLSAxKSAmJiAoeSA9PSAwIHx8IHkgPT0gdGlsZXNBY3Jvc3MgLSAxKSkgY29udGludWU7IC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0LnB1c2gobmV3IE5vZGUoeCwgeSwgdGlsZXNBY3Jvc3MsIFN0YXRlLmVtcHR5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMaXN0LmZpbmQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUueCA9PSB4ICYmIG5vZGUueSA9PSB5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeVBsYXlpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLmdldE5vZGUoeCwgeSk7XHJcblxyXG4gICAgICAgIGlmIChub2RlLnN0YXRlICE9IFN0YXRlLmVtcHR5KSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIG5vZGUuc3RhdGUgPSB0aGlzLnllbGxvd3NUdXJuID8gU3RhdGUueWVsbG93IDogU3RhdGUucmVkO1xyXG5cclxuICAgICAgICBsZXQgYnJpZGdlQWRkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgeCBhbmQgeSBvZiBhbGwgOCBwb3RlbnRpYWwgKGtuaWdodCltb3Zlc1xyXG4gICAgICAgICAgICBsZXQgaUluQmluYXJ5ID0gKFwiMDAwXCIgKyBpLnRvU3RyaW5nKDIpKS5zbGljZSgtMyk7XHJcbiAgICAgICAgICAgIGxldCBwb3RlbnRpYWxYID0gbm9kZS54ICsgKGlJbkJpbmFyeVswXSA9PSBcIjBcIiA/IDEgOiAyKSAqIChpSW5CaW5hcnlbMV0gPT0gXCIwXCIgPyAtMSA6IDEpO1xyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsWSA9IG5vZGUueSArIChpSW5CaW5hcnlbMF0gPT0gXCIwXCIgPyAyIDogMSkgKiAoaUluQmluYXJ5WzJdID09IFwiMFwiID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHBvdGVudGlhbE5vZGUgaXMgb25lIG91dCBvZiB0aGUgOCBzdXJyb3VuZGluZyBuZWlnaGJvdXJzIHRoYXQgbWlnaHQgaGF2ZSB0aGUgc2FtZSBjb2xvciBhbmQgY291bGQgYmUgY29ubmVjdGVkXHJcbiAgICAgICAgICAgIGxldCBwb3RlbnRpYWxOb2RlID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbFgsIHBvdGVudGlhbFkpO1xyXG4gICAgICAgICAgICBpZiAoIXBvdGVudGlhbE5vZGUpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAocG90ZW50aWFsTm9kZS5zdGF0ZSAhPSBub2RlLnN0YXRlKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBlZGdlQWRkZWQgPSB0aGlzLmFkZEVkZ2Uobm9kZSwgcG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghZWRnZUFkZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVkZ2UgdG8gcG90ZW50aWFsIE5vZGUgKFwiICsgcG90ZW50aWFsTm9kZS54ICsgXCIsIFwiICsgcG90ZW50aWFsTm9kZS55ICsgXCIpIGNvdWxkbid0IGJlIGFkZGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJpZGdlQWRkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGJyaWRnZUFkZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tXaW5Db25kaXRpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSAhdGhpcy55ZWxsb3dzVHVybjtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBvbmx5IGFkZHMgYW4gRWRnZSBpZiB0aGUgY29ubmVjdGlvbnMgaXNuJ3QgYmxvY2tlZFxyXG4gICAgLy8gVE9ETyBhZGQgYSBjaGVjayB0aGF0IGVuc3VyZXMgdGhlIGVkZ2UgdGhhdCBpcyBiZWluZyBhZGRlZCBpcyBleGFjdGx5IG9uZSBrbmlnaHQgbW92ZSBhd2F5IHRvIHByZXZlbnQgZnV0dXJlIGJ1Z3NcclxuICAgIGFkZEVkZ2Uobm9kZTogTm9kZSwgcG90ZW50aWFsTm9kZTogTm9kZSkge1xyXG4gICAgICAgIGxldCB4RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnggLSBub2RlLnggPiAwO1xyXG4gICAgICAgIGxldCB5RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnkgLSBub2RlLnkgPiAwO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICAgdmRvd252ICAgICAgIF51cF5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgbm9kZSAgICBwb3RlbnRpYWxOb2RlMlxyXG4gICAgICAgICAqICAgbm9kZTEgICBwb3RlbnRpYWxOb2RlMVxyXG4gICAgICAgICAqICAgbm9kZTIgICBwb3RlbnRpYWxOb2RlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIGFwcGxpY2FibGUgaW4gb3RoZXIgcm90YXRpb25zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IG5vZGUxID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpLCBwb3RlbnRpYWxOb2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUxID0gdGhpcy5nZXROb2RlKG5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpLCBub2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSk7XHJcblxyXG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuZ2V0Tm9kZShub2RlMS54ICogMiAtIG5vZGUueCwgbm9kZTEueSAqIDIgLSBub2RlLnkpO1xyXG4gICAgICAgIGxldCBwb3RlbnRpYWxOb2RlMiA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxOb2RlMS54ICogMiAtIHBvdGVudGlhbE5vZGUueCwgcG90ZW50aWFsTm9kZTEueSAqIDIgLSBwb3RlbnRpYWxOb2RlLnkpO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgY29sbGlzaW9uc1xyXG4gICAgICAgIGlmIChub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUyKSB8fCBwb3RlbnRpYWxOb2RlMS5ibG9ja2FkZXMuaGFzKG5vZGUyKSB8fCBub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRCbG9ja2FkZSA9IChub2RlQTogTm9kZSwgbm9kZUI6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgbm9kZUEuYmxvY2thZGVzLmFkZChub2RlQik7XHJcbiAgICAgICAgICAgIG5vZGVCLmJsb2NrYWRlcy5hZGQobm9kZUEpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgYWRkQmxvY2thZGUobm9kZSwgbm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUxLCBwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlLCBwb3RlbnRpYWxOb2RlMSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZTEsIG5vZGUpO1xyXG5cclxuICAgICAgICAvLyBhZGQgYnJpZGdlIGJvdGggd2F5c1xyXG4gICAgICAgIG5vZGUuZWRnZXMucHVzaChwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICBwb3RlbnRpYWxOb2RlLmVkZ2VzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tXaW5Db25kaXRpb24oKSB7XHJcbiAgICAgICAgbGV0IG5vZGVRdWV1ZSA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMudGlsZXNBY3Jvc3MgLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9IHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLmdldE5vZGUoaSwgMCkgOiB0aGlzLmdldE5vZGUoMCwgaSk7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gU3RhdGUueWVsbG93KSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgc3RhcnROb2RlLnN0YXRlICE9IFN0YXRlLnJlZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBub2RlUXVldWUuYWRkKHN0YXJ0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGlvbkZvdW5kOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgbm9kZVF1ZXVlLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb25Gb3VuZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgbm9kZS55ID09IHRoaXMudGlsZXNBY3Jvc3MgLSAxKSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgbm9kZS54ID09IHRoaXMudGlsZXNBY3Jvc3MgLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbkZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vZGVRdWV1ZS5hZGQobm9kZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChjb25uZWN0aW9uRm91bmQpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBHcmFwaCwgU3RhdGUgfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBnbG9iYWwgdmFyaWFibGVzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8vIGdhbWUgbG9naWNcclxuY29uc3QgdGlsZXNBY3Jvc3M6IG51bWJlciA9IDE2O1xyXG52YXIgZ3JhcGg6IEdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB0cnVlKTtcclxuXHJcbi8vIHZpc3VhbHNcclxudmFyIGJvYXJkOiBhbnk7XHJcbnZhciBjdHg6IGFueTtcclxudmFyIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG52YXIgdGlsZVNpemU6IG51bWJlcjtcclxudmFyIGNvcm5lcnM6IG51bWJlcltdO1xyXG52YXIgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxudmFyIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbnZhciBnYW1lV29uTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gZG9tIGVsZW1lbnRzIGFuZCBFdmVudCBsaXN0ZW5lcnNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY29uc3QgYm9hcmRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLWNvbnRhaW5lclwiKTtcclxuY29uc3QgdHVybkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInR1cm4taW5mb1wiKTtcclxuLy8gZ2FtZS1idXR0b25zXHJcbmNvbnN0IHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG5jb25zdCB1bmRvTW92ZUJ1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxuLy8gZGVidWctYnV0dG9uc1xyXG5jb25zdCB0b2dnbGVHcmlkbGluZXNCdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtZ3JpZGxpbmVzXCIpO1xyXG5jb25zdCB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtYmxvY2thZGVzXCIpO1xyXG4vLyBzdGFydCAvIHJlc3RhcnQgZ2FtZSBtb2RhbFxyXG52YXIgc3RhcnRHYW1lTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0R2FtZU1vZGFsXCIpO1xyXG52YXIgc3RhcnRHYW1lTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVswXTtcclxudmFyIHllbGxvd1N0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LXN0YXJ0c1wiKTtcclxudmFyIHJlZFN0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKTtcclxuLy8gZ2FtZSB3b24gbW9kYWxcclxudmFyIGdhbWVXb25Nb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVdvbk1vZGFsXCIpO1xyXG52YXIgZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMV07XHJcbnZhciB3aW5uZXJJbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aW5uZXItaW5mb1wiKTtcclxudmFyIHJlc3RhcnRHYW1lQWdhaW5CdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIik7XHJcbnZhciBrZWVwUGxheWluZ0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtlZXAtcGxheWluZ1wiKTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRyYXdCb2FyZCk7XHJcblxyXG5yZXN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufSk7XHJcbnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm5vdCB5ZXQgaW1wbGVtZW50ZWRcIik7XHJcbn0pO1xyXG50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHNob3dHcmlkbGluZXMgPSAhc2hvd0dyaWRsaW5lcztcclxuICAgIGRyYXdCb2FyZCgpO1xyXG59KTtcclxudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzaG93QmxvY2thZGVzID0gIXNob3dCbG9ja2FkZXM7XHJcbiAgICBkcmF3Qm9hcmQoKTtcclxufSk7XHJcblxyXG5zdGFydEdhbWVNb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHJlc3RhcnRHYW1lKHRydWUpO1xyXG59KTtcclxucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICByZXN0YXJ0R2FtZShmYWxzZSk7XHJcbn0pO1xyXG5cclxuZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufSk7XHJcbmtlZXBQbGF5aW5nQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59KTtcclxuXHJcbmRyYXdCb2FyZCgpO1xyXG5zdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBwbGF5ZXIgaW50ZXJhY3Rpb25zXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIHJlc3RhcnRHYW1lKHllbGxvd1N0YXJ0czogYm9vbGVhbikge1xyXG4gICAgZ3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3MsIHRydWUpO1xyXG4gICAgZ3JhcGgueWVsbG93c1R1cm4gPSB5ZWxsb3dTdGFydHM7XHJcbiAgICBzdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICBnYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgZHJhd0JvYXJkKCk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gcmVmcmVzaCBkcmF3aW5nIG9mIGNhbnZhc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBkcmF3Qm9hcmQoKSB7XHJcbiAgICB0dXJuSW5mby5pbm5lckhUTUwgPSBcIkl0J3MgXCIgKyAoZ3JhcGgueWVsbG93c1R1cm4gPyBcInllbGxvd1wiIDogXCJyZWRcIikgKyBcIidzIHR1cm5cIjtcclxuICAgIGJvYXJkQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgY3JlYXRlQ2FudmFzKCk7XHJcbiAgICBpZiAoc2hvd0dyaWRsaW5lcykge1xyXG4gICAgICAgIGRyYXdHcmlkbGluZXMoKTtcclxuICAgIH1cclxuICAgIGRyYXdGaW5pc2hMaW5lcygpO1xyXG5cclxuICAgIGdyYXBoLm5vZGVMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICBsZXQgbm9kZUNlbnRlclggPSBub2RlLnggKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMjtcclxuICAgICAgICBsZXQgbm9kZUNlbnRlclkgPSBub2RlLnkgKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMjtcclxuXHJcbiAgICAgICAgLy8gZHJhdyBob2xlIG9yIHBpblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSwgdGlsZVNpemUgLyA2LCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IG5vZGUuc3RhdGU7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgLy8gZHJhdyBicmlkZ2VzXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gMTI7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gbm9kZS5zdGF0ZTtcclxuICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcclxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICBjdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8oZWRnZS54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIsIGVkZ2UueSAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBkcmF3IGJsb2NrYWRlXHJcbiAgICAgICAgaWYgKCFzaG93QmxvY2thZGVzKSByZXR1cm47XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIG5vZGUuYmxvY2thZGVzLmZvckVhY2goKGJsb2NrKSA9PiB7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclkpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGJsb2NrLnggKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMiwgYmxvY2sueSAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhcygpIHtcclxuICAgIGJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgIGJvYXJkLmlkID0gXCJib2FyZFwiO1xyXG4gICAgYm9hcmQuc3R5bGUuYmFja2dyb3VuZCA9IFwiYmx1ZVwiO1xyXG4gICAgYm9hcmQuc3R5bGUuYm94U2hhZG93ID0gXCI1cHggNXB4IDIwcHggZ3JheVwiO1xyXG4gICAgYm9hcmQuc3R5bGUuYm9yZGVyUmFkaXVzID0gXCIzJVwiO1xyXG4gICAgYm9hcmQuc3R5bGUubWFyZ2luID0gXCIxJVwiO1xyXG4gICAgYm9hcmQud2lkdGggPSBib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICBib2FyZC5oZWlnaHQgPSBib2FyZENvbnRhaW5lci5jbGllbnRIZWlnaHQgKiAwLjk4O1xyXG4gICAgYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGJvYXJkQ2xpY2tlZCk7XHJcbiAgICBib2FyZENvbnRhaW5lci5hcHBlbmRDaGlsZChib2FyZCk7XHJcblxyXG4gICAgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgYm9hcmRTaWRlTGVuZ3RoID0gYm9hcmQuY2xpZW50V2lkdGg7XHJcbiAgICB0aWxlU2l6ZSA9IGJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLnRpbGVzQWNyb3NzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3R3JpZGxpbmVzKCkge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRpbGVTaXplKSB7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyhsLCAwKTtcclxuICAgICAgICBjdHgubGluZVRvKGwsIGJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICBjdHgubGluZVRvKGJvYXJkU2lkZUxlbmd0aCwgbCk7XHJcbiAgICB9XHJcbiAgICBjdHgubGluZVdpZHRoID0gdGlsZVNpemUgLyAyNTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0ZpbmlzaExpbmVzKCkge1xyXG4gICAgY29ybmVycyA9IFt0aWxlU2l6ZSwgdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDQsIGJvYXJkU2lkZUxlbmd0aCAtIHRpbGVTaXplLCBib2FyZFNpZGVMZW5ndGggLSB0aWxlU2l6ZSAtIHRpbGVTaXplIC8gNF07XHJcblxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gNjtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJzWzBdLCBjb3JuZXJzWzFdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyc1swXSwgY29ybmVyc1szXSk7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lcnNbMl0sIGNvcm5lcnNbMV0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJzWzJdLCBjb3JuZXJzWzNdKTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZmYWFcIjtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1sxXSwgY29ybmVyc1swXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbM10sIGNvcm5lcnNbMF0pO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJzWzFdLCBjb3JuZXJzWzJdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyc1szXSwgY29ybmVyc1syXSk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJvYXJkQ2xpY2tlZChldmVudDogeyBjdXJyZW50VGFyZ2V0OiB7IGdldEJvdW5kaW5nQ2xpZW50UmVjdDogKCkgPT4gYW55IH07IGNsaWVudFg6IG51bWJlcjsgY2xpZW50WTogbnVtYmVyIH0pIHtcclxuICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgdmFyIHJlY3QgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgdmFyIHggPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHRpbGVTaXplKTtcclxuICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRpbGVTaXplKTtcclxuICAgIC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICBpZiAoKHggPT0gMCB8fCB4ID09IGdyYXBoLnRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IGdyYXBoLnRpbGVzQWNyb3NzIC0gMSkpIHJldHVybjtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBob2xlOiAoeDogXCIgKyB4ICsgXCIsIHk6IFwiICsgeSArIFwiKVwiKTtcclxuXHJcbiAgICBsZXQgbm9kZVBsYXllZCA9IGdyYXBoLnRyeVBsYXlpbmdOb2RlKHgsIHkpO1xyXG4gICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICBkcmF3Qm9hcmQoKTtcclxuICAgIH1cclxuICAgIGlmIChncmFwaC5nYW1lV29uICE9IFN0YXRlLmVtcHR5ICYmICFnYW1lV29uTW9kYWxTaG93bikge1xyXG4gICAgICAgIHdpbm5lckluZm8uaW5uZXJIVE1MID0gZ3JhcGguZ2FtZVdvbiArIFwiIHdvbiFcIjtcclxuICAgICAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICBnYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9