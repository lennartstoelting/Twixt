/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/controller.ts":
/*!***************************!*\
  !*** ./src/controller.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Controller: () => (/* binding */ Controller)
/* harmony export */ });
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");

// -------------------------------------------------
// global variables
// -------------------------------------------------
var tilesAcrossDefault = 6;
var Controller = /** @class */ (function () {
    function Controller() {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcrossDefault, true);
        this.history = [];
        this.yellowComp = false;
        this.redComp = false;
    }
    Controller.prototype.restartGame = function (yellowStarts) {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcrossDefault, yellowStarts);
        this.history = [];
    };
    Controller.prototype.tryPlacingPin = function (x, y) {
        var currGraph = this.mainGraph.clone();
        var pinPlaced = this.mainGraph.tryAddingNode(x, y);
        if (!pinPlaced)
            return false;
        this.history.push(currGraph);
        return true;
    };
    Controller.prototype.undoMove = function () {
        if (this.history.length == 0) {
            return false;
        }
        this.mainGraph = this.history.pop();
        return true;
    };
    return Controller;
}());



/***/ }),

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
    Graph.prototype.clone = function () {
        var clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.nodeList = structuredClone(this.nodeList);
        return clonedGraph;
    };
    Graph.prototype.getNode = function (x, y) {
        return this.nodeList.find(function (node) {
            return node.x == x && node.y == y;
        });
    };
    Graph.prototype.tryAddingNode = function (x, y) {
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
/* harmony import */ var _controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controller */ "./src/controller.ts");
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");


