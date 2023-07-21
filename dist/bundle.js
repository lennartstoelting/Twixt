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
/**
 * gameOver: 0th bit = (yellow is cut off), 1st bit = (red is cut off), 2nd bit = (yellow won), 3rd bit = (red won)
 * ConnectedNodesQueue: all ids of nodes behind starting line with all their connections into the playing field
 *      id = x + y * tilesAcross
 */
var Graph = /** @class */ (function () {
    function Graph(tilesAcross, yellowsTurn) {
        this.yellowsTurn = yellowsTurn;
        this.gameOver = 0;
        this.bridgeBitsOffset = 2;
        this.yellowsConnectedNodesQueue = new Set();
        this.redsConnectedNodesQueue = new Set();
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
        var clonedGraph = new Graph(this.matrix.length, this.yellowsTurn);
        clonedGraph.matrix = structuredClone(this.matrix);
        return clonedGraph;
    };
    Graph.prototype.playNode = function (nodeA) {
        // if it's an empty hole, place a pin
        if (this.matrix[nodeA[0]][nodeA[1]] != 0)
            return false;
        this.matrix[nodeA[0]][nodeA[1]] = this.yellowsTurn ? 1 : 2;
        // check for bridges in all directions
        for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
            var nodeB = pointInDirectionOfIndex(nodeA[0], nodeA[1], directionIndex);
            // if outside or a corner or not the same color
            if (this.matrix[nodeB[0]] == undefined ||
                this.matrix[nodeB[0]][nodeB[1]] == undefined ||
                this.matrix[nodeB[0]][nodeB[1]] == 3 ||
                !((this.matrix[nodeB[0]][nodeB[1]] & 3) == (this.matrix[nodeA[0]][nodeA[1]] & 3))) {
                continue;
            }
            if (this._checkForBlockades(nodeA, nodeB))
                continue;
            // add edge in both directions
            this.matrix[nodeA[0]][nodeA[1]] |= (Math.pow(2, directionIndex)) << 2;
            var otherDirection = directionIndex & 1 ? (directionIndex + 3) % 8 : (directionIndex + 5) % 8;
            this.matrix[nodeB[0]][nodeB[1]] |= (Math.pow(2, otherDirection)) << 2;
        }
        this._checkGameOver();
        console.log("game over: ".concat(this.gameOver));
        this.yellowsTurn = !this.yellowsTurn;
        return true;
    };
    Graph.prototype._checkForBlockades = function (nodeA, nodeB) {
        var _this = this;
        // establish the bounding rectangle that contains the bridge connection
        var topLeftX = Math.min(nodeA[0], nodeB[0]);
        var topLeftY = Math.min(nodeA[1], nodeB[1]);
        var bottomRightX = Math.max(nodeA[0], nodeB[0]);
        var bottomRightY = Math.max(nodeA[1], nodeB[1]);
        // collect the 4 nodes in the rectangle, skipping the ones the original bridge is connecting
        var rectNodes = [];
        for (var rectY = topLeftY; rectY <= bottomRightY; rectY++) {
            for (var rectX = topLeftX; rectX <= bottomRightX; rectX++) {
                if ((rectX == nodeA[0] && rectY == nodeA[1]) || (rectX == nodeB[0] && rectY == nodeB[1]))
                    continue;
                rectNodes.push([rectX, rectY]);
            }
        }
        // for the 4 Nodes, see if any of them have an intersecting bridge
        return rectNodes.some(function (rectNode) {
            // only check the nodes that have bridges
            var bridges = _this.matrix[rectNode[0]][rectNode[1]] >> _this.bridgeBitsOffset;
            if (!bridges)
                return false;
            // go over each bridge and check for intersection with the original one
            for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (Math.pow(2, directionIndex))))
                    continue;
                var outsideRectNode = pointInDirectionOfIndex(rectNode[0], rectNode[1], directionIndex);
                if (intersects(nodeA, nodeB, rectNode, outsideRectNode)) {
                    return true;
                }
            }
        });
    };
    // -------------------------------------------------
    // gameOver : 0th bit = (yellow is cut off), 1st bit = (red is cut off), 2nd bit = (yellow won), 3rd bit = (red won)
    Graph.prototype._checkGameOver = function () {
        var _this = this;
        // could be sorted highest number to lowest number to have conditions stop each loop earlier
        this._updateNodesQueue();
        // no need to check the win condition if the current moving player is already cut off
        if ((this.yellowsTurn && !(this.gameOver & 1)) || (!this.yellowsTurn && !(this.gameOver & 2))) {
            this._checkGameWon();
        }
        // if game already won or cutoff already detected earlier, no need to check anymore
        if (this.gameOver > 2)
            return;
        if (this.yellowsTurn && this.gameOver == 2)
            return;
        if (!this.yellowsTurn && this.gameOver == 1)
            return;
        // this could potentially be turned into two class variables too
        var cutOffNodeIdQueue = new Set(this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue);
        var nodeAdded = false;
        nodeAdded = this._addFlankingNodes(cutOffNodeIdQueue, 0);
        nodeAdded = this._addFlankingNodes(cutOffNodeIdQueue, this.matrix.length - 1) ? true : nodeAdded;
        cutOffNodeIdQueue.forEach(function (nodeId) {
            if (_this.gameOver > 2)
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            _this._checkCutOff(x, y);
            // check if from the left and right the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.gameOver |= 2;
                return;
            }
            if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.gameOver |= 1;
                return;
            }
            if (nodeAdded)
                _this._nextNodesForSet(x, y, cutOffNodeIdQueue);
        });
    };
    Graph.prototype._checkGameWon = function () {
        var _this = this;
        console.log("checking win condition");
        (this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue).forEach(function (nodeId) {
            if (_this.gameOver > 2)
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            // check if the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.gameOver |= 4;
                return;
            }
            if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.gameOver |= 8;
                return;
            }
            _this._nextNodesForSet(x, y, _this.yellowsTurn ? _this.yellowsConnectedNodesQueue : _this.redsConnectedNodesQueue);
        });
    };
    // @returns Set of Ids of all the Nodes behind the starting line
    Graph.prototype._updateNodesQueue = function () {
        for (var i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn && (this.matrix[i][0] & 3) == 1 && this.matrix[i][0] > 3) {
                this.yellowsConnectedNodesQueue.add(i + 0 * this.matrix.length);
            }
            if (!this.yellowsTurn && (this.matrix[0][i] & 3) == 2 && this.matrix[0][i] > 3) {
                this.redsConnectedNodesQueue.add(0 + i * this.matrix.length);
            }
        }
    };
    // for the current node in the loop, add it's connected nodes to the set
    Graph.prototype._nextNodesForSet = function (x, y, set) {
        // check if current node in stack has more nodes connected
        var bridges = this.matrix[x][y] >> this.bridgeBitsOffset;
        if (!bridges)
            return;
        for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
            if (!(bridges & (Math.pow(2, directionIndex))))
                continue;
            var next = pointInDirectionOfIndex(x, y, directionIndex);
            set.add(next[0] + next[1] * this.matrix.length);
        }
    };
    // for cutoff detection we incorporate the nodes on either edge
    Graph.prototype._addFlankingNodes = function (idQueue, side) {
        var nodeAdded = false;
        for (var i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn) {
                if (!((this.matrix[side][i] & 3) == 1)) {
                    break;
                }
                idQueue.add(side + i * this.matrix.length);
                nodeAdded = true;
            }
            else {
                if (!((this.matrix[i][side] & 3) == 2))
                    break;
                idQueue.add(i + side * this.matrix.length);
                nodeAdded = true;
            }
        }
        return nodeAdded;
    };
    // check if to the left or right everything is cutoff for the other player
    Graph.prototype._checkCutOff = function (x, y) {
        // if we have reached either side
        if (this.yellowsTurn && !(this.gameOver & 2) && (x == 0 || x == this.matrix.length - 1)) {
            // red is temporarly cut off
            this.gameOver |= 2;
            for (var nextY = y + 1; nextY <= this.matrix.length - 2; nextY++) {
                if (this.matrix[x][nextY] & 1)
                    continue;
                this.gameOver &= ~2;
                return;
            }
        }
        else if (!this.yellowsTurn && !(this.gameOver & 1) && (y == 0 || y == this.matrix.length - 1)) {
            // yellow is temporarly cut off
            this.gameOver |= 1;
            for (var nextX = x + 1; nextX <= this.matrix.length - 2; nextX++) {
                if (this.matrix[nextX][y] & 2)
                    continue;
                this.gameOver &= ~1;
                return;
            }
        }
    };
    return Graph;
}());

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
function pointInDirectionOfIndex(x, y, directionIndex) {
    var newX = (directionIndex & 2 ? 1 : 2) * (directionIndex & 4 ? -1 : 1);
    var newY = (directionIndex & 2 ? 2 : 1) * (directionIndex & 1 ? -1 : 1);
    return [x + newX, y + newY];
}
// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function intersects(a, b, p, q) {
    var det, gamma, lambda;
    det = (b[0] - a[0]) * (q[1] - p[1]) - (q[0] - p[0]) * (b[1] - a[1]);
    if (det === 0) {
        return false;
    }
    else {
        lambda = ((q[1] - p[1]) * (q[0] - a[0]) + (p[0] - q[0]) * (q[1] - a[1])) / det;
        gamma = ((a[1] - b[1]) * (q[0] - a[0]) + (b[0] - a[0]) * (q[1] - a[1])) / det;
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

var Model = /** @class */ (function () {
    function Model(tilesAcross, yellowStarts, yellowAI, redAI) {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcross, yellowStarts);
        this.history = [];
        this.yellowAI = yellowAI;
        this.redAI = redAI;
    }
    Model.prototype.tryPlayingNode = function (x, y) {
        var currGraph = this.mainGraph.clone();
        var pinPlaced = this.mainGraph.playNode([x, y]);
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
        this.borderRadius = 3;
    }
    View.prototype.drawBoard = function (graph, gridlines, blockades) {
        var _this = this;
        this._createCanvas(graph);
        this._drawBackground();
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();
        graph.matrix.forEach(function (column, x) {
            column.forEach(function (node, y) {
                if (node == 3)
                    return;
                var nodeCenterX = x * _this.tileSize + _this.tileSize / 2;
                var nodeCenterY = y * _this.tileSize + _this.tileSize / 2;
                // draw hole or pin
                _this.ctx.beginPath();
                _this.ctx.arc(nodeCenterX, nodeCenterY, _this.tileSize / 6, 0, 2 * Math.PI);
                _this.ctx.fillStyle = node == 0 ? "black" : node & 1 ? "yellow" : "red";
                _this.ctx.fill();
                // draw bridges
                _this.ctx.lineWidth = _this.tileSize / 12;
                _this.ctx.strokeStyle = node == 0 ? "black" : node & 1 ? "yellow" : "red";
                var bridges = node >> graph.bridgeBitsOffset;
                if (!bridges)
                    return;
                for (var i = 0; i < 8; i++) {
                    if (!(bridges & (Math.pow(2, i))))
                        continue;
                    var connectedCoord = (0,_graph__WEBPACK_IMPORTED_MODULE_0__.pointInDirectionOfIndex)(x, y, i);
                    _this.ctx.beginPath();
                    _this.ctx.moveTo(nodeCenterX, nodeCenterY);
                    _this.ctx.lineTo(connectedCoord[0] * _this.tileSize + _this.tileSize / 2, connectedCoord[1] * _this.tileSize + _this.tileSize / 2);
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
    };
    View.prototype._drawBackground = function () {
        this.ctx.beginPath();
        this.ctx.fillStyle = "blue";
        this.ctx.roundRect(0, 0, this.board.clientWidth, this.board.clientWidth, this.board.clientWidth * (this.borderRadius / 100));
        this.ctx.stroke();
        this.ctx.fill();
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
        this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"](tilesAcrossDefault, true, false, false);
        this.view = new _view__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this._getDomElements();
        this._initEventListeners();
        this._updateView();
    }
    Controller.prototype._getDomElements = function () {
        // game-/debug-buttons
        this.restartGameButton = document.getElementById("restart-game");
        this.undoMoveButton = document.getElementById("undo-move");
        this.toggleGridlinesButton = document.getElementById("toggle-gridlines");
        this.toggleBlockadesButton = document.getElementById("toggle-blockades");
        // setup game modal
        this.setupGameModal = document.getElementById("start-game-modal");
        this.setupGameModalCloseButton = document.getElementsByClassName("modal-close")[0];
        this.yellowAiButton = document.getElementById("yellow-ai");
        this.yellowStartsButton = document.getElementById("yellow-starts");
        this.redAiButton = document.getElementById("red-ai");
        this.redStartsButton = document.getElementById("red-starts");
        this.boardSizeSlider = document.getElementById("board-size");
        this.boardSizeLabel = document.getElementById("board-size-label");
        this.startButton = document.getElementById("start");
        this.yellowAiButton.value = "Player";
        this.yellowStartsButton.value = "goes first";
        this.redAiButton.value = "Computer";
        this.redStartsButton.value = "goes second";
        this.boardSizeSlider.value = tilesAcrossDefault.toString();
        this.boardSizeLabel.innerHTML = "".concat(tilesAcrossDefault, "x").concat(tilesAcrossDefault);
        // game won modal
        this.gameOverModal = document.getElementById("game-over-modal");
        this.gameOverModalCloseButton = document.getElementsByClassName("modal-close")[1];
        this.gameOverInfo = document.getElementById("game-over-info");
        this.restartGameAgainButton = document.getElementById("restart-game-again");
        this.keepPlayingButton = document.getElementById("keep-playing");
    };
    Controller.prototype._initEventListeners = function () {
        var _this = this;
        window.addEventListener("resize", function () {
            _this._updateView();
        });
        // game-/debug-buttons
        this.restartGameButton.addEventListener("click", function () {
            _this.setupGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", function () {
            _this.model.undoMove() ? _this._updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", function () {
            _this.showGridlines = !_this.showGridlines;
            _this._updateView();
        });
        this.toggleBlockadesButton.addEventListener("click", function () {
            _this.showBlockades = !_this.showBlockades;
            _this._updateView();
        });
        // setup game modal
        this.setupGameModalCloseButton.addEventListener("click", function () {
            _this.setupGameModal.style.display = "none";
        });
        this.yellowAiButton.addEventListener("click", function () {
            _this.yellowAiButton.value = _this.yellowAiButton.value == "Player" ? "Computer" : "Player";
        });
        this.redAiButton.addEventListener("click", function () {
            _this.redAiButton.value = _this.redAiButton.value == "Player" ? "Computer" : "Player";
        });
        this.yellowStartsButton.addEventListener("click", function () {
            _this.yellowStartsButton.value = _this.yellowStartsButton.value == "goes first" ? "goes second" : "goes first";
            _this.redStartsButton.value = _this.redStartsButton.value == "goes first" ? "goes second" : "goes first";
        });
        this.redStartsButton.addEventListener("click", function () {
            _this.yellowStartsButton.value = _this.yellowStartsButton.value == "goes first" ? "goes second" : "goes first";
            _this.redStartsButton.value = _this.redStartsButton.value == "goes first" ? "goes second" : "goes first";
        });
        this.boardSizeSlider.addEventListener("input", function () {
            _this.boardSizeLabel.innerHTML = "".concat(_this.boardSizeSlider.value, "x").concat(_this.boardSizeSlider.value);
        });
        this.startButton.addEventListener("click", function () {
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"](parseInt(_this.boardSizeSlider.value), _this.yellowStartsButton.value == "goes first", _this.yellowAiButton.value == "Computer", _this.redAiButton.value == "Computer");
            _this.setupGameModal.style.display = "none";
            _this.gameOverModalShown = false;
            _this._updateView();
        });
        // game won modal
        this.gameOverModalCloseButton.addEventListener("click", function () {
            _this.gameOverModal.style.display = "none";
            _this.gameOverModalShown = true;
        });
        this.restartGameAgainButton.addEventListener("click", function () {
            _this.gameOverModal.style.display = "none";
            _this.setupGameModal.style.display = "block";
        });
        this.keepPlayingButton.addEventListener("click", function () {
            _this.gameOverModal.style.display = "none";
            _this.gameOverModalShown = true;
        });
    };
    Controller.prototype._updateView = function () {
        var _this = this;
        this.view.drawBoard(this.model.mainGraph, this.showGridlines, this.showBlockades);
        this.view.board.addEventListener("click", function (event) { return _this._boardClicked(event); });
    };
    Controller.prototype._boardClicked = function (event) {
        var rect = this.view.board.getBoundingClientRect();
        // calculate which tile was clicked from global coordinates to matrix coordinates
        var x = Math.floor((event.clientX - rect.left) / this.view.tileSize);
        var y = Math.floor((event.clientY - rect.top) / this.view.tileSize);
        // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
        if (this.model.tryPlayingNode(x, y)) {
            this._updateView();
        }
        if (this.model.mainGraph.gameOver < 3 || this.gameOverModalShown)
            return;
        if (this.model.mainGraph.gameOver & 4) {
            this.gameOverInfo.innerHTML = "Yellow won";
        }
        if (this.model.mainGraph.gameOver & 8) {
            this.gameOverInfo.innerHTML = "Red won";
        }
        if (this.model.mainGraph.gameOver == 3) {
            this.gameOverInfo.innerHTML = "Nobody can win anymore";
        }
        this.gameOverModal.style.display = "block";
        this.gameOverModalShown = true;
    };
    return Controller;
}());
var app = new Controller();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FBQztBQUVELGlFQUFlLElBQUksRUFBQzs7Ozs7OztVQ2pJcEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7QUNONEI7QUFDRjtBQUUxQixnRkFBZ0Y7QUFFaEYsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFFM0I7SUFnQ0k7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksOENBQUssQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSw2Q0FBSSxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsb0NBQWUsR0FBZjtRQUNJLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQXNCLENBQUM7UUFDdEYsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBc0IsQ0FBQztRQUNoRixJQUFJLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBc0IsQ0FBQztRQUM5RixJQUFJLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBc0IsQ0FBQztRQUU5RixtQkFBbUI7UUFDbkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQWdCLENBQUM7UUFDbEcsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBcUIsQ0FBQztRQUMvRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQXFCLENBQUM7UUFDdkYsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBcUIsQ0FBQztRQUN6RSxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFxQixDQUFDO1FBQ2pGLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQXFCLENBQUM7UUFDakYsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBcUIsQ0FBQztRQUV4RSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQztRQUMzQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzRCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxVQUFHLGtCQUFrQixjQUFJLGtCQUFrQixDQUFFLENBQUM7UUFFOUUsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFnQixDQUFDO1FBQ2pHLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFzQixDQUFDO1FBQ2pHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBc0IsQ0FBQztJQUMxRixDQUFDO0lBRUQsd0NBQW1CLEdBQW5CO1FBQUEsaUJBb0VDO1FBbkVHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7WUFDOUIsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7WUFDN0MsS0FBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQzFDLEtBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ25HLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUNqRCxLQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQztZQUN6QyxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQ2pELEtBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3pDLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQ3JELEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUMxQyxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQzlGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7WUFDdkMsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7WUFDOUMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDN0csS0FBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEdBQUcsS0FBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUMzRyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQzNDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQzdHLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDM0csQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUMzQyxLQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxVQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxjQUFJLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFFLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUN2QyxLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksOENBQUssQ0FDbEIsUUFBUSxDQUFDLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQ3BDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLElBQUksWUFBWSxFQUM3QyxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxVQUFVLEVBQ3ZDLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FDdkMsQ0FBQztZQUVGLEtBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDM0MsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUNoQyxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUNwRCxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQzFDLEtBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQ2xELEtBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDMUMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUU7WUFDN0MsS0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUMxQyxLQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGdDQUFXLEdBQW5CO1FBQUEsaUJBR0M7UUFGRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFpQixJQUFLLFlBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRU8sa0NBQWEsR0FBckIsVUFBc0IsS0FBaUI7UUFDbkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNuRCxpRkFBaUY7UUFDakYsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEUsNkRBQTZEO1FBRTdELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCO1lBQUUsT0FBTztRQUV6RSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUMzQztRQUNELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztTQUMxRDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQUFDO0FBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3R3aXh0Ly4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL21vZGVsLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogZ2FtZU92ZXI6IDB0aCBiaXQgPSAoeWVsbG93IGlzIGN1dCBvZmYpLCAxc3QgYml0ID0gKHJlZCBpcyBjdXQgb2ZmKSwgMm5kIGJpdCA9ICh5ZWxsb3cgd29uKSwgM3JkIGJpdCA9IChyZWQgd29uKVxyXG4gKiBDb25uZWN0ZWROb2Rlc1F1ZXVlOiBhbGwgaWRzIG9mIG5vZGVzIGJlaGluZCBzdGFydGluZyBsaW5lIHdpdGggYWxsIHRoZWlyIGNvbm5lY3Rpb25zIGludG8gdGhlIHBsYXlpbmcgZmllbGRcclxuICogICAgICBpZCA9IHggKyB5ICogdGlsZXNBY3Jvc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcbiAgICBtYXRyaXg6IG51bWJlcltdW107XHJcbiAgICB5ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZTogU2V0PG51bWJlcj47XHJcbiAgICByZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZTogU2V0PG51bWJlcj47XHJcblxyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICBnYW1lT3ZlcjogbnVtYmVyO1xyXG4gICAgLy8gZXZhbHVhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIGJyaWRnZUJpdHNPZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dzVHVybjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLmdhbWVPdmVyID0gMDtcclxuICAgICAgICB0aGlzLmJyaWRnZUJpdHNPZmZzZXQgPSAyO1xyXG4gICAgICAgIHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgICAgICB0aGlzLnJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlID0gbmV3IFNldDxudW1iZXI+KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF0cml4ID0gQXJyYXkodGlsZXNBY3Jvc3MpXHJcbiAgICAgICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgICAgIC5tYXAoKCkgPT4gQXJyYXkodGlsZXNBY3Jvc3MpLmZpbGwoMCkpO1xyXG5cclxuICAgICAgICAvLyBjb3JuZXJzLCBwb3RlbnRpYWxseSBlYXNpZXIgdG8gaW1wbGVtZW50XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbMF1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4WzBdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bdGlsZXNBY3Jvc3MgLSAxXSA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvbmUoKTogR3JhcGgge1xyXG4gICAgICAgIGxldCBjbG9uZWRHcmFwaCA9IG5ldyBHcmFwaCh0aGlzLm1hdHJpeC5sZW5ndGgsIHRoaXMueWVsbG93c1R1cm4pO1xyXG4gICAgICAgIGNsb25lZEdyYXBoLm1hdHJpeCA9IHN0cnVjdHVyZWRDbG9uZSh0aGlzLm1hdHJpeCk7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lZEdyYXBoO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlOb2RlKG5vZGVBOiBudW1iZXJbXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIGlmIGl0J3MgYW4gZW1wdHkgaG9sZSwgcGxhY2UgYSBwaW5cclxuICAgICAgICBpZiAodGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSAhPSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGJyaWRnZXMgaW4gYWxsIGRpcmVjdGlvbnNcclxuICAgICAgICBmb3IgKGxldCBkaXJlY3Rpb25JbmRleCA9IDA7IGRpcmVjdGlvbkluZGV4IDwgODsgZGlyZWN0aW9uSW5kZXgrKykge1xyXG4gICAgICAgICAgICBsZXQgbm9kZUIgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleChub2RlQVswXSwgbm9kZUFbMV0sIGRpcmVjdGlvbkluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG91dHNpZGUgb3IgYSBjb3JuZXIgb3Igbm90IHRoZSBzYW1lIGNvbG9yXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W25vZGVCWzBdXSA9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dID09IDMgfHxcclxuICAgICAgICAgICAgICAgICEoKHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gJiAzKSA9PSAodGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSAmIDMpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fY2hlY2tGb3JCbG9ja2FkZXMobm9kZUEsIG5vZGVCKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGFkZCBlZGdlIGluIGJvdGggZGlyZWN0aW9uc1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQVswXV1bbm9kZUFbMV1dIHw9ICgyICoqIGRpcmVjdGlvbkluZGV4KSA8PCAyO1xyXG4gICAgICAgICAgICBsZXQgb3RoZXJEaXJlY3Rpb24gPSBkaXJlY3Rpb25JbmRleCAmIDEgPyAoZGlyZWN0aW9uSW5kZXggKyAzKSAlIDggOiAoZGlyZWN0aW9uSW5kZXggKyA1KSAlIDg7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gfD0gKDIgKiogb3RoZXJEaXJlY3Rpb24pIDw8IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jaGVja0dhbWVPdmVyKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGdhbWUgb3ZlcjogJHt0aGlzLmdhbWVPdmVyfWApO1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2hlY2tGb3JCbG9ja2FkZXMobm9kZUE6IG51bWJlcltdLCBub2RlQjogbnVtYmVyW10pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBlc3RhYmxpc2ggdGhlIGJvdW5kaW5nIHJlY3RhbmdsZSB0aGF0IGNvbnRhaW5zIHRoZSBicmlkZ2UgY29ubmVjdGlvblxyXG4gICAgICAgIGxldCB0b3BMZWZ0WCA9IE1hdGgubWluKG5vZGVBWzBdLCBub2RlQlswXSk7XHJcbiAgICAgICAgbGV0IHRvcExlZnRZID0gTWF0aC5taW4obm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRYID0gTWF0aC5tYXgobm9kZUFbMF0sIG5vZGVCWzBdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRZID0gTWF0aC5tYXgobm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuXHJcbiAgICAgICAgLy8gY29sbGVjdCB0aGUgNCBub2RlcyBpbiB0aGUgcmVjdGFuZ2xlLCBza2lwcGluZyB0aGUgb25lcyB0aGUgb3JpZ2luYWwgYnJpZGdlIGlzIGNvbm5lY3RpbmdcclxuICAgICAgICBsZXQgcmVjdE5vZGVzOiBudW1iZXJbXVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcmVjdFkgPSB0b3BMZWZ0WTsgcmVjdFkgPD0gYm90dG9tUmlnaHRZOyByZWN0WSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlY3RYID0gdG9wTGVmdFg7IHJlY3RYIDw9IGJvdHRvbVJpZ2h0WDsgcmVjdFgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKChyZWN0WCA9PSBub2RlQVswXSAmJiByZWN0WSA9PSBub2RlQVsxXSkgfHwgKHJlY3RYID09IG5vZGVCWzBdICYmIHJlY3RZID09IG5vZGVCWzFdKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICByZWN0Tm9kZXMucHVzaChbcmVjdFgsIHJlY3RZXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZvciB0aGUgNCBOb2Rlcywgc2VlIGlmIGFueSBvZiB0aGVtIGhhdmUgYW4gaW50ZXJzZWN0aW5nIGJyaWRnZVxyXG4gICAgICAgIHJldHVybiByZWN0Tm9kZXMuc29tZSgocmVjdE5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGVjayB0aGUgbm9kZXMgdGhhdCBoYXZlIGJyaWRnZXNcclxuICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFtyZWN0Tm9kZVswXV1bcmVjdE5vZGVbMV1dID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBnbyBvdmVyIGVhY2ggYnJpZGdlIGFuZCBjaGVjayBmb3IgaW50ZXJzZWN0aW9uIHdpdGggdGhlIG9yaWdpbmFsIG9uZVxyXG4gICAgICAgICAgICBmb3IgKGxldCBkaXJlY3Rpb25JbmRleCA9IDA7IGRpcmVjdGlvbkluZGV4IDwgODsgZGlyZWN0aW9uSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgyICoqIGRpcmVjdGlvbkluZGV4KSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvdXRzaWRlUmVjdE5vZGUgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleChyZWN0Tm9kZVswXSwgcmVjdE5vZGVbMV0sIGRpcmVjdGlvbkluZGV4KTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3RzKG5vZGVBLCBub2RlQiwgcmVjdE5vZGUsIG91dHNpZGVSZWN0Tm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBnYW1lT3ZlciA6IDB0aCBiaXQgPSAoeWVsbG93IGlzIGN1dCBvZmYpLCAxc3QgYml0ID0gKHJlZCBpcyBjdXQgb2ZmKSwgMm5kIGJpdCA9ICh5ZWxsb3cgd29uKSwgM3JkIGJpdCA9IChyZWQgd29uKVxyXG4gICAgcHJpdmF0ZSBfY2hlY2tHYW1lT3ZlcigpOiB2b2lkIHtcclxuICAgICAgICAvLyBjb3VsZCBiZSBzb3J0ZWQgaGlnaGVzdCBudW1iZXIgdG8gbG93ZXN0IG51bWJlciB0byBoYXZlIGNvbmRpdGlvbnMgc3RvcCBlYWNoIGxvb3AgZWFybGllclxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZU5vZGVzUXVldWUoKTtcclxuICAgICAgICAvLyBubyBuZWVkIHRvIGNoZWNrIHRoZSB3aW4gY29uZGl0aW9uIGlmIHRoZSBjdXJyZW50IG1vdmluZyBwbGF5ZXIgaXMgYWxyZWFkeSBjdXQgb2ZmXHJcbiAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmICEodGhpcy5nYW1lT3ZlciAmIDEpKSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgISh0aGlzLmdhbWVPdmVyICYgMikpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrR2FtZVdvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgZ2FtZSBhbHJlYWR5IHdvbiBvciBjdXRvZmYgYWxyZWFkeSBkZXRlY3RlZCBlYXJsaWVyLCBubyBuZWVkIHRvIGNoZWNrIGFueW1vcmVcclxuICAgICAgICBpZiAodGhpcy5nYW1lT3ZlciA+IDIpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB0aGlzLmdhbWVPdmVyID09IDIpIHJldHVybjtcclxuICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgdGhpcy5nYW1lT3ZlciA9PSAxKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIHRoaXMgY291bGQgcG90ZW50aWFsbHkgYmUgdHVybmVkIGludG8gdHdvIGNsYXNzIHZhcmlhYmxlcyB0b29cclxuICAgICAgICBsZXQgY3V0T2ZmTm9kZUlkUXVldWUgPSBuZXcgU2V0KHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLnllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlIDogdGhpcy5yZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZSk7XHJcblxyXG4gICAgICAgIGxldCBub2RlQWRkZWQgPSBmYWxzZTtcclxuICAgICAgICBub2RlQWRkZWQgPSB0aGlzLl9hZGRGbGFua2luZ05vZGVzKGN1dE9mZk5vZGVJZFF1ZXVlLCAwKTtcclxuICAgICAgICBub2RlQWRkZWQgPSB0aGlzLl9hZGRGbGFua2luZ05vZGVzKGN1dE9mZk5vZGVJZFF1ZXVlLCB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSA/IHRydWUgOiBub2RlQWRkZWQ7XHJcblxyXG4gICAgICAgIGN1dE9mZk5vZGVJZFF1ZXVlLmZvckVhY2goKG5vZGVJZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lT3ZlciA+IDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBpZCB0byBjb29yZHNcclxuICAgICAgICAgICAgbGV0IHggPSBub2RlSWQgJSB0aGlzLm1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihub2RlSWQgLyB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tDdXRPZmYoeCwgeSk7XHJcblxyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBmcm9tIHRoZSBsZWZ0IGFuZCByaWdodCB0aGUgb3RoZXIgc2lkZSBoYXMgYmVlbiByZWFjaGVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuICYmIHkgPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlciB8PSAyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiB4ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgfD0gMTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGVBZGRlZCkgdGhpcy5fbmV4dE5vZGVzRm9yU2V0KHgsIHksIGN1dE9mZk5vZGVJZFF1ZXVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0dhbWVXb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjaGVja2luZyB3aW4gY29uZGl0aW9uXCIpO1xyXG4gICAgICAgICh0aGlzLnllbGxvd3NUdXJuID8gdGhpcy55ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZSA6IHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUpLmZvckVhY2goKG5vZGVJZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lT3ZlciA+IDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBpZCB0byBjb29yZHNcclxuICAgICAgICAgICAgbGV0IHggPSBub2RlSWQgJSB0aGlzLm1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihub2RlSWQgLyB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG90aGVyIHNpZGUgaGFzIGJlZW4gcmVhY2hlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgfD0gNDtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgeCA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyIHw9IDg7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX25leHROb2Rlc0ZvclNldCh4LCB5LCB0aGlzLnllbGxvd3NUdXJuID8gdGhpcy55ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZSA6IHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEByZXR1cm5zIFNldCBvZiBJZHMgb2YgYWxsIHRoZSBOb2RlcyBiZWhpbmQgdGhlIHN0YXJ0aW5nIGxpbmVcclxuICAgIHByaXZhdGUgX3VwZGF0ZU5vZGVzUXVldWUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLm1hdHJpeC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4gJiYgKHRoaXMubWF0cml4W2ldWzBdICYgMykgPT0gMSAmJiB0aGlzLm1hdHJpeFtpXVswXSA+IDMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUuYWRkKGkgKyAwICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgKHRoaXMubWF0cml4WzBdW2ldICYgMykgPT0gMiAmJiB0aGlzLm1hdHJpeFswXVtpXSA+IDMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUuYWRkKDAgKyBpICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3IgdGhlIGN1cnJlbnQgbm9kZSBpbiB0aGUgbG9vcCwgYWRkIGl0J3MgY29ubmVjdGVkIG5vZGVzIHRvIHRoZSBzZXRcclxuICAgIHByaXZhdGUgX25leHROb2Rlc0ZvclNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgc2V0OiBTZXQ8bnVtYmVyPik6IHZvaWQge1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIGN1cnJlbnQgbm9kZSBpbiBzdGFjayBoYXMgbW9yZSBub2RlcyBjb25uZWN0ZWRcclxuICAgICAgICBsZXQgYnJpZGdlcyA9IHRoaXMubWF0cml4W3hdW3ldID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICBpZiAoIWJyaWRnZXMpIHJldHVybjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgyICoqIGRpcmVjdGlvbkluZGV4KSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHgsIHksIGRpcmVjdGlvbkluZGV4KTtcclxuICAgICAgICAgICAgc2V0LmFkZChuZXh0WzBdICsgbmV4dFsxXSAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZvciBjdXRvZmYgZGV0ZWN0aW9uIHdlIGluY29ycG9yYXRlIHRoZSBub2RlcyBvbiBlaXRoZXIgZWRnZVxyXG4gICAgcHJpdmF0ZSBfYWRkRmxhbmtpbmdOb2RlcyhpZFF1ZXVlOiBTZXQ8bnVtYmVyPiwgc2lkZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vZGVBZGRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5tYXRyaXgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISgodGhpcy5tYXRyaXhbc2lkZV1baV0gJiAzKSA9PSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWRRdWV1ZS5hZGQoc2lkZSArIGkgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgbm9kZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghKCh0aGlzLm1hdHJpeFtpXVtzaWRlXSAmIDMpID09IDIpKSBicmVhaztcclxuICAgICAgICAgICAgICAgIGlkUXVldWUuYWRkKGkgKyBzaWRlICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIG5vZGVBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGVBZGRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiB0byB0aGUgbGVmdCBvciByaWdodCBldmVyeXRoaW5nIGlzIGN1dG9mZiBmb3IgdGhlIG90aGVyIHBsYXllclxyXG4gICAgcHJpdmF0ZSBfY2hlY2tDdXRPZmYoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBpZiB3ZSBoYXZlIHJlYWNoZWQgZWl0aGVyIHNpZGVcclxuICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiAhKHRoaXMuZ2FtZU92ZXIgJiAyKSAmJiAoeCA9PSAwIHx8IHggPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgLy8gcmVkIGlzIHRlbXBvcmFybHkgY3V0IG9mZlxyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyIHw9IDI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5leHRZID0geSArIDE7IG5leHRZIDw9IHRoaXMubWF0cml4Lmxlbmd0aCAtIDI7IG5leHRZKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFt4XVtuZXh0WV0gJiAxKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgJj0gfjI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmICEodGhpcy5nYW1lT3ZlciAmIDEpICYmICh5ID09IDAgfHwgeSA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAvLyB5ZWxsb3cgaXMgdGVtcG9yYXJseSBjdXQgb2ZmXHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgfD0gMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmV4dFggPSB4ICsgMTsgbmV4dFggPD0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMjsgbmV4dFgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W25leHRYXVt5XSAmIDIpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlciAmPSB+MTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gZ2V0cyBhIGRpcmVjdGlvbkluZGV4IGJldHdlZW4gMCBhbmQgNyBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyB4IGFuZCB5IGRpcmVjdGlvblxyXG5leHBvcnQgZnVuY3Rpb24gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgoeDogbnVtYmVyLCB5OiBudW1iZXIsIGRpcmVjdGlvbkluZGV4OiBudW1iZXIpOiBudW1iZXJbXSB7XHJcbiAgICBsZXQgbmV3WCA9IChkaXJlY3Rpb25JbmRleCAmIDIgPyAxIDogMikgKiAoZGlyZWN0aW9uSW5kZXggJiA0ID8gLTEgOiAxKTtcclxuICAgIGxldCBuZXdZID0gKGRpcmVjdGlvbkluZGV4ICYgMiA/IDIgOiAxKSAqIChkaXJlY3Rpb25JbmRleCAmIDEgPyAtMSA6IDEpO1xyXG5cclxuICAgIHJldHVybiBbeCArIG5ld1gsIHkgKyBuZXdZXTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTA0MzgwNS90ZXN0LWlmLXR3by1saW5lcy1pbnRlcnNlY3QtamF2YXNjcmlwdC1mdW5jdGlvblxyXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSwgcDogbnVtYmVyW10sIHE6IG51bWJlcltdKSB7XHJcbiAgICB2YXIgZGV0LCBnYW1tYSwgbGFtYmRhO1xyXG4gICAgZGV0ID0gKGJbMF0gLSBhWzBdKSAqIChxWzFdIC0gcFsxXSkgLSAocVswXSAtIHBbMF0pICogKGJbMV0gLSBhWzFdKTtcclxuICAgIGlmIChkZXQgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhbWJkYSA9ICgocVsxXSAtIHBbMV0pICogKHFbMF0gLSBhWzBdKSArIChwWzBdIC0gcVswXSkgKiAocVsxXSAtIGFbMV0pKSAvIGRldDtcclxuICAgICAgICBnYW1tYSA9ICgoYVsxXSAtIGJbMV0pICogKHFbMF0gLSBhWzBdKSArIChiWzBdIC0gYVswXSkgKiAocVsxXSAtIGFbMV0pKSAvIGRldDtcclxuICAgICAgICByZXR1cm4gMCA8IGxhbWJkYSAmJiBsYW1iZGEgPCAxICYmIDAgPCBnYW1tYSAmJiBnYW1tYSA8IDE7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgR3JhcGggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgbWFpbkdyYXBoOiBHcmFwaDtcclxuICAgIGhpc3Rvcnk6IEdyYXBoW107XHJcbiAgICB5ZWxsb3dBSTogYm9vbGVhbjtcclxuICAgIHJlZEFJOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd1N0YXJ0czogYm9vbGVhbiwgeWVsbG93QUk6IGJvb2xlYW4sIHJlZEFJOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3MsIHllbGxvd1N0YXJ0cyk7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBSSA9IHllbGxvd0FJO1xyXG4gICAgICAgIHRoaXMucmVkQUkgPSByZWRBSTtcclxuICAgIH1cclxuXHJcbiAgICB0cnlQbGF5aW5nTm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjdXJyR3JhcGggPSB0aGlzLm1haW5HcmFwaC5jbG9uZSgpO1xyXG4gICAgICAgIGxldCBwaW5QbGFjZWQgPSB0aGlzLm1haW5HcmFwaC5wbGF5Tm9kZShbeCwgeV0pO1xyXG4gICAgICAgIGlmICghcGluUGxhY2VkKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goY3VyckdyYXBoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB1bmRvTW92ZSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSB0aGlzLmhpc3RvcnkucG9wKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsO1xyXG4iLCJpbXBvcnQgeyBHcmFwaCwgcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcbiAgICBib2FyZDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBib2FyZFNpZGVMZW5ndGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYm9yZGVyUmFkaXVzOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvcm5lcnM6IG51bWJlcltdO1xyXG5cclxuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblxyXG4gICAgcHJpdmF0ZSB3aG9zVHVybjogSFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGJvYXJkQ29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLndob3NUdXJuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aG9zLXR1cm5cIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtY29udGFpbmVyXCIpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyUmFkaXVzID0gMztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Qm9hcmQoZ3JhcGg6IEdyYXBoLCBncmlkbGluZXM6IGJvb2xlYW4sIGJsb2NrYWRlczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyhncmFwaCk7XHJcbiAgICAgICAgdGhpcy5fZHJhd0JhY2tncm91bmQoKTtcclxuICAgICAgICBpZiAoZ3JpZGxpbmVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RyYXdHcmlkbGluZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZHJhd0ZpbmlzaExpbmVzKCk7XHJcblxyXG4gICAgICAgIGdyYXBoLm1hdHJpeC5mb3JFYWNoKChjb2x1bW4sIHgpID0+IHtcclxuICAgICAgICAgICAgY29sdW1uLmZvckVhY2goKG5vZGUsIHkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlID09IDMpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZUNlbnRlclggPSB4ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0geSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclksIHRoaXMudGlsZVNpemUgLyA2LCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBub2RlID09IDAgPyBcImJsYWNrXCIgOiBub2RlICYgMSA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBub2RlID09IDAgPyBcImJsYWNrXCIgOiBub2RlICYgMSA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSBub2RlID4+IGdyYXBoLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJyaWRnZXMpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMiAqKiBpKSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29ubmVjdGVkQ29vcmQgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4LCB5LCBpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNvbm5lY3RlZENvb3JkWzBdICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBjb25uZWN0ZWRDb29yZFsxXSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB0aGlzIGxpbmUgY291bGQgYmUgbWFkZSBzaG9ydGVyXHJcbiAgICAgICAgdGhpcy53aG9zVHVybi5pbm5lckhUTUwgPSBncmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgY2FuIHByb2JhYmx5IGJlIGNoYW5nZWQgd2l0aCBjbGVhclJlY3QgaW5zdGVhZCBvZiBjcmVhdGluZyBhIHdob2xlIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2FudmFzXHJcbiAgICBwcml2YXRlIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IHRoaXMuYm9yZGVyUmFkaXVzICsgXCIlXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5tYXJnaW4gPSBcIjElXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC53aWR0aCA9IHRoaXMuYm9hcmRDb250YWluZXIuY2xpZW50V2lkdGggKiAwLjk4O1xyXG4gICAgICAgIHRoaXMuYm9hcmQuaGVpZ2h0ID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRIZWlnaHQgKiAwLjk4O1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuYm9hcmQpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuYm9hcmQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoID0gdGhpcy5ib2FyZC5jbGllbnRXaWR0aDtcclxuICAgICAgICB0aGlzLnRpbGVTaXplID0gdGhpcy5ib2FyZFNpZGVMZW5ndGggLyBncmFwaC5tYXRyaXgubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnJvdW5kUmVjdCgwLCAwLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoICogKHRoaXMuYm9yZGVyUmFkaXVzIC8gMTAwKSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdHcmlkbGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gdGhpcy5ib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGhpcy50aWxlU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhsLCB0aGlzLmJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDI1O1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdGaW5pc2hMaW5lcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvcm5lcnMgPSBbXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUgLSB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gNjtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVmlldztcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIjtcclxuaW1wb3J0IFZpZXcgZnJvbSBcIi4vdmlld1wiO1xyXG5cclxuLyoqIGhhbmRsZXMgYWxsIGlucHV0LCBjaGVja3MgaW4gd2l0aCBtb2RlbCBhbmQgZGlzcGxheXMgdGhlIHJlc3VsdCB3aXRoIHZpZXcgKi9cclxuXHJcbnZhciB0aWxlc0Fjcm9zc0RlZmF1bHQgPSA2O1xyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcbiAgICBtb2RlbDogTW9kZWw7XHJcbiAgICB2aWV3OiBWaWV3O1xyXG5cclxuICAgIHByaXZhdGUgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgc2hvd0Jsb2NrYWRlczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZ2FtZU92ZXJNb2RhbFNob3duOiBib29sZWFuOyAvLyBoYXMgdGhlIHBsYXllciBhbHJlYWR5IHNlZW4gdGhlIGdhbWUgd29uIE1vZGFsIGFuZCB3YW50ZWQgdG8ga2VlcCBwbGF5aW5nP1xyXG5cclxuICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgIHNldHVwR2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgeWVsbG93QWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZFN0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZUxhYmVsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0QnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lT3Zlck1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIGdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICBnYW1lT3ZlckluZm86IEhUTUxFbGVtZW50O1xyXG4gICAgcmVzdGFydEdhbWVBZ2FpbkJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBrZWVwUGxheWluZ0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbCh0aWxlc0Fjcm9zc0RlZmF1bHQsIHRydWUsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IFZpZXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZ2V0RG9tRWxlbWVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIF9nZXREb21FbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICAvLyBnYW1lLS9kZWJ1Zy1idXR0b25zXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LWdhbWUtbW9kYWxcIik7XHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1haVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ5ZWxsb3ctc3RhcnRzXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZVNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLXNpemUtbGFiZWxcIik7XHJcbiAgICAgICAgdGhpcy5zdGFydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9IFwiUGxheWVyXCI7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID0gXCJDb21wdXRlclwiO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gXCJnb2VzIHNlY29uZFwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlID0gdGlsZXNBY3Jvc3NEZWZhdWx0LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aWxlc0Fjcm9zc0RlZmF1bHR9eCR7dGlsZXNBY3Jvc3NEZWZhdWx0fWA7XHJcblxyXG4gICAgICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLW92ZXItbW9kYWxcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMV0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtb3Zlci1pbmZvXCIpO1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVBZ2FpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lLWFnYWluXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtlZXAtcGxheWluZ1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdEV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLS9kZWJ1Zy1idXR0b25zXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnVuZG9Nb3ZlKCkgPyB0aGlzLl91cGRhdGVWaWV3KCkgOiBjb25zb2xlLmxvZyhcIm5vIG1vcmUgcG9zaXRpb25zIGluIGhpc3RvcnkgYXJyYXlcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93R3JpZGxpbmVzID0gIXRoaXMuc2hvd0dyaWRsaW5lcztcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiUGxheWVyXCIgPyBcIkNvbXB1dGVyXCIgOiBcIlBsYXllclwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9IHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJQbGF5ZXJcIiA/IFwiQ29tcHV0ZXJcIiA6IFwiUGxheWVyXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX14JHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX1gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbChcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9PSBcIkNvbXB1dGVyXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIlxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmtlZXBQbGF5aW5nQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5fYm9hcmRDbGlja2VkKGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYm9hcmRDbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLnZpZXcuYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHdoaWNoIHRpbGUgd2FzIGNsaWNrZWQgZnJvbSBnbG9iYWwgY29vcmRpbmF0ZXMgdG8gbWF0cml4IGNvb3JkaW5hdGVzXHJcbiAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApIC8gdGhpcy52aWV3LnRpbGVTaXplKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLnRyeVBsYXlpbmdOb2RlKHgsIHkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVPdmVyIDwgMyB8fCB0aGlzLmdhbWVPdmVyTW9kYWxTaG93bikgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5tYWluR3JhcGguZ2FtZU92ZXIgJiA0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJJbmZvLmlubmVySFRNTCA9IGBZZWxsb3cgd29uYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVPdmVyICYgOCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVySW5mby5pbm5lckhUTUwgPSBgUmVkIHdvbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lT3ZlciA9PSAzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJJbmZvLmlubmVySFRNTCA9IGBOb2JvZHkgY2FuIHdpbiBhbnltb3JlYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgQ29udHJvbGxlcigpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=