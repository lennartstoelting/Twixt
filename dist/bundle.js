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
/* harmony export */   pointInDirectionOfIndex: () => (/* binding */ pointInDirectionOfIndex)
/* harmony export */ });
// export class Node {
//     x: number;
//     y: number;
//     state: number;
//     edges: Node[];
//     blockades: Set<Node>;
//     id: number;
//     constructor(x: number, y: number, tilesAcross: number, state: number) {
//         this.x = x;
//         this.y = y;
//         this.state = state;
//         this.edges = [];
//         this.blockades = new Set<Node>();
//         this.id = y * tilesAcross + x;
//     }
// }
// -------------------------------------------------
/**
 * for understanding the bitwise operations
 * https://www.w3schools.com/js/js_bitwise.asp
 */
var Graph = /** @class */ (function () {
    function Graph(tilesAcross, yellowsTurn) {
        this.yellowsTurn = yellowsTurn;
        this.tilesAcross = tilesAcross;
        this.gameWon = 0;
        this.matrix = Array(tilesAcross)
            .fill(0)
            .map(function () { return Array(tilesAcross).fill(0); });
        // corners, potentially easier to implement
        this.matrix[0][0] = 3;
        this.matrix[0][tilesAcross - 1] = 3;
        this.matrix[tilesAcross - 1][0] = 3;
        this.matrix[tilesAcross - 1][tilesAcross - 1] = 3;
    }
    Graph.prototype.clone = function () {
        var clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.matrix = structuredClone(this.matrix);
        return clonedGraph;
    };
    Graph.prototype.tryAddingNode = function (x, y) {
        if (this.matrix[x][y] != 0)
            return false;
        this.matrix[x][y] = this.yellowsTurn ? 1 : 2;
        // connect bridges
        var bridgeAdded = false;
        for (var i = 0; i < 8; i++) {
            var next = pointInDirectionOfIndex(x, y, i);
            // if outside or a corner or not the same color
            if (this.matrix[next.x] == undefined ||
                this.matrix[next.x][next.y] == undefined ||
                this.matrix[next.x][next.y] == 3 ||
                !((this.matrix[next.x][next.y] & 3) == (this.matrix[x][y] & 3))) {
                continue;
            }
            /**
             * TODO check for collisions
             * looks the easiest
             * https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
             * potentially better explained
             * https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
             */
            for (var i_1 = Math.min(y, next.y); i_1 <= Math.max(y, next.y); i_1++) {
                for (var j = Math.min(x, next.x); j <= Math.max(x, next.x); j++) {
                    // skip when it's one of the original connecting nodes
                    if ((j == x && i_1 == y) || (j == next.x && i_1 == next.y))
                        continue;
                    var bridges = this.matrix[j][i_1] >> 2;
                    if (!bridges)
                        continue;
                    console.log("checking for intersections at: ".concat([j, i_1]));
                    for (var k = 0; k < 8; k++) {
                        if (!(bridges & (Math.pow(2, k))))
                            continue;
                        var connectedCoord = pointInDirectionOfIndex(j, i_1, k);
                        var intersection = intersects(x, y, next.x, next.y, j, i_1, connectedCoord.x, connectedCoord.y);
                        if (intersection)
                            console.log("".concat([j, i_1], " is blocking this connection"));
                    }
                }
            }
            // add edge in both directions
            this.matrix[x][y] |= (Math.pow(2, i)) << 2;
            var otherDirection = i & 1 ? (i + 3) % 8 : (i + 5) % 8;
            this.matrix[next.x][next.y] |= (Math.pow(2, otherDirection)) << 2;
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
    /*
    addEdge(node: Node, potNode: Node): boolean {
        let xDirectionPositive = potNode.x - node.x > 0;
        let yDirectionPositive = potNode.y - node.y > 0;

        /*
         *   vdownv       ^up^
         *
         *   node    potNode2
         *   node1   potNode1
         *   node2   potNode
         *
         *   applicable in other rotations
         *
        let node1 = this.getNode(potNode.x + (xDirectionPositive ? -1 : 1), potNode.y + (yDirectionPositive ? -1 : 1));
        let potNode1 = this.getNode(node.x + (xDirectionPositive ? 1 : -1), node.y + (yDirectionPositive ? 1 : -1));

        let node2 = this.getNode(node1.x * 2 - node.x, node1.y * 2 - node.y);
        let potNode2 = this.getNode(potNode1.x * 2 - potNode.x, potNode1.y * 2 - potNode.y);

        // check for collisions
        if (node1.blockades.has(potNode2) || potNode1.blockades.has(node2) || node1.blockades.has(potNode1)) {
            return false;
        }

        const addBlockade = (nodeA: Node, nodeB: Node) => {
            nodeA.blockades.add(nodeB);
            nodeB.blockades.add(nodeA);
        };
        addBlockade(node, node1);
        addBlockade(node1, potNode);
        addBlockade(potNode, potNode1);
        addBlockade(potNode1, node);

        // add bridge both ways
        node.edges.push(potNode);
        potNode.edges.push(node);
        return true;
    }
    */
    Graph.prototype.checkWinCondition = function () {
        console.log("checking win condition...");
        // let nodeQueue = new Set<Node>();
        // for (let i = 1; i < this.tilesAcross - 1; i++) {
        //     let startNode = this.yellowsTurn ? this.getNode(i, 0) : this.getNode(0, i);
        //     if ((this.yellowsTurn && startNode.state != 1) || (!this.yellowsTurn && startNode.state != 2)) continue;
        //     nodeQueue.add(startNode);
        // }
        // let connectionFound: boolean = false;
        // nodeQueue.forEach((node) => {
        //     if (connectionFound) return;
        //     if ((this.yellowsTurn && node.y == this.tilesAcross - 1) || (!this.yellowsTurn && node.x == this.tilesAcross - 1)) {
        //         connectionFound = true;
        //         return;
        //     }
        //     node.edges.forEach((node) => {
        //         nodeQueue.add(node);
        //     });
        // });
        // if (connectionFound) {
        //     this.gameWon = this.yellowsTurn ? 1 : 2;
        // }
    };
    return Graph;
}());

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
function pointInDirectionOfIndex(x, y, directionIndex) {
    var newX = (directionIndex & 2 ? 1 : 2) * (directionIndex & 4 ? -1 : 1);
    var newY = (directionIndex & 2 ? 2 : 1) * (directionIndex & 1 ? -1 : 1);
    return { x: x + newX, y: y + newY };
}
function intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    }
    else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
}


