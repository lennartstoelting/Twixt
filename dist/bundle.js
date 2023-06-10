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
    State["yellow"] = "yellow";
    State["red"] = "red";
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
            }
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
        // add invisible blockades
        this.addBlockade(node, node1);
        this.addBlockade(node1, potentialNode);
        this.addBlockade(potentialNode, potentialNode1);
        this.addBlockade(potentialNode1, node);
        // add bridge both ways
        node.edges.push(potentialNode);
        potentialNode.edges.push(node);
        return true;
    };
    Graph.prototype.addBlockade = function (nodeA, nodeB) {
        nodeA.blockades.add(nodeB);
        nodeB.blockades.add(nodeA);
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
// visuals
var board;
var ctx;
var boardSideLength;
var tileSize;
var corners;
var showGridlines;
var showBlockades;
// -------------------------------------------------
var boardContainer = document.getElementById("board-container");
window.addEventListener("resize", drawBoard);
var turnInfo = document.getElementById("turn-info");
drawBoard();
// game-buttons
var restartGameButton = document.getElementById("restart-game");
restartGameButton.addEventListener("click", function () {
    // open modal
    modal.style.display = "block";
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
// modal
var modal = document.getElementById("myModal");
var modalClose = document.getElementsByClassName("modal-close-button")[0];
modalClose.addEventListener("click", function () {
    // close modal on close-button
    modal.style.display = "none";
});
window.onclick = function (event) {
    // close modal when clicked outside of modal
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
var yellowStarts = document.getElementById("yellow-starts");
yellowStarts.addEventListener("click", function () {
    restartGame(true);
});
var redStarts = document.getElementById("red-starts");
redStarts.addEventListener("click", function () {
    restartGame(false);
});
modal.style.display = "block";
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
    ctx.strokeStyle = "#ffffaa";
    ctx.moveTo(corners[0], corners[1]);
    ctx.lineTo(corners[0], corners[3]);
    ctx.moveTo(corners[2], corners[1]);
    ctx.lineTo(corners[2], corners[3]);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#ff4444";
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
}
function restartGame(yellowStarts) {
    graph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
    graph.yellowsTurn = yellowStarts;
    modal.style.display = "none";
    drawBoard();
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUksQ0FBQyxDQUFDO0lBQ3JDLEtBQUssQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDO0lBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUM3QixTQUFTLEVBQUUsQ0FBQztBQUNoQixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTdGF0ZSB7XHJcbiAgICBlbXB0eSA9IFwiYmxhY2tcIixcclxuICAgIHllbGxvdyA9IFwieWVsbG93XCIsXHJcbiAgICByZWQgPSBcInJlZFwiLFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBzdGF0ZTogU3RhdGU7XHJcbiAgICBlZGdlczogTm9kZVtdO1xyXG4gICAgYmxvY2thZGVzOiBTZXQ8Tm9kZT47XHJcbiAgICBpZDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCB0aWxlc0Fjcm9zczogbnVtYmVyLCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmJsb2NrYWRlcyA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmlkID0geSAqIHRpbGVzQWNyb3NzICsgeDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIHllbGxvd3NUdXJuOiBib29sZWFuO1xyXG4gICAgdGlsZXNBY3Jvc3M6IG51bWJlcjtcclxuICAgIG5vZGVMaXN0OiBOb2RlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZXNBY3Jvc3M6IG51bWJlciwgeWVsbG93c1R1cm46IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm5vZGVMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMudGlsZXNBY3Jvc3MgPSB0aWxlc0Fjcm9zcztcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGFsbCBub2RlcyBpbiBlbXB0eSBzdGF0ZVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNBY3Jvc3M7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRpbGVzQWNyb3NzOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgoeCA9PSAwIHx8IHggPT0gdGlsZXNBY3Jvc3MgLSAxKSAmJiAoeSA9PSAwIHx8IHkgPT0gdGlsZXNBY3Jvc3MgLSAxKSkgY29udGludWU7IC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0LnB1c2gobmV3IE5vZGUoeCwgeSwgdGlsZXNBY3Jvc3MsIFN0YXRlLmVtcHR5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMaXN0LmZpbmQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUueCA9PSB4ICYmIG5vZGUueSA9PSB5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeVBsYXlpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLmdldE5vZGUoeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBub2RlLnN0YXRlID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHggYW5kIHkgb2YgYWxsIDggcG90ZW50aWFsIChrbmlnaHQpbW92ZXNcclxuICAgICAgICAgICAgbGV0IGlJbkJpbmFyeSA9IChcIjAwMFwiICsgaS50b1N0cmluZygyKSkuc2xpY2UoLTMpO1xyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsWCA9IG5vZGUueCArIChpSW5CaW5hcnlbMF0gPT0gXCIwXCIgPyAxIDogMikgKiAoaUluQmluYXJ5WzFdID09IFwiMFwiID8gLTEgOiAxKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFkgPSBub2RlLnkgKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMiA6IDEpICogKGlJbkJpbmFyeVsyXSA9PSBcIjBcIiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBwb3RlbnRpYWxOb2RlIGlzIG9uZSBvdXQgb2YgdGhlIDggc3Vycm91bmRpbmcgbmVpZ2hib3VycyB0aGF0IG1pZ2h0IGhhdmUgdGhlIHNhbWUgY29sb3IgYW5kIGNvdWxkIGJlIGNvbm5lY3RlZFxyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsTm9kZSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxYLCBwb3RlbnRpYWxZKTtcclxuICAgICAgICAgICAgaWYgKCFwb3RlbnRpYWxOb2RlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHBvdGVudGlhbE5vZGUuc3RhdGUgIT0gbm9kZS5zdGF0ZSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgZWRnZUFkZGVkID0gdGhpcy5hZGRFZGdlKG5vZGUsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIWVkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFZGdlIHRvIHBvdGVudGlhbCBOb2RlIChcIiArIHBvdGVudGlhbE5vZGUueCArIFwiLCBcIiArIHBvdGVudGlhbE5vZGUueSArIFwiKSBjb3VsZG4ndCBiZSBhZGRlZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9ICF0aGlzLnllbGxvd3NUdXJuO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEVkZ2Uobm9kZTogTm9kZSwgcG90ZW50aWFsTm9kZTogTm9kZSkge1xyXG4gICAgICAgIGxldCB4RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnggLSBub2RlLnggPiAwO1xyXG4gICAgICAgIGxldCB5RGlyZWN0aW9uUG9zaXRpdmUgPSBwb3RlbnRpYWxOb2RlLnkgLSBub2RlLnkgPiAwO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICAgdmRvd252ICAgICAgIF51cF5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgbm9kZSAgICBwb3RlbnRpYWxOb2RlMlxyXG4gICAgICAgICAqICAgbm9kZTEgICBwb3RlbnRpYWxOb2RlMVxyXG4gICAgICAgICAqICAgbm9kZTIgICBwb3RlbnRpYWxOb2RlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIGFwcGxpY2FibGUgaW4gb3RoZXIgcm90YXRpb25zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IG5vZGUxID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpLCBwb3RlbnRpYWxOb2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUxID0gdGhpcy5nZXROb2RlKG5vZGUueCArICh4RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpLCBub2RlLnkgKyAoeURpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSk7XHJcblxyXG4gICAgICAgIGxldCBub2RlMiA9IHRoaXMuZ2V0Tm9kZShub2RlMS54ICogMiAtIG5vZGUueCwgbm9kZTEueSAqIDIgLSBub2RlLnkpO1xyXG4gICAgICAgIGxldCBwb3RlbnRpYWxOb2RlMiA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxOb2RlMS54ICogMiAtIHBvdGVudGlhbE5vZGUueCwgcG90ZW50aWFsTm9kZTEueSAqIDIgLSBwb3RlbnRpYWxOb2RlLnkpO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgY29sbGlzaW9uc1xyXG4gICAgICAgIGlmIChub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUyKSB8fCBwb3RlbnRpYWxOb2RlMS5ibG9ja2FkZXMuaGFzKG5vZGUyKSB8fCBub2RlMS5ibG9ja2FkZXMuaGFzKHBvdGVudGlhbE5vZGUxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhZGQgaW52aXNpYmxlIGJsb2NrYWRlc1xyXG4gICAgICAgIHRoaXMuYWRkQmxvY2thZGUobm9kZSwgbm9kZTEpO1xyXG4gICAgICAgIHRoaXMuYWRkQmxvY2thZGUobm9kZTEsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIHRoaXMuYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZSwgcG90ZW50aWFsTm9kZTEpO1xyXG4gICAgICAgIHRoaXMuYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZTEsIG5vZGUpO1xyXG5cclxuICAgICAgICAvLyBhZGQgYnJpZGdlIGJvdGggd2F5c1xyXG4gICAgICAgIG5vZGUuZWRnZXMucHVzaChwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICBwb3RlbnRpYWxOb2RlLmVkZ2VzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQmxvY2thZGUobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSB7XHJcbiAgICAgICAgbm9kZUEuYmxvY2thZGVzLmFkZChub2RlQik7XHJcbiAgICAgICAgbm9kZUIuYmxvY2thZGVzLmFkZChub2RlQSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBHcmFwaCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyBnYW1lIGxvZ2ljXHJcbmNvbnN0IHRpbGVzQWNyb3NzOiBudW1iZXIgPSA4O1xyXG52YXIgZ3JhcGg6IEdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB0cnVlKTtcclxuXHJcbi8vIHZpc3VhbHNcclxudmFyIGJvYXJkOiBhbnk7XHJcbnZhciBjdHg6IGFueTtcclxudmFyIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG52YXIgdGlsZVNpemU6IG51bWJlcjtcclxudmFyIGNvcm5lcnM6IG51bWJlcltdO1xyXG52YXIgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxudmFyIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jb25zdCBib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtY29udGFpbmVyXCIpO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBkcmF3Qm9hcmQpO1xyXG5jb25zdCB0dXJuSW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHVybi1pbmZvXCIpO1xyXG5kcmF3Qm9hcmQoKTtcclxuXHJcbi8vIGdhbWUtYnV0dG9uc1xyXG5jb25zdCByZXN0YXJ0R2FtZUJ1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RhcnQtZ2FtZVwiKTtcclxucmVzdGFydEdhbWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIC8vIG9wZW4gbW9kYWxcclxuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn0pO1xyXG5jb25zdCB1bmRvTW92ZUJ1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxudW5kb01vdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwibm90IHlldCBpbXBsZW1lbnRlZFwiKTtcclxufSk7XHJcblxyXG4vLyBkZWJ1Zy1idXR0b25zXHJcbmNvbnN0IHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1ncmlkbGluZXNcIik7XHJcbnRvZ2dsZUdyaWRsaW5lc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgc2hvd0dyaWRsaW5lcyA9ICFzaG93R3JpZGxpbmVzO1xyXG4gICAgZHJhd0JvYXJkKCk7XHJcbn0pO1xyXG5jb25zdCB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtYmxvY2thZGVzXCIpO1xyXG50b2dnbGVCbG9ja2FkZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHNob3dCbG9ja2FkZXMgPSAhc2hvd0Jsb2NrYWRlcztcclxuICAgIGRyYXdCb2FyZCgpO1xyXG59KTtcclxuXHJcbi8vIG1vZGFsXHJcbnZhciBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNb2RhbFwiKTtcclxudmFyIG1vZGFsQ2xvc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2UtYnV0dG9uXCIpWzBdO1xyXG5tb2RhbENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAvLyBjbG9zZSBtb2RhbCBvbiBjbG9zZS1idXR0b25cclxuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufSk7XHJcbndpbmRvdy5vbmNsaWNrID0gKGV2ZW50KSA9PiB7XHJcbiAgICAvLyBjbG9zZSBtb2RhbCB3aGVuIGNsaWNrZWQgb3V0c2lkZSBvZiBtb2RhbFxyXG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PSBtb2RhbCkge1xyXG4gICAgICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH1cclxufTtcclxudmFyIHllbGxvd1N0YXJ0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LXN0YXJ0c1wiKTtcclxueWVsbG93U3RhcnRzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICByZXN0YXJ0R2FtZSh0cnVlKTtcclxufSk7XHJcbnZhciByZWRTdGFydHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIik7XHJcbnJlZFN0YXJ0cy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgcmVzdGFydEdhbWUoZmFsc2UpO1xyXG59KTtcclxubW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIGRyYXdCb2FyZCgpIHtcclxuICAgIHR1cm5JbmZvLmlubmVySFRNTCA9IFwiSXQncyBcIiArIChncmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiKSArIFwiJ3MgdHVyblwiO1xyXG4gICAgYm9hcmRDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICBjcmVhdGVDYW52YXMoKTtcclxuICAgIGlmIChzaG93R3JpZGxpbmVzKSB7XHJcbiAgICAgICAgZHJhd0dyaWRsaW5lcygpO1xyXG4gICAgfVxyXG4gICAgZHJhd0ZpbmlzaExpbmVzKCk7XHJcblxyXG4gICAgZ3JhcGgubm9kZUxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIGxldCBub2RlQ2VudGVyWCA9IG5vZGUueCAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyO1xyXG4gICAgICAgIGxldCBub2RlQ2VudGVyWSA9IG5vZGUueSAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyO1xyXG5cclxuICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmMobm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZLCB0aWxlU2l6ZSAvIDYsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gbm9kZS5zdGF0ZTtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gdGlsZVNpemUgLyAxMjtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhlZGdlLnggKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMiwgZWRnZS55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgYmxvY2thZGVcclxuICAgICAgICBpZiAoIXNob3dCbG9ja2FkZXMpIHJldHVybjtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgbm9kZS5ibG9ja2FkZXMuZm9yRWFjaCgoYmxvY2spID0+IHtcclxuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICBjdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8oYmxvY2sueCAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyLCBibG9jay55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzKCkge1xyXG4gICAgYm9hcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgYm9hcmQuaWQgPSBcImJvYXJkXCI7XHJcbiAgICBib2FyZC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJibHVlXCI7XHJcbiAgICBib2FyZC5zdHlsZS5ib3hTaGFkb3cgPSBcIjVweCA1cHggMjBweCBncmF5XCI7XHJcbiAgICBib2FyZC5zdHlsZS5ib3JkZXJSYWRpdXMgPSBcIjMlXCI7XHJcbiAgICBib2FyZC5zdHlsZS5tYXJnaW4gPSBcIjElXCI7XHJcbiAgICBib2FyZC53aWR0aCA9IGJvYXJkQ29udGFpbmVyLmNsaWVudFdpZHRoICogMC45ODtcclxuICAgIGJvYXJkLmhlaWdodCA9IGJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICBib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYm9hcmRDbGlja2VkKTtcclxuICAgIGJvYXJkQ29udGFpbmVyLmFwcGVuZENoaWxkKGJvYXJkKTtcclxuXHJcbiAgICBjdHggPSBib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICBib2FyZFNpZGVMZW5ndGggPSBib2FyZC5jbGllbnRXaWR0aDtcclxuICAgIHRpbGVTaXplID0gYm9hcmRTaWRlTGVuZ3RoIC8gZ3JhcGgudGlsZXNBY3Jvc3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdHcmlkbGluZXMoKSB7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBmb3IgKGxldCBsID0gMDsgbCA8PSBib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGlsZVNpemUpIHtcclxuICAgICAgICBjdHgubW92ZVRvKGwsIDApO1xyXG4gICAgICAgIGN0eC5saW5lVG8obCwgYm9hcmRTaWRlTGVuZ3RoKTtcclxuICAgICAgICBjdHgubW92ZVRvKDAsIGwpO1xyXG4gICAgICAgIGN0eC5saW5lVG8oYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgIH1cclxuICAgIGN0eC5saW5lV2lkdGggPSB0aWxlU2l6ZSAvIDI1O1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3RmluaXNoTGluZXMoKSB7XHJcbiAgICBjb3JuZXJzID0gW3RpbGVTaXplLCB0aWxlU2l6ZSArIHRpbGVTaXplIC8gNCwgYm9hcmRTaWRlTGVuZ3RoIC0gdGlsZVNpemUsIGJvYXJkU2lkZUxlbmd0aCAtIHRpbGVTaXplIC0gdGlsZVNpemUgLyA0XTtcclxuXHJcbiAgICBjdHgubGluZVdpZHRoID0gdGlsZVNpemUgLyA2O1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lcnNbMF0sIGNvcm5lcnNbMV0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJzWzBdLCBjb3JuZXJzWzNdKTtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyc1syXSwgY29ybmVyc1sxXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lcnNbMl0sIGNvcm5lcnNbM10pO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJzWzFdLCBjb3JuZXJzWzBdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyc1szXSwgY29ybmVyc1swXSk7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lcnNbMV0sIGNvcm5lcnNbMl0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJzWzNdLCBjb3JuZXJzWzJdKTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYm9hcmRDbGlja2VkKGV2ZW50OiB7IGN1cnJlbnRUYXJnZXQ6IHsgZ2V0Qm91bmRpbmdDbGllbnRSZWN0OiAoKSA9PiBhbnkgfTsgY2xpZW50WDogbnVtYmVyOyBjbGllbnRZOiBudW1iZXIgfSkge1xyXG4gICAgLy8gY2FsY3VsYXRlIHdoaWNoIHRpbGUgd2FzIGNsaWNrZWQgZnJvbSBnbG9iYWwgY29vcmRpbmF0ZXMgdG8gbWF0cml4IGNvb3JkaW5hdGVzXHJcbiAgICB2YXIgcmVjdCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICB2YXIgeCA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpIC8gdGlsZVNpemUpO1xyXG4gICAgdmFyIHkgPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApIC8gdGlsZVNpemUpO1xyXG4gICAgLy8gdGhlIGNvcm5lcnMgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgIGlmICgoeCA9PSAwIHx8IHggPT0gZ3JhcGgudGlsZXNBY3Jvc3MgLSAxKSAmJiAoeSA9PSAwIHx8IHkgPT0gZ3JhcGgudGlsZXNBY3Jvc3MgLSAxKSkgcmV0dXJuO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG5cclxuICAgIGxldCBub2RlUGxheWVkID0gZ3JhcGgudHJ5UGxheWluZ05vZGUoeCwgeSk7XHJcbiAgICBpZiAobm9kZVBsYXllZCkge1xyXG4gICAgICAgIGRyYXdCb2FyZCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXN0YXJ0R2FtZSh5ZWxsb3dTdGFydHM6IGJvb2xlYW4pIHtcclxuICAgIGdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB0cnVlKTtcclxuICAgIGdyYXBoLnllbGxvd3NUdXJuID0geWVsbG93U3RhcnRzO1xyXG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZHJhd0JvYXJkKCk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9