// -------------------------------------------------
// global variables
// -------------------------------------------------
// game logic
var controller = new _controller__WEBPACK_IMPORTED_MODULE_0__.Controller();
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
    controller.undoMove() ? drawBoard() : console.log("no more positions in history array");
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
// -------------------------------------------------
// player interactions
// -------------------------------------------------
function restartGame(yellowStarts) {
    controller.restartGame(yellowStarts);
    startGameModal.style.display = "none";
    gameWonModalShown = false;
    drawBoard();
}
// -------------------------------------------------
// refresh drawing of canvas
// -------------------------------------------------
function drawBoard() {
    turnInfo.innerHTML = "It's " + (controller.mainGraph.yellowsTurn ? "yellow" : "red") + "'s turn";
    boardContainer.innerHTML = "";
    createCanvas();
    if (showGridlines) {
        drawGridlines();
    }
    drawFinishLines();
    controller.mainGraph.nodeList.forEach(function (node) {
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
    tileSize = boardSideLength / controller.mainGraph.tilesAcross;
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
    if ((x == 0 || x == controller.mainGraph.tilesAcross - 1) && (y == 0 || y == controller.mainGraph.tilesAcross - 1))
        return;
    // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
    var nodePlayed = controller.tryPlacingPin(x, y);
    if (nodePlayed) {
        drawBoard();
    }
    if (controller.mainGraph.gameWon != _graph__WEBPACK_IMPORTED_MODULE_1__.State.empty && !gameWonModalShown) {
        winnerInfo.innerHTML = controller.mainGraph.gameWon + " won!";
        gameWonModal.style.display = "block";
        gameWonModalShown = true;
    }
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDM0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQzFELG1DQUFtQztJQUNuQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFBRSxPQUFPO0lBQzNILDZEQUE2RDtJQUU3RCxJQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRCxJQUFJLFVBQVUsRUFBRTtRQUNaLFNBQVMsRUFBRSxDQUFDO0tBQ2Y7SUFDRCxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxJQUFJLCtDQUFXLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtRQUNuRSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM5RCxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDckMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3R3aXh0Ly4vc3JjL2NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHcmFwaCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGdsb2JhbCB2YXJpYWJsZXNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxudmFyIHRpbGVzQWNyb3NzRGVmYXVsdCA9IDY7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciB7XHJcbiAgICBtYWluR3JhcGg6IEdyYXBoO1xyXG4gICAgaGlzdG9yeTogR3JhcGhbXTtcclxuICAgIHllbGxvd0NvbXA6IGJvb2xlYW47XHJcbiAgICByZWRDb21wOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dDb21wID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yZWRDb21wID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdGFydEdhbWUoeWVsbG93U3RhcnRzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3NEZWZhdWx0LCB5ZWxsb3dTdGFydHMpO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeVBsYWNpbmdQaW4oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VyckdyYXBoID0gdGhpcy5tYWluR3JhcGguY2xvbmUoKTtcclxuICAgICAgICBsZXQgcGluUGxhY2VkID0gdGhpcy5tYWluR3JhcGgudHJ5QWRkaW5nTm9kZSh4LCB5KTtcclxuICAgICAgICBpZiAoIXBpblBsYWNlZCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKGN1cnJHcmFwaCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdW5kb01vdmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gdGhpcy5oaXN0b3J5LnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBlbnVtIFN0YXRlIHtcclxuICAgIGVtcHR5ID0gXCJibGFja1wiLFxyXG4gICAgeWVsbG93ID0gXCJZZWxsb3dcIixcclxuICAgIHJlZCA9IFwiUmVkXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHN0YXRlOiBTdGF0ZTtcclxuICAgIGVkZ2VzOiBOb2RlW107XHJcbiAgICBibG9ja2FkZXM6IFNldDxOb2RlPjtcclxuICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHRpbGVzQWNyb3NzOiBudW1iZXIsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy5lZGdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmxvY2thZGVzID0gbmV3IFNldDxOb2RlPigpO1xyXG4gICAgICAgIHRoaXMuaWQgPSB5ICogdGlsZXNBY3Jvc3MgKyB4O1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGgge1xyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICB0aWxlc0Fjcm9zczogbnVtYmVyO1xyXG4gICAgbm9kZUxpc3Q6IE5vZGVbXTtcclxuICAgIGdhbWVXb246IFN0YXRlO1xyXG4gICAgZXZhbHVhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLnRpbGVzQWNyb3NzID0gdGlsZXNBY3Jvc3M7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uID0gU3RhdGUuZW1wdHk7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBhbGwgbm9kZXMgaW4gZW1wdHkgc3RhdGVcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRpbGVzQWNyb3NzOyB5KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc0Fjcm9zczsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRpbGVzQWNyb3NzIC0gMSkpIGNvbnRpbnVlOyAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdC5wdXNoKG5ldyBOb2RlKHgsIHksIHRpbGVzQWNyb3NzLCBTdGF0ZS5lbXB0eSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCkge1xyXG4gICAgICAgIGxldCBjbG9uZWRHcmFwaCA9IG5ldyBHcmFwaCh0aGlzLnRpbGVzQWNyb3NzLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5ub2RlTGlzdCA9IHN0cnVjdHVyZWRDbG9uZSh0aGlzLm5vZGVMaXN0KTtcclxuICAgICAgICByZXR1cm4gY2xvbmVkR3JhcGg7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMaXN0LmZpbmQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUueCA9PSB4ICYmIG5vZGUueSA9PSB5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeUFkZGluZ05vZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuZ2V0Tm9kZSh4LCB5KTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbm9kZS5zdGF0ZSA9IHRoaXMueWVsbG93c1R1cm4gPyBTdGF0ZS55ZWxsb3cgOiBTdGF0ZS5yZWQ7XHJcblxyXG4gICAgICAgIGxldCBicmlkZ2VBZGRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB4IGFuZCB5IG9mIGFsbCA4IHBvdGVudGlhbCAoa25pZ2h0KW1vdmVzXHJcbiAgICAgICAgICAgIGxldCBpSW5CaW5hcnkgPSAoXCIwMDBcIiArIGkudG9TdHJpbmcoMikpLnNsaWNlKC0zKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFggPSBub2RlLnggKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMSA6IDIpICogKGlJbkJpbmFyeVsxXSA9PSBcIjBcIiA/IC0xIDogMSk7XHJcbiAgICAgICAgICAgIGxldCBwb3RlbnRpYWxZID0gbm9kZS55ICsgKGlJbkJpbmFyeVswXSA9PSBcIjBcIiA/IDIgOiAxKSAqIChpSW5CaW5hcnlbMl0gPT0gXCIwXCIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICAgICAgLy8gcG90ZW50aWFsTm9kZSBpcyBvbmUgb3V0IG9mIHRoZSA4IHN1cnJvdW5kaW5nIG5laWdoYm91cnMgdGhhdCBtaWdodCBoYXZlIHRoZSBzYW1lIGNvbG9yIGFuZCBjb3VsZCBiZSBjb25uZWN0ZWRcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsWCwgcG90ZW50aWFsWSk7XHJcbiAgICAgICAgICAgIGlmICghcG90ZW50aWFsTm9kZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChwb3RlbnRpYWxOb2RlLnN0YXRlICE9IG5vZGUuc3RhdGUpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVkZ2VBZGRlZCA9IHRoaXMuYWRkRWRnZShub2RlLCBwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICAgICAgaWYgKCFlZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRWRnZSB0byBwb3RlbnRpYWwgTm9kZSAoXCIgKyBwb3RlbnRpYWxOb2RlLnggKyBcIiwgXCIgKyBwb3RlbnRpYWxOb2RlLnkgKyBcIikgY291bGRuJ3QgYmUgYWRkZWRcIik7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmlkZ2VBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYnJpZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja1dpbkNvbmRpdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9ICF0aGlzLnllbGxvd3NUdXJuO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgYWRkcyBhbiBFZGdlIGlmIHRoZSBjb25uZWN0aW9ucyBpc24ndCBibG9ja2VkXHJcbiAgICAvLyBUT0RPIGFkZCBhIGNoZWNrIHRoYXQgZW5zdXJlcyB0aGUgZWRnZSB0aGF0IGlzIGJlaW5nIGFkZGVkIGlzIGV4YWN0bHkgb25lIGtuaWdodCBtb3ZlIGF3YXkgdG8gcHJldmVudCBmdXR1cmUgYnVnc1xyXG4gICAgYWRkRWRnZShub2RlOiBOb2RlLCBwb3RlbnRpYWxOb2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbGV0IHhEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueCAtIG5vZGUueCA+IDA7XHJcbiAgICAgICAgbGV0IHlEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueSAtIG5vZGUueSA+IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICB2ZG93bnYgICAgICAgXnVwXlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBub2RlICAgIHBvdGVudGlhbE5vZGUyXHJcbiAgICAgICAgICogICBub2RlMSAgIHBvdGVudGlhbE5vZGUxXHJcbiAgICAgICAgICogICBub2RlMiAgIHBvdGVudGlhbE5vZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgYXBwbGljYWJsZSBpbiBvdGhlciByb3RhdGlvbnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgbm9kZTEgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsTm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSksIHBvdGVudGlhbE5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpKTtcclxuICAgICAgICBsZXQgcG90ZW50aWFsTm9kZTEgPSB0aGlzLmdldE5vZGUobm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSksIG5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpKTtcclxuXHJcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5nZXROb2RlKG5vZGUxLnggKiAyIC0gbm9kZS54LCBub2RlMS55ICogMiAtIG5vZGUueSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUyID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUxLnggKiAyIC0gcG90ZW50aWFsTm9kZS54LCBwb3RlbnRpYWxOb2RlMS55ICogMiAtIHBvdGVudGlhbE5vZGUueSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBjb2xsaXNpb25zXHJcbiAgICAgICAgaWYgKG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTIpIHx8IHBvdGVudGlhbE5vZGUxLmJsb2NrYWRlcy5oYXMobm9kZTIpIHx8IG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTEpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZEJsb2NrYWRlID0gKG5vZGVBOiBOb2RlLCBub2RlQjogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBub2RlQS5ibG9ja2FkZXMuYWRkKG5vZGVCKTtcclxuICAgICAgICAgICAgbm9kZUIuYmxvY2thZGVzLmFkZChub2RlQSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlLCBub2RlMSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUobm9kZTEsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdGVudGlhbE5vZGUsIHBvdGVudGlhbE5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlMSwgbm9kZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBicmlkZ2UgYm90aCB3YXlzXHJcbiAgICAgICAgbm9kZS5lZGdlcy5wdXNoKHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIHBvdGVudGlhbE5vZGUuZWRnZXMucHVzaChub2RlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1dpbkNvbmRpdGlvbigpIHtcclxuICAgICAgICBsZXQgbm9kZVF1ZXVlID0gbmV3IFNldDxOb2RlPigpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy50aWxlc0Fjcm9zcyAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3RhcnROb2RlID0gdGhpcy55ZWxsb3dzVHVybiA/IHRoaXMuZ2V0Tm9kZShpLCAwKSA6IHRoaXMuZ2V0Tm9kZSgwLCBpKTtcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSBTdGF0ZS55ZWxsb3cpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gU3RhdGUucmVkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIG5vZGVRdWV1ZS5hZGQoc3RhcnROb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0aW9uRm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBub2RlUXVldWUuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnkgPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnggPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbm9kZVF1ZXVlLmFkZChub2RlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGNvbm5lY3Rpb25Gb3VuZCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb24gPSB0aGlzLnllbGxvd3NUdXJuID8gU3RhdGUueWVsbG93IDogU3RhdGUucmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IENvbnRyb2xsZXIgfSBmcm9tIFwiLi9jb250cm9sbGVyXCI7XHJcbmltcG9ydCB7IEdyYXBoLCBTdGF0ZSB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGdsb2JhbCB2YXJpYWJsZXNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLy8gZ2FtZSBsb2dpY1xyXG52YXIgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XHJcblxyXG4vLyB2aXN1YWxzXHJcbnZhciBib2FyZDogYW55O1xyXG52YXIgY3R4OiBhbnk7XHJcbnZhciBib2FyZFNpZGVMZW5ndGg6IG51bWJlcjtcclxudmFyIHRpbGVTaXplOiBudW1iZXI7XHJcbnZhciBjb3JuZXJzOiBudW1iZXJbXTtcclxudmFyIHNob3dHcmlkbGluZXM6IGJvb2xlYW47XHJcbnZhciBzaG93QmxvY2thZGVzOiBib29sZWFuO1xyXG52YXIgZ2FtZVdvbk1vZGFsU2hvd246IGJvb2xlYW47IC8vIGhhcyB0aGUgcGxheWVyIGFscmVhZHkgc2VlbiB0aGUgZ2FtZSB3b24gTW9kYWwgYW5kIHdhbnRlZCB0byBrZWVwIHBsYXlpbmc/XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGRvbSBlbGVtZW50cyBhbmQgRXZlbnQgbGlzdGVuZXJzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IGJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIik7XHJcbmNvbnN0IHR1cm5JbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0dXJuLWluZm9cIik7XHJcbi8vIGdhbWUtYnV0dG9uc1xyXG5jb25zdCByZXN0YXJ0R2FtZUJ1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RhcnQtZ2FtZVwiKTtcclxuY29uc3QgdW5kb01vdmVCdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1bmRvLW1vdmVcIik7XHJcbi8vIGRlYnVnLWJ1dHRvbnNcclxuY29uc3QgdG9nZ2xlR3JpZGxpbmVzQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxuY29uc3QgdG9nZ2xlQmxvY2thZGVzQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKTtcclxuLy8gc3RhcnQgLyByZXN0YXJ0IGdhbWUgbW9kYWxcclxudmFyIHN0YXJ0R2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydEdhbWVNb2RhbFwiKTtcclxudmFyIHN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF07XHJcbnZhciB5ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIik7XHJcbnZhciByZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIik7XHJcbi8vIGdhbWUgd29uIG1vZGFsXHJcbnZhciBnYW1lV29uTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVXb25Nb2RhbFwiKTtcclxudmFyIGdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdO1xyXG52YXIgd2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbnZhciByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lLWFnYWluXCIpO1xyXG52YXIga2VlcFBsYXlpbmdCdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJrZWVwLXBsYXlpbmdcIik7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkcmF3Qm9hcmQpO1xyXG5cclxucmVzdGFydEdhbWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn0pO1xyXG51bmRvTW92ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgY29udHJvbGxlci51bmRvTW92ZSgpID8gZHJhd0JvYXJkKCkgOiBjb25zb2xlLmxvZyhcIm5vIG1vcmUgcG9zaXRpb25zIGluIGhpc3RvcnkgYXJyYXlcIik7XHJcbn0pO1xyXG50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHNob3dHcmlkbGluZXMgPSAhc2hvd0dyaWRsaW5lcztcclxuICAgIGRyYXdCb2FyZCgpO1xyXG59KTtcclxudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzaG93QmxvY2thZGVzID0gIXNob3dCbG9ja2FkZXM7XHJcbiAgICBkcmF3Qm9hcmQoKTtcclxufSk7XHJcblxyXG5zdGFydEdhbWVNb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHJlc3RhcnRHYW1lKHRydWUpO1xyXG59KTtcclxucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICByZXN0YXJ0R2FtZShmYWxzZSk7XHJcbn0pO1xyXG5cclxuZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufSk7XHJcbmtlZXBQbGF5aW5nQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBnYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59KTtcclxuXHJcbmRyYXdCb2FyZCgpO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBwbGF5ZXIgaW50ZXJhY3Rpb25zXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIHJlc3RhcnRHYW1lKHllbGxvd1N0YXJ0czogYm9vbGVhbikge1xyXG4gICAgY29udHJvbGxlci5yZXN0YXJ0R2FtZSh5ZWxsb3dTdGFydHMpO1xyXG4gICAgc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZ2FtZVdvbk1vZGFsU2hvd24gPSBmYWxzZTtcclxuICAgIGRyYXdCb2FyZCgpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIHJlZnJlc2ggZHJhd2luZyBvZiBjYW52YXNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gZHJhd0JvYXJkKCkge1xyXG4gICAgdHVybkluZm8uaW5uZXJIVE1MID0gXCJJdCdzIFwiICsgKGNvbnRyb2xsZXIubWFpbkdyYXBoLnllbGxvd3NUdXJuID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCIpICsgXCIncyB0dXJuXCI7XHJcbiAgICBib2FyZENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIGNyZWF0ZUNhbnZhcygpO1xyXG4gICAgaWYgKHNob3dHcmlkbGluZXMpIHtcclxuICAgICAgICBkcmF3R3JpZGxpbmVzKCk7XHJcbiAgICB9XHJcbiAgICBkcmF3RmluaXNoTGluZXMoKTtcclxuXHJcbiAgICBjb250cm9sbGVyLm1haW5HcmFwaC5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0gbm9kZS54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcbiAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0gbm9kZS55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgaG9sZSBvciBwaW5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclksIHRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSB0aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG5vZGUuc3RhdGU7XHJcbiAgICAgICAgbm9kZS5lZGdlcy5mb3JFYWNoKChlZGdlKSA9PiB7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclkpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGVkZ2UueCAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyLCBlZGdlLnkgKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZHJhdyBibG9ja2FkZVxyXG4gICAgICAgIGlmICghc2hvd0Jsb2NrYWRlcykgcmV0dXJuO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBub2RlLmJsb2NrYWRlcy5mb3JFYWNoKChibG9jaykgPT4ge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhibG9jay54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIsIGJsb2NrLnkgKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMoKSB7XHJcbiAgICBib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICBib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgIGJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgIGJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgIGJvYXJkLndpZHRoID0gYm9hcmRDb250YWluZXIuY2xpZW50V2lkdGggKiAwLjk4O1xyXG4gICAgYm9hcmQuaGVpZ2h0ID0gYm9hcmRDb250YWluZXIuY2xpZW50SGVpZ2h0ICogMC45ODtcclxuICAgIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBib2FyZENsaWNrZWQpO1xyXG4gICAgYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xyXG5cclxuICAgIGN0eCA9IGJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIGJvYXJkU2lkZUxlbmd0aCA9IGJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgdGlsZVNpemUgPSBib2FyZFNpZGVMZW5ndGggLyBjb250cm9sbGVyLm1haW5HcmFwaC50aWxlc0Fjcm9zcztcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0dyaWRsaW5lcygpIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IGJvYXJkU2lkZUxlbmd0aDsgbCArPSB0aWxlU2l6ZSkge1xyXG4gICAgICAgIGN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgY3R4LmxpbmVUbyhsLCBib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgY3R4LmxpbmVUbyhib2FyZFNpZGVMZW5ndGgsIGwpO1xyXG4gICAgfVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gMjU7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdGaW5pc2hMaW5lcygpIHtcclxuICAgIGNvcm5lcnMgPSBbdGlsZVNpemUsIHRpbGVTaXplICsgdGlsZVNpemUgLyA0LCBib2FyZFNpZGVMZW5ndGggLSB0aWxlU2l6ZSwgYm9hcmRTaWRlTGVuZ3RoIC0gdGlsZVNpemUgLSB0aWxlU2l6ZSAvIDRdO1xyXG5cclxuICAgIGN0eC5saW5lV2lkdGggPSB0aWxlU2l6ZSAvIDY7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjQ0NDRcIjtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1swXSwgY29ybmVyc1sxXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbMF0sIGNvcm5lcnNbM10pO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJzWzJdLCBjb3JuZXJzWzFdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyc1syXSwgY29ybmVyc1szXSk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lcnNbMV0sIGNvcm5lcnNbMF0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJzWzNdLCBjb3JuZXJzWzBdKTtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1sxXSwgY29ybmVyc1syXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbM10sIGNvcm5lcnNbMl0pO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBib2FyZENsaWNrZWQoZXZlbnQ6IHsgY3VycmVudFRhcmdldDogeyBnZXRCb3VuZGluZ0NsaWVudFJlY3Q6ICgpID0+IGFueSB9OyBjbGllbnRYOiBudW1iZXI7IGNsaWVudFk6IG51bWJlciB9KSB7XHJcbiAgICAvLyBjYWxjdWxhdGUgd2hpY2ggdGlsZSB3YXMgY2xpY2tlZCBmcm9tIGdsb2JhbCBjb29yZGluYXRlcyB0byBtYXRyaXggY29vcmRpbmF0ZXNcclxuICAgIHZhciByZWN0ID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aWxlU2l6ZSk7XHJcbiAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgLyB0aWxlU2l6ZSk7XHJcbiAgICAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgaWYgKCh4ID09IDAgfHwgeCA9PSBjb250cm9sbGVyLm1haW5HcmFwaC50aWxlc0Fjcm9zcyAtIDEpICYmICh5ID09IDAgfHwgeSA9PSBjb250cm9sbGVyLm1haW5HcmFwaC50aWxlc0Fjcm9zcyAtIDEpKSByZXR1cm47XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcblxyXG4gICAgbGV0IG5vZGVQbGF5ZWQgPSBjb250cm9sbGVyLnRyeVBsYWNpbmdQaW4oeCwgeSk7XHJcbiAgICBpZiAobm9kZVBsYXllZCkge1xyXG4gICAgICAgIGRyYXdCb2FyZCgpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbnRyb2xsZXIubWFpbkdyYXBoLmdhbWVXb24gIT0gU3RhdGUuZW1wdHkgJiYgIWdhbWVXb25Nb2RhbFNob3duKSB7XHJcbiAgICAgICAgd2lubmVySW5mby5pbm5lckhUTUwgPSBjb250cm9sbGVyLm1haW5HcmFwaC5nYW1lV29uICsgXCIgd29uIVwiO1xyXG4gICAgICAgIGdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIGdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=