/***/ }),

/***/ "./src/model.ts":
/*!**********************!*\
  !*** ./src/model.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");

// -------------------------------------------------
// global variables
// -------------------------------------------------
var Model = /** @class */ (function () {
    function Model(tilesAcross, yellowStarts) {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, yellowStarts);
        this.history = [];
    }
    Model.prototype.tryPlacingPin = function (x, y) {
        var currGraph = this.mainGraph.clone();
        var pinPlaced = this.mainGraph.tryAddingNode(x, y);
        if (!pinPlaced)
            return false;
        this.history.push(currGraph);
        return true;
    };
    Model.prototype.undoMove = function () {
        if (this.history.length == 0) {
            return false;
        }
        this.mainGraph = this.history.pop();
        return true;
    };
    return Model;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Model);


/***/ }),

/***/ "./src/view.ts":
/*!*********************!*\
  !*** ./src/view.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");

var View = /** @class */ (function () {
    function View() {
        this.whosTurn = document.getElementById("whos-turn");
        this.boardContainer = document.getElementById("board-container");
    }
    View.prototype.drawBoard = function (graph, gridlines, blockades) {
        var _this = this;
        this._createCanvas(graph);
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();
        graph.matrix.forEach(function (column, x) {
            column.forEach(function (entry, y) {
                if (entry == 3)
                    return;
                var nodeCenterX = x * _this.tileSize + _this.tileSize / 2;
                var nodeCenterY = y * _this.tileSize + _this.tileSize / 2;
                // draw hole or pin
                _this.ctx.beginPath();
                _this.ctx.arc(nodeCenterX, nodeCenterY, _this.tileSize / 6, 0, 2 * Math.PI);
                _this.ctx.fillStyle = _this._numberToColor(entry);
                _this.ctx.fill();
                // draw bridges
                _this.ctx.lineWidth = _this.tileSize / 12;
                _this.ctx.strokeStyle = _this._numberToColor(entry);
                var bridges = entry >> 2;
                if (!bridges)
                    return;
                for (var i = 0; i < 8; i++) {
                    if (!(bridges & (Math.pow(2, i))))
                        continue;
                    var connectedCoord = (0,_graph__WEBPACK_IMPORTED_MODULE_0__.pointInDirectionOfIndex)(x, y, i);
                    _this.ctx.beginPath();
                    _this.ctx.moveTo(nodeCenterX, nodeCenterY);
                    _this.ctx.lineTo(connectedCoord.x * _this.tileSize + _this.tileSize / 2, connectedCoord.y * _this.tileSize + _this.tileSize / 2);
                    _this.ctx.stroke();
                }
            });
        });
        // this line could be made shorter
        this.whosTurn.innerHTML = graph.yellowsTurn ? "yellow" : "red";
    };
    // this can probably be changed with clearRect instead of creating a whole new instance of the canvas
    View.prototype._createCanvas = function (graph) {
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
        this.tileSize = this.boardSideLength / graph.tilesAcross;
    };
    View.prototype._drawGridlines = function () {
        this.ctx.beginPath();
        for (var l = 0; l <= this.boardSideLength; l += this.tileSize) {
            this.ctx.moveTo(l, 0);
            this.ctx.lineTo(l, this.boardSideLength);
            this.ctx.moveTo(0, l);
            this.ctx.lineTo(this.boardSideLength, l);
        }
        this.ctx.lineWidth = this.tileSize / 25;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
    };
    View.prototype._drawFinishLines = function () {
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
    };
    View.prototype._numberToColor = function (value) {
        if (value == 0) {
            return "black";
        }
        if (value & 1) {
            return "yellow";
        }
        if (value & 2) {
            return "red";
        }
    };
    return View;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (View);


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
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model */ "./src/model.ts");
/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view */ "./src/view.ts");


