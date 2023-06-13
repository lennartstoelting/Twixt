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
// game logic
var tilesAcross = 8;
var graph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
console.log(_graph__WEBPACK_IMPORTED_MODULE_0__.Graph);
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
var boardContainer = document.getElementById("board-container");
window.addEventListener("resize", drawBoard);
var turnInfo = document.getElementById("turn-info");
drawBoard();
// game-buttons
var restartGameButton = document.getElementById("restart-game");
restartGameButton.addEventListener("click", function () {
    // open startGameModal
    startGameModal.style.display = "block";
});
var undoMoveButton = document.getElementById("undo-move");
undoMoveButton.addEventListener("click", function () {
    console.log("not yet implemented");
});
// debug-buttons
var toggleGridlinesButton = document.getElementById("toggle-gridlines");
toggleGridlinesButton.addEventListener("click", function () {
    showGridlines = !showGridlines;
    drawBoard();
});
var toggleBlockadesButton = document.getElementById("toggle-blockades");
toggleBlockadesButton.addEventListener("click", function () {
    showBlockades = !showBlockades;
    drawBoard();
});
// start / restart game Modal
var startGameModal = document.getElementById("startGameModal");
var startGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
startGameModalCloseButton.addEventListener("click", function () {
    startGameModal.style.display = "none";
});
var yellowStartsButton = document.getElementById("yellow-starts");
yellowStartsButton.addEventListener("click", function () {
    restartGame(true);
});
var redStartsButton = document.getElementById("red-starts");
redStartsButton.addEventListener("click", function () {
    restartGame(false);
});
startGameModal.style.display = "block";
// game won Modal
var gameWonModal = document.getElementById("gameWonModal");
var gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
gameWonModalCloseButton.addEventListener("click", function () {
    gameWonModal.style.display = "none";
});
var winnerInfo = document.getElementById("winner-info");
var restartGameAgainButton = document.getElementById("restart-game-again");
restartGameAgainButton.addEventListener("click", function () {
    gameWonModal.style.display = "none";
    startGameModal.style.display = "block";
});
var keepPlayingButton = document.getElementById("keep-playing");
keepPlayingButton.addEventListener("click", function () {
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
function restartGame(yellowStarts) {
    graph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
    graph.yellowsTurn = yellowStarts;
    startGameModal.style.display = "none";
    gameWonModalShown = false;
    drawBoard();
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxpQkFBaUIsRUFBRTtRQUNwRCxVQUFVLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQy9DLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNyQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7S0FDNUI7QUFDTCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsWUFBcUI7SUFDdEMsS0FBSyxHQUFHLElBQUkseUNBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsS0FBSyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7SUFDakMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3RDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztJQUMxQixTQUFTLEVBQUUsQ0FBQztBQUNoQixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTdGF0ZSB7XHJcbiAgICBlbXB0eSA9IFwiYmxhY2tcIixcclxuICAgIHllbGxvdyA9IFwiWWVsbG93XCIsXHJcbiAgICByZWQgPSBcIlJlZFwiLFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBzdGF0ZTogU3RhdGU7XHJcbiAgICBlZGdlczogTm9kZVtdO1xyXG4gICAgYmxvY2thZGVzOiBTZXQ8Tm9kZT47XHJcbiAgICBpZDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCB0aWxlc0Fjcm9zczogbnVtYmVyLCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmJsb2NrYWRlcyA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmlkID0geSAqIHRpbGVzQWNyb3NzICsgeDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIHllbGxvd3NUdXJuOiBib29sZWFuO1xyXG4gICAgdGlsZXNBY3Jvc3M6IG51bWJlcjtcclxuICAgIG5vZGVMaXN0OiBOb2RlW107XHJcbiAgICBnYW1lV29uOiBTdGF0ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dzVHVybjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubm9kZUxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0geWVsbG93c1R1cm47XHJcbiAgICAgICAgdGhpcy50aWxlc0Fjcm9zcyA9IHRpbGVzQWNyb3NzO1xyXG4gICAgICAgIHRoaXMuZ2FtZVdvbiA9IFN0YXRlLmVtcHR5O1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgYWxsIG5vZGVzIGluIGVtcHR5IHN0YXRlXHJcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aWxlc0Fjcm9zczsgeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGlsZXNBY3Jvc3M7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh4ID09IDAgfHwgeCA9PSB0aWxlc0Fjcm9zcyAtIDEpICYmICh5ID09IDAgfHwgeSA9PSB0aWxlc0Fjcm9zcyAtIDEpKSBjb250aW51ZTsgLy8gdGhlIGNvcm5lcnMgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZUxpc3QucHVzaChuZXcgTm9kZSh4LCB5LCB0aWxlc0Fjcm9zcywgU3RhdGUuZW1wdHkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUxpc3QuZmluZCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS54ID09IHggJiYgbm9kZS55ID09IHk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5UGxheWluZ05vZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuZ2V0Tm9kZSh4LCB5KTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbm9kZS5zdGF0ZSA9IHRoaXMueWVsbG93c1R1cm4gPyBTdGF0ZS55ZWxsb3cgOiBTdGF0ZS5yZWQ7XHJcblxyXG4gICAgICAgIGxldCBicmlkZ2VBZGRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB4IGFuZCB5IG9mIGFsbCA4IHBvdGVudGlhbCAoa25pZ2h0KW1vdmVzXHJcbiAgICAgICAgICAgIGxldCBpSW5CaW5hcnkgPSAoXCIwMDBcIiArIGkudG9TdHJpbmcoMikpLnNsaWNlKC0zKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFggPSBub2RlLnggKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMSA6IDIpICogKGlJbkJpbmFyeVsxXSA9PSBcIjBcIiA/IC0xIDogMSk7XHJcbiAgICAgICAgICAgIGxldCBwb3RlbnRpYWxZID0gbm9kZS55ICsgKGlJbkJpbmFyeVswXSA9PSBcIjBcIiA/IDIgOiAxKSAqIChpSW5CaW5hcnlbMl0gPT0gXCIwXCIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICAgICAgLy8gcG90ZW50aWFsTm9kZSBpcyBvbmUgb3V0IG9mIHRoZSA4IHN1cnJvdW5kaW5nIG5laWdoYm91cnMgdGhhdCBtaWdodCBoYXZlIHRoZSBzYW1lIGNvbG9yIGFuZCBjb3VsZCBiZSBjb25uZWN0ZWRcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsWCwgcG90ZW50aWFsWSk7XHJcbiAgICAgICAgICAgIGlmICghcG90ZW50aWFsTm9kZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChwb3RlbnRpYWxOb2RlLnN0YXRlICE9IG5vZGUuc3RhdGUpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVkZ2VBZGRlZCA9IHRoaXMuYWRkRWRnZShub2RlLCBwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICAgICAgaWYgKCFlZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRWRnZSB0byBwb3RlbnRpYWwgTm9kZSAoXCIgKyBwb3RlbnRpYWxOb2RlLnggKyBcIiwgXCIgKyBwb3RlbnRpYWxOb2RlLnkgKyBcIikgY291bGRuJ3QgYmUgYWRkZWRcIik7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmlkZ2VBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYnJpZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja1dpbkNvbmRpdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9ICF0aGlzLnllbGxvd3NUdXJuO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEVkZ2Uobm9kZTogTm9kZSwgcG90ZW50aWFsTm9kZTogTm9kZSkge1xyXG4gICAgICAgIGxldCB4RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnggLSBub2RlLnggPiAwO1xyXG4gICAgICAgIGxldCB5RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnkgLSBub2RlLnkgPiAwO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICAgdmRvd252ICAgICAgIF51cF5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgbm9kZSAgICBwb3RlbnRpYWxOb2RlMlxyXG4gICAgICAgICAqICAgbm9kZTEgICBwb3RlbnRpYWxOb2RlMVxyXG4gICAgICAgICAqICAgbm9kZTIgICBwb3RlbnRpYWxOb2RlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIGFwcGxpY2FibGUgaW4gb3RoZXIgcm90YXRpb25zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IG5vZGUxID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpLCBwb3RlbnRpYWxOb2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUxID0gdGhpcy5nZXROb2RlKG5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpLCBub2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSk7XHJcblxyXG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuZ2V0Tm9kZShub2RlMS54ICogMiAtIG5vZGUueCwgbm9kZTEueSAqIDIgLSBub2RlLnkpO1xyXG4gICAgICAgIGxldCBwb3RlbnRpYWxOb2RlMiA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxOb2RlMS54ICogMiAtIHBvdGVudGlhbE5vZGUueCwgcG90ZW50aWFsTm9kZTEueSAqIDIgLSBwb3RlbnRpYWxOb2RlLnkpO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgY29sbGlzaW9uc1xyXG4gICAgICAgIGlmIChub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUyKSB8fCBwb3RlbnRpYWxOb2RlMS5ibG9ja2FkZXMuaGFzKG5vZGUyKSB8fCBub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRCbG9ja2FkZSA9IChub2RlQTogTm9kZSwgbm9kZUI6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgbm9kZUEuYmxvY2thZGVzLmFkZChub2RlQik7XHJcbiAgICAgICAgICAgIG5vZGVCLmJsb2NrYWRlcy5hZGQobm9kZUEpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgYWRkQmxvY2thZGUobm9kZSwgbm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUxLCBwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlLCBwb3RlbnRpYWxOb2RlMSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZTEsIG5vZGUpO1xyXG5cclxuICAgICAgICAvLyBhZGQgYnJpZGdlIGJvdGggd2F5c1xyXG4gICAgICAgIG5vZGUuZWRnZXMucHVzaChwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICBwb3RlbnRpYWxOb2RlLmVkZ2VzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tXaW5Db25kaXRpb24oKSB7XHJcbiAgICAgICAgbGV0IG5vZGVRdWV1ZSA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMudGlsZXNBY3Jvc3MgLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9IHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLmdldE5vZGUoaSwgMCkgOiB0aGlzLmdldE5vZGUoMCwgaSk7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gU3RhdGUueWVsbG93KSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgc3RhcnROb2RlLnN0YXRlICE9IFN0YXRlLnJlZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBub2RlUXVldWUuYWRkKHN0YXJ0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGlvbkZvdW5kOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgbm9kZVF1ZXVlLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb25Gb3VuZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgbm9kZS55ID09IHRoaXMudGlsZXNBY3Jvc3MgLSAxKSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgbm9kZS54ID09IHRoaXMudGlsZXNBY3Jvc3MgLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbkZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIG5vZGVRdWV1ZS5hZGQobm9kZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChjb25uZWN0aW9uRm91bmQpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBHcmFwaCwgU3RhdGUgfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLy8gZ2FtZSBsb2dpY1xyXG5jb25zdCB0aWxlc0Fjcm9zczogbnVtYmVyID0gODtcclxudmFyIGdyYXBoOiBHcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgdHJ1ZSk7XHJcbmNvbnNvbGUubG9nKEdyYXBoKTtcclxuXHJcbi8vIHZpc3VhbHNcclxudmFyIGJvYXJkOiBhbnk7XHJcbnZhciBjdHg6IGFueTtcclxudmFyIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG52YXIgdGlsZVNpemU6IG51bWJlcjtcclxudmFyIGNvcm5lcnM6IG51bWJlcltdO1xyXG52YXIgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxudmFyIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbnZhciBnYW1lV29uTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IGJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIik7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRyYXdCb2FyZCk7XHJcbmNvbnN0IHR1cm5JbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0dXJuLWluZm9cIik7XHJcbmRyYXdCb2FyZCgpO1xyXG5cclxuLy8gZ2FtZS1idXR0b25zXHJcbmNvbnN0IHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG5yZXN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgLy8gb3BlbiBzdGFydEdhbWVNb2RhbFxyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufSk7XHJcbmNvbnN0IHVuZG9Nb3ZlQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidW5kby1tb3ZlXCIpO1xyXG51bmRvTW92ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJub3QgeWV0IGltcGxlbWVudGVkXCIpO1xyXG59KTtcclxuXHJcbi8vIGRlYnVnLWJ1dHRvbnNcclxuY29uc3QgdG9nZ2xlR3JpZGxpbmVzQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzaG93R3JpZGxpbmVzID0gIXNob3dHcmlkbGluZXM7XHJcbiAgICBkcmF3Qm9hcmQoKTtcclxufSk7XHJcbmNvbnN0IHRvZ2dsZUJsb2NrYWRlc0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1ibG9ja2FkZXNcIik7XHJcbnRvZ2dsZUJsb2NrYWRlc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgc2hvd0Jsb2NrYWRlcyA9ICFzaG93QmxvY2thZGVzO1xyXG4gICAgZHJhd0JvYXJkKCk7XHJcbn0pO1xyXG5cclxuLy8gc3RhcnQgLyByZXN0YXJ0IGdhbWUgTW9kYWxcclxudmFyIHN0YXJ0R2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydEdhbWVNb2RhbFwiKTtcclxudmFyIHN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF07XHJcbnN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufSk7XHJcbnZhciB5ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIik7XHJcbnllbGxvd1N0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgcmVzdGFydEdhbWUodHJ1ZSk7XHJcbn0pO1xyXG52YXIgcmVkU3RhcnRzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtc3RhcnRzXCIpO1xyXG5yZWRTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHJlc3RhcnRHYW1lKGZhbHNlKTtcclxufSk7XHJcbnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcblxyXG4vLyBnYW1lIHdvbiBNb2RhbFxyXG52YXIgZ2FtZVdvbk1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lV29uTW9kYWxcIik7XHJcbnZhciBnYW1lV29uTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVsxXTtcclxuZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG52YXIgd2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbnZhciByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lLWFnYWluXCIpO1xyXG5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufSk7XHJcbnZhciBrZWVwUGxheWluZ0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtlZXAtcGxheWluZ1wiKTtcclxua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gZHJhd0JvYXJkKCkge1xyXG4gICAgdHVybkluZm8uaW5uZXJIVE1MID0gXCJJdCdzIFwiICsgKGdyYXBoLnllbGxvd3NUdXJuID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCIpICsgXCIncyB0dXJuXCI7XHJcbiAgICBib2FyZENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIGNyZWF0ZUNhbnZhcygpO1xyXG4gICAgaWYgKHNob3dHcmlkbGluZXMpIHtcclxuICAgICAgICBkcmF3R3JpZGxpbmVzKCk7XHJcbiAgICB9XHJcbiAgICBkcmF3RmluaXNoTGluZXMoKTtcclxuXHJcbiAgICBncmFwaC5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0gbm9kZS54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcbiAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0gbm9kZS55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgaG9sZSBvciBwaW5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclksIHRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSB0aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG5vZGUuc3RhdGU7XHJcbiAgICAgICAgbm9kZS5lZGdlcy5mb3JFYWNoKChlZGdlKSA9PiB7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclkpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGVkZ2UueCAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyLCBlZGdlLnkgKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZHJhdyBibG9ja2FkZVxyXG4gICAgICAgIGlmICghc2hvd0Jsb2NrYWRlcykgcmV0dXJuO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBub2RlLmJsb2NrYWRlcy5mb3JFYWNoKChibG9jaykgPT4ge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhibG9jay54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIsIGJsb2NrLnkgKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMoKSB7XHJcbiAgICBib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICBib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgIGJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgIGJvYXJkLndpZHRoID0gYm9hcmRDb250YWluZXIuY2xpZW50V2lkdGggKiAwLjk4O1xyXG4gICAgYm9hcmQuaGVpZ2h0ID0gYm9hcmRDb250YWluZXIuY2xpZW50SGVpZ2h0ICogMC45ODtcclxuICAgIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBib2FyZENsaWNrZWQpO1xyXG4gICAgYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xyXG5cclxuICAgIGN0eCA9IGJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIGJvYXJkU2lkZUxlbmd0aCA9IGJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgdGlsZVNpemUgPSBib2FyZFNpZGVMZW5ndGggLyBncmFwaC50aWxlc0Fjcm9zcztcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0dyaWRsaW5lcygpIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IGJvYXJkU2lkZUxlbmd0aDsgbCArPSB0aWxlU2l6ZSkge1xyXG4gICAgICAgIGN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgY3R4LmxpbmVUbyhsLCBib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgY3R4LmxpbmVUbyhib2FyZFNpZGVMZW5ndGgsIGwpO1xyXG4gICAgfVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gMjU7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdGaW5pc2hMaW5lcygpIHtcclxuICAgIGNvcm5lcnMgPSBbdGlsZVNpemUsIHRpbGVTaXplICsgdGlsZVNpemUgLyA0LCBib2FyZFNpZGVMZW5ndGggLSB0aWxlU2l6ZSwgYm9hcmRTaWRlTGVuZ3RoIC0gdGlsZVNpemUgLSB0aWxlU2l6ZSAvIDRdO1xyXG5cclxuICAgIGN0eC5saW5lV2lkdGggPSB0aWxlU2l6ZSAvIDY7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjQ0NDRcIjtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1swXSwgY29ybmVyc1sxXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbMF0sIGNvcm5lcnNbM10pO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJzWzJdLCBjb3JuZXJzWzFdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyc1syXSwgY29ybmVyc1szXSk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lcnNbMV0sIGNvcm5lcnNbMF0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJzWzNdLCBjb3JuZXJzWzBdKTtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1sxXSwgY29ybmVyc1syXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbM10sIGNvcm5lcnNbMl0pO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBib2FyZENsaWNrZWQoZXZlbnQ6IHsgY3VycmVudFRhcmdldDogeyBnZXRCb3VuZGluZ0NsaWVudFJlY3Q6ICgpID0+IGFueSB9OyBjbGllbnRYOiBudW1iZXI7IGNsaWVudFk6IG51bWJlciB9KSB7XHJcbiAgICAvLyBjYWxjdWxhdGUgd2hpY2ggdGlsZSB3YXMgY2xpY2tlZCBmcm9tIGdsb2JhbCBjb29yZGluYXRlcyB0byBtYXRyaXggY29vcmRpbmF0ZXNcclxuICAgIHZhciByZWN0ID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aWxlU2l6ZSk7XHJcbiAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgLyB0aWxlU2l6ZSk7XHJcbiAgICAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgaWYgKCh4ID09IDAgfHwgeCA9PSBncmFwaC50aWxlc0Fjcm9zcyAtIDEpICYmICh5ID09IDAgfHwgeSA9PSBncmFwaC50aWxlc0Fjcm9zcyAtIDEpKSByZXR1cm47XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcblxyXG4gICAgbGV0IG5vZGVQbGF5ZWQgPSBncmFwaC50cnlQbGF5aW5nTm9kZSh4LCB5KTtcclxuICAgIGlmIChub2RlUGxheWVkKSB7XHJcbiAgICAgICAgZHJhd0JvYXJkKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZ3JhcGguZ2FtZVdvbiAhPSBTdGF0ZS5lbXB0eSAmJiAhZ2FtZVdvbk1vZGFsU2hvd24pIHtcclxuICAgICAgICB3aW5uZXJJbmZvLmlubmVySFRNTCA9IGdyYXBoLmdhbWVXb24gKyBcIiB3b24hXCI7XHJcbiAgICAgICAgZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgZ2FtZVdvbk1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXN0YXJ0R2FtZSh5ZWxsb3dTdGFydHM6IGJvb2xlYW4pIHtcclxuICAgIGdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB0cnVlKTtcclxuICAgIGdyYXBoLnllbGxvd3NUdXJuID0geWVsbG93U3RhcnRzO1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZ2FtZVdvbk1vZGFsU2hvd24gPSBmYWxzZTtcclxuICAgIGRyYXdCb2FyZCgpO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==