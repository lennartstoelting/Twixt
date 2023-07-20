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
 * for understanding the bitwise operations
 * https://www.w3schools.com/js/js_bitwise.asp
 */
var Graph = /** @class */ (function () {
    function Graph(tilesAcross, yellowsTurn) {
        this.yellowsTurn = yellowsTurn;
        this.gameOver = 0;
        this.bridgeBitsOffset = 2;
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
    // maybe needs to be rewirtten because the nodes are already existing in the matrix, it's more like playing a move
    // maybe makeMove ?
    Graph.prototype.playNode = function (nodeA) {
        // if it's an empty hole, place a pin
        if (this.matrix[nodeA[0]][nodeA[1]] != 0)
            return false;
        this.matrix[nodeA[0]][nodeA[1]] = this.yellowsTurn ? 1 : 2;
        // now check for bridges in all directions
        var bridgeAdded = false; // to know if the win condition needs to be cheked
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
            bridgeAdded = true;
        }
        this._checkGameOver();
        console.log(this.gameOver);
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
                if (intersects(nodeA[0], nodeA[1], nodeB[0], nodeB[1], rectNode[0], rectNode[1], outsideRectNode[0], outsideRectNode[1])) {
                    return true;
                }
            }
        });
    };
    Graph.prototype._checkGameOver = function () {
        var _this = this;
        // because of the weird behaviour of sets, it will get the id of a node instead of the coordinates
        // let id = x + y * tilesAcross;
        var nodeIdQueue = new Set();
        for (var i = 1; i < this.matrix.length - 1; i++) {
            if (this.yellowsTurn) {
                if ((this.matrix[i][0] & 3) == 1) {
                    nodeIdQueue.add(i + 0 * this.matrix.length);
                }
            }
            else {
                if ((this.matrix[0][i] & 3) == 2) {
                    nodeIdQueue.add(0 + i * this.matrix.length);
                }
            }
        }
        if (nodeIdQueue.size == 0)
            return;
        var connectionFound = false;
        nodeIdQueue.forEach(function (nodeId) {
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
            // check if the opponent has been cut off
            if (_this.yellowsTurn && _this.gameOver | 2 && (x == 0 || x == _this.matrix.length - 1)) {
                _this.gameOver |= 2;
                for (var nextY = y + 1; nextY <= _this.matrix.length - 2; nextY++) {
                    if (!(_this.matrix[x][nextY] & 1)) {
                        _this.gameOver &= ~2;
                    }
                }
            }
            if (!_this.yellowsTurn && _this.gameOver | 1 && (y == 0 || y == _this.matrix.length - 1)) {
                _this.gameOver |= 1;
                for (var nextX = x + 1; nextX <= _this.matrix.length - 2; nextX++) {
                    if (!(_this.matrix[nextX][y] & 2)) {
                        _this.gameOver &= ~1;
                    }
                }
            }
            // check if current node in stack has more nodes connected
            var bridges = _this.matrix[x][y] >> _this.bridgeBitsOffset;
            if (!bridges)
                return;
            for (var directionIndex = 0; directionIndex < 8; directionIndex++) {
                if (!(bridges & (Math.pow(2, directionIndex))))
                    continue;
                var next = pointInDirectionOfIndex(x, y, directionIndex);
                nodeIdQueue.add(next[0] + next[1] * _this.matrix.length);
            }
        });
    };
    return Graph;
}());