/** handles all input, checks in with model and displays the result with view */
var tilesAcrossDefault = 6;
var Controller = /** @class */ (function () {
    function Controller() {
        var _this = this;
        this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"](tilesAcrossDefault, true);
        this.view = new _view__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.updateView();
        this.restartGameButton = document.getElementById("restart-game");
        this.undoMoveButton = document.getElementById("undo-move");
        this.toggleGridlinesButton = document.getElementById("toggle-gridlines");
        this.toggleBlockadesButton = document.getElementById("toggle-blockades");
        this.startGameModal = document.getElementById("startGameModal");
        this.startGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
        this.yellowStartsButton = document.getElementById("yellow-starts");
        this.redStartsButton = document.getElementById("red-starts");
        this.gameWonModal = document.getElementById("gameWonModal");
        this.gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
        this.winnerInfo = document.getElementById("winner-info");
        this.restartGameAgainButton = document.getElementById("restart-game-again");
        this.keepPlayingButton = document.getElementById("keep-playing");
        window.addEventListener("resize", function () {
            _this.updateView();
        });
        this.restartGameButton.addEventListener("click", function () {
            _this.startGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", function () {
            _this.model.undoMove() ? _this.updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", function () {
            _this.showGridlines = !_this.showGridlines;
            _this.updateView();
        });
        this.toggleBlockadesButton.addEventListener("click", function () {
            _this.showBlockades = !_this.showBlockades;
            _this.updateView();
            console.table(transpose(_this.model.mainGraph.matrix, 10));
        });
        this.startGameModalCloseButton.addEventListener("click", function () {
            _this.startGameModal.style.display = "none";
        });
        this.yellowStartsButton.addEventListener("click", function () {
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"](tilesAcrossDefault, true);
            _this.updateView();
            _this.startGameModal.style.display = "none";
            _this.gameWonModalShown = false;
        });
        this.redStartsButton.addEventListener("click", function () {
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"](tilesAcrossDefault, false);
            _this.updateView();
            _this.startGameModal.style.display = "none";
            _this.gameWonModalShown = false;
        });
        this.gameWonModalCloseButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.gameWonModalShown = true;
        });
        this.restartGameAgainButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.startGameModal.style.display = "block";
        });
        this.keepPlayingButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.gameWonModalShown = true;
        });
    }
    Controller.prototype.updateView = function () {
        var _this = this;
        this.view.drawBoard(this.model.mainGraph, this.showGridlines, this.showBlockades);
        this.view.board.addEventListener("click", function () { return _this.boardClicked(event); });
    };
    Controller.prototype.boardClicked = function (event) {
        var rect = this.view.board.getBoundingClientRect();
        // calculate which tile was clicked from global coordinates to matrix coordinates
        var x = Math.floor((event.clientX - rect.left) / this.view.tileSize);
        var y = Math.floor((event.clientY - rect.top) / this.view.tileSize);
        // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
        var nodePlayed = this.model.tryPlacingPin(x, y);
        if (nodePlayed) {
            this.updateView();
        }
        if (this.model.mainGraph.gameWon != 0 && !this.gameWonModalShown) {
            this.winnerInfo.innerHTML = this.model.mainGraph.gameWon + " won!";
            this.gameWonModal.style.display = "block";
            this.gameWonModalShown = true;
        }
    };
    return Controller;
}());
var app = new Controller();
// mostly for console.table() but also potentially for transposition
function transpose(a, numeral) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return numeral == 10 ? r[c] : r[c].toString(numeral);
        });
    });
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQUFzQjtBQUN0QixpQkFBaUI7QUFDakIsaUJBQWlCO0FBQ2pCLHFCQUFxQjtBQUNyQixxQkFBcUI7QUFDckIsNEJBQTRCO0FBQzVCLGtCQUFrQjtBQUVsQiw4RUFBOEU7QUFDOUUsc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUN0Qiw4QkFBOEI7QUFDOUIsMkJBQTJCO0FBQzNCLDRDQUE0QztBQUM1Qyx5Q0FBeUM7QUFDekMsUUFBUTtBQUNSLElBQUk7QUFFSixvREFBb0Q7QUFFcEQ7OztHQUdHO0FBRUg7SUFTSSxlQUFZLFdBQW1CLEVBQUUsV0FBb0I7UUFDakQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO2FBQzNCLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDUCxHQUFHLENBQUMsY0FBTSxZQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7UUFFM0MsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQscUJBQUssR0FBTDtRQUNJLElBQUksV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hFLFdBQVcsQ0FBQyxNQUFNLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRUQsNkJBQWEsR0FBYixVQUFjLENBQVMsRUFBRSxDQUFTO1FBQzlCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QyxrQkFBa0I7UUFDbEIsSUFBSSxXQUFXLEdBQVksS0FBSyxDQUFDO1FBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsSUFBSSxJQUFJLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU1QywrQ0FBK0M7WUFDL0MsSUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTO2dCQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUztnQkFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDakU7Z0JBQ0UsU0FBUzthQUNaO1lBRUQ7Ozs7OztlQU1HO1lBRUgsS0FBSyxJQUFJLEdBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLEVBQUUsRUFBRTtnQkFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0Qsc0RBQXNEO29CQUN0RCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFBRSxTQUFTO29CQUVqRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckMsSUFBSSxDQUFDLE9BQU87d0JBQUUsU0FBUztvQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBa0MsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUUsQ0FBQyxDQUFDO29CQUV4RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN4QixJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFDLEVBQUksQ0FBQyxFQUFDLENBQUM7NEJBQUUsU0FBUzt3QkFFcEMsSUFBSSxjQUFjLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDdEQsSUFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlGLElBQUksWUFBWTs0QkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLGlDQUE4QixDQUFDLENBQUM7cUJBQzFFO2lCQUNKO2FBQ0o7WUFFRCw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBSSxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFJLGNBQWMsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxXQUFXLEVBQUU7WUFDYixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUM1QjtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsb0hBQW9IO0lBQ3BIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF1Q0U7SUFFRixpQ0FBaUIsR0FBakI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDekMsbUNBQW1DO1FBQ25DLG1EQUFtRDtRQUNuRCxrRkFBa0Y7UUFDbEYsK0dBQStHO1FBQy9HLGdDQUFnQztRQUNoQyxJQUFJO1FBRUosd0NBQXdDO1FBQ3hDLGdDQUFnQztRQUNoQyxtQ0FBbUM7UUFDbkMsMkhBQTJIO1FBQzNILGtDQUFrQztRQUNsQyxrQkFBa0I7UUFDbEIsUUFBUTtRQUNSLHFDQUFxQztRQUNyQywrQkFBK0I7UUFDL0IsVUFBVTtRQUNWLE1BQU07UUFDTix5QkFBeUI7UUFDekIsK0NBQStDO1FBQy9DLElBQUk7SUFDUixDQUFDO0lBQ0wsWUFBQztBQUFELENBQUM7O0FBRUQsd0ZBQXdGO0FBQ2pGLFNBQVMsdUJBQXVCLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxjQUFzQjtJQUNoRixJQUFJLElBQUksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ3hDLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztJQUN0RyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDWCxPQUFPLEtBQUssQ0FBQztLQUNoQjtTQUFNO1FBQ0gsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDdkQsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDdEQsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQzdEO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQzNNK0I7QUFFaEMsb0RBQW9EO0FBQ3BELG1CQUFtQjtBQUNuQixvREFBb0Q7QUFFcEQ7SUFJSSxlQUFZLFdBQW1CLEVBQUUsWUFBcUI7UUFDbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLHlDQUFLLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCw2QkFBYSxHQUFiLFVBQWMsQ0FBUyxFQUFFLENBQVM7UUFDOUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsd0JBQVEsR0FBUjtRQUNJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQzFCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0FBQztBQUVELGlFQUFlLEtBQUssRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ2hDb0M7QUFFekQ7SUFVSTtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsd0JBQVMsR0FBVCxVQUFVLEtBQVksRUFBRSxTQUFrQixFQUFFLFNBQWtCO1FBQTlELGlCQXlDQztRQXhDRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLElBQUksU0FBUyxFQUFFO1lBQ1gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksS0FBSyxJQUFJLENBQUM7b0JBQUUsT0FBTztnQkFFdkIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEtBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ3hELElBQUksV0FBVyxHQUFHLENBQUMsR0FBRyxLQUFJLENBQUMsUUFBUSxHQUFHLEtBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUV4RCxtQkFBbUI7Z0JBQ25CLEtBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3JCLEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsS0FBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFFLEtBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hELEtBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRWhCLGVBQWU7Z0JBQ2YsS0FBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7Z0JBQ3hDLEtBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xELElBQUksT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPO29CQUFFLE9BQU87Z0JBRXJCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQUMsRUFBSSxDQUFDLEVBQUMsQ0FBQzt3QkFBRSxTQUFTO29CQUVwQyxJQUFJLGNBQWMsR0FBRywrREFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUV0RCxLQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNyQixLQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQzFDLEtBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsS0FBSSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDNUgsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDckI7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ25FLENBQUM7SUFFRCxxR0FBcUc7SUFDN0YsNEJBQWEsR0FBckIsVUFBc0IsS0FBWTtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQzVELElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQzdELENBQUM7SUFFTyw2QkFBYyxHQUF0QjtRQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU8sK0JBQWdCLEdBQXhCO1FBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNYLElBQUksQ0FBQyxRQUFRO1lBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7WUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUTtZQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO1NBQzNELENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWxCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEIs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LE9BQU8sQ0FBQztZQUNuRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQzFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQUFDO0FBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUU3QixvRUFBb0U7QUFDcEUsU0FBUyxTQUFTLENBQUMsQ0FBYSxFQUFFLE9BQWU7SUFDN0MsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQU07UUFDekMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUNwQixPQUFPLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3R3aXh0Ly4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL21vZGVsLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHBvcnQgY2xhc3MgTm9kZSB7XHJcbi8vICAgICB4OiBudW1iZXI7XHJcbi8vICAgICB5OiBudW1iZXI7XHJcbi8vICAgICBzdGF0ZTogbnVtYmVyO1xyXG4vLyAgICAgZWRnZXM6IE5vZGVbXTtcclxuLy8gICAgIGJsb2NrYWRlczogU2V0PE5vZGU+O1xyXG4vLyAgICAgaWQ6IG51bWJlcjtcclxuXHJcbi8vICAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgdGlsZXNBY3Jvc3M6IG51bWJlciwgc3RhdGU6IG51bWJlcikge1xyXG4vLyAgICAgICAgIHRoaXMueCA9IHg7XHJcbi8vICAgICAgICAgdGhpcy55ID0geTtcclxuLy8gICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbi8vICAgICAgICAgdGhpcy5lZGdlcyA9IFtdO1xyXG4vLyAgICAgICAgIHRoaXMuYmxvY2thZGVzID0gbmV3IFNldDxOb2RlPigpO1xyXG4vLyAgICAgICAgIHRoaXMuaWQgPSB5ICogdGlsZXNBY3Jvc3MgKyB4O1xyXG4vLyAgICAgfVxyXG4vLyB9XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogZm9yIHVuZGVyc3RhbmRpbmcgdGhlIGJpdHdpc2Ugb3BlcmF0aW9uc1xyXG4gKiBodHRwczovL3d3dy53M3NjaG9vbHMuY29tL2pzL2pzX2JpdHdpc2UuYXNwXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIHRpbGVzQWNyb3NzOiBudW1iZXI7XHJcblxyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICBnYW1lV29uOiBudW1iZXI7XHJcbiAgICBldmFsdWF0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgbWF0cml4OiBudW1iZXJbXVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMudGlsZXNBY3Jvc3MgPSB0aWxlc0Fjcm9zcztcclxuICAgICAgICB0aGlzLmdhbWVXb24gPSAwO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gQXJyYXkodGlsZXNBY3Jvc3MpXHJcbiAgICAgICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgICAgIC5tYXAoKCkgPT4gQXJyYXkodGlsZXNBY3Jvc3MpLmZpbGwoMCkpO1xyXG5cclxuICAgICAgICAvLyBjb3JuZXJzLCBwb3RlbnRpYWxseSBlYXNpZXIgdG8gaW1wbGVtZW50XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbMF1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4WzBdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bdGlsZXNBY3Jvc3MgLSAxXSA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvbmUoKTogR3JhcGgge1xyXG4gICAgICAgIGxldCBjbG9uZWRHcmFwaCA9IG5ldyBHcmFwaCh0aGlzLnRpbGVzQWNyb3NzLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5tYXRyaXggPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgIHJldHVybiBjbG9uZWRHcmFwaDtcclxuICAgIH1cclxuXHJcbiAgICB0cnlBZGRpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMubWF0cml4W3hdW3ldICE9IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLm1hdHJpeFt4XVt5XSA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuXHJcbiAgICAgICAgLy8gY29ubmVjdCBicmlkZ2VzXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4LCB5LCBpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG91dHNpZGUgb3IgYSBjb3JuZXIgb3Igbm90IHRoZSBzYW1lIGNvbG9yXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W25leHQueF0gPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtuZXh0LnhdW25leHQueV0gPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtuZXh0LnhdW25leHQueV0gPT0gMyB8fFxyXG4gICAgICAgICAgICAgICAgISgodGhpcy5tYXRyaXhbbmV4dC54XVtuZXh0LnldICYgMykgPT0gKHRoaXMubWF0cml4W3hdW3ldICYgMykpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBUT0RPIGNoZWNrIGZvciBjb2xsaXNpb25zXHJcbiAgICAgICAgICAgICAqIGxvb2tzIHRoZSBlYXNpZXN0XHJcbiAgICAgICAgICAgICAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkwNDM4MDUvdGVzdC1pZi10d28tbGluZXMtaW50ZXJzZWN0LWphdmFzY3JpcHQtZnVuY3Rpb25cclxuICAgICAgICAgICAgICogcG90ZW50aWFsbHkgYmV0dGVyIGV4cGxhaW5lZFxyXG4gICAgICAgICAgICAgKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjMxOTgvaG93LWRvLXlvdS1kZXRlY3Qtd2hlcmUtdHdvLWxpbmUtc2VnbWVudHMtaW50ZXJzZWN0XHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IE1hdGgubWluKHksIG5leHQueSk7IGkgPD0gTWF0aC5tYXgoeSwgbmV4dC55KTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gTWF0aC5taW4oeCwgbmV4dC54KTsgaiA8PSBNYXRoLm1heCh4LCBuZXh0LngpOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBza2lwIHdoZW4gaXQncyBvbmUgb2YgdGhlIG9yaWdpbmFsIGNvbm5lY3Rpbmcgbm9kZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKGogPT0geCAmJiBpID09IHkpIHx8IChqID09IG5leHQueCAmJiBpID09IG5leHQueSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJpZGdlcyA9IHRoaXMubWF0cml4W2pdW2ldID4+IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgY2hlY2tpbmcgZm9yIGludGVyc2VjdGlvbnMgYXQ6ICR7W2osIGldfWApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IDg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShicmlkZ2VzICYgKDIgKiogaykpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0ZWRDb29yZCA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KGosIGksIGspO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9uID0gaW50ZXJzZWN0cyh4LCB5LCBuZXh0LngsIG5leHQueSwgaiwgaSwgY29ubmVjdGVkQ29vcmQueCwgY29ubmVjdGVkQ29vcmQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3Rpb24pIGNvbnNvbGUubG9nKGAke1tqLCBpXX0gaXMgYmxvY2tpbmcgdGhpcyBjb25uZWN0aW9uYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgZWRnZSBpbiBib3RoIGRpcmVjdGlvbnNcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbeF1beV0gfD0gKDIgKiogaSkgPDwgMjtcclxuICAgICAgICAgICAgbGV0IG90aGVyRGlyZWN0aW9uID0gaSAmIDEgPyAoaSArIDMpICUgOCA6IChpICsgNSkgJSA4O1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtuZXh0LnhdW25leHQueV0gfD0gKDIgKiogb3RoZXJEaXJlY3Rpb24pIDw8IDI7XHJcbiAgICAgICAgICAgIGJyaWRnZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChicmlkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrV2luQ29uZGl0aW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSBhZGRzIGFuIEVkZ2UgaWYgdGhlIGNvbm5lY3Rpb25zIGlzbid0IGJsb2NrZWRcclxuICAgIC8vIFRPRE8gYWRkIGEgY2hlY2sgdGhhdCBlbnN1cmVzIHRoZSBlZGdlIHRoYXQgaXMgYmVpbmcgYWRkZWQgaXMgZXhhY3RseSBvbmUga25pZ2h0IG1vdmUgYXdheSB0byBwcmV2ZW50IGZ1dHVyZSBidWdzXHJcbiAgICAvKlxyXG4gICAgYWRkRWRnZShub2RlOiBOb2RlLCBwb3ROb2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHhEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdE5vZGUueCAtIG5vZGUueCA+IDA7XHJcbiAgICAgICAgbGV0IHlEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdE5vZGUueSAtIG5vZGUueSA+IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICB2ZG93bnYgICAgICAgXnVwXlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBub2RlICAgIHBvdE5vZGUyXHJcbiAgICAgICAgICogICBub2RlMSAgIHBvdE5vZGUxXHJcbiAgICAgICAgICogICBub2RlMiAgIHBvdE5vZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgYXBwbGljYWJsZSBpbiBvdGhlciByb3RhdGlvbnNcclxuICAgICAgICAgKlxyXG4gICAgICAgIGxldCBub2RlMSA9IHRoaXMuZ2V0Tm9kZShwb3ROb2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSwgcG90Tm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSkpO1xyXG4gICAgICAgIGxldCBwb3ROb2RlMSA9IHRoaXMuZ2V0Tm9kZShub2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSwgbm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSkpO1xyXG5cclxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdldE5vZGUobm9kZTEueCAqIDIgLSBub2RlLngsIG5vZGUxLnkgKiAyIC0gbm9kZS55KTtcclxuICAgICAgICBsZXQgcG90Tm9kZTIgPSB0aGlzLmdldE5vZGUocG90Tm9kZTEueCAqIDIgLSBwb3ROb2RlLngsIHBvdE5vZGUxLnkgKiAyIC0gcG90Tm9kZS55KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcclxuICAgICAgICBpZiAobm9kZTEuYmxvY2thZGVzLmhhcyhwb3ROb2RlMikgfHwgcG90Tm9kZTEuYmxvY2thZGVzLmhhcyhub2RlMikgfHwgbm9kZTEuYmxvY2thZGVzLmhhcyhwb3ROb2RlMSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkQmxvY2thZGUgPSAobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIG5vZGVBLmJsb2NrYWRlcy5hZGQobm9kZUIpO1xyXG4gICAgICAgICAgICBub2RlQi5ibG9ja2FkZXMuYWRkKG5vZGVBKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUsIG5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlMSwgcG90Tm9kZSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90Tm9kZSwgcG90Tm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdE5vZGUxLCBub2RlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGJyaWRnZSBib3RoIHdheXNcclxuICAgICAgICBub2RlLmVkZ2VzLnB1c2gocG90Tm9kZSk7XHJcbiAgICAgICAgcG90Tm9kZS5lZGdlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgKi9cclxuXHJcbiAgICBjaGVja1dpbkNvbmRpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNoZWNraW5nIHdpbiBjb25kaXRpb24uLi5cIik7XHJcbiAgICAgICAgLy8gbGV0IG5vZGVRdWV1ZSA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAvLyBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMudGlsZXNBY3Jvc3MgLSAxOyBpKyspIHtcclxuICAgICAgICAvLyAgICAgbGV0IHN0YXJ0Tm9kZSA9IHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLmdldE5vZGUoaSwgMCkgOiB0aGlzLmdldE5vZGUoMCwgaSk7XHJcbiAgICAgICAgLy8gICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gMSkgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSAyKSkgY29udGludWU7XHJcbiAgICAgICAgLy8gICAgIG5vZGVRdWV1ZS5hZGQoc3RhcnROb2RlKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIGxldCBjb25uZWN0aW9uRm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICAvLyBub2RlUXVldWUuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIC8vICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSByZXR1cm47XHJcbiAgICAgICAgLy8gICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnkgPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnggPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBjb25uZWN0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIC8vICAgICAgICAgbm9kZVF1ZXVlLmFkZChub2RlKTtcclxuICAgICAgICAvLyAgICAgfSk7XHJcbiAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgLy8gaWYgKGNvbm5lY3Rpb25Gb3VuZCkge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmdhbWVXb24gPSB0aGlzLnllbGxvd3NUdXJuID8gMSA6IDI7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBnZXRzIGEgZGlyZWN0aW9uSW5kZXggYmV0d2VlbiAwIGFuZCA3IGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHggYW5kIHkgZGlyZWN0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4OiBudW1iZXIsIHk6IG51bWJlciwgZGlyZWN0aW9uSW5kZXg6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld1ggPSAoZGlyZWN0aW9uSW5kZXggJiAyID8gMSA6IDIpICogKGRpcmVjdGlvbkluZGV4ICYgNCA/IC0xIDogMSk7XHJcbiAgICBsZXQgbmV3WSA9IChkaXJlY3Rpb25JbmRleCAmIDIgPyAyIDogMSkgKiAoZGlyZWN0aW9uSW5kZXggJiAxID8gLTEgOiAxKTtcclxuXHJcbiAgICByZXR1cm4geyB4OiB4ICsgbmV3WCwgeTogeSArIG5ld1kgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW50ZXJzZWN0cyhhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIsIHA6IG51bWJlciwgcTogbnVtYmVyLCByOiBudW1iZXIsIHM6IG51bWJlcikge1xyXG4gICAgdmFyIGRldCwgZ2FtbWEsIGxhbWJkYTtcclxuICAgIGRldCA9IChjIC0gYSkgKiAocyAtIHEpIC0gKHIgLSBwKSAqIChkIC0gYik7XHJcbiAgICBpZiAoZGV0ID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBsYW1iZGEgPSAoKHMgLSBxKSAqIChyIC0gYSkgKyAocCAtIHIpICogKHMgLSBiKSkgLyBkZXQ7XHJcbiAgICAgICAgZ2FtbWEgPSAoKGIgLSBkKSAqIChyIC0gYSkgKyAoYyAtIGEpICogKHMgLSBiKSkgLyBkZXQ7XHJcbiAgICAgICAgcmV0dXJuIDAgPCBsYW1iZGEgJiYgbGFtYmRhIDwgMSAmJiAwIDwgZ2FtbWEgJiYgZ2FtbWEgPCAxO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IEdyYXBoIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gZ2xvYmFsIHZhcmlhYmxlc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBtYWluR3JhcGg6IEdyYXBoO1xyXG4gICAgaGlzdG9yeTogR3JhcGhbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dTdGFydHM6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgeWVsbG93U3RhcnRzKTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB0cnlQbGFjaW5nUGluKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGN1cnJHcmFwaCA9IHRoaXMubWFpbkdyYXBoLmNsb25lKCk7XHJcbiAgICAgICAgbGV0IHBpblBsYWNlZCA9IHRoaXMubWFpbkdyYXBoLnRyeUFkZGluZ05vZGUoeCwgeSk7XHJcbiAgICAgICAgaWYgKCFwaW5QbGFjZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChjdXJyR3JhcGgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHVuZG9Nb3ZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IHRoaXMuaGlzdG9yeS5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XHJcbiIsImltcG9ydCB7IEdyYXBoLCBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuICAgIGJvYXJkOiBhbnk7XHJcbiAgICBjdHg6IGFueTtcclxuICAgIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG4gICAgdGlsZVNpemU6IG51bWJlcjtcclxuICAgIGNvcm5lcnM6IG51bWJlcltdO1xyXG5cclxuICAgIHdob3NUdXJuOiBIVE1MRWxlbWVudDtcclxuICAgIGJvYXJkQ29udGFpbmVyOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLndob3NUdXJuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aG9zLXR1cm5cIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtY29udGFpbmVyXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdCb2FyZChncmFwaDogR3JhcGgsIGdyaWRsaW5lczogYm9vbGVhbiwgYmxvY2thZGVzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2FudmFzKGdyYXBoKTtcclxuICAgICAgICBpZiAoZ3JpZGxpbmVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RyYXdHcmlkbGluZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZHJhd0ZpbmlzaExpbmVzKCk7XHJcblxyXG4gICAgICAgIGdyYXBoLm1hdHJpeC5mb3JFYWNoKChjb2x1bW4sIHgpID0+IHtcclxuICAgICAgICAgICAgY29sdW1uLmZvckVhY2goKGVudHJ5LCB5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkgPT0gMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWCA9IHggKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZUNlbnRlclkgPSB5ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgaG9sZSBvciBwaW5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSwgdGhpcy50aWxlU2l6ZSAvIDYsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuX251bWJlclRvQ29sb3IoZW50cnkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLl9udW1iZXJUb0NvbG9yKGVudHJ5KTtcclxuICAgICAgICAgICAgICAgIGxldCBicmlkZ2VzID0gZW50cnkgPj4gMjtcclxuICAgICAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgyICoqIGkpKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0ZWRDb29yZCA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHgsIHksIGkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY29ubmVjdGVkQ29vcmQueCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgY29ubmVjdGVkQ29vcmQueSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB0aGlzIGxpbmUgY291bGQgYmUgbWFkZSBzaG9ydGVyXHJcbiAgICAgICAgdGhpcy53aG9zVHVybi5pbm5lckhUTUwgPSBncmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgY2FuIHByb2JhYmx5IGJlIGNoYW5nZWQgd2l0aCBjbGVhclJlY3QgaW5zdGVhZCBvZiBjcmVhdGluZyBhIHdob2xlIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2FudmFzXHJcbiAgICBwcml2YXRlIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLndpZHRoID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5oZWlnaHQgPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ib2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5ib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggPSB0aGlzLmJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHRoaXMudGlsZVNpemUgPSB0aGlzLmJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLnRpbGVzQWNyb3NzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdHcmlkbGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gdGhpcy5ib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGhpcy50aWxlU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhsLCB0aGlzLmJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDI1O1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdGaW5pc2hMaW5lcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvcm5lcnMgPSBbXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUgLSB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gNjtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9udW1iZXJUb0NvbG9yKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImJsYWNrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSAmIDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwieWVsbG93XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSAmIDIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwicmVkXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xyXG5pbXBvcnQgVmlldyBmcm9tIFwiLi92aWV3XCI7XHJcblxyXG4vKiogaGFuZGxlcyBhbGwgaW5wdXQsIGNoZWNrcyBpbiB3aXRoIG1vZGVsIGFuZCBkaXNwbGF5cyB0aGUgcmVzdWx0IHdpdGggdmlldyAqL1xyXG5cclxudmFyIHRpbGVzQWNyb3NzRGVmYXVsdCA9IDY7XHJcblxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuICAgIG1vZGVsOiBNb2RlbDtcclxuICAgIHZpZXc6IFZpZXc7XHJcblxyXG4gICAgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxuICAgIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbiAgICBnYW1lV29uTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbiAgICAvLyBnYW1lLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIGRlYnVnLWJ1dHRvbnNcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgLy8gc3RhcnQgLyByZXN0YXJ0IGdhbWUgbW9kYWxcclxuICAgIHN0YXJ0R2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b246IGFueTtcclxuICAgIHllbGxvd1N0YXJ0c0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICByZWRTdGFydHNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgIGdhbWVXb25Nb2RhbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBnYW1lV29uTW9kYWxDbG9zZUJ1dHRvbjogYW55O1xyXG4gICAgd2lubmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IFZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydEdhbWVNb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF07XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVXb25Nb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdO1xyXG4gICAgICAgIHRoaXMud2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIik7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwudW5kb01vdmUoKSA/IHRoaXMudXBkYXRlVmlldygpIDogY29uc29sZS5sb2coXCJubyBtb3JlIHBvc2l0aW9ucyBpbiBoaXN0b3J5IGFycmF5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0dyaWRsaW5lcyA9ICF0aGlzLnNob3dHcmlkbGluZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS50YWJsZSh0cmFuc3Bvc2UodGhpcy5tb2RlbC5tYWluR3JhcGgubWF0cml4LCAxMCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwodGlsZXNBY3Jvc3NEZWZhdWx0LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuYm9hcmRDbGlja2VkKGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgYm9hcmRDbGlja2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMudmlldy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgd2hpY2ggdGlsZSB3YXMgY2xpY2tlZCBmcm9tIGdsb2JhbCBjb29yZGluYXRlcyB0byBtYXRyaXggY29vcmRpbmF0ZXNcclxuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpIC8gdGhpcy52aWV3LnRpbGVTaXplKTtcclxuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcbiAgICAgICAgbGV0IG5vZGVQbGF5ZWQgPSB0aGlzLm1vZGVsLnRyeVBsYWNpbmdQaW4oeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICE9IDAgJiYgIXRoaXMuZ2FtZVdvbk1vZGFsU2hvd24pIHtcclxuICAgICAgICAgICAgdGhpcy53aW5uZXJJbmZvLmlubmVySFRNTCA9IHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVXb24gKyBcIiB3b24hXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IENvbnRyb2xsZXIoKTtcclxuXHJcbi8vIG1vc3RseSBmb3IgY29uc29sZS50YWJsZSgpIGJ1dCBhbHNvIHBvdGVudGlhbGx5IGZvciB0cmFuc3Bvc2l0aW9uXHJcbmZ1bmN0aW9uIHRyYW5zcG9zZShhOiBudW1iZXJbXVtdLCBudW1lcmFsOiBudW1iZXIpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhhWzBdKS5tYXAoZnVuY3Rpb24gKGM6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBhLm1hcChmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtZXJhbCA9PSAxMCA/IHJbY10gOiByW2NdLnRvU3RyaW5nKG51bWVyYWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9