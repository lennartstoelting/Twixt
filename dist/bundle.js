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
        console.log("gameOver: ".concat(this.gameOver, " \n yellow is cut off: ").concat(this.yellowCutOff, ", red is cut off: ").concat(this.redCutOff));
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
        if (this.gameOver != 0)
            return;
        if (this.yellowsTurn && this.redCutOff)
            return;
        if (!this.yellowsTurn && this.yellowCutOff)
            return;
        // this could potentially be turned into two class variables too
        var cutOffNodeIdQueue = new Set(this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue);
        this._addFlankingNodes(cutOffNodeIdQueue, 0);
        this._addFlankingNodes(cutOffNodeIdQueue, this.matrix.length - 1);
        cutOffNodeIdQueue.forEach(function (nodeId) {
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            console.log("nodeId being searched: ".concat(nodeId));
            _this._checkCutOff(x, y);
            // check if from the left and right the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.redCutOff = true;
            }
            else if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.yellowCutOff = true;
            }
            if (_this.yellowCutOff && _this.redCutOff)
                _this.gameOver = 3;
            if (_this.gameOver != 0)
                return;
            if (_this.yellowsTurn && _this.redCutOff)
                return;
            if (!_this.yellowsTurn && _this.yellowCutOff)
                return;
            _this._nextNodesForSet(x, y, cutOffNodeIdQueue);
            var bridges = _this.matrix[x][y] >> _this.bridgeBitsOffset;
            if (!bridges)
                return;
            // if (bridges & (1 << 0)) {
            //     if ((this.matrix[x + 1][y] & 3) == (this.matrix[x][y] & 3) && this.matrix[x + 1][y] >> this.bridgeBitsOffset) {
            //         cutOffNodeIdQueue.add(x + 1 + y * this.matrix.length);
            //     }
            //     if ((this.matrix[x + 1][y + 1] & 3) == (this.matrix[x][y] & 3) && this.matrix[x + 1][y + 1] >> this.bridgeBitsOffset) {
            //         cutOffNodeIdQueue.add(x + 1 + (y + 1) * this.matrix.length);
            //     }
            // }
            // if (bridges & (1 << 1)) {
            //     if ((this.matrix[x + 1][y] & 3) == (this.matrix[x][y] & 3) && this.matrix[x + 1][y] >> this.bridgeBitsOffset) {
            //         cutOffNodeIdQueue.add(x + 1 + y * this.matrix.length);
            //     }
            //     if ((this.matrix[x + 1][y - 1] & 3) == (this.matrix[x][y] & 3) && this.matrix[x + 1][y - 1] >> this.bridgeBitsOffset) {
            //         cutOffNodeIdQueue.add(x + 1 + (y - 1) * this.matrix.length);
            //     }
            // }
            for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (1 << directionIndex)))
                    continue;
                var x_1 = x + (directionIndex & 4 ? -1 : 1) * (directionIndex & 2 ? 0 : 1);
                var y_1 = y + (directionIndex & 1 ? -1 : 1) * (directionIndex & 2 ? 1 : 0);
                var x_2 = x + (directionIndex & 4 ? -1 : 1);
                var y_2 = y + (directionIndex & 1 ? -1 : 1);
                if ((_this.matrix[x_1][y_1] & 3) == (_this.matrix[x][y] & 3) && _this.matrix[x_1][y_1] >> _this.bridgeBitsOffset) {
                    cutOffNodeIdQueue.add(x_1 + y_1 * _this.matrix.length);
                }
                if ((_this.matrix[x_2][y_2] & 3) == (_this.matrix[x][y] & 3) && _this.matrix[x_2][y_2] >> _this.bridgeBitsOffset) {
                    cutOffNodeIdQueue.add(x_2 + y_2 * _this.matrix.length);
                }
            }
        });
    };
    Graph.prototype._checkGameWon = function () {
        var _this = this;
        (this.yellowsTurn ? this.yellowsConnectedNodesQueue : this.redsConnectedNodesQueue).forEach(function (nodeId) {
            if (_this.gameOver != 0)
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            // check if the other side has been reached
            if (_this.yellowsTurn && y == _this.matrix.length - 1) {
                _this.gameOver = 1;
                return;
            }
            if (!_this.yellowsTurn && x == _this.matrix.length - 1) {
                _this.gameOver = 2;
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
        var nodesAdded = false;
        for (var i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn) {
                if (!((this.matrix[side][i] & 3) == 1)) {
                    break;
                }
                idQueue.add(side + i * this.matrix.length);
                nodesAdded = true;
            }
            else {
                if (!((this.matrix[i][side] & 3) == 2))
                    break;
                idQueue.add(i + side * this.matrix.length);
                nodesAdded = true;
            }
        }
        return nodesAdded;
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
            _this.showGridlines = !_this.showGridlines;
            _this._updateView();
            // this.model.testPerformance();
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
        if (this.model.mainGraph.gameOver == 0 || this.gameOverModalShown)
            return;
        if (this.model.mainGraph.gameOver == 1) {
            this.gameOverInfo.innerHTML = "Yellow won";
        }
        if (this.model.mainGraph.gameOver == 2) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VztJQUNsRSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRSxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDWCxPQUFPLEtBQUssQ0FBQztLQUNoQjtTQUFNO1FBQ0gsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDL0UsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FB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Q0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEUsNkRBQTZEO1FBRTdELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCO1lBQUUsT0FBTztRQUUxRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFO1lBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUMzQztRQUNELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztTQUMxRDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQUFDO0FBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3R3aXh0Ly4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL21vZGVsLnRzIiwid2VicGFjazovL3R3aXh0Ly4vc3JjL3ZpZXcudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogZ2FtZU92ZXI6IDB0aCBiaXQgPSAoeWVsbG93IGlzIGN1dCBvZmYpLCAxc3QgYml0ID0gKHJlZCBpcyBjdXQgb2ZmKSwgMm5kIGJpdCA9ICh5ZWxsb3cgd29uKSwgM3JkIGJpdCA9IChyZWQgd29uKVxyXG4gKiBDb25uZWN0ZWROb2Rlc1F1ZXVlOiBhbGwgaWRzIG9mIG5vZGVzIGJlaGluZCBzdGFydGluZyBsaW5lIHdpdGggYWxsIHRoZWlyIGNvbm5lY3Rpb25zIGludG8gdGhlIHBsYXlpbmcgZmllbGRcclxuICogICAgICBpZCA9IHggKyB5ICogdGlsZXNBY3Jvc3NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcbiAgICBtYXRyaXg6IG51bWJlcltdW107XHJcbiAgICB5ZWxsb3dzQ29ubmVjdGVkTm9kZXNRdWV1ZTogU2V0PG51bWJlcj47XHJcbiAgICByZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZTogU2V0PG51bWJlcj47XHJcblxyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcblxyXG4gICAgZ2FtZU92ZXI6IG51bWJlcjsgLy8gMSA9IHllbGxvdywgMiA9IHJlZCwgMyA9IG5vYm9keSBjYW4gd2luXHJcbiAgICB5ZWxsb3dDdXRPZmY6IGJvb2xlYW47XHJcbiAgICByZWRDdXRPZmY6IGJvb2xlYW47XHJcblxyXG4gICAgYnJpZGdlQml0c09mZnNldDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZU92ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMueWVsbG93Q3V0T2ZmID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yZWRDdXRPZmYgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJyaWRnZUJpdHNPZmZzZXQgPSAyO1xyXG4gICAgICAgIHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuICAgICAgICB0aGlzLnJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlID0gbmV3IFNldDxudW1iZXI+KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWF0cml4ID0gQXJyYXkodGlsZXNBY3Jvc3MpXHJcbiAgICAgICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgICAgIC5tYXAoKCkgPT4gQXJyYXkodGlsZXNBY3Jvc3MpLmZpbGwoMCkpO1xyXG5cclxuICAgICAgICAvLyBjb3JuZXJzLCBwb3RlbnRpYWxseSBlYXNpZXIgdG8gaW1wbGVtZW50XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbMF1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4WzBdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bMF0gPSAzO1xyXG4gICAgICAgIHRoaXMubWF0cml4W3RpbGVzQWNyb3NzIC0gMV1bdGlsZXNBY3Jvc3MgLSAxXSA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy5tYXRyaXgubGVuZ3RoLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5tYXRyaXggPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgIHJldHVybiBjbG9uZWRHcmFwaDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGVnYWxNb3ZlcygpOiBudW1iZXJbXVtdIHtcclxuICAgICAgICBsZXQgbGVnYWxNb3ZlczogbnVtYmVyW11bXSA9IFtdO1xyXG4gICAgICAgIHRoaXMubWF0cml4LmZvckVhY2goKGNvbHVtbiwgeCkgPT4ge1xyXG4gICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgobm9kZSwgeSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUgIT0gMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgbGVnYWxNb3Zlcy5wdXNoKFt4LCB5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsZWdhbE1vdmVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwbGF5Tm9kZShub2RlQTogbnVtYmVyW10pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBpZiBpdCdzIGFuIGVtcHR5IGhvbGUsIHBsYWNlIGEgcGluXHJcbiAgICAgICAgaWYgKHRoaXMubWF0cml4W25vZGVBWzBdXVtub2RlQVsxXV0gIT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMubWF0cml4W25vZGVBWzBdXVtub2RlQVsxXV0gPSB0aGlzLnllbGxvd3NUdXJuID8gMSA6IDI7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBicmlkZ2VzIGluIGFsbCBkaXJlY3Rpb25zXHJcbiAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVCID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgobm9kZUFbMF0sIG5vZGVBWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBvdXRzaWRlIG9mIGJvYXJkXHJcbiAgICAgICAgICAgIGlmIChub2RlQlswXSA8IDAgfHwgbm9kZUJbMF0gPiB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKG5vZGVCWzFdIDwgMCB8fCBub2RlQlsxXSA+IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBpZiBvbmUgb2YgdGhlIG1pc3NpbmcgY29ybmVyc1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhbbm9kZUJbMF1dW25vZGVCWzFdXSA9PSAzKSBjb250aW51ZTtcclxuICAgICAgICAgICAgLy8gaWYgbm90IHRoZSBzYW1lIGNvbG9yXHJcbiAgICAgICAgICAgIGlmICgodGhpcy5tYXRyaXhbbm9kZUJbMF1dW25vZGVCWzFdXSAmIDMpICE9ICh0aGlzLm1hdHJpeFtub2RlQVswXV1bbm9kZUFbMV1dICYgMykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgbGV0IG90aGVyRGlyZWN0aW9uSW5kZXggPSBkaXJlY3Rpb25JbmRleCAmIDEgPyAoZGlyZWN0aW9uSW5kZXggKyAzKSAlIDggOiAoZGlyZWN0aW9uSW5kZXggKyA1KSAlIDg7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGVja0ZvckJsb2NrYWRlcyhub2RlQSwgbm9kZUIsIGRpcmVjdGlvbkluZGV4LCBvdGhlckRpcmVjdGlvbkluZGV4KSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgZWRnZSBpbiBib3RoIGRpcmVjdGlvbnNcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSB8PSAxIDw8IChkaXJlY3Rpb25JbmRleCArIHRoaXMuYnJpZGdlQml0c09mZnNldCk7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W25vZGVCWzBdXVtub2RlQlsxXV0gfD0gMSA8PCAob3RoZXJEaXJlY3Rpb25JbmRleCArIHRoaXMuYnJpZGdlQml0c09mZnNldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jaGVja0dhbWVPdmVyKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGdhbWVPdmVyOiAke3RoaXMuZ2FtZU92ZXJ9IFxcbiB5ZWxsb3cgaXMgY3V0IG9mZjogJHt0aGlzLnllbGxvd0N1dE9mZn0sIHJlZCBpcyBjdXQgb2ZmOiAke3RoaXMucmVkQ3V0T2ZmfWApO1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2hlY2tGb3JCbG9ja2FkZXMobm9kZUE6IG51bWJlcltdLCBub2RlQjogbnVtYmVyW10sIG1haW5EaXJlY3Rpb25JbmRleDogbnVtYmVyLCBvdGhlckRpcmVjdGlvbkluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyBlc3RhYmxpc2ggdGhlIGJvdW5kaW5nIHJlY3RhbmdsZSB0aGF0IGNvbnRhaW5zIHRoZSBicmlkZ2UgY29ubmVjdGlvblxyXG4gICAgICAgIGxldCB0b3BMZWZ0WCA9IE1hdGgubWluKG5vZGVBWzBdLCBub2RlQlswXSk7XHJcbiAgICAgICAgbGV0IHRvcExlZnRZID0gTWF0aC5taW4obm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRYID0gTWF0aC5tYXgobm9kZUFbMF0sIG5vZGVCWzBdKTtcclxuICAgICAgICBsZXQgYm90dG9tUmlnaHRZID0gTWF0aC5tYXgobm9kZUFbMV0sIG5vZGVCWzFdKTtcclxuXHJcbiAgICAgICAgLy8gY29sbGVjdCB0aGUgNCBub2RlcyBpbiB0aGUgcmVjdGFuZ2xlLCBza2lwcGluZyB0aGUgb25lcyB0aGUgb3JpZ2luYWwgYnJpZGdlIGlzIGNvbm5lY3RpbmdcclxuICAgICAgICBsZXQgcmVjdE5vZGVzOiBudW1iZXJbXVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcmVjdFkgPSB0b3BMZWZ0WTsgcmVjdFkgPD0gYm90dG9tUmlnaHRZOyByZWN0WSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlY3RYID0gdG9wTGVmdFg7IHJlY3RYIDw9IGJvdHRvbVJpZ2h0WDsgcmVjdFgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlY3RYID09IG5vZGVBWzBdICYmIHJlY3RZID09IG5vZGVBWzFdKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWN0WCA9PSBub2RlQlswXSAmJiByZWN0WSA9PSBub2RlQlsxXSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICByZWN0Tm9kZXMucHVzaChbcmVjdFgsIHJlY3RZXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZvciB0aGUgNCBOb2Rlcywgc2VlIGlmIGFueSBvZiB0aGVtIGhhdmUgYW4gaW50ZXJzZWN0aW5nIGJyaWRnZVxyXG4gICAgICAgIHJldHVybiByZWN0Tm9kZXMuc29tZSgocmVjdE5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGVjayB0aGUgbm9kZXMgdGhhdCBoYXZlIGJyaWRnZXNcclxuICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFtyZWN0Tm9kZVswXV1bcmVjdE5vZGVbMV1dID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBnbyBvdmVyIGVhY2ggYnJpZGdlIGFuZCBjaGVjayBmb3IgaW50ZXJzZWN0aW9uIHdpdGggdGhlIG9yaWdpbmFsIG9uZVxyXG4gICAgICAgICAgICBmb3IgKGxldCBkaXJlY3Rpb25JbmRleCA9IDA7IGRpcmVjdGlvbkluZGV4IDwgODsgZGlyZWN0aW9uSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHBvdGVudGlhbGx5IGludGVyc2VjdGluZyBicmlkZ2VzIGFyZSBwYXJhbGVsbFxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbkluZGV4ID09IG1haW5EaXJlY3Rpb25JbmRleCB8fCBkaXJlY3Rpb25JbmRleCA9PSBvdGhlckRpcmVjdGlvbkluZGV4KSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMSA8PCBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0c2lkZVJlY3ROb2RlID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgocmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcG90ZW50aWFsbHkgaW50ZXJzZWN0aW5nIGJyaWRnZSBzaG9vdHMgb2YgaW4gYW5vdGhlciBkaXJlY3Rpb25cclxuICAgICAgICAgICAgICAgIC8vIHdpdGggYSBkaXN0YW5jZSBvZiArLy0yIGZyb20gdGhlIG9yaWdpbmFsIHJlY3RhbmdsZSB0aGF0IHdhcyBlbmNhc2luZyB0aGUgb3JpZ2luYWwgYnJpZGdlXHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0c2lkZVJlY3ROb2RlWzBdIDwgdG9wTGVmdFggLSAxIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0c2lkZVJlY3ROb2RlWzBdID4gYm90dG9tUmlnaHRYICsgMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHNpZGVSZWN0Tm9kZVsxXSA8IHRvcExlZnRZIC0gMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHNpZGVSZWN0Tm9kZVsxXSA+IGJvdHRvbVJpZ2h0WSArIDFcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnNlY3RzKG5vZGVBLCBub2RlQiwgcmVjdE5vZGUsIG91dHNpZGVSZWN0Tm9kZSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIGdhbWVPdmVyIDogMHRoIGJpdCA9ICh5ZWxsb3cgaXMgY3V0IG9mZiksIDFzdCBiaXQgPSAocmVkIGlzIGN1dCBvZmYpLCAybmQgYml0ID0gKHllbGxvdyB3b24pLCAzcmQgYml0ID0gKHJlZCB3b24pXHJcbiAgICBwcml2YXRlIF9jaGVja0dhbWVPdmVyKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGNvdWxkIGJlIHNvcnRlZCBoaWdoZXN0IG51bWJlciB0byBsb3dlc3QgbnVtYmVyIHRvIGhhdmUgY29uZGl0aW9ucyBzdG9wIGVhY2ggbG9vcCBlYXJsaWVyXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlTm9kZXNRdWV1ZSgpO1xyXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gY2hlY2sgdGhlIHdpbiBjb25kaXRpb24gaWYgdGhlIGN1cnJlbnQgbW92aW5nIHBsYXllciBpcyBhbHJlYWR5IGN1dCBvZmZcclxuICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgIXRoaXMueWVsbG93Q3V0T2ZmKSB8fCAoIXRoaXMueWVsbG93c1R1cm4gJiYgIXRoaXMucmVkQ3V0T2ZmKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja0dhbWVXb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGdhbWUgYWxyZWFkeSB3b24gb3IgY3V0b2ZmIGFscmVhZHkgZGV0ZWN0ZWQgZWFybGllciwgbm8gbmVlZCB0byBjaGVjayBhbnltb3JlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZU92ZXIgIT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuICYmIHRoaXMucmVkQ3V0T2ZmKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmIHRoaXMueWVsbG93Q3V0T2ZmKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIHRoaXMgY291bGQgcG90ZW50aWFsbHkgYmUgdHVybmVkIGludG8gdHdvIGNsYXNzIHZhcmlhYmxlcyB0b29cclxuICAgICAgICBsZXQgY3V0T2ZmTm9kZUlkUXVldWUgPSBuZXcgU2V0KHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLnllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlIDogdGhpcy5yZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FkZEZsYW5raW5nTm9kZXMoY3V0T2ZmTm9kZUlkUXVldWUsIDApO1xyXG4gICAgICAgIHRoaXMuX2FkZEZsYW5raW5nTm9kZXMoY3V0T2ZmTm9kZUlkUXVldWUsIHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpO1xyXG5cclxuICAgICAgICBjdXRPZmZOb2RlSWRRdWV1ZS5mb3JFYWNoKChub2RlSWQpID0+IHtcclxuICAgICAgICAgICAgLy8gdHJhbnNsYXRlIGlkIHRvIGNvb3Jkc1xyXG4gICAgICAgICAgICBsZXQgeCA9IG5vZGVJZCAlIHRoaXMubWF0cml4Lmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKG5vZGVJZCAvIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgbm9kZUlkIGJlaW5nIHNlYXJjaGVkOiAke25vZGVJZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrQ3V0T2ZmKHgsIHkpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZnJvbSB0aGUgbGVmdCBhbmQgcmlnaHQgdGhlIG90aGVyIHNpZGUgaGFzIGJlZW4gcmVhY2hlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkQ3V0T2ZmID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiB4ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93Q3V0T2ZmID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93Q3V0T2ZmICYmIHRoaXMucmVkQ3V0T2ZmKSB0aGlzLmdhbWVPdmVyID0gMztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWVPdmVyICE9IDApIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4gJiYgdGhpcy5yZWRDdXRPZmYpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmIHRoaXMueWVsbG93Q3V0T2ZmKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uZXh0Tm9kZXNGb3JTZXQoeCwgeSwgY3V0T2ZmTm9kZUlkUXVldWUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFt4XVt5XSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgKGJyaWRnZXMgJiAoMSA8PCAwKSkge1xyXG4gICAgICAgICAgICAvLyAgICAgaWYgKCh0aGlzLm1hdHJpeFt4ICsgMV1beV0gJiAzKSA9PSAodGhpcy5tYXRyaXhbeF1beV0gJiAzKSAmJiB0aGlzLm1hdHJpeFt4ICsgMV1beV0gPj4gdGhpcy5icmlkZ2VCaXRzT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgY3V0T2ZmTm9kZUlkUXVldWUuYWRkKHggKyAxICsgeSAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vICAgICBpZiAoKHRoaXMubWF0cml4W3ggKyAxXVt5ICsgMV0gJiAzKSA9PSAodGhpcy5tYXRyaXhbeF1beV0gJiAzKSAmJiB0aGlzLm1hdHJpeFt4ICsgMV1beSArIDFdID4+IHRoaXMuYnJpZGdlQml0c09mZnNldCkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGN1dE9mZk5vZGVJZFF1ZXVlLmFkZCh4ICsgMSArICh5ICsgMSkgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIC8vIGlmIChicmlkZ2VzICYgKDEgPDwgMSkpIHtcclxuICAgICAgICAgICAgLy8gICAgIGlmICgodGhpcy5tYXRyaXhbeCArIDFdW3ldICYgMykgPT0gKHRoaXMubWF0cml4W3hdW3ldICYgMykgJiYgdGhpcy5tYXRyaXhbeCArIDFdW3ldID4+IHRoaXMuYnJpZGdlQml0c09mZnNldCkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGN1dE9mZk5vZGVJZFF1ZXVlLmFkZCh4ICsgMSArIHkgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyAgICAgaWYgKCh0aGlzLm1hdHJpeFt4ICsgMV1beSAtIDFdICYgMykgPT0gKHRoaXMubWF0cml4W3hdW3ldICYgMykgJiYgdGhpcy5tYXRyaXhbeCArIDFdW3kgLSAxXSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQpIHtcclxuICAgICAgICAgICAgLy8gICAgICAgICBjdXRPZmZOb2RlSWRRdWV1ZS5hZGQoeCArIDEgKyAoeSAtIDEpICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMSA8PCBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGxldCB4XzEgPSB4ICsgKGRpcmVjdGlvbkluZGV4ICYgNCA/IC0xIDogMSkgKiAoZGlyZWN0aW9uSW5kZXggJiAyID8gMCA6IDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlfMSA9IHkgKyAoZGlyZWN0aW9uSW5kZXggJiAxID8gLTEgOiAxKSAqIChkaXJlY3Rpb25JbmRleCAmIDIgPyAxIDogMCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeF8yID0geCArIChkaXJlY3Rpb25JbmRleCAmIDQgPyAtMSA6IDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlfMiA9IHkgKyAoZGlyZWN0aW9uSW5kZXggJiAxID8gLTEgOiAxKTtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5tYXRyaXhbeF8xXVt5XzFdICYgMykgPT0gKHRoaXMubWF0cml4W3hdW3ldICYgMykgJiYgdGhpcy5tYXRyaXhbeF8xXVt5XzFdID4+IHRoaXMuYnJpZGdlQml0c09mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1dE9mZk5vZGVJZFF1ZXVlLmFkZCh4XzEgKyB5XzEgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLm1hdHJpeFt4XzJdW3lfMl0gJiAzKSA9PSAodGhpcy5tYXRyaXhbeF1beV0gJiAzKSAmJiB0aGlzLm1hdHJpeFt4XzJdW3lfMl0gPj4gdGhpcy5icmlkZ2VCaXRzT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3V0T2ZmTm9kZUlkUXVldWUuYWRkKHhfMiArIHlfMiAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0dhbWVXb24oKSB7XHJcbiAgICAgICAgKHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLnllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlIDogdGhpcy5yZWRzQ29ubmVjdGVkTm9kZXNRdWV1ZSkuZm9yRWFjaCgobm9kZUlkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWVPdmVyICE9IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBpZCB0byBjb29yZHNcclxuICAgICAgICAgICAgbGV0IHggPSBub2RlSWQgJSB0aGlzLm1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihub2RlSWQgLyB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG90aGVyIHNpZGUgaGFzIGJlZW4gcmVhY2hlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgPSAxO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiB4ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgPSAyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uZXh0Tm9kZXNGb3JTZXQoeCwgeSwgdGhpcy55ZWxsb3dzVHVybiA/IHRoaXMueWVsbG93c0Nvbm5lY3RlZE5vZGVzUXVldWUgOiB0aGlzLnJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcmV0dXJucyBTZXQgb2YgSWRzIG9mIGFsbCB0aGUgTm9kZXMgYmVoaW5kIHRoZSBzdGFydGluZyBsaW5lXHJcbiAgICBwcml2YXRlIF91cGRhdGVOb2Rlc1F1ZXVlKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5tYXRyaXgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuICYmICh0aGlzLm1hdHJpeFtpXVswXSAmIDMpID09IDEgJiYgdGhpcy5tYXRyaXhbaV1bMF0gPiAzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd3NDb25uZWN0ZWROb2Rlc1F1ZXVlLmFkZChpICsgMCAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmICh0aGlzLm1hdHJpeFswXVtpXSAmIDMpID09IDIgJiYgdGhpcy5tYXRyaXhbMF1baV0gPiAzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZHNDb25uZWN0ZWROb2Rlc1F1ZXVlLmFkZCgwICsgaSAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yIHRoZSBjdXJyZW50IG5vZGUgaW4gdGhlIGxvb3AsIGFkZCBpdCdzIGNvbm5lY3RlZCBub2RlcyB0byB0aGUgc2V0XHJcbiAgICBwcml2YXRlIF9uZXh0Tm9kZXNGb3JTZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNldDogU2V0PG51bWJlcj4pOiB2b2lkIHtcclxuICAgICAgICAvLyBjaGVjayBpZiBjdXJyZW50IG5vZGUgaW4gc3RhY2sgaGFzIG1vcmUgbm9kZXMgY29ubmVjdGVkXHJcbiAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFt4XVt5XSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm47XHJcblxyXG4gICAgICAgIGZvciAobGV0IGRpcmVjdGlvbkluZGV4ID0gMDsgZGlyZWN0aW9uSW5kZXggPCA4OyBkaXJlY3Rpb25JbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMSA8PCBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4LCB5LCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgIHNldC5hZGQobmV4dFswXSArIG5leHRbMV0gKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBmb3IgY3V0b2ZmIGRldGVjdGlvbiB3ZSBpbmNvcnBvcmF0ZSB0aGUgbm9kZXMgb24gZWl0aGVyIGVkZ2VcclxuICAgIHByaXZhdGUgX2FkZEZsYW5raW5nTm9kZXMoaWRRdWV1ZTogU2V0PG51bWJlcj4sIHNpZGU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub2Rlc0FkZGVkID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLm1hdHJpeC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4pIHtcclxuICAgICAgICAgICAgICAgIGlmICghKCh0aGlzLm1hdHJpeFtzaWRlXVtpXSAmIDMpID09IDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZFF1ZXVlLmFkZChzaWRlICsgaSAqIHRoaXMubWF0cml4Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBub2Rlc0FkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghKCh0aGlzLm1hdHJpeFtpXVtzaWRlXSAmIDMpID09IDIpKSBicmVhaztcclxuICAgICAgICAgICAgICAgIGlkUXVldWUuYWRkKGkgKyBzaWRlICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIG5vZGVzQWRkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2Rlc0FkZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIHRvIHRoZSBsZWZ0IG9yIHJpZ2h0IGV2ZXJ5dGhpbmcgaXMgY3V0b2ZmIGZvciB0aGUgb3RoZXIgcGxheWVyXHJcbiAgICBwcml2YXRlIF9jaGVja0N1dE9mZih4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgcmVhY2hlZCBlaXRoZXIgc2lkZVxyXG4gICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuICYmICF0aGlzLnJlZEN1dE9mZiAmJiAoeCA9PSAwIHx8IHggPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgLy8gcmVkIGlzIHRlbXBvcmFybHkgY3V0IG9mZlxyXG4gICAgICAgICAgICB0aGlzLnJlZEN1dE9mZiA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5leHRZID0geSArIDE7IG5leHRZIDw9IHRoaXMubWF0cml4Lmxlbmd0aCAtIDI7IG5leHRZKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFt4XVtuZXh0WV0gJiAxKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkQ3V0T2ZmID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnllbGxvd3NUdXJuICYmICF0aGlzLnllbGxvd0N1dE9mZiAmJiAoeSA9PSAwIHx8IHkgPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgLy8geWVsbG93IGlzIHRlbXBvcmFybHkgY3V0IG9mZlxyXG4gICAgICAgICAgICB0aGlzLnllbGxvd0N1dE9mZiA9IHRydWU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5leHRYID0geCArIDE7IG5leHRYIDw9IHRoaXMubWF0cml4Lmxlbmd0aCAtIDI7IG5leHRYKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeFtuZXh0WF1beV0gJiAyKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93Q3V0T2ZmID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIGdldHMgYSBkaXJlY3Rpb25JbmRleCBiZXR3ZWVuIDAgYW5kIDcgYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgeCBhbmQgeSBkaXJlY3Rpb25cclxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb25JbmRleDogbnVtYmVyKTogbnVtYmVyW10ge1xyXG4gICAgbGV0IG5ld1ggPSAoZGlyZWN0aW9uSW5kZXggJiAyID8gMSA6IDIpICogKGRpcmVjdGlvbkluZGV4ICYgNCA/IC0xIDogMSk7XHJcbiAgICBsZXQgbmV3WSA9IChkaXJlY3Rpb25JbmRleCAmIDIgPyAyIDogMSkgKiAoZGlyZWN0aW9uSW5kZXggJiAxID8gLTEgOiAxKTtcclxuXHJcbiAgICByZXR1cm4gW3ggKyBuZXdYLCB5ICsgbmV3WV07XHJcbn1cclxuXHJcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkwNDM4MDUvdGVzdC1pZi10d28tbGluZXMtaW50ZXJzZWN0LWphdmFzY3JpcHQtZnVuY3Rpb25cclxuZnVuY3Rpb24gaW50ZXJzZWN0cyhhOiBudW1iZXJbXSwgYjogbnVtYmVyW10sIHA6IG51bWJlcltdLCBxOiBudW1iZXJbXSkge1xyXG4gICAgdmFyIGRldCwgZ2FtbWEsIGxhbWJkYTtcclxuICAgIGRldCA9IChiWzBdIC0gYVswXSkgKiAocVsxXSAtIHBbMV0pIC0gKHFbMF0gLSBwWzBdKSAqIChiWzFdIC0gYVsxXSk7XHJcbiAgICBpZiAoZGV0ID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBsYW1iZGEgPSAoKHFbMV0gLSBwWzFdKSAqIChxWzBdIC0gYVswXSkgKyAocFswXSAtIHFbMF0pICogKHFbMV0gLSBhWzFdKSkgLyBkZXQ7XHJcbiAgICAgICAgZ2FtbWEgPSAoKGFbMV0gLSBiWzFdKSAqIChxWzBdIC0gYVswXSkgKyAoYlswXSAtIGFbMF0pICogKHFbMV0gLSBhWzFdKSkgLyBkZXQ7XHJcbiAgICAgICAgcmV0dXJuIDAgPCBsYW1iZGEgJiYgbGFtYmRhIDwgMSAmJiAwIDwgZ2FtbWEgJiYgZ2FtbWEgPCAxO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IEdyYXBoIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbmNsYXNzIE1vZGVsIHtcclxuICAgIG1haW5HcmFwaDogR3JhcGg7XHJcbiAgICBoaXN0b3J5OiBHcmFwaFtdO1xyXG4gICAgeWVsbG93QUk6IGJvb2xlYW47XHJcbiAgICByZWRBSTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dTdGFydHM6IGJvb2xlYW4sIHllbGxvd0FJOiBib29sZWFuLCByZWRBSTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB5ZWxsb3dTdGFydHMpO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93QUkgPSB5ZWxsb3dBSTtcclxuICAgICAgICB0aGlzLnJlZEFJID0gcmVkQUk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyeVBsYXlpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGN1cnJHcmFwaCA9IHRoaXMubWFpbkdyYXBoLmNsb25lKCk7XHJcbiAgICAgICAgbGV0IHBpblBsYWNlZCA9IHRoaXMubWFpbkdyYXBoLnBsYXlOb2RlKFt4LCB5XSk7XHJcbiAgICAgICAgaWYgKCFwaW5QbGFjZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChjdXJyR3JhcGgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdW5kb01vdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gdGhpcy5oaXN0b3J5LnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1heWJlIG1vdmUgdGhpcyB0byBhbiBleHRyYSB0ZXN0LnRzIGZpbGVcclxuICAgIHB1YmxpYyBydW5QZXJmb3JtYW5jZSguLi5hcmdzOiBhbnkpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYXJnc1tpXSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUudGltZShhcmdzW2ldLm5hbWUpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwMDAwMDAwMDA7IGorKykge1xyXG4gICAgICAgICAgICAgICAgYXJnc1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoYXJnc1tpXS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRlc3RQZXJmb3JtYW5jZSgpIHtcclxuICAgICAgICB0aGlzLnJ1blBlcmZvcm1hbmNlKHRoaXMubWFpbkdyYXBoLmNsb25lKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbHBoYSBiZXRhIHBydW5pbmcgbWl0IGl0ZXJhdGl2ZSBkZWVwZW5pbmdcclxuICAgIC8vIGRhenUgbG9va3VwL3RyYW5zcG9zaXRpb24gdGFibGVcclxuICAgIC8vIHZpZWxsZWljaHQgcnVuLWxlbmdodCBlbmNvZGluZyB6dW0gc3BhcmVuIHZvbiBTcGVpY2hlclxyXG5cclxuICAgIC8vIG1laHIgZXZhbHVhdGlvbiBpbiBncmFwaCBhbHMgbnVyIGRpZSBGYWt0ZW5iYXNpZXJ0ZVxyXG4gICAgLy8gYWxzbyBlaWdlbmUgaGV1cmlzdGlrIMO8YmVybGVnZW5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XHJcbiIsImltcG9ydCB7IEdyYXBoLCBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuICAgIGJvYXJkOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHRpbGVTaXplOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBib3JkZXJSYWRpdXM6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29ybmVyczogbnVtYmVyW107XHJcblxyXG4gICAgcHJpdmF0ZSBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuXHJcbiAgICBwcml2YXRlIHdob3NUdXJuOiBIVE1MRWxlbWVudDtcclxuICAgIHByaXZhdGUgYm9hcmRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMud2hvc1R1cm4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndob3MtdHVyblwiKTtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIikgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJSYWRpdXMgPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkcmF3Qm9hcmQoZ3JhcGg6IEdyYXBoLCBncmlkbGluZXM6IGJvb2xlYW4sIGJsb2NrYWRlczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyhncmFwaCk7XHJcbiAgICAgICAgdGhpcy5fZHJhd0JhY2tncm91bmQoKTtcclxuICAgICAgICBpZiAoZ3JpZGxpbmVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RyYXdHcmlkbGluZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZHJhd0ZpbmlzaExpbmVzKCk7XHJcblxyXG4gICAgICAgIGdyYXBoLm1hdHJpeC5mb3JFYWNoKChjb2x1bW4sIHgpID0+IHtcclxuICAgICAgICAgICAgY29sdW1uLmZvckVhY2goKG5vZGUsIHkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlID09IDMpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZUNlbnRlclggPSB4ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0geSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclksIHRoaXMudGlsZVNpemUgLyA2LCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBub2RlID09IDAgPyBcImJsYWNrXCIgOiBub2RlICYgMSA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgYnJpZGdlc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBub2RlID09IDAgPyBcImJsYWNrXCIgOiBub2RlICYgMSA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSBub2RlID4+IGdyYXBoLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJyaWRnZXMpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMiAqKiBpKSkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29ubmVjdGVkQ29vcmQgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4LCB5LCBpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNvbm5lY3RlZENvb3JkWzBdICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBjb25uZWN0ZWRDb29yZFsxXSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB0aGlzIGxpbmUgY291bGQgYmUgbWFkZSBzaG9ydGVyXHJcbiAgICAgICAgdGhpcy53aG9zVHVybi5pbm5lckhUTUwgPSBncmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgY2FuIHByb2JhYmx5IGJlIGNoYW5nZWQgd2l0aCBjbGVhclJlY3QgaW5zdGVhZCBvZiBjcmVhdGluZyBhIHdob2xlIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2FudmFzXHJcbiAgICBwcml2YXRlIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IHRoaXMuYm9yZGVyUmFkaXVzICsgXCIlXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5tYXJnaW4gPSBcIjElXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC53aWR0aCA9IHRoaXMuYm9hcmRDb250YWluZXIuY2xpZW50V2lkdGggKiAwLjk4O1xyXG4gICAgICAgIHRoaXMuYm9hcmQuaGVpZ2h0ID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRIZWlnaHQgKiAwLjk4O1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuYm9hcmQpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuYm9hcmQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoID0gdGhpcy5ib2FyZC5jbGllbnRXaWR0aDtcclxuICAgICAgICB0aGlzLnRpbGVTaXplID0gdGhpcy5ib2FyZFNpZGVMZW5ndGggLyBncmFwaC5tYXRyaXgubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnJvdW5kUmVjdCgwLCAwLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoLCB0aGlzLmJvYXJkLmNsaWVudFdpZHRoICogKHRoaXMuYm9yZGVyUmFkaXVzIC8gMTAwKSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdHcmlkbGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gdGhpcy5ib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGhpcy50aWxlU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhsLCB0aGlzLmJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDI1O1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdGaW5pc2hMaW5lcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvcm5lcnMgPSBbXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUgLSB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gNjtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVmlldztcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIjtcclxuaW1wb3J0IFZpZXcgZnJvbSBcIi4vdmlld1wiO1xyXG5cclxuLyoqIGhhbmRsZXMgYWxsIGlucHV0LCBjaGVja3MgaW4gd2l0aCBtb2RlbCBhbmQgZGlzcGxheXMgdGhlIHJlc3VsdCB3aXRoIHZpZXcgKi9cclxuXHJcbnZhciB0aWxlc0Fjcm9zc0RlZmF1bHQgPSA2O1xyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcbiAgICBtb2RlbDogTW9kZWw7XHJcbiAgICB2aWV3OiBWaWV3O1xyXG5cclxuICAgIHByaXZhdGUgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgc2hvd0Jsb2NrYWRlczogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZ2FtZU92ZXJNb2RhbFNob3duOiBib29sZWFuOyAvLyBoYXMgdGhlIHBsYXllciBhbHJlYWR5IHNlZW4gdGhlIGdhbWUgd29uIE1vZGFsIGFuZCB3YW50ZWQgdG8ga2VlcCBwbGF5aW5nP1xyXG5cclxuICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgIHNldHVwR2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgeWVsbG93QWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZFN0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZUxhYmVsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0QnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lT3Zlck1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIGdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICBnYW1lT3ZlckluZm86IEhUTUxFbGVtZW50O1xyXG4gICAgcmVzdGFydEdhbWVBZ2FpbkJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICBrZWVwUGxheWluZ0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbCh0aWxlc0Fjcm9zc0RlZmF1bHQsIHRydWUsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IFZpZXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZ2V0RG9tRWxlbWVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0RXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldERvbUVsZW1lbnRzKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidW5kby1tb3ZlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtZ3JpZGxpbmVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtYmxvY2thZGVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgICAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnQtZ2FtZS1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtYWlcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1zaXplXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZS1sYWJlbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID0gXCJQbGF5ZXJcIjtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPSBcIkNvbXB1dGVyXCI7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgc2Vjb25kXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUgPSB0aWxlc0Fjcm9zc0RlZmF1bHQudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsLmlubmVySFRNTCA9IGAke3RpbGVzQWNyb3NzRGVmYXVsdH14JHt0aWxlc0Fjcm9zc0RlZmF1bHR9YDtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtb3Zlci1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVsxXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmdhbWVPdmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1vdmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXRFdmVudExpc3RlbmVycygpOiB2b2lkIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS0vZGVidWctYnV0dG9uc1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gdGhlIHZlcnkgcmFyZSBjYXNlIHRoYXQgdGhlIGxhc3QgbW92ZSB3YXMgYSBnYW1lIGVuZGluZywgdG9nZ2xpbmcgdGhlIG1vZGFsIHRvIHNob3dcclxuICAgICAgICAgICAgLy8gaWYgdGhhdCBtb3ZlIGlzIGJlaW5nIHVuZG9uZSwgdGhlIG1vZGFsU2hvd24gdmFyaWFibGUgaXMgbm90IHlldCBoYW5kZWxlZFxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnVuZG9Nb3ZlKCkgPyB0aGlzLl91cGRhdGVWaWV3KCkgOiBjb25zb2xlLmxvZyhcIm5vIG1vcmUgcG9zaXRpb25zIGluIGhpc3RvcnkgYXJyYXlcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93R3JpZGxpbmVzID0gIXRoaXMuc2hvd0dyaWRsaW5lcztcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm1vZGVsLnRlc3RQZXJmb3JtYW5jZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiUGxheWVyXCIgPyBcIkNvbXB1dGVyXCIgOiBcIlBsYXllclwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9IHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJQbGF5ZXJcIiA/IFwiQ29tcHV0ZXJcIiA6IFwiUGxheWVyXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX14JHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX1gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbChcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9PSBcIkNvbXB1dGVyXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIlxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmtlZXBQbGF5aW5nQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF91cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy5fYm9hcmRDbGlja2VkKGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYm9hcmRDbGlja2VkKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLnZpZXcuYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHdoaWNoIHRpbGUgd2FzIGNsaWNrZWQgZnJvbSBnbG9iYWwgY29vcmRpbmF0ZXMgdG8gbWF0cml4IGNvb3JkaW5hdGVzXHJcbiAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApIC8gdGhpcy52aWV3LnRpbGVTaXplKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLnRyeVBsYXlpbmdOb2RlKHgsIHkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVPdmVyID09IDAgfHwgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24pIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVPdmVyID09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8uaW5uZXJIVE1MID0gYFllbGxvdyB3b25gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5tYWluR3JhcGguZ2FtZU92ZXIgPT0gMikge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVySW5mby5pbm5lckhUTUwgPSBgUmVkIHdvbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lT3ZlciA9PSAzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJJbmZvLmlubmVySFRNTCA9IGBOb2JvZHkgY2FuIHdpbiBhbnltb3JlYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgQ29udHJvbGxlcigpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=