// gets a directionIndex between 0 and 7 and returns the corresponding x and y direction
function pointInDirectionOfIndex(x, y, directionIndex) {
    var newX = (directionIndex & 2 ? 1 : 2) * (directionIndex & 4 ? -1 : 1);
    var newY = (directionIndex & 2 ? 2 : 1) * (directionIndex & 1 ? -1 : 1);
    return [x + newX, y + newY];
}
/**
 * https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEUsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsVUFBVSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO0lBQ3RHLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7SUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO1NBQU07UUFDSCxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN2RCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN0RCxPQUFPLENBQUMsR0FBRyxNQUFNLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLEtB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QyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMzQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQ25DLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUM7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvdmlldy50cyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3R3aXh0Ly4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBmb3IgdW5kZXJzdGFuZGluZyB0aGUgYml0d2lzZSBvcGVyYXRpb25zXHJcbiAqIGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vanMvanNfYml0d2lzZS5hc3BcclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGgge1xyXG4gICAgbWF0cml4OiBudW1iZXJbXVtdO1xyXG5cclxuICAgIHllbGxvd3NUdXJuOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiAwdGggYml0ID0gKHllbGxvdyBjYW4ndCB3aW4pLCAxc3QgYml0ID0gKHJlZCBjYW4ndCB3aW4pLCAybmQgYml0ID0gKHllbGxvdyB3b24pLCAzcmQgYml0ID0gKHJlZCB3b24pXHJcbiAgICAgKiB3ZSBhZGQgdG8gdGhpcyBzY29yZSBieSBkb2luZyBhbiBvciBvcGVyYXRpb24gc28gdGhhdCB0aGUgZ2FtZSBpcyBvdmVyIHdoZW4gdGhpcyBzY29yZSBpcyAzIG9yIGhpZ2hlclxyXG4gICAgICogMyBtZWFucyBlaXRoZXIgcGFydHkgY2FuJ3Qgd2luLCA0IG1lYW5zIHllbGxvdyB3b24gYW5kIDggbWVhbnMgcmVkIHdvblxyXG4gICAgICovXHJcbiAgICBnYW1lT3ZlcjogbnVtYmVyO1xyXG4gICAgZXZhbHVhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIGJyaWRnZUJpdHNPZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dzVHVybjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLmdhbWVPdmVyID0gMDtcclxuICAgICAgICB0aGlzLmJyaWRnZUJpdHNPZmZzZXQgPSAyO1xyXG5cclxuICAgICAgICB0aGlzLm1hdHJpeCA9IEFycmF5KHRpbGVzQWNyb3NzKVxyXG4gICAgICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgICAgICAubWFwKCgpID0+IEFycmF5KHRpbGVzQWNyb3NzKS5maWxsKDApKTtcclxuXHJcbiAgICAgICAgLy8gY29ybmVycywgcG90ZW50aWFsbHkgZWFzaWVyIHRvIGltcGxlbWVudFxyXG4gICAgICAgIHRoaXMubWF0cml4WzBdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFswXVt0aWxlc0Fjcm9zcyAtIDFdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy5tYXRyaXgubGVuZ3RoLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5tYXRyaXggPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgIHJldHVybiBjbG9uZWRHcmFwaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYXliZSBuZWVkcyB0byBiZSByZXdpcnR0ZW4gYmVjYXVzZSB0aGUgbm9kZXMgYXJlIGFscmVhZHkgZXhpc3RpbmcgaW4gdGhlIG1hdHJpeCwgaXQncyBtb3JlIGxpa2UgcGxheWluZyBhIG1vdmVcclxuICAgIC8vIG1heWJlIG1ha2VNb3ZlID9cclxuICAgIHBsYXlOb2RlKG5vZGVBOiBudW1iZXJbXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIGlmIGl0J3MgYW4gZW1wdHkgaG9sZSwgcGxhY2UgYSBwaW5cclxuICAgICAgICBpZiAodGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSAhPSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuXHJcbiAgICAgICAgLy8gbm93IGNoZWNrIGZvciBicmlkZ2VzIGluIGFsbCBkaXJlY3Rpb25zXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7IC8vIHRvIGtub3cgaWYgdGhlIHdpbiBjb25kaXRpb24gbmVlZHMgdG8gYmUgY2hla2VkXHJcbiAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVCID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgobm9kZUFbMF0sIG5vZGVBWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBvdXRzaWRlIG9yIGEgY29ybmVyIG9yIG5vdCB0aGUgc2FtZSBjb2xvclxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV0gPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dID09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUJbMF1dW25vZGVCWzFdXSA9PSAzIHx8XHJcbiAgICAgICAgICAgICAgICAhKCh0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dICYgMykgPT0gKHRoaXMubWF0cml4W25vZGVBWzBdXVtub2RlQVsxXV0gJiAzKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2NoZWNrRm9yQmxvY2thZGVzKG5vZGVBLCBub2RlQikpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBhZGQgZWRnZSBpbiBib3RoIGRpcmVjdGlvbnNcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSB8PSAoMiAqKiBkaXJlY3Rpb25JbmRleCkgPDwgMjtcclxuICAgICAgICAgICAgbGV0IG90aGVyRGlyZWN0aW9uID0gZGlyZWN0aW9uSW5kZXggJiAxID8gKGRpcmVjdGlvbkluZGV4ICsgMykgJSA4IDogKGRpcmVjdGlvbkluZGV4ICsgNSkgJSA4O1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dIHw9ICgyICoqIG90aGVyRGlyZWN0aW9uKSA8PCAyO1xyXG4gICAgICAgICAgICBicmlkZ2VBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jaGVja0dhbWVPdmVyKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5nYW1lT3Zlcik7XHJcblxyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSAhdGhpcy55ZWxsb3dzVHVybjtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0ZvckJsb2NrYWRlcyhub2RlQTogYW55LCBub2RlQjogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gZXN0YWJsaXNoIHRoZSBib3VuZGluZyByZWN0YW5nbGUgdGhhdCBjb250YWlucyB0aGUgYnJpZGdlIGNvbm5lY3Rpb25cclxuICAgICAgICBsZXQgdG9wTGVmdFggPSBNYXRoLm1pbihub2RlQVswXSwgbm9kZUJbMF0pO1xyXG4gICAgICAgIGxldCB0b3BMZWZ0WSA9IE1hdGgubWluKG5vZGVBWzFdLCBub2RlQlsxXSk7XHJcbiAgICAgICAgbGV0IGJvdHRvbVJpZ2h0WCA9IE1hdGgubWF4KG5vZGVBWzBdLCBub2RlQlswXSk7XHJcbiAgICAgICAgbGV0IGJvdHRvbVJpZ2h0WSA9IE1hdGgubWF4KG5vZGVBWzFdLCBub2RlQlsxXSk7XHJcblxyXG4gICAgICAgIC8vIGNvbGxlY3QgdGhlIDQgbm9kZXMgaW4gdGhlIHJlY3RhbmdsZSwgc2tpcHBpbmcgdGhlIG9uZXMgdGhlIG9yaWdpbmFsIGJyaWRnZSBpcyBjb25uZWN0aW5nXHJcbiAgICAgICAgbGV0IHJlY3ROb2RlczogbnVtYmVyW11bXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJlY3RZID0gdG9wTGVmdFk7IHJlY3RZIDw9IGJvdHRvbVJpZ2h0WTsgcmVjdFkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByZWN0WCA9IHRvcExlZnRYOyByZWN0WCA8PSBib3R0b21SaWdodFg7IHJlY3RYKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgocmVjdFggPT0gbm9kZUFbMF0gJiYgcmVjdFkgPT0gbm9kZUFbMV0pIHx8IChyZWN0WCA9PSBub2RlQlswXSAmJiByZWN0WSA9PSBub2RlQlsxXSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgcmVjdE5vZGVzLnB1c2goW3JlY3RYLCByZWN0WV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmb3IgdGhlIDQgTm9kZXMsIHNlZSBpZiBhbnkgb2YgdGhlbSBoYXZlIGFuIGludGVyc2VjdGluZyBicmlkZ2VcclxuICAgICAgICByZXR1cm4gcmVjdE5vZGVzLnNvbWUoKHJlY3ROb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hlY2sgdGhlIG5vZGVzIHRoYXQgaGF2ZSBicmlkZ2VzXHJcbiAgICAgICAgICAgIGxldCBicmlkZ2VzID0gdGhpcy5tYXRyaXhbcmVjdE5vZGVbMF1dW3JlY3ROb2RlWzFdXSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gZ28gb3ZlciBlYWNoIGJyaWRnZSBhbmQgY2hlY2sgZm9yIGludGVyc2VjdGlvbiB3aXRoIHRoZSBvcmlnaW5hbCBvbmVcclxuICAgICAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMiAqKiBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0c2lkZVJlY3ROb2RlID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgocmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0cyhub2RlQVswXSwgbm9kZUFbMV0sIG5vZGVCWzBdLCBub2RlQlsxXSwgcmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBvdXRzaWRlUmVjdE5vZGVbMF0sIG91dHNpZGVSZWN0Tm9kZVsxXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NoZWNrR2FtZU92ZXIoKTogdm9pZCB7XHJcbiAgICAgICAgLy8gYmVjYXVzZSBvZiB0aGUgd2VpcmQgYmVoYXZpb3VyIG9mIHNldHMsIGl0IHdpbGwgZ2V0IHRoZSBpZCBvZiBhIG5vZGUgaW5zdGVhZCBvZiB0aGUgY29vcmRpbmF0ZXNcclxuICAgICAgICAvLyBsZXQgaWQgPSB4ICsgeSAqIHRpbGVzQWNyb3NzO1xyXG4gICAgICAgIGxldCBub2RlSWRRdWV1ZSA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMubWF0cml4Lmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLm1hdHJpeFtpXVswXSAmIDMpID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlSWRRdWV1ZS5hZGQoaSArIDAgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLm1hdHJpeFswXVtpXSAmIDMpID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlSWRRdWV1ZS5hZGQoMCArIGkgKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlSWRRdWV1ZS5zaXplID09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGNvbm5lY3Rpb25Gb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIG5vZGVJZFF1ZXVlLmZvckVhY2goKG5vZGVJZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lT3ZlciA+IDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBpZCB0byBjb29yZHNcclxuICAgICAgICAgICAgbGV0IHggPSBub2RlSWQgJSB0aGlzLm1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihub2RlSWQgLyB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG90aGVyIHNpZGUgaGFzIGJlZW4gcmVhY2hlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy55ZWxsb3dzVHVybiAmJiB5ID09IHRoaXMubWF0cml4Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgfD0gNDtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMueWVsbG93c1R1cm4gJiYgeCA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyIHw9IDg7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBvcHBvbmVudCBoYXMgYmVlbiBjdXQgb2ZmXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnllbGxvd3NUdXJuICYmIHRoaXMuZ2FtZU92ZXIgfCAyICYmICh4ID09IDAgfHwgeCA9PSB0aGlzLm1hdHJpeC5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlciB8PSAyO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbmV4dFkgPSB5ICsgMTsgbmV4dFkgPD0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMjsgbmV4dFkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHRoaXMubWF0cml4W3hdW25leHRZXSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgJj0gfjI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy55ZWxsb3dzVHVybiAmJiB0aGlzLmdhbWVPdmVyIHwgMSAmJiAoeSA9PSAwIHx8IHkgPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgfD0gMTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5leHRYID0geCArIDE7IG5leHRYIDw9IHRoaXMubWF0cml4Lmxlbmd0aCAtIDI7IG5leHRYKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0aGlzLm1hdHJpeFtuZXh0WF1beV0gJiAyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyICY9IH4xO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgY3VycmVudCBub2RlIGluIHN0YWNrIGhhcyBtb3JlIG5vZGVzIGNvbm5lY3RlZFxyXG4gICAgICAgICAgICBsZXQgYnJpZGdlcyA9IHRoaXMubWF0cml4W3hdW3ldID4+IHRoaXMuYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBkaXJlY3Rpb25JbmRleCA9IDA7IGRpcmVjdGlvbkluZGV4IDwgODsgZGlyZWN0aW9uSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgyICoqIGRpcmVjdGlvbkluZGV4KSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSBwb2ludEluRGlyZWN0aW9uT2ZJbmRleCh4LCB5LCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgICAgICBub2RlSWRRdWV1ZS5hZGQobmV4dFswXSArIG5leHRbMV0gKiB0aGlzLm1hdHJpeC5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIGdldHMgYSBkaXJlY3Rpb25JbmRleCBiZXR3ZWVuIDAgYW5kIDcgYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgeCBhbmQgeSBkaXJlY3Rpb25cclxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb25JbmRleDogbnVtYmVyKTogbnVtYmVyW10ge1xyXG4gICAgbGV0IG5ld1ggPSAoZGlyZWN0aW9uSW5kZXggJiAyID8gMSA6IDIpICogKGRpcmVjdGlvbkluZGV4ICYgNCA/IC0xIDogMSk7XHJcbiAgICBsZXQgbmV3WSA9IChkaXJlY3Rpb25JbmRleCAmIDIgPyAyIDogMSkgKiAoZGlyZWN0aW9uSW5kZXggJiAxID8gLTEgOiAxKTtcclxuXHJcbiAgICByZXR1cm4gW3ggKyBuZXdYLCB5ICsgbmV3WV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85MDQzODA1L3Rlc3QtaWYtdHdvLWxpbmVzLWludGVyc2VjdC1qYXZhc2NyaXB0LWZ1bmN0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIsIGQ6IG51bWJlciwgcDogbnVtYmVyLCBxOiBudW1iZXIsIHI6IG51bWJlciwgczogbnVtYmVyKSB7XHJcbiAgICB2YXIgZGV0LCBnYW1tYSwgbGFtYmRhO1xyXG4gICAgZGV0ID0gKGMgLSBhKSAqIChzIC0gcSkgLSAociAtIHApICogKGQgLSBiKTtcclxuICAgIGlmIChkZXQgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhbWJkYSA9ICgocyAtIHEpICogKHIgLSBhKSArIChwIC0gcikgKiAocyAtIGIpKSAvIGRldDtcclxuICAgICAgICBnYW1tYSA9ICgoYiAtIGQpICogKHIgLSBhKSArIChjIC0gYSkgKiAocyAtIGIpKSAvIGRldDtcclxuICAgICAgICByZXR1cm4gMCA8IGxhbWJkYSAmJiBsYW1iZGEgPCAxICYmIDAgPCBnYW1tYSAmJiBnYW1tYSA8IDE7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgR3JhcGggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBnbG9iYWwgdmFyaWFibGVzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNsYXNzIE1vZGVsIHtcclxuICAgIG1haW5HcmFwaDogR3JhcGg7XHJcbiAgICBoaXN0b3J5OiBHcmFwaFtdO1xyXG4gICAgeWVsbG93QUk6IGJvb2xlYW47XHJcbiAgICByZWRBSTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dTdGFydHM6IGJvb2xlYW4sIHllbGxvd0FJOiBib29sZWFuLCByZWRBSTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gbmV3IEdyYXBoKHRpbGVzQWNyb3NzLCB5ZWxsb3dTdGFydHMpO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93QUkgPSB5ZWxsb3dBSTtcclxuICAgICAgICB0aGlzLnJlZEFJID0gcmVkQUk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5UGxheWluZ05vZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY3VyckdyYXBoID0gdGhpcy5tYWluR3JhcGguY2xvbmUoKTtcclxuICAgICAgICBsZXQgcGluUGxhY2VkID0gdGhpcy5tYWluR3JhcGgucGxheU5vZGUoW3gsIHldKTtcclxuICAgICAgICBpZiAoIXBpblBsYWNlZCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKGN1cnJHcmFwaCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdW5kb01vdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gdGhpcy5oaXN0b3J5LnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2RlbDtcclxuIiwiaW1wb3J0IHsgR3JhcGgsIHBvaW50SW5EaXJlY3Rpb25PZkluZGV4IH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbmNsYXNzIFZpZXcge1xyXG4gICAgYm9hcmQ6IGFueTtcclxuICAgIHRpbGVTaXplOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBib3JkZXJSYWRpdXM6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29ybmVyczogbnVtYmVyW107XHJcblxyXG4gICAgcHJpdmF0ZSBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuXHJcbiAgICBwcml2YXRlIHdob3NUdXJuOiBIVE1MRWxlbWVudDtcclxuICAgIHByaXZhdGUgYm9hcmRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMud2hvc1R1cm4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndob3MtdHVyblwiKTtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIikgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJSYWRpdXMgPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdCb2FyZChncmFwaDogR3JhcGgsIGdyaWRsaW5lczogYm9vbGVhbiwgYmxvY2thZGVzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2FudmFzKGdyYXBoKTtcclxuICAgICAgICB0aGlzLl9kcmF3QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIGlmIChncmlkbGluZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZHJhd0dyaWRsaW5lcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kcmF3RmluaXNoTGluZXMoKTtcclxuXHJcbiAgICAgICAgZ3JhcGgubWF0cml4LmZvckVhY2goKGNvbHVtbiwgeCkgPT4ge1xyXG4gICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgobm9kZSwgeSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUgPT0gMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWCA9IHggKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZUNlbnRlclkgPSB5ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRyYXcgaG9sZSBvciBwaW5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSwgdGhpcy50aWxlU2l6ZSAvIDYsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IG5vZGUgPT0gMCA/IFwiYmxhY2tcIiA6IG5vZGUgJiAxID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBicmlkZ2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gMTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IG5vZGUgPT0gMCA/IFwiYmxhY2tcIiA6IG5vZGUgJiAxID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgYnJpZGdlcyA9IG5vZGUgPj4gZ3JhcGguYnJpZGdlQml0c09mZnNldDtcclxuICAgICAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoYnJpZGdlcyAmICgyICoqIGkpKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0ZWRDb29yZCA9IHBvaW50SW5EaXJlY3Rpb25PZkluZGV4KHgsIHksIGkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY29ubmVjdGVkQ29vcmRbMF0gKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIsIGNvbm5lY3RlZENvb3JkWzFdICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMgbGluZSBjb3VsZCBiZSBtYWRlIHNob3J0ZXJcclxuICAgICAgICB0aGlzLndob3NUdXJuLmlubmVySFRNTCA9IGdyYXBoLnllbGxvd3NUdXJuID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBjYW4gcHJvYmFibHkgYmUgY2hhbmdlZCB3aXRoIGNsZWFyUmVjdCBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgd2hvbGUgbmV3IGluc3RhbmNlIG9mIHRoZSBjYW52YXNcclxuICAgIHByaXZhdGUgX2NyZWF0ZUNhbnZhcyhncmFwaDogR3JhcGgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICB0aGlzLmJvYXJkLmlkID0gXCJib2FyZFwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUuYm94U2hhZG93ID0gXCI1cHggNXB4IDIwcHggZ3JheVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUuYm9yZGVyUmFkaXVzID0gdGhpcy5ib3JkZXJSYWRpdXMgKyBcIiVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLndpZHRoID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5oZWlnaHQgPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ib2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5ib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggPSB0aGlzLmJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHRoaXMudGlsZVNpemUgPSB0aGlzLmJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLm1hdHJpeC5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZHJhd0JhY2tncm91bmQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJibHVlXCI7XHJcbiAgICAgICAgdGhpcy5jdHgucm91bmRSZWN0KDAsIDAsIHRoaXMuYm9hcmQuY2xpZW50V2lkdGgsIHRoaXMuYm9hcmQuY2xpZW50V2lkdGgsIHRoaXMuYm9hcmQuY2xpZW50V2lkdGggKiAodGhpcy5ib3JkZXJSYWRpdXMgLyAxMDApKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZHJhd0dyaWRsaW5lcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8PSB0aGlzLmJvYXJkU2lkZUxlbmd0aDsgbCArPSB0aGlzLnRpbGVTaXplKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhsLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGwsIHRoaXMuYm9hcmRTaWRlTGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKDAsIGwpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5ib2FyZFNpZGVMZW5ndGgsIGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gMjU7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIndoaXRlXCI7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZHJhd0ZpbmlzaExpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29ybmVycyA9IFtcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSAtIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyA2O1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY0NDQ0XCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZmYWFcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xyXG5pbXBvcnQgVmlldyBmcm9tIFwiLi92aWV3XCI7XHJcblxyXG4vKiogaGFuZGxlcyBhbGwgaW5wdXQsIGNoZWNrcyBpbiB3aXRoIG1vZGVsIGFuZCBkaXNwbGF5cyB0aGUgcmVzdWx0IHdpdGggdmlldyAqL1xyXG5cclxudmFyIHRpbGVzQWNyb3NzRGVmYXVsdCA9IDY7XHJcblxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuICAgIG1vZGVsOiBNb2RlbDtcclxuICAgIHZpZXc6IFZpZXc7XHJcblxyXG4gICAgcHJpdmF0ZSBzaG93R3JpZGxpbmVzOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBzaG93QmxvY2thZGVzOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBnYW1lT3Zlck1vZGFsU2hvd246IGJvb2xlYW47IC8vIGhhcyB0aGUgcGxheWVyIGFscmVhZHkgc2VlbiB0aGUgZ2FtZSB3b24gTW9kYWwgYW5kIHdhbnRlZCB0byBrZWVwIHBsYXlpbmc/XHJcblxyXG4gICAgLy8gZ2FtZS0vZGVidWctYnV0dG9uc1xyXG4gICAgcmVzdGFydEdhbWVCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgdW5kb01vdmVCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgdG9nZ2xlR3JpZGxpbmVzQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHRvZ2dsZUJsb2NrYWRlc0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgc2V0dXBHYW1lTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgc2V0dXBHYW1lTW9kYWxDbG9zZUJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHllbGxvd1N0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZEFpQnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcmVkU3RhcnRzQnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgYm9hcmRTaXplU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgYm9hcmRTaXplTGFiZWw6IEhUTUxFbGVtZW50O1xyXG4gICAgc3RhcnRCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgIGdhbWVPdmVyTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZU92ZXJNb2RhbENsb3NlQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIGdhbWVPdmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgVmlldygpO1xyXG5cclxuICAgICAgICB0aGlzLl9nZXREb21FbGVtZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2dldERvbUVsZW1lbnRzKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidW5kby1tb3ZlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtZ3JpZGxpbmVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtYmxvY2thZGVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgICAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnQtZ2FtZS1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtYWlcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1zaXplXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZS1sYWJlbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID0gXCJQbGF5ZXJcIjtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPSBcIkNvbXB1dGVyXCI7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgc2Vjb25kXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUgPSB0aWxlc0Fjcm9zc0RlZmF1bHQudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsLmlubmVySFRNTCA9IGAke3RpbGVzQWNyb3NzRGVmYXVsdH14JHt0aWxlc0Fjcm9zc0RlZmF1bHR9YDtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtb3Zlci1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVPdmVyTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVsxXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmdhbWVPdmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1vdmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0RXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwudW5kb01vdmUoKSA/IHRoaXMuX3VwZGF0ZVZpZXcoKSA6IGNvbnNvbGUubG9nKFwibm8gbW9yZSBwb3NpdGlvbnMgaW4gaGlzdG9yeSBhcnJheVwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dHcmlkbGluZXMgPSAhdGhpcy5zaG93R3JpZGxpbmVzO1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCbG9ja2FkZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93QmxvY2thZGVzID0gIXRoaXMuc2hvd0Jsb2NrYWRlcztcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPT0gXCJQbGF5ZXJcIiA/IFwiQ29tcHV0ZXJcIiA6IFwiUGxheWVyXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9PSBcIlBsYXllclwiID8gXCJDb21wdXRlclwiIDogXCJQbGF5ZXJcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZVNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsLmlubmVySFRNTCA9IGAke3RoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlfXgke3RoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlfWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQodGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIixcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJDb21wdXRlclwiXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lIHdvbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQWdhaW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy52aWV3LmRyYXdCb2FyZCh0aGlzLm1vZGVsLm1haW5HcmFwaCwgdGhpcy5zaG93R3JpZGxpbmVzLCB0aGlzLnNob3dCbG9ja2FkZXMpO1xyXG4gICAgICAgIHRoaXMudmlldy5ib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLl9ib2FyZENsaWNrZWQoZXZlbnQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ib2FyZENsaWNrZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy52aWV3LmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC50cnlQbGF5aW5nTm9kZSh4LCB5KSkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lT3ZlciA8IDMgfHwgdGhpcy5nYW1lT3Zlck1vZGFsU2hvd24pIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVPdmVyICYgNCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVySW5mby5pbm5lckhUTUwgPSBgWWVsbG93IHdvbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lT3ZlciAmIDgpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlckluZm8uaW5uZXJIVE1MID0gYFJlZCB3b25gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5tYWluR3JhcGguZ2FtZU92ZXIgPT0gMykge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVySW5mby5pbm5lckhUTUwgPSBgTm9ib2R5IGNhbiB3aW4gYW55bW9yZWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIHRoaXMuZ2FtZU92ZXJNb2RhbFNob3duID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IENvbnRyb2xsZXIoKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9