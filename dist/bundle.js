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
        this.yellowWon = false;
        this.redWon = false;
        this.yellowCutOff = false;
        this.redCutOff = false;
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
    Graph.prototype.getLegalMoves = function () {
        var legalMoves = [];
        this.matrix.forEach(function (column, x) {
            column.forEach(function (node, y) {
                if (node != 0)
                    return;
                legalMoves.push([x, y]);
            });
        });
        return legalMoves;
    };
    Graph.prototype.playNode = function (nodeA) {
        // if it's an empty hole, place a pin
        if (this.matrix[nodeA[0]][nodeA[1]] != 0)
            return false;
        this.matrix[nodeA[0]][nodeA[1]] = this.yellowsTurn ? 1 : 2;
        // check for bridges in all directions
        for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
            var nodeB = pointInDirectionOfIndex(nodeA[0], nodeA[1], directionIndex);
            // if outside of board
            if (nodeB[0] < 0 || nodeB[0] > this.matrix.length - 1)
                continue;
            if (nodeB[1] < 0 || nodeB[1] > this.matrix.length - 1)
                continue;
            // if one of the missing corners
            if (this.matrix[nodeB[0]][nodeB[1]] == 3)
                continue;
            // if not the same color
            if ((this.matrix[nodeB[0]][nodeB[1]] & 3) != (this.matrix[nodeA[0]][nodeA[1]] & 3))
                continue;
            var otherDirectionIndex = directionIndex & 1 ? (directionIndex + 3) % 8 : (directionIndex + 5) % 8;
            if (this._checkForBlockades(nodeA, nodeB, directionIndex, otherDirectionIndex))
                continue;
            // add edge in both directions
            this.matrix[nodeA[0]][nodeA[1]] |= 1 << (directionIndex + this.bridgeBitsOffset);
            this.matrix[nodeB[0]][nodeB[1]] |= 1 << (otherDirectionIndex + this.bridgeBitsOffset);
        }
        this._checkGameOver();
        console.log("yellow won: ".concat(this.yellowWon, ", red won: ").concat(this.redWon, " \n yellow is cut off: ").concat(this.yellowCutOff, ", red is cut off: ").concat(this.redCutOff));
        this.yellowsTurn = !this.yellowsTurn;
        return true;
    };
    Graph.prototype._checkForBlockades = function (nodeA, nodeB, mainDirectionIndex, otherDirectionIndex) {
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
                if (rectX == nodeA[0] && rectY == nodeA[1])
                    continue;
                if (rectX == nodeB[0] && rectY == nodeB[1])
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
                // if the potentially intersecting bridges are paralell
                if (directionIndex == mainDirectionIndex || directionIndex == otherDirectionIndex)
                    continue;
                if (!(bridges & (1 << directionIndex)))
                    continue;
                var outsideRectNode = pointInDirectionOfIndex(rectNode[0], rectNode[1], directionIndex);
                // if the potentially intersecting bridge shoots of in another direction
                // with a distance of +/-2 from the original rectangle that was encasing the original bridge
                if (outsideRectNode[0] < topLeftX - 1 ||
                    outsideRectNode[0] > bottomRightX + 1 ||
                    outsideRectNode[1] < topLeftY - 1 ||
                    outsideRectNode[1] > bottomRightY + 1)
                    continue;
                if (intersects(nodeA, nodeB, rectNode, outsideRectNode))
                    return true;
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
        if ((this.yellowsTurn && !this.yellowCutOff) || (!this.yellowsTurn && !this.redCutOff)) {
            this._checkGameWon();
        }
        // if game already won or cutoff already detected earlier, no need to check anymore
        if (this.yellowWon || this.redWon || (this.yellowCutOff && this.redCutOff))
            return;
        if (this.yellowsTurn && this.redCutOff)
            return;
        if (!this.yellowsTurn && this.yellowCutOff)
            return;
        // this could potentially be turned into two class variables too
        var cutOffNodeIdQueue = new Set(this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue);
        var nodeAdded = this._addFlankingNodes(cutOffNodeIdQueue, 0) || this._addFlankingNodes(cutOffNodeIdQueue, this.matrix.length - 1);
        cutOffNodeIdQueue.forEach(function (nodeId) {
            if (_this.yellowWon || _this.redWon || (_this.yellowCutOff && _this.redCutOff))
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            _this._checkCutOff(x, y);
            // check if from the left and right the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.redCutOff = true;
                return;
            }
            if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.yellowCutOff = true;
                return;
            }
            if (nodeAdded)
                _this._nextNodesForSet(x, y, cutOffNodeIdQueue);
        });
    };
    Graph.prototype._checkGameWon = function () {
        var _this = this;
        (this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue).forEach(function (nodeId) {
            if (_this.yellowWon || _this.redWon || (_this.yellowCutOff && _this.redCutOff))
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            // check if the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.yellowWon = true;
                return;
            }
            if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.redWon = true;
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
            if (!(bridges & (1 << directionIndex)))
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
        if (this.yellowsTurn && !this.redCutOff && (x == 0 || x == this.matrix.length - 1)) {
            // red is temporarly cut off
            this.redCutOff = true;
            for (var nextY = y + 1; nextY <= this.matrix.length - 2; nextY++) {
                if (this.matrix[x][nextY] & 1)
                    continue;
                this.redCutOff = false;
                return;
            }
        }
        else if (!this.yellowsTurn && !this.yellowCutOff && (y == 0 || y == this.matrix.length - 1)) {
            // yellow is temporarly cut off
            this.yellowCutOff = true;
            for (var nextX = x + 1; nextX <= this.matrix.length - 2; nextX++) {
                if (this.matrix[nextX][y] & 2)
                    continue;
                this.yellowCutOff = false;
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
    // maybe move this to an extra test.ts file
    Model.prototype.runPerformance = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            console.log(args[i]);
            console.time(args[i].name);
            for (var j = 0; j < 1000000000; j++) {
                args[i];
            }
            console.timeEnd(args[i].name);
        }
    };
    Model.prototype.testPerformance = function () {
        this.runPerformance(this.mainGraph.clone);
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
            // the very rare case that the last move was a game ending, toggling the modal to show
            // if that move is being undone, the modalShown variable is not yet handeled
            _this.model.undoMove() ? _this._updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", function () {
            // this.showGridlines = !this.showGridlines;
            // this._updateView();
            _this.model.testPerformance();
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
        if ((!this.model.mainGraph.yellowWon &&
            !this.model.mainGraph.redWon &&
            !(this.model.mainGraph.yellowCutOff && this.model.mainGraph.redCutOff)) ||
            this.gameOverModalShown)
            return;
        if (this.model.mainGraph.yellowWon) {
            this.gameOverInfo.innerHTML = "Yellow won";
        }
        if (this.model.mainGraph.redWon) {
            this.gameOverInfo.innerHTML = "Red won";
        }
        if (this.model.mainGraph.yellowCutOff && this.model.mainGraph.redCutOff) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDO1NBQzFEO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMzQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQ25DLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUM7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvdmlldy50cyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3R3aXh0Ly4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBnYW1lT3ZlcjogMHRoIGJpdCA9ICh5ZWxsb3cgaXMgY3V0IG9mZiksIDFzdCBiaXQgPSAocmVkIGlzIGN1dCBvZmYpLCAybmQgYml0ID0gKHllbGxvdyB3b24pLCAzcmQgYml0ID0gKHJlZCB3b24pXHJcbiAqIENvbm5lY3RlZE5vZGVzUXVldWU6IGFsbCBpZHMgb2Ygbm9kZXMgYmVoaW5kIHN0YXJ0aW5nIGxpbmUgd2l0aCBhbGwgdGhlaXIgY29ubmVjdGlvbnMgaW50byB0aGUgcGxheWluZyBmaWVsZFxyXG4gKiAgICAgIGlkID0geCArIHkgKiB0aWxlc0Fjcm9zc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIG1hdHJpeDogbnVtYmVyW11bXTtcclxuICAgIHllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlOiBTZXQ8bnVtYmVyPjtcclxuICAgIHJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlOiBTZXQ8bnVtYmVyPjtcclxuXHJcbiAgICB5ZWxsb3dzVHVybjogYm9vbGVhbjtcclxuXHJcbiAgICB5ZWxsb3dXb246IGJvb2xlYW47XHJcbiAgICByZWRXb246IGJvb2xlYW47XHJcbiAgICB5ZWxsb3dDdXRPZmY6IGJvb2xlYW47XHJcbiAgICByZWRDdXRPZmY6IGJvb2xlYW47XHJcblxyXG4gICAgYnJpZGdlQml0c09mZnNldDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMueWVsbG93V29uID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yZWRXb24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnllbGxvd0N1dE9mZiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmVkQ3V0T2ZmID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5icmlkZ2VCaXRzT2Zmc2V0ID0gMjtcclxuICAgICAgICB0aGlzLnllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlID0gbmV3IFNldDxudW1iZXI+KCk7XHJcbiAgICAgICAgdGhpcy5yZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZSA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG5cclxuICAgICAgICB0aGlzLm1hdHJpeCA9IEFycmF5KHRpbGVzQWNyb3NzKVxyXG4gICAgICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgICAgICAubWFwKCgpID0+IEFycmF5KHRpbGVzQWNyb3NzKS5maWxsKDApKTtcclxuXHJcbiAgICAgICAgLy8gY29ybmVycywgcG90ZW50aWFsbHkgZWFzaWVyIHRvIGltcGxlbWVudFxyXG4gICAgICAgIHRoaXMubWF0cml4WzBdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFswXVt0aWxlc0Fjcm9zcyAtIDFdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9uZSgpOiBHcmFwaCB7XHJcbiAgICAgICAgbGV0IGNsb25lZEdyYXBoID0gbmV3IEdyYXBoKHRoaXMubWF0cml4Lmxlbmd0aCwgdGhpcy55ZWxsb3dzVHVybik7XHJcbiAgICAgICAgY2xvbmVkR3JhcGgubWF0cml4ID0gc3RydWN0dXJlZENsb25lKHRoaXMubWF0cml4KTtcclxuICAgICAgICByZXR1cm4gY2xvbmVkR3JhcGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldExlZ2FsTW92ZXMoKTogbnVtYmVyW11bXSB7XHJcbiAgICAgICAgbGV0IGxlZ2FsTW92ZXM6IG51bWJlcltdW10gPSBbXTtcclxuICAgICAgICB0aGlzLm1hdHJpeC5mb3JFYWNoKChjb2x1bW4sIHgpID0+IHtcclxuICAgICAgICAgICAgY29sdW1uLmZvckVhY2goKG5vZGUsIHkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlICE9IDApIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGxlZ2FsTW92ZXMucHVzaChbeCwgeV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGVnYWxNb3ZlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheU5vZGUobm9kZUE6IG51bWJlcltdKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gaWYgaXQncyBhbiBlbXB0eSBob2xlLCBwbGFjZSBhIHBpblxyXG4gICAgICAgIGlmICh0aGlzLm1hdHJpeFtub2RlQVswXV1bbm9kZUFbMV1dICE9IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLm1hdHJpeFtub2RlQVswXV1bbm9kZUFbMV1dID0gdGhpcy55ZWxsb3dzVHVybiA/IDEgOiAyO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgYnJpZGdlcyBpbiBhbGwgZGlyZWN0aW9uc1xyXG4gICAgICAgIGZvciAobGV0IGRpcmVjdGlvbkluZGV4ID0gMDsgZGlyZWN0aW9uSW5kZXggPCA4OyBkaXJlY3Rpb25JbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlQiA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KG5vZGVBWzBdLCBub2RlQVsxXSwgZGlyZWN0aW9uSW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgb3V0c2lkZSBvZiBib2FyZFxyXG4gICAgICAgICAgICBpZiAobm9kZUJbMF0gPCAwIHx8IG5vZGVCWzBdID4gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChub2RlQlsxXSA8IDAgfHwgbm9kZUJbMV0gPiB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSBjb250aW51ZTtcclxuICAgICAgICAgICAgLy8gaWYgb25lIG9mIHRoZSBtaXNzaW5nIGNvcm5lcnNcclxuICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gPT0gMykgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGlmIG5vdCB0aGUgc2FtZSBjb2xvclxyXG4gICAgICAgICAgICBpZiAoKHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gJiAzKSAhPSAodGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSAmIDMpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBvdGhlckRpcmVjdGlvbkluZGV4ID0gZGlyZWN0aW9uSW5kZXggJiAxID8gKGRpcmVjdGlvbkluZGV4ICsgMykgJSA4IDogKGRpcmVjdGlvbkluZGV4ICsgNSkgJSA4O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY2hlY2tGb3JCbG9ja2FkZXMobm9kZUEsIG5vZGVCLCBkaXJlY3Rpb25JbmRleCwgb3RoZXJEaXJlY3Rpb25JbmRleCkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGVkZ2UgaW4gYm90aCBkaXJlY3Rpb25zXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W25vZGVBWzBdXVtub2RlQVsxXV0gfD0gMSA8PCAoZGlyZWN0aW9uSW5kZXggKyB0aGlzLmJyaWRnZUJpdHNPZmZzZXQpO1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dIHw9IDEgPDwgKG90aGVyRGlyZWN0aW9uSW5kZXggKyB0aGlzLmJyaWRnZUJpdHNPZmZzZXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY2hlY2tHYW1lT3ZlcigpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgeWVsbG93IHdvbjogJHt0aGlzLnllbGxvd1dvbn0sIHJlZCB3b246ICR7dGhpcy5yZWRXb259IFxcbiB5ZWxsb3cgaXMgY3V0IG9mZjogJHt0aGlzLnllbGxvd0N1dE9mZn0sIHJlZCBpcyBjdXQgb2ZmOiAke3RoaXMucmVkQ3V0T2ZmfWBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2hlY2tGb3JCbG9ja2FkZXMobm9kZUE6IG51bWJlcltdLCBub2RlQjogbnVtYmVyW10sIG1haW5EaXJlY3Rpb25JbmRleDogbnVtYmVyLCBvdGhlckRpcmVjdGlvbkluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyBlc3RhYmxpc2ggdGhlIGJvdW5kaW5nIHJlY3RhbmdsZSB0aGF0IGNvbnRhaW5zIHRoZSBicmlkZ2UgY29ubmVjdGlvblxyXG4gICAgICAgIGxldCB0b3BMZWZ0WCA9IE1hdGgubWluKG5vZGVBWzBdLCBub2RlQlswXSk7XHJcbiAgICAgICAgbGV0IHRvcExlZnRZID0gTWF0aC5taW4obm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRYID0gTWF0aC5tYXgobm9kZUFbMF0sIG5vZGVCWzBdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRZID0gTWF0aC5tYXgobm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuXHJcbiAgICAgICAgLy8gY29sbGVjdCB0aGUgNCBub2RlcyBpbiB0aGUgcmVjdGFuZ2xlLCBza2lwcGluZyB0aGUgb25lcyB0aGUgb3JpZ2luYWwgYnJpZGdlIGlzIGNvbm5lY3RpbmdcclxuICAgICAgICBsZXQgcmVjdE5vZGVzOiBudW1iZXJbXVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcmVjdFkgPSB0b3BMZWZ0WTsgcmVjdFkgPD0gYm90dG9tUmlnaHRZOyByZWN0WSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlY3RYID0gdG9wTGVmdFg7IHJlY3RYIDw9IGJvdHRvbVJpZ2h0WDsgcmVjdFgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlY3RYID09IG5vZGVBWzBdICYmIHJlY3RZID09IG5vZGVBWzFdKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWN0WCA9PSBub2RlQlswXSAmJiByZWN0WSA9PSBub2RlQlsxXSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICByZWN0Tm9kZXMucHVzaChbcmVjdFgsIHJlY3RZXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZvciB0aGUgNCBOb2Rlcywgc2VlIGlmIGFueSBvZiB0aGVtIGhhdmUgYW4gaW50ZXJzZWN0aW5nIGJyaWRnZVxyXG4gICAgICAgIHJldHVybiByZWN0Tm9kZXMuc29tZSgocmVjdE5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGVjayB0aGUgbm9kZXMgdGhhdCBoYXZlIGJyaWRnZXNcclxuICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFtyZWN0Tm9kZVswXV1bcmVjdE5vZGVbMV1dID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBnbyBvdmVyIGVhY2ggYnJpZGdlIGFuZCBjaGVjayBmb3IgaW50ZXJzZWN0aW9uIHdpdGggdGhlIG9yaWdpbmFsIG9uZVxyXG4gICAgICAgICAgICBmb3IgKGxldCBkaXJlY3Rpb25JbmRleCA9IDA7IGRpcmVjdGlvbkluZGV4IDwgODsgZGlyZWN0aW9uSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHBvdGVudGlhbGx5IGludGVyc2VjdGluZyBicmlkZ2VzIGFyZSBwYXJhbGVsbFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbkluZGV4ID09IG1haW5EaXJlY3Rpb25JbmRleCB8fCBkaXJlY3Rpb25JbmRleCA9PSBvdGhlckRpcmVjdGlvbkluZGV4KSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMSA8PCBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0c2lkZVJlY3ROb2RlID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgocmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcG90ZW50aWFsbHkgaW50ZXJzZWN0aW5nIGJyaWRnZSBzaG9vdHMgb2YgaW4gYW5vdGhlciBkaXJlY3Rpb25cclxuICAgICAgICAgICAgICAgIC8vIHdpdGggYSBkaXN0YW5jZSBvZiArLy0yIGZyb20gdGhlIG9yaWdpbmFsIHJlY3RhbmdsZSB0aGF0IHdhcyBlbmNhc2luZyB0aGUgb3JpZ2luYWwgYnJpZGdlXHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0c2lkZVJlY3ROb2RlWzBdIDwgdG9wTGVmdFggLSAxIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0c2lkZVJlY3ROb2RlWzBdID4gYm90dG9tUmlnaHRYICsgMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHNpZGVSZWN0Tm9kZVsxXSA8IHRvcExlZnRZIC0gMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHNpZGVSZWN0Tm9kZVsxXSA+IGJvdHRvbVJpZ2h0WSArIDFcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3RzKG5vZGVBLCBub2RlQiwgcmVjdE5vZGUsIG91dHNpZGVSZWN0Tm9kZSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIGdhbWVPdmVyIDogMHRoIGJpdCA9ICh5ZWxsb3cgaXMgY3V0IG9mZiksIDFzdCBiaXQgPSAocmVkIGlzIGN1dCBvZmYpLCAybmQgYml0ID0gKHllbGxvdyB3b24pLCAzcmQgYml0ID0gKHJlZCB3b24pXHJcbiAgICBwcml2YXRlIF9jaGVja0dhbWVPdmVyKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGNvdWxkIGJlIHNvcnRlZCBoaWdoZXN0IG51bWJlciB0byBsb3dlc3QgbnVtYmVyIHRvIGhhdmUgY29uZGl0aW9ucyBzdG9wIGVhY2ggbG9vcCBlYXJsaWVyXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTm9kZXNRdWV1ZSgpO1xyXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gY2hlY2sgdGhlIHdpbiBjb25kaXRpb24gaWYgdGhlIGN1cnJlbnQgbW92aW5nIHBsYXllciBpcyBhbHJlYWR5IGN1dCBvZmZcclxuICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgIXRoaXMueWVsbG93Q3V0T2ZmKSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgIXRoaXMucmVkQ3V0T2ZmKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja0dhbWVXb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGdhbWUgYWxyZWFkeSB3b24gb3IgY3V0b2ZmIGFscmVhZHkgZGV0ZWN0ZWQgZWFybGllciwgbm8gbmVlZCB0byBjaGVjayBhbnltb3JlXHJcbiAgICAgICAgaWYgKHRoaXMueWVsbG93V29uIHx8IHRoaXMucmVkV29uIHx8ICh0aGlzLnllbGxvd0N1dE9mZiAmJiB0aGlzLnJlZEN1dE9mZikpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB0aGlzLnJlZEN1dE9mZikgcmV0dXJuO1xyXG4gICAgICAgIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiB0aGlzLnllbGxvd0N1dE9mZikgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyB0aGlzIGNvdWxkIHBvdGVudGlhbGx5IGJlIHR1cm5lZCBpbnRvIHR3byBjbGFzcyB2YXJpYWJsZXMgdG9vXHJcbiAgICAgICAgbGV0IGN1dE9mZk5vZGVJZFF1ZXVlID0gbmV3IFNldCh0aGlzLnllbGxvd3NUdXJuID8gdGhpcy55ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZSA6IHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUpO1xyXG5cclxuICAgICAgICBsZXQgbm9kZUFkZGVkID0gdGhpcy5fYWRkRmxhbmtpbmdOb2RlcyhjdXRPZmZOb2RlSWRRdWV1ZSwgMCkgfHwgdGhpcy5fYWRkRmxhbmtpbmdOb2RlcyhjdXRPZmZOb2RlSWRRdWV1ZSwgdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSk7XHJcblxyXG4gICAgICAgIGN1dE9mZk5vZGVJZFF1ZXVlLmZvckVhY2goKG5vZGVJZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dXb24gfHwgdGhpcy5yZWRXb24gfHwgKHRoaXMueWVsbG93Q3V0T2ZmICYmIHRoaXMucmVkQ3V0T2ZmKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gdHJhbnNsYXRlIGlkIHRvIGNvb3Jkc1xyXG4gICAgICAgICAgICBsZXQgeCA9IG5vZGVJZCAlIHRoaXMubWF0cml4Lmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKG5vZGVJZCAvIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9jaGVja0N1dE9mZih4LCB5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGZyb20gdGhlIGxlZnQgYW5kIHJpZ2h0IHRoZSBvdGhlciBzaWRlIGhhcyBiZWVuIHJlYWNoZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4gJiYgeSA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZEN1dE9mZiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmIHggPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dDdXRPZmYgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZUFkZGVkKSB0aGlzLl9uZXh0Tm9kZXNGb3JTZXQoeCwgeSwgY3V0T2ZmTm9kZUlkUXVldWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NoZWNrR2FtZVdvbigpIHtcclxuICAgICAgICAodGhpcy55ZWxsb3dzVHVybiA/IHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUgOiB0aGlzLnJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlKS5mb3JFYWNoKChub2RlSWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93V29uIHx8IHRoaXMucmVkV29uIHx8ICh0aGlzLnllbGxvd0N1dE9mZiAmJiB0aGlzLnJlZEN1dE9mZikpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBpZCB0byBjb29yZHNcclxuICAgICAgICAgICAgbGV0IHggPSBub2RlSWQgJSB0aGlzLm1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihub2RlSWQgLyB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG90aGVyIHNpZGUgaGFzIGJlZW4gcmVhY2hlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93V29uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgeCA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZFdvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX25leHROb2Rlc0ZvclNldCh4LCB5LCB0aGlzLnllbGxvd3NUdXJuID8gdGhpcy55ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZSA6IHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEByZXR1cm5zIFNldCBvZiBJZHMgb2YgYWxsIHRoZSBOb2RlcyBiZWhpbmQgdGhlIHN0YXJ0aW5nIGxpbmVcclxuICAgIHByaXZhdGUgX3VwZGF0ZU5vZGVzUXVldWUoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLm1hdHJpeC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4gJiYgKHRoaXMubWF0cml4W2ldWzBdICYgMykgPT0gMSAmJiB0aGlzLm1hdHJpeFtpXVswXSA+IDMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUuYWRkKGkgKyAwICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgKHRoaXMubWF0cml4WzBdW2ldICYgMykgPT0gMiAmJiB0aGlzLm1hdHJpeFswXVtpXSA+IDMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkc0Nvbm5lY3RlZE5vZGVzUXVldWUuYWRkKDAgKyBpICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3IgdGhlIGN1cnJlbnQgbm9kZSBpbiB0aGUgbG9vcCwgYWRkIGl0J3MgY29ubmVjdGVkIG5vZGVzIHRvIHRoZSBzZXRcclxuICAgIHByaXZhdGUgX25leHROb2Rlc0ZvclNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgc2V0OiBTZXQ8bnVtYmVyPik6IHZvaWQge1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIGN1cnJlbnQgbm9kZSBpbiBzdGFjayBoYXMgbW9yZSBub2RlcyBjb25uZWN0ZWRcclxuICAgICAgICBsZXQgYnJpZGdlcyA9IHRoaXMubWF0cml4W3hdW3ldID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICBpZiAoIWJyaWRnZXMpIHJldHVybjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgxIDw8IGRpcmVjdGlvbkluZGV4KSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHgsIHksIGRpcmVjdGlvbkluZGV4KTtcclxuICAgICAgICAgICAgc2V0LmFkZChuZXh0WzBdICsgbmV4dFsxXSAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZvciBjdXRvZmYgZGV0ZWN0aW9uIHdlIGluY29ycG9yYXRlIHRoZSBub2RlcyBvbiBlaXRoZXIgZWRnZVxyXG4gICAgcHJpdmF0ZSBfYWRkRmxhbmtpbmdOb2RlcyhpZFF1ZXVlOiBTZXQ8bnVtYmVyPiwgc2lkZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vZGVBZGRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5tYXRyaXgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISgodGhpcy5tYXRyaXhbc2lkZV1baV0gJiAzKSA9PSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWRRdWV1ZS5hZGQoc2lkZSArIGkgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgbm9kZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghKCh0aGlzLm1hdHJpeFtpXVtzaWRlXSAmIDMpID09IDIpKSBicmVhaztcclxuICAgICAgICAgICAgICAgIGlkUXVldWUuYWRkKGkgKyBzaWRlICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIG5vZGVBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGVBZGRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiB0byB0aGUgbGVmdCBvciByaWdodCBldmVyeXRoaW5nIGlzIGN1dG9mZiBmb3IgdGhlIG90aGVyIHBsYXllclxyXG4gICAgcHJpdmF0ZSBfY2hlY2tDdXRPZmYoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBpZiB3ZSBoYXZlIHJlYWNoZWQgZWl0aGVyIHNpZGVcclxuICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiAhdGhpcy5yZWRDdXRPZmYgJiYgKHggPT0gMCB8fCB4ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgIC8vIHJlZCBpcyB0ZW1wb3Jhcmx5IGN1dCBvZmZcclxuICAgICAgICAgICAgdGhpcy5yZWRDdXRPZmYgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuZXh0WSA9IHkgKyAxOyBuZXh0WSA8PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAyOyBuZXh0WSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbeF1bbmV4dFldICYgMSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZEN1dE9mZiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiAhdGhpcy55ZWxsb3dDdXRPZmYgJiYgKHkgPT0gMCB8fCB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgIC8vIHllbGxvdyBpcyB0ZW1wb3Jhcmx5IGN1dCBvZmZcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dDdXRPZmYgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuZXh0WCA9IHggKyAxOyBuZXh0WCA8PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAyOyBuZXh0WCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbbmV4dFhdW3ldICYgMikgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd0N1dE9mZiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBnZXRzIGEgZGlyZWN0aW9uSW5kZXggYmV0d2VlbiAwIGFuZCA3IGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHggYW5kIHkgZGlyZWN0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4OiBudW1iZXIsIHk6IG51bWJlciwgZGlyZWN0aW9uSW5kZXg6IG51bWJlcik6IG51bWJlcltdIHtcclxuICAgIGxldCBuZXdYID0gKGRpcmVjdGlvbkluZGV4ICYgMiA/IDEgOiAyKSAqIChkaXJlY3Rpb25JbmRleCAmIDQgPyAtMSA6IDEpO1xyXG4gICAgbGV0IG5ld1kgPSAoZGlyZWN0aW9uSW5kZXggJiAyID8gMiA6IDEpICogKGRpcmVjdGlvbkluZGV4ICYgMSA/IC0xIDogMSk7XHJcblxyXG4gICAgcmV0dXJuIFt4ICsgbmV3WCwgeSArIG5ld1ldO1xyXG59XHJcblxyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85MDQzODA1L3Rlc3QtaWYtdHdvLWxpbmVzLWludGVyc2VjdC1qYXZhc2NyaXB0LWZ1bmN0aW9uXHJcbmZ1bmN0aW9uIGludGVyc2VjdHMoYTogbnVtYmVyW10sIGI6IG51bWJlcltdLCBwOiBudW1iZXJbXSwgcTogbnVtYmVyW10pIHtcclxuICAgIHZhciBkZXQsIGdhbW1hLCBsYW1iZGE7XHJcbiAgICBkZXQgPSAoYlswXSAtIGFbMF0pICogKHFbMV0gLSBwWzFdKSAtIChxWzBdIC0gcFswXSkgKiAoYlsxXSAtIGFbMV0pO1xyXG4gICAgaWYgKGRldCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGFtYmRhID0gKChxWzFdIC0gcFsxXSkgKiAocVswXSAtIGFbMF0pICsgKHBbMF0gLSBxWzBdKSAqIChxWzFdIC0gYVsxXSkpIC8gZGV0O1xyXG4gICAgICAgIGdhbW1hID0gKChhWzFdIC0gYlsxXSkgKiAocVswXSAtIGFbMF0pICsgKGJbMF0gLSBhWzBdKSAqIChxWzFdIC0gYVsxXSkpIC8gZGV0O1xyXG4gICAgICAgIHJldHVybiAwIDwgbGFtYmRhICYmIGxhbWJkYSA8IDEgJiYgMCA8IGdhbW1hICYmIGdhbW1hIDwgMTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBHcmFwaCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBtYWluR3JhcGg6IEdyYXBoO1xyXG4gICAgaGlzdG9yeTogR3JhcGhbXTtcclxuICAgIHllbGxvd0FJOiBib29sZWFuO1xyXG4gICAgcmVkQUk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZXNBY3Jvc3M6IG51bWJlciwgeWVsbG93U3RhcnRzOiBib29sZWFuLCB5ZWxsb3dBSTogYm9vbGVhbiwgcmVkQUk6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgeWVsbG93U3RhcnRzKTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnllbGxvd0FJID0geWVsbG93QUk7XHJcbiAgICAgICAgdGhpcy5yZWRBSSA9IHJlZEFJO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlQbGF5aW5nTm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjdXJyR3JhcGggPSB0aGlzLm1haW5HcmFwaC5jbG9uZSgpO1xyXG4gICAgICAgIGxldCBwaW5QbGFjZWQgPSB0aGlzLm1haW5HcmFwaC5wbGF5Tm9kZShbeCwgeV0pO1xyXG4gICAgICAgIGlmICghcGluUGxhY2VkKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goY3VyckdyYXBoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVuZG9Nb3ZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IHRoaXMuaGlzdG9yeS5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYXliZSBtb3ZlIHRoaXMgdG8gYW4gZXh0cmEgdGVzdC50cyBmaWxlXHJcbiAgICBwdWJsaWMgcnVuUGVyZm9ybWFuY2UoLi4uYXJnczogYW55KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFyZ3NbaV0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWUoYXJnc1tpXS5uYW1lKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDAwMDAwMDAwOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGFyZ3NbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS50aW1lRW5kKGFyZ3NbaV0ubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0ZXN0UGVyZm9ybWFuY2UoKSB7XHJcbiAgICAgICAgdGhpcy5ydW5QZXJmb3JtYW5jZSh0aGlzLm1haW5HcmFwaC5jbG9uZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxwaGEgYmV0YSBwcnVuaW5nIG1pdCBpdGVyYXRpdmUgZGVlcGVuaW5nXHJcbiAgICAvLyBkYXp1IGxvb2t1cC90cmFuc3Bvc2l0aW9uIHRhYmxlXHJcbiAgICAvLyB2aWVsbGVpY2h0IHJ1bi1sZW5naHQgZW5jb2RpbmcgenVtIHNwYXJlbiB2b24gU3BlaWNoZXJcclxuXHJcbiAgICAvLyBtZWhyIGV2YWx1YXRpb24gaW4gZ3JhcGggYWxzIG51ciBkaWUgRmFrdGVuYmFzaWVydGVcclxuICAgIC8vIGFsc28gZWlnZW5lIGhldXJpc3RpayDDvGJlcmxlZ2VuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsO1xyXG4iLCJpbXBvcnQgeyBHcmFwaCwgcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcbiAgICBib2FyZDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBib2FyZFNpZGVMZW5ndGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYm9yZGVyUmFkaXVzOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvcm5lcnM6IG51bWJlcltdO1xyXG5cclxuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblxyXG4gICAgcHJpdmF0ZSB3aG9zVHVybjogSFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGJvYXJkQ29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLndob3NUdXJuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aG9zLXR1cm5cIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtY29udGFpbmVyXCIpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyUmFkaXVzID0gMztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZHJhd0JvYXJkKGdyYXBoOiBHcmFwaCwgZ3JpZGxpbmVzOiBib29sZWFuLCBibG9ja2FkZXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jcmVhdGVDYW52YXMoZ3JhcGgpO1xyXG4gICAgICAgIHRoaXMuX2RyYXdCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgaWYgKGdyaWRsaW5lcykge1xyXG4gICAgICAgICAgICB0aGlzLl9kcmF3R3JpZGxpbmVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RyYXdGaW5pc2hMaW5lcygpO1xyXG5cclxuICAgICAgICBncmFwaC5tYXRyaXguZm9yRWFjaCgoY29sdW1uLCB4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKChub2RlLCB5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PSAzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0geCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWSA9IHkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBob2xlIG9yIHBpblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5hcmMobm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZLCB0aGlzLnRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gbm9kZSA9PSAwID8gXCJibGFja1wiIDogbm9kZSAmIDEgPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gbm9kZSA9PSAwID8gXCJibGFja1wiIDogbm9kZSAmIDEgPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgICAgICAgICAgICAgIGxldCBicmlkZ2VzID0gbm9kZSA+PiBncmFwaC5icmlkZ2VCaXRzT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShicmlkZ2VzICYgKDIgKiogaSkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbm5lY3RlZENvb3JkID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgoeCwgeSwgaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhjb25uZWN0ZWRDb29yZFswXSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgY29ubmVjdGVkQ29vcmRbMV0gKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBsaW5lIGNvdWxkIGJlIG1hZGUgc2hvcnRlclxyXG4gICAgICAgIHRoaXMud2hvc1R1cm4uaW5uZXJIVE1MID0gZ3JhcGgueWVsbG93c1R1cm4gPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGlzIGNhbiBwcm9iYWJseSBiZSBjaGFuZ2VkIHdpdGggY2xlYXJSZWN0IGluc3RlYWQgb2YgY3JlYXRpbmcgYSB3aG9sZSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ2FudmFzKGdyYXBoOiBHcmFwaCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuaWQgPSBcImJvYXJkXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5ib3hTaGFkb3cgPSBcIjVweCA1cHggMjBweCBncmF5XCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5ib3JkZXJSYWRpdXMgPSB0aGlzLmJvcmRlclJhZGl1cyArIFwiJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUubWFyZ2luID0gXCIxJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQud2lkdGggPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudFdpZHRoICogMC45ODtcclxuICAgICAgICB0aGlzLmJvYXJkLmhlaWdodCA9IHRoaXMuYm9hcmRDb250YWluZXIuY2xpZW50SGVpZ2h0ICogMC45ODtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJvYXJkKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCA9IHRoaXMuYm9hcmQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdGhpcy50aWxlU2l6ZSA9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC8gZ3JhcGgubWF0cml4Lmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3QmFja2dyb3VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmN0eC5yb3VuZFJlY3QoMCwgMCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCAqICh0aGlzLmJvcmRlclJhZGl1cyAvIDEwMCkpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3R3JpZGxpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRoaXMudGlsZVNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8obCwgdGhpcy5ib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkU2lkZUxlbmd0aCwgbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAyNTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3RmluaXNoTGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb3JuZXJzID0gW1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplIC0gdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDY7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjQ0NDRcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZmZhYVwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpZXc7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG52YXIgdGlsZXNBY3Jvc3NEZWZhdWx0ID0gNjtcclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG4gICAgbW9kZWw6IE1vZGVsO1xyXG4gICAgdmlldzogVmlldztcclxuXHJcbiAgICBwcml2YXRlIHNob3dHcmlkbGluZXM6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGdhbWVPdmVyTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbiAgICAvLyBnYW1lLS9kZWJ1Zy1idXR0b25zXHJcbiAgICByZXN0YXJ0R2FtZUJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB1bmRvTW92ZUJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB0b2dnbGVHcmlkbGluZXNCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgdG9nZ2xlQmxvY2thZGVzQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICBzZXR1cEdhbWVNb2RhbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBzZXR1cEdhbWVNb2RhbENsb3NlQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIHllbGxvd0FpQnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgeWVsbG93U3RhcnRzQnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcmVkQWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBib2FyZFNpemVTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBib2FyZFNpemVMYWJlbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBzdGFydEJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAvLyBnYW1lIHdvbiBtb2RhbFxyXG4gICAgZ2FtZU92ZXJNb2RhbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBnYW1lT3Zlck1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZU92ZXJJbmZvOiBIVE1MRWxlbWVudDtcclxuICAgIHJlc3RhcnRHYW1lQWdhaW5CdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAga2VlcFBsYXlpbmdCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwodGlsZXNBY3Jvc3NEZWZhdWx0LCB0cnVlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBWaWV3KCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dldERvbUVsZW1lbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdEV2ZW50TGlzdGVuZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXREb21FbGVtZW50cygpOiB2b2lkIHtcclxuICAgICAgICAvLyBnYW1lLS9kZWJ1Zy1idXR0b25zXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LWdhbWUtbW9kYWxcIik7XHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1haVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ5ZWxsb3ctc3RhcnRzXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZVNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLXNpemUtbGFiZWxcIik7XHJcbiAgICAgICAgdGhpcy5zdGFydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9IFwiUGxheWVyXCI7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID0gXCJDb21wdXRlclwiO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gXCJnb2VzIHNlY29uZFwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlID0gdGlsZXNBY3Jvc3NEZWZhdWx0LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aWxlc0Fjcm9zc0RlZmF1bHR9eCR7dGlsZXNBY3Jvc3NEZWZhdWx0fWA7XHJcblxyXG4gICAgICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLW92ZXItbW9kYWxcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMV0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtb3Zlci1pbmZvXCIpO1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVBZ2FpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lLWFnYWluXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtlZXAtcGxheWluZ1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0RXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHRoZSB2ZXJ5IHJhcmUgY2FzZSB0aGF0IHRoZSBsYXN0IG1vdmUgd2FzIGEgZ2FtZSBlbmRpbmcsIHRvZ2dsaW5nIHRoZSBtb2RhbCB0byBzaG93XHJcbiAgICAgICAgICAgIC8vIGlmIHRoYXQgbW92ZSBpcyBiZWluZyB1bmRvbmUsIHRoZSBtb2RhbFNob3duIHZhcmlhYmxlIGlzIG5vdCB5ZXQgaGFuZGVsZWRcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC51bmRvTW92ZSgpID8gdGhpcy5fdXBkYXRlVmlldygpIDogY29uc29sZS5sb2coXCJubyBtb3JlIHBvc2l0aW9ucyBpbiBoaXN0b3J5IGFycmF5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2hvd0dyaWRsaW5lcyA9ICF0aGlzLnNob3dHcmlkbGluZXM7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC50ZXN0UGVyZm9ybWFuY2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCbG9ja2FkZXMgPSAhdGhpcy5zaG93QmxvY2thZGVzO1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9PSBcIlBsYXllclwiID8gXCJDb21wdXRlclwiIDogXCJQbGF5ZXJcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPSB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID09IFwiUGxheWVyXCIgPyBcIkNvbXB1dGVyXCIgOiBcIlBsYXllclwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaXplTGFiZWwuaW5uZXJIVE1MID0gYCR7dGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWV9eCR7dGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWV9YDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwoXHJcbiAgICAgICAgICAgICAgICBwYXJzZUludCh0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIixcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPT0gXCJDb21wdXRlclwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9PSBcIkNvbXB1dGVyXCJcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVBZ2FpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlVmlldygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnZpZXcuZHJhd0JvYXJkKHRoaXMubW9kZWwubWFpbkdyYXBoLCB0aGlzLnNob3dHcmlkbGluZXMsIHRoaXMuc2hvd0Jsb2NrYWRlcyk7XHJcbiAgICAgICAgdGhpcy52aWV3LmJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuX2JvYXJkQ2xpY2tlZChldmVudCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2JvYXJkQ2xpY2tlZChldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy52aWV3LmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC50cnlQbGF5aW5nTm9kZSh4LCB5KSkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKCF0aGlzLm1vZGVsLm1haW5HcmFwaC55ZWxsb3dXb24gJiZcclxuICAgICAgICAgICAgICAgICF0aGlzLm1vZGVsLm1haW5HcmFwaC5yZWRXb24gJiZcclxuICAgICAgICAgICAgICAgICEodGhpcy5tb2RlbC5tYWluR3JhcGgueWVsbG93Q3V0T2ZmICYmIHRoaXMubW9kZWwubWFpbkdyYXBoLnJlZEN1dE9mZikpIHx8XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duXHJcbiAgICAgICAgKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC55ZWxsb3dXb24pIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8uaW5uZXJIVE1MID0gYFllbGxvdyB3b25gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5tYWluR3JhcGgucmVkV29uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJJbmZvLmlubmVySFRNTCA9IGBSZWQgd29uYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLnllbGxvd0N1dE9mZiAmJiB0aGlzLm1vZGVsLm1haW5HcmFwaC5yZWRDdXRPZmYpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8uaW5uZXJIVE1MID0gYE5vYm9keSBjYW4gd2luIGFueW1vcmVgO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==