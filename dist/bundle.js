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
                console.log("Edge to potential Node (" + potentialNode.x + ", " + potentialNode.y + ") couln't be added");
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
var turnInfo = document.getElementById("info");
var board = document.getElementById("board");
var ctx = board.getContext("2d");
var boardSideLength = board.clientWidth;
var tilesAcross = 10;
var currGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
var tileSize = boardSideLength / currGraph.tilesAcross;
var corner = [tileSize, tileSize + tileSize / 4, boardSideLength - tileSize, boardSideLength - tileSize - tileSize / 4];
var showGridlines;
var toggleGridlinesButton = document.getElementById("toggleGridlines");
toggleGridlinesButton.addEventListener("click", function () {
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
yellowStarts.addEventListener("click", function () {
    restartGame(true);
});
var redStarts = document.getElementById("red-starts");
redStarts.addEventListener("click", function () {
    restartGame(false);
});
// When the user clicks on the button, open the modal
restartButton.onclick = function () {
    modal.style.display = "block";
};
// When the user clicks on <span> (x), close the modal
span.addEventListener("click", function () {
    modal.style.display = "none";
});
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
var undoButton = document.getElementById("undo");
undoButton.addEventListener("click", function () {
    console.log("undoing last move (coming soon)");
    // TODO
    // implement tracking the played moves and being able to revert those changes
});
// -------------------------------------------------
board.addEventListener("click", function (event) {
    // calculate which tile was clicked from global coordinates to matrix coordinates
    var rect = event.currentTarget.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / tileSize);
    var y = Math.floor((event.clientY - rect.top) / tileSize);
    // the corners of the playing field
    if ((x == 0 || x == currGraph.tilesAcross - 1) && (y == 0 || y == currGraph.tilesAcross - 1))
        return;
    // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
    var nodePlayed = currGraph.tryPlayingNode(x, y);
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
        for (var l = 0; l <= boardSideLength; l += tileSize) {
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
    currGraph.nodeList.forEach(function (node) {
        // center point of node
        var tileCenterX = node.x * tileSize + tileSize / 2;
        var tileCenterY = node.y * tileSize + tileSize / 2;
        ctx.fillStyle = node.state;
        ctx.strokeStyle = node.state;
        ctx.lineWidth = tileSize / 12;
        // draw hole or pin
        ctx.beginPath();
        ctx.arc(tileCenterX, tileCenterY, tileSize / 6, 0, 2 * Math.PI);
        ctx.fill();
        // draw bridges
        node.edges.forEach(function (edge) {
            ctx.beginPath();
            ctx.moveTo(tileCenterX, tileCenterY);
            ctx.lineTo(edge.x * tileSize + tileSize / 2, edge.y * tileSize + tileSize / 2);
            ctx.stroke();
        });
        // draw blockades (temp)
        ctx.strokeStyle = "#000000";
        node.blockades.forEach(function (block) {
            ctx.beginPath();
            ctx.moveTo(tileCenterX, tileCenterY);
            ctx.lineTo(block.x * tileSize + tileSize / 2, block.y * tileSize + tileSize / 2);
            ctx.stroke();
        });
    });
    turnInfo.innerHTML = "It's " + (currGraph.yellowsTurn ? "yellow" : "red") + "'s turn";
}
function restartGame(yellowStarts) {
    currGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, true);
    currGraph.yellowsTurn = yellowStarts;
    modal.style.display = "none";
    drawBoard();
}
drawBoard();
modal.style.display = "block";

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDN0IsU0FBUyxFQUFFLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsRUFBRSxDQUFDO0FBQ1osS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBTdGF0ZSB7XHJcbiAgICBlbXB0eSA9IFwiYmxhY2tcIixcclxuICAgIHllbGxvdyA9IFwieWVsbG93XCIsXHJcbiAgICByZWQgPSBcInJlZFwiLFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBzdGF0ZTogU3RhdGU7XHJcbiAgICBlZGdlczogTm9kZVtdO1xyXG4gICAgYmxvY2thZGVzOiBTZXQ8Tm9kZT47XHJcbiAgICBpZDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCB0aWxlc0Fjcm9zczogbnVtYmVyLCBzdGF0ZTogU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmJsb2NrYWRlcyA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmlkID0geSAqIHRpbGVzQWNyb3NzICsgeDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIHllbGxvd3NUdXJuOiBib29sZWFuO1xyXG4gICAgdGlsZXNBY3Jvc3M6IG51bWJlcjtcclxuICAgIG5vZGVMaXN0OiBOb2RlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZXNBY3Jvc3M6IG51bWJlciwgeWVsbG93c1R1cm46IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm5vZGVMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMudGlsZXNBY3Jvc3MgPSB0aWxlc0Fjcm9zcztcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGFsbCBub2RlcyBpbiBlbXB0eSBzdGF0ZVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNBY3Jvc3M7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRpbGVzQWNyb3NzOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgoeCA9PSAwIHx8IHggPT0gdGlsZXNBY3Jvc3MgLSAxKSAmJiAoeSA9PSAwIHx8IHkgPT0gdGlsZXNBY3Jvc3MgLSAxKSkgY29udGludWU7IC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVMaXN0LnB1c2gobmV3IE5vZGUoeCwgeSwgdGlsZXNBY3Jvc3MsIFN0YXRlLmVtcHR5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMaXN0LmZpbmQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUueCA9PSB4ICYmIG5vZGUueSA9PSB5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeVBsYXlpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLmdldE5vZGUoeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBub2RlLnN0YXRlID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHggYW5kIHkgb2YgYWxsIDggcG90ZW50aWFsIChrbmlnaHQpbW92ZXNcclxuICAgICAgICAgICAgbGV0IGlJbkJpbmFyeSA9IChcIjAwMFwiICsgaS50b1N0cmluZygyKSkuc2xpY2UoLTMpO1xyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsWCA9IG5vZGUueCArIChpSW5CaW5hcnlbMF0gPT0gXCIwXCIgPyAxIDogMikgKiAoaUluQmluYXJ5WzFdID09IFwiMFwiID8gLTEgOiAxKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFkgPSBub2RlLnkgKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMiA6IDEpICogKGlJbkJpbmFyeVsyXSA9PSBcIjBcIiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBwb3RlbnRpYWxOb2RlIGlzIG9uZSBvdXQgb2YgdGhlIDggc3Vycm91bmRpbmcgbmVpZ2hib3VycyB0aGF0IG1pZ2h0IGhhdmUgdGhlIHNhbWUgY29sb3IgYW5kIGNvdWxkIGJlIGNvbm5lY3RlZFxyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsTm9kZSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxYLCBwb3RlbnRpYWxZKTtcclxuICAgICAgICAgICAgaWYgKCFwb3RlbnRpYWxOb2RlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHBvdGVudGlhbE5vZGUuc3RhdGUgIT0gbm9kZS5zdGF0ZSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgZWRnZUFkZGVkID0gdGhpcy5hZGRFZGdlKG5vZGUsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIWVkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFZGdlIHRvIHBvdGVudGlhbCBOb2RlIChcIiArIHBvdGVudGlhbE5vZGUueCArIFwiLCBcIiArIHBvdGVudGlhbE5vZGUueSArIFwiKSBjb3Vsbid0IGJlIGFkZGVkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkRWRnZShub2RlOiBOb2RlLCBwb3RlbnRpYWxOb2RlOiBOb2RlKSB7XHJcbiAgICAgICAgbGV0IHhEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueCAtIG5vZGUueCA+IDA7XHJcbiAgICAgICAgbGV0IHlEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueSAtIG5vZGUueSA+IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICB2ZG93bnYgICAgICAgXnVwXlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBub2RlICAgIHBvdGVudGlhbE5vZGUyXHJcbiAgICAgICAgICogICBub2RlMSAgIHBvdGVudGlhbE5vZGUxXHJcbiAgICAgICAgICogICBub2RlMiAgIHBvdGVudGlhbE5vZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgYXBwbGljYWJsZSBpbiBvdGhlciByb3RhdGlvbnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgbm9kZTEgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsTm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSksIHBvdGVudGlhbE5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpKTtcclxuICAgICAgICBsZXQgcG90ZW50aWFsTm9kZTEgPSB0aGlzLmdldE5vZGUobm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSksIG5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpKTtcclxuXHJcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5nZXROb2RlKG5vZGUxLnggKiAyIC0gbm9kZS54LCBub2RlMS55ICogMiAtIG5vZGUueSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUyID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUxLnggKiAyIC0gcG90ZW50aWFsTm9kZS54LCBwb3RlbnRpYWxOb2RlMS55ICogMiAtIHBvdGVudGlhbE5vZGUueSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBjb2xsaXNpb25zXHJcbiAgICAgICAgaWYgKG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTIpIHx8IHBvdGVudGlhbE5vZGUxLmJsb2NrYWRlcy5oYXMobm9kZTIpIHx8IG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTEpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFkZCBpbnZpc2libGUgYmxvY2thZGVzXHJcbiAgICAgICAgdGhpcy5hZGRCbG9ja2FkZShub2RlLCBub2RlMSk7XHJcbiAgICAgICAgdGhpcy5hZGRCbG9ja2FkZShub2RlMSwgcG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgdGhpcy5hZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlLCBwb3RlbnRpYWxOb2RlMSk7XHJcbiAgICAgICAgdGhpcy5hZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlMSwgbm9kZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBicmlkZ2UgYm90aCB3YXlzXHJcbiAgICAgICAgbm9kZS5lZGdlcy5wdXNoKHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIHBvdGVudGlhbE5vZGUuZWRnZXMucHVzaChub2RlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRCbG9ja2FkZShub2RlQTogTm9kZSwgbm9kZUI6IE5vZGUpIHtcclxuICAgICAgICBub2RlQS5ibG9ja2FkZXMuYWRkKG5vZGVCKTtcclxuICAgICAgICBub2RlQi5ibG9ja2FkZXMuYWRkKG5vZGVBKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEdyYXBoLCBOb2RlLCBTdGF0ZSB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG52YXIgdHVybkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluZm9cIik7XHJcbmNvbnN0IGJvYXJkOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG5jb25zdCBjdHg6IGFueSA9IGJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuY29uc3QgYm9hcmRTaWRlTGVuZ3RoOiBudW1iZXIgPSBib2FyZC5jbGllbnRXaWR0aDtcclxuY29uc3QgdGlsZXNBY3Jvc3M6IG51bWJlciA9IDEwO1xyXG5cclxudmFyIGN1cnJHcmFwaDogR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3MsIHRydWUpO1xyXG5jb25zdCB0aWxlU2l6ZTogbnVtYmVyID0gYm9hcmRTaWRlTGVuZ3RoIC8gY3VyckdyYXBoLnRpbGVzQWNyb3NzO1xyXG5jb25zdCBjb3JuZXIgPSBbdGlsZVNpemUsIHRpbGVTaXplICsgdGlsZVNpemUgLyA0LCBib2FyZFNpZGVMZW5ndGggLSB0aWxlU2l6ZSwgYm9hcmRTaWRlTGVuZ3RoIC0gdGlsZVNpemUgLSB0aWxlU2l6ZSAvIDRdO1xyXG5cclxudmFyIHNob3dHcmlkbGluZXM6IGJvb2xlYW47XHJcbmNvbnN0IHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZUdyaWRsaW5lc1wiKTtcclxudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBzaG93R3JpZGxpbmVzID0gIXNob3dHcmlkbGluZXM7XHJcbiAgICBkcmF3Qm9hcmQoKTtcclxufSk7XHJcblxyXG4vLyBHZXQgdGhlIG1vZGFsXHJcbnZhciBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlNb2RhbFwiKTtcclxuXHJcbi8vIEdldCB0aGUgYnV0dG9uIHRoYXQgb3BlbnMgdGhlIG1vZGFsXHJcbnZhciByZXN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0XCIpO1xyXG5cclxuLy8gR2V0IHRoZSA8c3Bhbj4gZWxlbWVudCB0aGF0IGNsb3NlcyB0aGUgbW9kYWxcclxudmFyIHNwYW4gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2xvc2VcIilbMF07XHJcblxyXG52YXIgeWVsbG93U3RhcnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ5ZWxsb3ctc3RhcnRzXCIpO1xyXG55ZWxsb3dTdGFydHMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIHJlc3RhcnRHYW1lKHRydWUpO1xyXG59KTtcclxudmFyIHJlZFN0YXJ0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKTtcclxucmVkU3RhcnRzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICByZXN0YXJ0R2FtZShmYWxzZSk7XHJcbn0pO1xyXG5cclxuLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIGJ1dHRvbiwgb3BlbiB0aGUgbW9kYWxcclxucmVzdGFydEJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufTtcclxuXHJcbi8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIDxzcGFuPiAoeCksIGNsb3NlIHRoZSBtb2RhbFxyXG5zcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn0pO1xyXG5cclxuLy8gV2hlbiB0aGUgdXNlciBjbGlja3MgYW55d2hlcmUgb3V0c2lkZSBvZiB0aGUgbW9kYWwsIGNsb3NlIGl0XHJcbndpbmRvdy5vbmNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09IG1vZGFsKSB7XHJcbiAgICAgICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgdW5kb0J1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG9cIik7XHJcbnVuZG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwidW5kb2luZyBsYXN0IG1vdmUgKGNvbWluZyBzb29uKVwiKTtcclxuICAgIC8vIFRPRE9cclxuICAgIC8vIGltcGxlbWVudCB0cmFja2luZyB0aGUgcGxheWVkIG1vdmVzIGFuZCBiZWluZyBhYmxlIHRvIHJldmVydCB0aG9zZSBjaGFuZ2VzXHJcbn0pO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudDogeyBjdXJyZW50VGFyZ2V0OiB7IGdldEJvdW5kaW5nQ2xpZW50UmVjdDogKCkgPT4gYW55IH07IGNsaWVudFg6IG51bWJlcjsgY2xpZW50WTogbnVtYmVyIH0pID0+IHtcclxuICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgdmFyIHJlY3QgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgdmFyIHggPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHRpbGVTaXplKTtcclxuICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRpbGVTaXplKTtcclxuICAgIC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICBpZiAoKHggPT0gMCB8fCB4ID09IGN1cnJHcmFwaC50aWxlc0Fjcm9zcyAtIDEpICYmICh5ID09IDAgfHwgeSA9PSBjdXJyR3JhcGgudGlsZXNBY3Jvc3MgLSAxKSkgcmV0dXJuO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG5cclxuICAgIGxldCBub2RlUGxheWVkID0gY3VyckdyYXBoLnRyeVBsYXlpbmdOb2RlKHgsIHkpO1xyXG4gICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICBkcmF3Qm9hcmQoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBkcmF3Qm9hcmQoKSB7XHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGJvYXJkU2lkZUxlbmd0aCwgYm9hcmRTaWRlTGVuZ3RoKTtcclxuXHJcbiAgICAvLyBwcm9iYWJseSByZWR1bmRhbnQgaW4gdGhlIGZ1dHVyZVxyXG4gICAgaWYgKHNob3dHcmlkbGluZXMpIHtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRpbGVTaXplKSB7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8obCwgYm9hcmRTaWRlTGVuZ3RoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhib2FyZFNpZGVMZW5ndGgsIGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMTtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbmlzaCBsaW5lcyBvbiBhbGwgZm91ciBzaWRlc1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gNjtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZmZhYVwiO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJbMF0sIGNvcm5lclsxXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lclswXSwgY29ybmVyWzNdKTtcclxuICAgIGN0eC5tb3ZlVG8oY29ybmVyWzJdLCBjb3JuZXJbMV0pO1xyXG4gICAgY3R4LmxpbmVUbyhjb3JuZXJbMl0sIGNvcm5lclszXSk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY0NDQ0XCI7XHJcbiAgICBjdHgubW92ZVRvKGNvcm5lclsxXSwgY29ybmVyWzBdKTtcclxuICAgIGN0eC5saW5lVG8oY29ybmVyWzNdLCBjb3JuZXJbMF0pO1xyXG4gICAgY3R4Lm1vdmVUbyhjb3JuZXJbMV0sIGNvcm5lclsyXSk7XHJcbiAgICBjdHgubGluZVRvKGNvcm5lclszXSwgY29ybmVyWzJdKTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAvLyBkcmF3IGhvbGVzIGFuZCBwaW5zIGFuZCBicmlkZ2VzXHJcbiAgICBjdXJyR3JhcGgubm9kZUxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIC8vIGNlbnRlciBwb2ludCBvZiBub2RlXHJcbiAgICAgICAgbGV0IHRpbGVDZW50ZXJYID0gbm9kZS54ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcbiAgICAgICAgbGV0IHRpbGVDZW50ZXJZID0gbm9kZS55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG5vZGUuc3RhdGU7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHRpbGVTaXplIC8gMTI7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgaG9sZSBvciBwaW5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh0aWxlQ2VudGVyWCwgdGlsZUNlbnRlclksIHRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8odGlsZUNlbnRlclgsIHRpbGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhlZGdlLnggKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMiwgZWRnZS55ICogdGlsZVNpemUgKyB0aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGRyYXcgYmxvY2thZGVzICh0ZW1wKVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiIzAwMDAwMFwiO1xyXG4gICAgICAgIG5vZGUuYmxvY2thZGVzLmZvckVhY2goKGJsb2NrKSA9PiB7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyh0aWxlQ2VudGVyWCwgdGlsZUNlbnRlclkpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGJsb2NrLnggKiB0aWxlU2l6ZSArIHRpbGVTaXplIC8gMiwgYmxvY2sueSAqIHRpbGVTaXplICsgdGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdHVybkluZm8uaW5uZXJIVE1MID0gXCJJdCdzIFwiICsgKGN1cnJHcmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiKSArIFwiJ3MgdHVyblwiO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXN0YXJ0R2FtZSh5ZWxsb3dTdGFydHM6IGJvb2xlYW4pIHtcclxuICAgIGN1cnJHcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgdHJ1ZSk7XHJcbiAgICBjdXJyR3JhcGgueWVsbG93c1R1cm4gPSB5ZWxsb3dTdGFydHM7XHJcbiAgICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICBkcmF3Qm9hcmQoKTtcclxufVxyXG5cclxuZHJhd0JvYXJkKCk7XHJcbm1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==