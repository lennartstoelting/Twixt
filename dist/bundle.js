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
        this.gameWon = 0;
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
        if (bridgeAdded) {
            this._checkWinCondition();
        }
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
    Graph.prototype._checkWinCondition = function () {
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
            if (connectionFound)
                return;
            // translate id to coords
            var x = nodeId % _this.matrix.length;
            var y = Math.floor(nodeId / _this.matrix.length);
            // check if the other side has been reached
            if ((_this.yellowsTurn && y == _this.matrix.length - 1) || (!_this.yellowsTurn && x == _this.matrix.length - 1)) {
                connectionFound = true;
                return;
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
        if (!connectionFound)
            return;
        this.gameWon = this.yellowsTurn ? 1 : 2;
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
        this.gameWonModal = document.getElementById("game-won-modal");
        this.gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1];
        this.winnerInfo = document.getElementById("winner-info");
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
            _this.gameWonModalShown = false;
            _this._updateView();
        });
        // game won modal
        this.gameWonModalCloseButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.gameWonModalShown = true;
        });
        this.restartGameAgainButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.setupGameModal.style.display = "block";
        });
        this.keepPlayingButton.addEventListener("click", function () {
            _this.gameWonModal.style.display = "none";
            _this.gameWonModalShown = true;
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
        if (this.model.mainGraph.gameWon != 0 && !this.gameWonModalShown) {
            this.winnerInfo.innerHTML = "".concat(this.model.mainGraph.gameWon == 1 ? "Yellow" : "Red", " won");
            this.gameWonModal.style.display = "block";
            this.gameWonModalShown = true;
        }
    };
    return Controller;
}());
var app = new Controller();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUVIO0lBU0ksZUFBWSxXQUFtQixFQUFFLFdBQW9CO1FBQ2pELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO2FBQzNCLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDUCxHQUFHLENBQUMsY0FBTSxZQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7UUFFM0MsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQscUJBQUssR0FBTDtRQUNJLElBQUksV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRSxXQUFXLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVELGtIQUFrSDtJQUNsSCxtQkFBbUI7SUFDbkIsd0JBQVEsR0FBUixVQUFTLEtBQWU7UUFDcEIscUNBQXFDO1FBQ3JDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzRCwwQ0FBMEM7UUFDMUMsSUFBSSxXQUFXLEdBQVksS0FBSyxDQUFDLENBQUMsa0RBQWtEO1FBQ3BGLEtBQUssSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLGNBQWMsR0FBRyxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUU7WUFDL0QsSUFBSSxLQUFLLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUV4RSwrQ0FBK0M7WUFDL0MsSUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUztnQkFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNuRjtnQkFDRSxTQUFTO2FBQ1o7WUFFRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFDcEQsOEJBQThCO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUksY0FBYyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELElBQUksY0FBYyxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUksY0FBYyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDdEI7UUFFRCxJQUFJLFdBQVcsRUFBRTtZQUNiLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLGtDQUFrQixHQUExQixVQUEyQixLQUFVLEVBQUUsS0FBVTtRQUFqRCxpQkFnQ0M7UUEvQkcsdUVBQXVFO1FBQ3ZFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhELDRGQUE0RjtRQUM1RixJQUFJLFNBQVMsR0FBZSxFQUFFLENBQUM7UUFDL0IsS0FBSyxJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsS0FBSyxJQUFJLFlBQVksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN2RCxLQUFLLElBQUksS0FBSyxHQUFHLFFBQVEsRUFBRSxLQUFLLElBQUksWUFBWSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUN2RCxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQUUsU0FBUztnQkFDbkcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7UUFFRCxrRUFBa0U7UUFDbEUsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTtZQUMzQix5Q0FBeUM7WUFDekMsSUFBSSxPQUFPLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDN0UsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFM0IsdUVBQXVFO1lBQ3ZFLEtBQUssSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLGNBQWMsR0FBRyxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQUMsRUFBSSxjQUFjLEVBQUMsQ0FBQztvQkFBRSxTQUFTO2dCQUVqRCxJQUFJLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUN4RixJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3RILE9BQU8sSUFBSSxDQUFDO2lCQUNmO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxrQ0FBa0IsR0FBMUI7UUFBQSxpQkErQ0M7UUE5Q0csa0dBQWtHO1FBQ2xHLGdDQUFnQztRQUNoQyxJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRXBDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzlCLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMvQzthQUNKO2lCQUFNO2dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDOUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQy9DO2FBQ0o7U0FDSjtRQUVELElBQUksV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQUUsT0FBTztRQUVsQyxJQUFJLGVBQWUsR0FBWSxLQUFLLENBQUM7UUFFckMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFDdkIsSUFBSSxlQUFlO2dCQUFFLE9BQU87WUFFNUIseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhELDJDQUEyQztZQUMzQyxJQUFJLENBQUMsS0FBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN6RyxlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixPQUFPO2FBQ1Y7WUFFRCwwREFBMEQ7WUFDMUQsSUFBSSxPQUFPLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDekQsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTztZQUVyQixLQUFLLElBQUksY0FBYyxHQUFHLENBQUMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFO2dCQUMvRCxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFDLEVBQUksY0FBYyxFQUFDLENBQUM7b0JBQUUsU0FBUztnQkFDakQsSUFBSSxJQUFJLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDekQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDM0Q7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0FBQzs7QUFFRCx3RkFBd0Y7QUFDakYsU0FBUyx1QkFBdUIsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLGNBQXNCO0lBQ2hGLElBQUksSUFBSSxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RSxJQUFJLElBQUksR0FBRyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFeEUsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsVUFBVSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO0lBQ3RHLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7SUFDdkIsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO1NBQU07UUFDSCxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN2RCxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN0RCxPQUFPLENBQUMsR0FBRyxNQUFNLElBQUksTUFBTSxHQUFHLENB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QUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FBQztBQUVELGlFQUFl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dC8uL3NyYy9ncmFwaC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9tb2RlbC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy92aWV3LnRzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGZvciB1bmRlcnN0YW5kaW5nIHRoZSBiaXR3aXNlIG9wZXJhdGlvbnNcclxuICogaHR0cHM6Ly93d3cudzNzY2hvb2xzLmNvbS9qcy9qc19iaXR3aXNlLmFzcFxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcbiAgICBtYXRyaXg6IG51bWJlcltdW107XHJcblxyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICBnYW1lV29uOiBudW1iZXI7XHJcbiAgICBldmFsdWF0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgYnJpZGdlQml0c09mZnNldDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dzVHVybiA9IHllbGxvd3NUdXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZVdvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5icmlkZ2VCaXRzT2Zmc2V0ID0gMjtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IEFycmF5KHRpbGVzQWNyb3NzKVxyXG4gICAgICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgICAgICAubWFwKCgpID0+IEFycmF5KHRpbGVzQWNyb3NzKS5maWxsKDApKTtcclxuXHJcbiAgICAgICAgLy8gY29ybmVycywgcG90ZW50aWFsbHkgZWFzaWVyIHRvIGltcGxlbWVudFxyXG4gICAgICAgIHRoaXMubWF0cml4WzBdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFswXVt0aWxlc0Fjcm9zcyAtIDFdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdWzBdID0gMztcclxuICAgICAgICB0aGlzLm1hdHJpeFt0aWxlc0Fjcm9zcyAtIDFdW3RpbGVzQWNyb3NzIC0gMV0gPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy5tYXRyaXgubGVuZ3RoLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5tYXRyaXggPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgIHJldHVybiBjbG9uZWRHcmFwaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYXliZSBuZWVkcyB0byBiZSByZXdpcnR0ZW4gYmVjYXVzZSB0aGUgbm9kZXMgYXJlIGFscmVhZHkgZXhpc3RpbmcgaW4gdGhlIG1hdHJpeCwgaXQncyBtb3JlIGxpa2UgcGxheWluZyBhIG1vdmVcclxuICAgIC8vIG1heWJlIG1ha2VNb3ZlID9cclxuICAgIHBsYXlOb2RlKG5vZGVBOiBudW1iZXJbXSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIGlmIGl0J3MgYW4gZW1wdHkgaG9sZSwgcGxhY2UgYSBwaW5cclxuICAgICAgICBpZiAodGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSAhPSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuXHJcbiAgICAgICAgLy8gbm93IGNoZWNrIGZvciBicmlkZ2VzIGluIGFsbCBkaXJlY3Rpb25zXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7IC8vIHRvIGtub3cgaWYgdGhlIHdpbiBjb25kaXRpb24gbmVlZHMgdG8gYmUgY2hla2VkXHJcbiAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVCID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgobm9kZUFbMF0sIG5vZGVBWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBvdXRzaWRlIG9yIGEgY29ybmVyIG9yIG5vdCB0aGUgc2FtZSBjb2xvclxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV0gPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dID09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUJbMF1dW25vZGVCWzFdXSA9PSAzIHx8XHJcbiAgICAgICAgICAgICAgICAhKCh0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dICYgMykgPT0gKHRoaXMubWF0cml4W25vZGVBWzBdXVtub2RlQVsxXV0gJiAzKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2NoZWNrRm9yQmxvY2thZGVzKG5vZGVBLCBub2RlQikpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBhZGQgZWRnZSBpbiBib3RoIGRpcmVjdGlvbnNcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbbm9kZUFbMF1dW25vZGVBWzFdXSB8PSAoMiAqKiBkaXJlY3Rpb25JbmRleCkgPDwgMjtcclxuICAgICAgICAgICAgbGV0IG90aGVyRGlyZWN0aW9uID0gZGlyZWN0aW9uSW5kZXggJiAxID8gKGRpcmVjdGlvbkluZGV4ICsgMykgJSA4IDogKGRpcmVjdGlvbkluZGV4ICsgNSkgJSA4O1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeFtub2RlQlswXV1bbm9kZUJbMV1dIHw9ICgyICoqIG90aGVyRGlyZWN0aW9uKSA8PCAyO1xyXG4gICAgICAgICAgICBicmlkZ2VBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYnJpZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tXaW5Db25kaXRpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSAhdGhpcy55ZWxsb3dzVHVybjtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0ZvckJsb2NrYWRlcyhub2RlQTogYW55LCBub2RlQjogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gZXN0YWJsaXNoIHRoZSBib3VuZGluZyByZWN0YW5nbGUgdGhhdCBjb250YWlucyB0aGUgYnJpZGdlIGNvbm5lY3Rpb25cclxuICAgICAgICBsZXQgdG9wTGVmdFggPSBNYXRoLm1pbihub2RlQVswXSwgbm9kZUJbMF0pO1xyXG4gICAgICAgIGxldCB0b3BMZWZ0WSA9IE1hdGgubWluKG5vZGVBWzFdLCBub2RlQlsxXSk7XHJcbiAgICAgICAgbGV0IGJvdHRvbVJpZ2h0WCA9IE1hdGgubWF4KG5vZGVBWzBdLCBub2RlQlswXSk7XHJcbiAgICAgICAgbGV0IGJvdHRvbVJpZ2h0WSA9IE1hdGgubWF4KG5vZGVBWzFdLCBub2RlQlsxXSk7XHJcblxyXG4gICAgICAgIC8vIGNvbGxlY3QgdGhlIDQgbm9kZXMgaW4gdGhlIHJlY3RhbmdsZSwgc2tpcHBpbmcgdGhlIG9uZXMgdGhlIG9yaWdpbmFsIGJyaWRnZSBpcyBjb25uZWN0aW5nXHJcbiAgICAgICAgbGV0IHJlY3ROb2RlczogbnVtYmVyW11bXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHJlY3RZID0gdG9wTGVmdFk7IHJlY3RZIDw9IGJvdHRvbVJpZ2h0WTsgcmVjdFkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByZWN0WCA9IHRvcExlZnRYOyByZWN0WCA8PSBib3R0b21SaWdodFg7IHJlY3RYKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgocmVjdFggPT0gbm9kZUFbMF0gJiYgcmVjdFkgPT0gbm9kZUFbMV0pIHx8IChyZWN0WCA9PSBub2RlQlswXSAmJiByZWN0WSA9PSBub2RlQlsxXSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgcmVjdE5vZGVzLnB1c2goW3JlY3RYLCByZWN0WV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmb3IgdGhlIDQgTm9kZXMsIHNlZSBpZiBhbnkgb2YgdGhlbSBoYXZlIGFuIGludGVyc2VjdGluZyBicmlkZ2VcclxuICAgICAgICByZXR1cm4gcmVjdE5vZGVzLnNvbWUoKHJlY3ROb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hlY2sgdGhlIG5vZGVzIHRoYXQgaGF2ZSBicmlkZ2VzXHJcbiAgICAgICAgICAgIGxldCBicmlkZ2VzID0gdGhpcy5tYXRyaXhbcmVjdE5vZGVbMF1dW3JlY3ROb2RlWzFdXSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gZ28gb3ZlciBlYWNoIGJyaWRnZSBhbmQgY2hlY2sgZm9yIGludGVyc2VjdGlvbiB3aXRoIHRoZSBvcmlnaW5hbCBvbmVcclxuICAgICAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMiAqKiBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0c2lkZVJlY3ROb2RlID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgocmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBkaXJlY3Rpb25JbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzZWN0cyhub2RlQVswXSwgbm9kZUFbMV0sIG5vZGVCWzBdLCBub2RlQlsxXSwgcmVjdE5vZGVbMF0sIHJlY3ROb2RlWzFdLCBvdXRzaWRlUmVjdE5vZGVbMF0sIG91dHNpZGVSZWN0Tm9kZVsxXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NoZWNrV2luQ29uZGl0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGJlY2F1c2Ugb2YgdGhlIHdlaXJkIGJlaGF2aW91ciBvZiBzZXRzLCBpdCB3aWxsIGdldCB0aGUgaWQgb2YgYSBub2RlIGluc3RlYWQgb2YgdGhlIGNvb3JkaW5hdGVzXHJcbiAgICAgICAgLy8gbGV0IGlkID0geCArIHkgKiB0aWxlc0Fjcm9zcztcclxuICAgICAgICBsZXQgbm9kZUlkUXVldWUgPSBuZXcgU2V0PG51bWJlcj4oKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLm1hdHJpeC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMueWVsbG93c1R1cm4pIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5tYXRyaXhbaV1bMF0gJiAzKSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkUXVldWUuYWRkKGkgKyAwICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5tYXRyaXhbMF1baV0gJiAzKSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkUXVldWUuYWRkKDAgKyBpICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5vZGVJZFF1ZXVlLnNpemUgPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGlvbkZvdW5kOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIG5vZGVJZFF1ZXVlLmZvckVhY2goKG5vZGVJZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyB0cmFuc2xhdGUgaWQgdG8gY29vcmRzXHJcbiAgICAgICAgICAgIGxldCB4ID0gbm9kZUlkICUgdGhpcy5tYXRyaXgubGVuZ3RoO1xyXG4gICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3Iobm9kZUlkIC8gdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZSBvdGhlciBzaWRlIGhhcyBiZWVuIHJlYWNoZWRcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmIHkgPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIHggPT0gdGhpcy5tYXRyaXgubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25Gb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGN1cnJlbnQgbm9kZSBpbiBzdGFjayBoYXMgbW9yZSBub2RlcyBjb25uZWN0ZWRcclxuICAgICAgICAgICAgbGV0IGJyaWRnZXMgPSB0aGlzLm1hdHJpeFt4XVt5XSA+PiB0aGlzLmJyaWRnZUJpdHNPZmZzZXQ7XHJcbiAgICAgICAgICAgIGlmICghYnJpZGdlcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgZGlyZWN0aW9uSW5kZXggPSAwOyBkaXJlY3Rpb25JbmRleCA8IDg7IGRpcmVjdGlvbkluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghKGJyaWRnZXMgJiAoMiAqKiBkaXJlY3Rpb25JbmRleCkpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgoeCwgeSwgZGlyZWN0aW9uSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgbm9kZUlkUXVldWUuYWRkKG5leHRbMF0gKyBuZXh0WzFdICogdGhpcy5tYXRyaXgubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIWNvbm5lY3Rpb25Gb3VuZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZVdvbiA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuICAgIH1cclxufVxyXG5cclxuLy8gZ2V0cyBhIGRpcmVjdGlvbkluZGV4IGJldHdlZW4gMCBhbmQgNyBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyB4IGFuZCB5IGRpcmVjdGlvblxyXG5leHBvcnQgZnVuY3Rpb24gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgoeDogbnVtYmVyLCB5OiBudW1iZXIsIGRpcmVjdGlvbkluZGV4OiBudW1iZXIpOiBudW1iZXJbXSB7XHJcbiAgICBsZXQgbmV3WCA9IChkaXJlY3Rpb25JbmRleCAmIDIgPyAxIDogMikgKiAoZGlyZWN0aW9uSW5kZXggJiA0ID8gLTEgOiAxKTtcclxuICAgIGxldCBuZXdZID0gKGRpcmVjdGlvbkluZGV4ICYgMiA/IDIgOiAxKSAqIChkaXJlY3Rpb25JbmRleCAmIDEgPyAtMSA6IDEpO1xyXG5cclxuICAgIHJldHVybiBbeCArIG5ld1gsIHkgKyBuZXdZXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkwNDM4MDUvdGVzdC1pZi10d28tbGluZXMtaW50ZXJzZWN0LWphdmFzY3JpcHQtZnVuY3Rpb25cclxuICovXHJcbmZ1bmN0aW9uIGludGVyc2VjdHMoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyLCBwOiBudW1iZXIsIHE6IG51bWJlciwgcjogbnVtYmVyLCBzOiBudW1iZXIpIHtcclxuICAgIHZhciBkZXQsIGdhbW1hLCBsYW1iZGE7XHJcbiAgICBkZXQgPSAoYyAtIGEpICogKHMgLSBxKSAtIChyIC0gcCkgKiAoZCAtIGIpO1xyXG4gICAgaWYgKGRldCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGFtYmRhID0gKChzIC0gcSkgKiAociAtIGEpICsgKHAgLSByKSAqIChzIC0gYikpIC8gZGV0O1xyXG4gICAgICAgIGdhbW1hID0gKChiIC0gZCkgKiAociAtIGEpICsgKGMgLSBhKSAqIChzIC0gYikpIC8gZGV0O1xyXG4gICAgICAgIHJldHVybiAwIDwgbGFtYmRhICYmIGxhbWJkYSA8IDEgJiYgMCA8IGdhbW1hICYmIGdhbW1hIDwgMTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBHcmFwaCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGdsb2JhbCB2YXJpYWJsZXNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgbWFpbkdyYXBoOiBHcmFwaDtcclxuICAgIGhpc3Rvcnk6IEdyYXBoW107XHJcbiAgICB5ZWxsb3dBSTogYm9vbGVhbjtcclxuICAgIHJlZEFJOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd1N0YXJ0czogYm9vbGVhbiwgeWVsbG93QUk6IGJvb2xlYW4sIHJlZEFJOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3MsIHllbGxvd1N0YXJ0cyk7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBSSA9IHllbGxvd0FJO1xyXG4gICAgICAgIHRoaXMucmVkQUkgPSByZWRBSTtcclxuICAgIH1cclxuXHJcbiAgICB0cnlQbGF5aW5nTm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjdXJyR3JhcGggPSB0aGlzLm1haW5HcmFwaC5jbG9uZSgpO1xyXG4gICAgICAgIGxldCBwaW5QbGFjZWQgPSB0aGlzLm1haW5HcmFwaC5wbGF5Tm9kZShbeCwgeV0pO1xyXG4gICAgICAgIGlmICghcGluUGxhY2VkKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goY3VyckdyYXBoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB1bmRvTW92ZSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSB0aGlzLmhpc3RvcnkucG9wKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsO1xyXG4iLCJpbXBvcnQgeyBHcmFwaCwgcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcbiAgICBib2FyZDogYW55O1xyXG4gICAgdGlsZVNpemU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYm9hcmRTaWRlTGVuZ3RoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGJvcmRlclJhZGl1czogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb3JuZXJzOiBudW1iZXJbXTtcclxuXHJcbiAgICBwcml2YXRlIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG5cclxuICAgIHByaXZhdGUgd2hvc1R1cm46IEhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBib2FyZENvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy53aG9zVHVybiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2hvcy10dXJuXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLWNvbnRhaW5lclwiKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICB0aGlzLmJvcmRlclJhZGl1cyA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0JvYXJkKGdyYXBoOiBHcmFwaCwgZ3JpZGxpbmVzOiBib29sZWFuLCBibG9ja2FkZXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9jcmVhdGVDYW52YXMoZ3JhcGgpO1xyXG4gICAgICAgIHRoaXMuX2RyYXdCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgaWYgKGdyaWRsaW5lcykge1xyXG4gICAgICAgICAgICB0aGlzLl9kcmF3R3JpZGxpbmVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RyYXdGaW5pc2hMaW5lcygpO1xyXG5cclxuICAgICAgICBncmFwaC5tYXRyaXguZm9yRWFjaCgoY29sdW1uLCB4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKChub2RlLCB5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PSAzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0geCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWSA9IHkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBob2xlIG9yIHBpblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5hcmMobm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZLCB0aGlzLnRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gbm9kZSA9PSAwID8gXCJibGFja1wiIDogbm9kZSAmIDEgPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gbm9kZSA9PSAwID8gXCJibGFja1wiIDogbm9kZSAmIDEgPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgICAgICAgICAgICAgIGxldCBicmlkZ2VzID0gbm9kZSA+PiBncmFwaC5icmlkZ2VCaXRzT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCFicmlkZ2VzKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShicmlkZ2VzICYgKDIgKiogaSkpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbm5lY3RlZENvb3JkID0gcG9pbnRJbkRpcmVjdGlvbk9mSW5kZXgoeCwgeSwgaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhjb25uZWN0ZWRDb29yZFswXSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgY29ubmVjdGVkQ29vcmRbMV0gKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBsaW5lIGNvdWxkIGJlIG1hZGUgc2hvcnRlclxyXG4gICAgICAgIHRoaXMud2hvc1R1cm4uaW5uZXJIVE1MID0gZ3JhcGgueWVsbG93c1R1cm4gPyBcInllbGxvd1wiIDogXCJyZWRcIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGlzIGNhbiBwcm9iYWJseSBiZSBjaGFuZ2VkIHdpdGggY2xlYXJSZWN0IGluc3RlYWQgb2YgY3JlYXRpbmcgYSB3aG9sZSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ2FudmFzKGdyYXBoOiBHcmFwaCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuaWQgPSBcImJvYXJkXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5ib3hTaGFkb3cgPSBcIjVweCA1cHggMjBweCBncmF5XCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5zdHlsZS5ib3JkZXJSYWRpdXMgPSB0aGlzLmJvcmRlclJhZGl1cyArIFwiJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUubWFyZ2luID0gXCIxJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQud2lkdGggPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudFdpZHRoICogMC45ODtcclxuICAgICAgICB0aGlzLmJvYXJkLmhlaWdodCA9IHRoaXMuYm9hcmRDb250YWluZXIuY2xpZW50SGVpZ2h0ICogMC45ODtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJvYXJkKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCA9IHRoaXMuYm9hcmQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdGhpcy50aWxlU2l6ZSA9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC8gZ3JhcGgubWF0cml4Lmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3QmFja2dyb3VuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmN0eC5yb3VuZFJlY3QoMCwgMCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCwgdGhpcy5ib2FyZC5jbGllbnRXaWR0aCAqICh0aGlzLmJvcmRlclJhZGl1cyAvIDEwMCkpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3R3JpZGxpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRoaXMudGlsZVNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8obCwgdGhpcy5ib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkU2lkZUxlbmd0aCwgbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAyNTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kcmF3RmluaXNoTGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb3JuZXJzID0gW1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplIC0gdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDY7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjQ0NDRcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZmZhYVwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpZXc7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG52YXIgdGlsZXNBY3Jvc3NEZWZhdWx0ID0gNjtcclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG4gICAgbW9kZWw6IE1vZGVsO1xyXG4gICAgdmlldzogVmlldztcclxuXHJcbiAgICBwcml2YXRlIHNob3dHcmlkbGluZXM6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGdhbWVXb25Nb2RhbFNob3duOiBib29sZWFuOyAvLyBoYXMgdGhlIHBsYXllciBhbHJlYWR5IHNlZW4gdGhlIGdhbWUgd29uIE1vZGFsIGFuZCB3YW50ZWQgdG8ga2VlcCBwbGF5aW5nP1xyXG5cclxuICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgIHNldHVwR2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgeWVsbG93QWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZFN0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZUxhYmVsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0QnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lV29uTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgd2lubmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgVmlldygpO1xyXG5cclxuICAgICAgICB0aGlzLl9nZXREb21FbGVtZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2dldERvbUVsZW1lbnRzKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidW5kby1tb3ZlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtZ3JpZGxpbmVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtYmxvY2thZGVzXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgICAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnQtZ2FtZS1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtYWlcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1zaXplXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZS1sYWJlbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID0gXCJQbGF5ZXJcIjtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPSBcIkNvbXB1dGVyXCI7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgc2Vjb25kXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUgPSB0aWxlc0Fjcm9zc0RlZmF1bHQudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsLmlubmVySFRNTCA9IGAke3RpbGVzQWNyb3NzRGVmYXVsdH14JHt0aWxlc0Fjcm9zc0RlZmF1bHR9YDtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS13b24tbW9kYWxcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVsxXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLndpbm5lckluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndpbm5lci1pbmZvXCIpO1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVBZ2FpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lLWFnYWluXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtlZXAtcGxheWluZ1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdEV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLS9kZWJ1Zy1idXR0b25zXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnVuZG9Nb3ZlKCkgPyB0aGlzLl91cGRhdGVWaWV3KCkgOiBjb25zb2xlLmxvZyhcIm5vIG1vcmUgcG9zaXRpb25zIGluIGhpc3RvcnkgYXJyYXlcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93R3JpZGxpbmVzID0gIXRoaXMuc2hvd0dyaWRsaW5lcztcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgZ2FtZSBtb2RhbFxyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiUGxheWVyXCIgPyBcIkNvbXB1dGVyXCIgOiBcIlBsYXllclwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9IHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJQbGF5ZXJcIiA/IFwiQ29tcHV0ZXJcIiA6IFwiUGxheWVyXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX14JHt0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZX1gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbChcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9PSBcIkNvbXB1dGVyXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIlxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsU2hvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lIHdvbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQWdhaW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy52aWV3LmRyYXdCb2FyZCh0aGlzLm1vZGVsLm1haW5HcmFwaCwgdGhpcy5zaG93R3JpZGxpbmVzLCB0aGlzLnNob3dCbG9ja2FkZXMpO1xyXG4gICAgICAgIHRoaXMudmlldy5ib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLl9ib2FyZENsaWNrZWQoZXZlbnQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9ib2FyZENsaWNrZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy52aWV3LmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC50cnlQbGF5aW5nTm9kZSh4LCB5KSkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICE9IDAgJiYgIXRoaXMuZ2FtZVdvbk1vZGFsU2hvd24pIHtcclxuICAgICAgICAgICAgdGhpcy53aW5uZXJJbmZvLmlubmVySFRNTCA9IGAke3RoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVXb24gPT0gMSA/IFwiWWVsbG93XCIgOiBcIlJlZFwifSB3b25gO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==