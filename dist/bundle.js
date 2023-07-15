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
/* harmony export */   State: () => (/* binding */ State),
/* harmony export */   transpose: () => (/* binding */ transpose)
/* harmony export */ });
var State;
(function (State) {
    State["yellow"] = "Yellow";
    State["red"] = "Red";
    State["empty"] = "black";
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
    Graph.prototype.graphToBitboard = function () {
        var _this = this;
        var matrix = Array(this.tilesAcross)
            .fill(0)
            .map(function () { return Array(_this.tilesAcross).fill(3); });
        this.nodeList.forEach(function (node) {
            if (node.state == State.empty) {
                matrix[node.x][node.y] = 0;
                return;
            }
            matrix[node.x][node.y] = node.state == State.yellow ? 1 : 2;
            node.edges.forEach(function (edge) {
                var offsetX = edge.x - node.x;
                var offsetY = edge.y - node.y;
                var bridgeIndex = (offsetX < 0 ? 4 : 0) | (offsetY < 0 ? 1 : 0) | (Math.abs(offsetX) == 1 ? 2 : 0);
                // console.log(`node at: [${node.x}, ${node.y}]\n in direction x = ${offsetX}, y = ${offsetY}\n with direction index ${bridgeIndex}`);
                matrix[node.x][node.y] |= (Math.pow(2, bridgeIndex)) << 2;
            });
        });
        // console.table(transpose(matrix, 10));
        return matrix;
    };
    Graph.prototype.getNode = function (x, y) {
        return this.nodeList.find(function (node) {
            return node.x == x && node.y == y;
        });
    };
    Graph.prototype.addNode = function (x, y) {
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
                // console.log("Edge to potential Node (" + potentialNode.x + ", " + potentialNode.y + ") couldn't be added");
                continue;
            }
            bridgeAdded = true;
        }
        if (bridgeAdded) {
            this.checkWinCondition();
        }
        this.evaluate();
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
    Graph.prototype.getPossibleMoves = function () {
        var possibleMoves = [];
        this.nodeList.forEach(function (node) {
            if (node.state != State.empty)
                return;
            possibleMoves.push([node.x, node.y]);
        });
        return possibleMoves;
    };
    /**
     * TODO make the score more advanced with more factors
     * who has more connecting bridges
     * who has a longer connection that is not yet a winning connection
     */
    Graph.prototype.evaluate = function () {
        if (this.gameWon == State.empty) {
            this.score = 0;
        }
        // the earlier the game is won, the higher the score
        var maxValue = Math.pow(this.tilesAcross, 2) - 4 + this.getPossibleMoves().length;
        if (this.gameWon == State.yellow) {
            this.score = maxValue;
            return;
        }
        if (this.gameWon == State.red) {
            this.score = maxValue * -1;
            return;
        }
    };
    return Graph;
}());

function transpose(a, numeral) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return numeral == 10 ? r[c] : r[c].toString(numeral);
        });
    });
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
    Model.prototype.tryPlacingPin = function (x, y) {
        var currGraph = this.mainGraph.clone();
        var pinPlaced = this.mainGraph.addNode(x, y);
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
    //returns best next move
    // make everything async so that the user interface stays responsive
    Model.prototype.minimaxStart = function (depth) {
        var _this = this;
        var possibleMoves = this.mainGraph.getPossibleMoves();
        var evalArray = [];
        possibleMoves.forEach(function (move) {
            var currGraph = _this.mainGraph.clone();
            currGraph.addNode(move[0], move[1]);
            evalArray.push("move: [".concat(move, "], evaluation: ").concat(_this.minimax(depth - 1, currGraph, -Infinity, Infinity)));
        });
        console.log(evalArray);
    };
    // sort the graph so that pruning happens earlier
    Model.prototype.minimax = function (depth, graph, alpha, beta) {
        var _this = this;
        if (depth == 0 || graph.gameWon != _graph__WEBPACK_IMPORTED_MODULE_0__.State.empty) {
            return graph.score;
        }
        var possibleGraphs = [];
        graph.getPossibleMoves().forEach(function (move) {
            var currGraph = graph.clone();
            currGraph.addNode(move[0], move[1]);
            possibleGraphs.push(currGraph);
        });
        if (graph.yellowsTurn) {
            var maxEval_1 = -Infinity;
            possibleGraphs.forEach(function (child) {
                var evaluation = _this.minimax(depth - 1, child, alpha, beta);
                maxEval_1 = Math.max(maxEval_1, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha)
                    return maxEval_1;
            });
            return maxEval_1;
        }
        else {
            var minEval_1 = Infinity;
            possibleGraphs.forEach(function (child) {
                var evaluation = _this.minimax(depth - 1, child, alpha, beta);
                minEval_1 = Math.min(minEval_1, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha)
                    return minEval_1;
            });
            return minEval_1;
        }
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
var View = /** @class */ (function () {
    function View() {
        this.turnInfo = document.getElementById("turn-info");
        this.boardContainer = document.getElementById("board-container");
    }
    View.prototype.drawBoard = function (graph, gridlines, blockades) {
        var _this = this;
        // this line could be made shorter
        this.turnInfo.innerHTML = "It's " + (graph.yellowsTurn ? "yellow" : "red") + "'s turn";
        this.boardContainer.innerHTML = "";
        this._createCanvas(graph);
        if (gridlines) {
            this._drawGridlines();
        }
        this._drawFinishLines();
        graph.nodeList.forEach(function (node) {
            var nodeCenterX = node.x * _this.tileSize + _this.tileSize / 2;
            var nodeCenterY = node.y * _this.tileSize + _this.tileSize / 2;
            // draw hole or pin
            _this.ctx.beginPath();
            _this.ctx.arc(nodeCenterX, nodeCenterY, _this.tileSize / 6, 0, 2 * Math.PI);
            _this.ctx.fillStyle = node.state;
            _this.ctx.fill();
            // draw bridges
            _this.ctx.lineWidth = _this.tileSize / 12;
            _this.ctx.strokeStyle = node.state;
            node.edges.forEach(function (edge) {
                _this.ctx.beginPath();
                _this.ctx.moveTo(nodeCenterX, nodeCenterY);
                _this.ctx.lineTo(edge.x * _this.tileSize + _this.tileSize / 2, edge.y * _this.tileSize + _this.tileSize / 2);
                _this.ctx.stroke();
            });
            // draw blockade
            if (!blockades)
                return;
            _this.ctx.strokeStyle = "black";
            node.blockades.forEach(function (block) {
                _this.ctx.beginPath();
                _this.ctx.moveTo(nodeCenterX, nodeCenterY);
                _this.ctx.lineTo(block.x * _this.tileSize + _this.tileSize / 2, block.y * _this.tileSize + _this.tileSize / 2);
                _this.ctx.stroke();
            });
        });
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
        // this.board.addEventListener("click", this.boardClicked);
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
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model */ "./src/model.ts");
/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./view */ "./src/view.ts");



/** handles all input, checks in with model and displays the result with view */
var tilesAcrossDefault = 5;
var Controller = /** @class */ (function () {
    function Controller() {
        this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](tilesAcrossDefault, true, false, false);
        this.view = new _view__WEBPACK_IMPORTED_MODULE_2__["default"]();
        this._getDomElements();
        this._initEventListeners();
        this.updateView();
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
            _this.updateView();
        });
        // game-/debug-buttons
        this.restartGameButton.addEventListener("click", function () {
            _this.setupGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", function () {
            _this.model.undoMove() ? _this.updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", function () {
            // this.showGridlines = !this.showGridlines;
            // this.updateView();
            _this.model.minimaxStart(4);
        });
        this.toggleBlockadesButton.addEventListener("click", function () {
            _this.showBlockades = !_this.showBlockades;
            _this.updateView();
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
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](parseInt(_this.boardSizeSlider.value), _this.yellowStartsButton.value == "goes first", _this.yellowAiButton.value == "Computer", _this.redAiButton.value == "Computer");
            _this.setupGameModal.style.display = "none";
            _this.gameWonModalShown = false;
            _this.updateView();
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
    Controller.prototype.updateView = function () {
        var _this = this;
        this.view.drawBoard(this.model.mainGraph, this.showGridlines, this.showBlockades);
        this.view.board.addEventListener("click", function () { return _this._boardClicked(event); });
    };
    Controller.prototype._boardClicked = function (event) {
        var rect = this.view.board.getBoundingClientRect();
        // calculate which tile was clicked from global coordinates to matrix coordinates
        var x = Math.floor((event.clientX - rect.left) / this.view.tileSize);
        var y = Math.floor((event.clientY - rect.top) / this.view.tileSize);
        // the corners of the playing field
        if ((x == 0 || x == this.model.mainGraph.tilesAcross - 1) && (y == 0 || y == this.model.mainGraph.tilesAcross - 1))
            return;
        // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
        var nodePlayed = this.model.tryPlacingPin(x, y);
        if (nodePlayed) {
            this.updateView();
        }
        if (this.model.mainGraph.gameWon != _graph__WEBPACK_IMPORTED_MODULE_0__.State.empty && !this.gameWonModalShown) {
            this.winnerInfo.innerHTML = this.model.mainGraph.gameWon + " won!";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1B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U0FBUyxDQUFDLE9BQU8sSUFBSSwrQ0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUMxQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FBQztBQUVELElBQU0sR0FBRyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9ncmFwaC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9tb2RlbC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy92aWV3LnRzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gU3RhdGUge1xyXG4gICAgeWVsbG93ID0gXCJZZWxsb3dcIixcclxuICAgIHJlZCA9IFwiUmVkXCIsXHJcbiAgICBlbXB0eSA9IFwiYmxhY2tcIixcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgc3RhdGU6IFN0YXRlO1xyXG4gICAgZWRnZXM6IE5vZGVbXTtcclxuICAgIGJsb2NrYWRlczogU2V0PE5vZGU+O1xyXG4gICAgaWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgdGlsZXNBY3Jvc3M6IG51bWJlciwgc3RhdGU6IFN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmVkZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy5ibG9ja2FkZXMgPSBuZXcgU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5pZCA9IHkgKiB0aWxlc0Fjcm9zcyArIHg7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcbiAgICB5ZWxsb3dzVHVybjogYm9vbGVhbjtcclxuICAgIHRpbGVzQWNyb3NzOiBudW1iZXI7XHJcbiAgICBub2RlTGlzdDogTm9kZVtdO1xyXG4gICAgZ2FtZVdvbjogU3RhdGU7XHJcbiAgICBzY29yZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLnRpbGVzQWNyb3NzID0gdGlsZXNBY3Jvc3M7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uID0gU3RhdGUuZW1wdHk7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBhbGwgbm9kZXMgaW4gZW1wdHkgc3RhdGVcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRpbGVzQWNyb3NzOyB5KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc0Fjcm9zczsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRpbGVzQWNyb3NzIC0gMSkpIGNvbnRpbnVlOyAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdC5wdXNoKG5ldyBOb2RlKHgsIHksIHRpbGVzQWNyb3NzLCBTdGF0ZS5lbXB0eSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy50aWxlc0Fjcm9zcywgdGhpcy55ZWxsb3dzVHVybik7XHJcbiAgICAgICAgY2xvbmVkR3JhcGgubm9kZUxpc3QgPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5ub2RlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lZEdyYXBoO1xyXG4gICAgfVxyXG5cclxuICAgIGdyYXBoVG9CaXRib2FyZCgpOiBudW1iZXJbXVtdIHtcclxuICAgICAgICBsZXQgbWF0cml4ID0gQXJyYXkodGhpcy50aWxlc0Fjcm9zcylcclxuICAgICAgICAgICAgLmZpbGwoMClcclxuICAgICAgICAgICAgLm1hcCgoKSA9PiBBcnJheSh0aGlzLnRpbGVzQWNyb3NzKS5maWxsKDMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnN0YXRlID09IFN0YXRlLmVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXhbbm9kZS54XVtub2RlLnldID0gMDtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtYXRyaXhbbm9kZS54XVtub2RlLnldID0gbm9kZS5zdGF0ZSA9PSBTdGF0ZS55ZWxsb3cgPyAxIDogMjtcclxuXHJcbiAgICAgICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldFggPSBlZGdlLnggLSBub2RlLng7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0WSA9IGVkZ2UueSAtIG5vZGUueTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYnJpZGdlSW5kZXggPSAob2Zmc2V0WCA8IDAgPyA0IDogMCkgfCAob2Zmc2V0WSA8IDAgPyAxIDogMCkgfCAoTWF0aC5hYnMob2Zmc2V0WCkgPT0gMSA/IDIgOiAwKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBub2RlIGF0OiBbJHtub2RlLnh9LCAke25vZGUueX1dXFxuIGluIGRpcmVjdGlvbiB4ID0gJHtvZmZzZXRYfSwgeSA9ICR7b2Zmc2V0WX1cXG4gd2l0aCBkaXJlY3Rpb24gaW5kZXggJHticmlkZ2VJbmRleH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXRyaXhbbm9kZS54XVtub2RlLnldIHw9ICgyICoqIGJyaWRnZUluZGV4KSA8PCAyO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY29uc29sZS50YWJsZSh0cmFuc3Bvc2UobWF0cml4LCAxMCkpO1xyXG4gICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IE5vZGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVMaXN0LmZpbmQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUueCA9PSB4ICYmIG5vZGUueSA9PSB5O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE5vZGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuZ2V0Tm9kZSh4LCB5KTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbm9kZS5zdGF0ZSA9IHRoaXMueWVsbG93c1R1cm4gPyBTdGF0ZS55ZWxsb3cgOiBTdGF0ZS5yZWQ7XHJcblxyXG4gICAgICAgIGxldCBicmlkZ2VBZGRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB4IGFuZCB5IG9mIGFsbCA4IHBvdGVudGlhbCAoa25pZ2h0KW1vdmVzXHJcbiAgICAgICAgICAgIGxldCBpSW5CaW5hcnkgPSAoXCIwMDBcIiArIGkudG9TdHJpbmcoMikpLnNsaWNlKC0zKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFggPSBub2RlLnggKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMSA6IDIpICogKGlJbkJpbmFyeVsxXSA9PSBcIjBcIiA/IC0xIDogMSk7XHJcbiAgICAgICAgICAgIGxldCBwb3RlbnRpYWxZID0gbm9kZS55ICsgKGlJbkJpbmFyeVswXSA9PSBcIjBcIiA/IDIgOiAxKSAqIChpSW5CaW5hcnlbMl0gPT0gXCIwXCIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICAgICAgLy8gcG90ZW50aWFsTm9kZSBpcyBvbmUgb3V0IG9mIHRoZSA4IHN1cnJvdW5kaW5nIG5laWdoYm91cnMgdGhhdCBtaWdodCBoYXZlIHRoZSBzYW1lIGNvbG9yIGFuZCBjb3VsZCBiZSBjb25uZWN0ZWRcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsWCwgcG90ZW50aWFsWSk7XHJcbiAgICAgICAgICAgIGlmICghcG90ZW50aWFsTm9kZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChwb3RlbnRpYWxOb2RlLnN0YXRlICE9IG5vZGUuc3RhdGUpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVkZ2VBZGRlZCA9IHRoaXMuYWRkRWRnZShub2RlLCBwb3RlbnRpYWxOb2RlKTtcclxuICAgICAgICAgICAgaWYgKCFlZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRWRnZSB0byBwb3RlbnRpYWwgTm9kZSAoXCIgKyBwb3RlbnRpYWxOb2RlLnggKyBcIiwgXCIgKyBwb3RlbnRpYWxOb2RlLnkgKyBcIikgY291bGRuJ3QgYmUgYWRkZWRcIik7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmlkZ2VBZGRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYnJpZGdlQWRkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja1dpbkNvbmRpdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ldmFsdWF0ZSgpO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSAhdGhpcy55ZWxsb3dzVHVybjtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRFZGdlKG5vZGU6IE5vZGUsIHBvdGVudGlhbE5vZGU6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgeERpcmVjdGlvblBvc2l0aXZlID0gcG90ZW50aWFsTm9kZS54IC0gbm9kZS54ID4gMDtcclxuICAgICAgICBsZXQgeURpcmVjdGlvblBvc2l0aXZlID0gcG90ZW50aWFsTm9kZS55IC0gbm9kZS55ID4gMDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgIHZkb3dudiAgICAgICBedXBeXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIG5vZGUgICAgcG90ZW50aWFsTm9kZTJcclxuICAgICAgICAgKiAgIG5vZGUxICAgcG90ZW50aWFsTm9kZTFcclxuICAgICAgICAgKiAgIG5vZGUyICAgcG90ZW50aWFsTm9kZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBhcHBsaWNhYmxlIGluIG90aGVyIHJvdGF0aW9uc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCBub2RlMSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxOb2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSwgcG90ZW50aWFsTm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSkpO1xyXG4gICAgICAgIGxldCBwb3RlbnRpYWxOb2RlMSA9IHRoaXMuZ2V0Tm9kZShub2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSwgbm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSkpO1xyXG5cclxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdldE5vZGUobm9kZTEueCAqIDIgLSBub2RlLngsIG5vZGUxLnkgKiAyIC0gbm9kZS55KTtcclxuICAgICAgICBsZXQgcG90ZW50aWFsTm9kZTIgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsTm9kZTEueCAqIDIgLSBwb3RlbnRpYWxOb2RlLngsIHBvdGVudGlhbE5vZGUxLnkgKiAyIC0gcG90ZW50aWFsTm9kZS55KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcclxuICAgICAgICBpZiAobm9kZTEuYmxvY2thZGVzLmhhcyhwb3RlbnRpYWxOb2RlMikgfHwgcG90ZW50aWFsTm9kZTEuYmxvY2thZGVzLmhhcyhub2RlMikgfHwgbm9kZTEuYmxvY2thZGVzLmhhcyhwb3RlbnRpYWxOb2RlMSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkQmxvY2thZGUgPSAobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIG5vZGVBLmJsb2NrYWRlcy5hZGQobm9kZUIpO1xyXG4gICAgICAgICAgICBub2RlQi5ibG9ja2FkZXMuYWRkKG5vZGVBKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUsIG5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlMSwgcG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZSwgcG90ZW50aWFsTm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdGVudGlhbE5vZGUxLCBub2RlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGJyaWRnZSBib3RoIHdheXNcclxuICAgICAgICBub2RlLmVkZ2VzLnB1c2gocG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgcG90ZW50aWFsTm9kZS5lZGdlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrV2luQ29uZGl0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlUXVldWUgPSBuZXcgU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLnRpbGVzQWNyb3NzIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydE5vZGUgPSB0aGlzLnllbGxvd3NUdXJuID8gdGhpcy5nZXROb2RlKGksIDApIDogdGhpcy5nZXROb2RlKDAsIGkpO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgc3RhcnROb2RlLnN0YXRlICE9IFN0YXRlLnllbGxvdykgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSBTdGF0ZS5yZWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgbm9kZVF1ZXVlLmFkZChzdGFydE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbm5lY3Rpb25Gb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIG5vZGVRdWV1ZS5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0aW9uRm91bmQpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmIG5vZGUueSA9PSB0aGlzLnRpbGVzQWNyb3NzIC0gMSkgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIG5vZGUueCA9PSB0aGlzLnRpbGVzQWNyb3NzIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25Gb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZS5lZGdlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub2RlUXVldWUuYWRkKG5vZGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbiA9IHRoaXMueWVsbG93c1R1cm4gPyBTdGF0ZS55ZWxsb3cgOiBTdGF0ZS5yZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldFBvc3NpYmxlTW92ZXMoKTogbnVtYmVyW11bXSB7XHJcbiAgICAgICAgbGV0IHBvc3NpYmxlTW92ZXM6IG51bWJlcltdW10gPSBbXTtcclxuICAgICAgICB0aGlzLm5vZGVMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5vZGUuc3RhdGUgIT0gU3RhdGUuZW1wdHkpIHJldHVybjtcclxuICAgICAgICAgICAgcG9zc2libGVNb3Zlcy5wdXNoKFtub2RlLngsIG5vZGUueV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwb3NzaWJsZU1vdmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ETyBtYWtlIHRoZSBzY29yZSBtb3JlIGFkdmFuY2VkIHdpdGggbW9yZSBmYWN0b3JzXHJcbiAgICAgKiB3aG8gaGFzIG1vcmUgY29ubmVjdGluZyBicmlkZ2VzXHJcbiAgICAgKiB3aG8gaGFzIGEgbG9uZ2VyIGNvbm5lY3Rpb24gdGhhdCBpcyBub3QgeWV0IGEgd2lubmluZyBjb25uZWN0aW9uXHJcbiAgICAgKi9cclxuICAgIGV2YWx1YXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVXb24gPT0gU3RhdGUuZW1wdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoZSBlYXJsaWVyIHRoZSBnYW1lIGlzIHdvbiwgdGhlIGhpZ2hlciB0aGUgc2NvcmVcclxuICAgICAgICBsZXQgbWF4VmFsdWUgPSB0aGlzLnRpbGVzQWNyb3NzICoqIDIgLSA0ICsgdGhpcy5nZXRQb3NzaWJsZU1vdmVzKCkubGVuZ3RoO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVXb24gPT0gU3RhdGUueWVsbG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcmUgPSBtYXhWYWx1ZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5nYW1lV29uID09IFN0YXRlLnJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNjb3JlID0gbWF4VmFsdWUgKiAtMTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShhOiBudW1iZXJbXVtdLCBudW1lcmFsOiBudW1iZXIpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhhWzBdKS5tYXAoZnVuY3Rpb24gKGM6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBhLm1hcChmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtZXJhbCA9PSAxMCA/IHJbY10gOiByW2NdLnRvU3RyaW5nKG51bWVyYWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHsgR3JhcGgsIFN0YXRlIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gZ2xvYmFsIHZhcmlhYmxlc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBtYWluR3JhcGg6IEdyYXBoO1xyXG4gICAgaGlzdG9yeTogR3JhcGhbXTtcclxuICAgIHllbGxvd0FJOiBib29sZWFuO1xyXG4gICAgcmVkQUk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZXNBY3Jvc3M6IG51bWJlciwgeWVsbG93U3RhcnRzOiBib29sZWFuLCB5ZWxsb3dBSTogYm9vbGVhbiwgcmVkQUk6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgeWVsbG93U3RhcnRzKTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnllbGxvd0FJID0geWVsbG93QUk7XHJcbiAgICAgICAgdGhpcy5yZWRBSSA9IHJlZEFJO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeVBsYWNpbmdQaW4oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgY3VyckdyYXBoID0gdGhpcy5tYWluR3JhcGguY2xvbmUoKTtcclxuICAgICAgICBsZXQgcGluUGxhY2VkID0gdGhpcy5tYWluR3JhcGguYWRkTm9kZSh4LCB5KTtcclxuICAgICAgICBpZiAoIXBpblBsYWNlZCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeS5wdXNoKGN1cnJHcmFwaCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdW5kb01vdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWFpbkdyYXBoID0gdGhpcy5oaXN0b3J5LnBvcCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmV0dXJucyBiZXN0IG5leHQgbW92ZVxyXG4gICAgLy8gbWFrZSBldmVyeXRoaW5nIGFzeW5jIHNvIHRoYXQgdGhlIHVzZXIgaW50ZXJmYWNlIHN0YXlzIHJlc3BvbnNpdmVcclxuICAgIG1pbmltYXhTdGFydChkZXB0aDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHBvc3NpYmxlTW92ZXMgPSB0aGlzLm1haW5HcmFwaC5nZXRQb3NzaWJsZU1vdmVzKCk7XHJcbiAgICAgICAgbGV0IGV2YWxBcnJheTogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgcG9zc2libGVNb3Zlcy5mb3JFYWNoKChtb3ZlOiBudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY3VyckdyYXBoID0gdGhpcy5tYWluR3JhcGguY2xvbmUoKTtcclxuICAgICAgICAgICAgY3VyckdyYXBoLmFkZE5vZGUobW92ZVswXSwgbW92ZVsxXSk7XHJcbiAgICAgICAgICAgIGV2YWxBcnJheS5wdXNoKGBtb3ZlOiBbJHttb3ZlfV0sIGV2YWx1YXRpb246ICR7dGhpcy5taW5pbWF4KGRlcHRoIC0gMSwgY3VyckdyYXBoLCAtSW5maW5pdHksIEluZmluaXR5KX1gKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coZXZhbEFycmF5KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzb3J0IHRoZSBncmFwaCBzbyB0aGF0IHBydW5pbmcgaGFwcGVucyBlYXJsaWVyXHJcbiAgICBtaW5pbWF4KGRlcHRoOiBudW1iZXIsIGdyYXBoOiBHcmFwaCwgYWxwaGE6IG51bWJlciwgYmV0YTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoZGVwdGggPT0gMCB8fCBncmFwaC5nYW1lV29uICE9IFN0YXRlLmVtcHR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBncmFwaC5zY29yZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwb3NzaWJsZUdyYXBoczogR3JhcGhbXSA9IFtdO1xyXG4gICAgICAgIGdyYXBoLmdldFBvc3NpYmxlTW92ZXMoKS5mb3JFYWNoKChtb3ZlOiBudW1iZXJbXSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY3VyckdyYXBoID0gZ3JhcGguY2xvbmUoKTtcclxuICAgICAgICAgICAgY3VyckdyYXBoLmFkZE5vZGUobW92ZVswXSwgbW92ZVsxXSk7XHJcbiAgICAgICAgICAgIHBvc3NpYmxlR3JhcGhzLnB1c2goY3VyckdyYXBoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGdyYXBoLnllbGxvd3NUdXJuKSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhFdmFsID0gLUluZmluaXR5O1xyXG4gICAgICAgICAgICBwb3NzaWJsZUdyYXBocy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2YWx1YXRpb24gPSB0aGlzLm1pbmltYXgoZGVwdGggLSAxLCBjaGlsZCwgYWxwaGEsIGJldGEpO1xyXG4gICAgICAgICAgICAgICAgbWF4RXZhbCA9IE1hdGgubWF4KG1heEV2YWwsIGV2YWx1YXRpb24pO1xyXG4gICAgICAgICAgICAgICAgYWxwaGEgPSBNYXRoLm1heChhbHBoYSwgZXZhbHVhdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmV0YSA8PSBhbHBoYSkgcmV0dXJuIG1heEV2YWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF4RXZhbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbWluRXZhbCA9IEluZmluaXR5O1xyXG4gICAgICAgICAgICBwb3NzaWJsZUdyYXBocy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2YWx1YXRpb24gPSB0aGlzLm1pbmltYXgoZGVwdGggLSAxLCBjaGlsZCwgYWxwaGEsIGJldGEpO1xyXG4gICAgICAgICAgICAgICAgbWluRXZhbCA9IE1hdGgubWluKG1pbkV2YWwsIGV2YWx1YXRpb24pO1xyXG4gICAgICAgICAgICAgICAgYmV0YSA9IE1hdGgubWluKGJldGEsIGV2YWx1YXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJldGEgPD0gYWxwaGEpIHJldHVybiBtaW5FdmFsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1pbkV2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2RlbDtcclxuIiwiaW1wb3J0IHsgR3JhcGggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcbiAgICBib2FyZDogYW55O1xyXG4gICAgY3R4OiBhbnk7XHJcbiAgICBib2FyZFNpZGVMZW5ndGg6IG51bWJlcjtcclxuICAgIHRpbGVTaXplOiBudW1iZXI7XHJcbiAgICBjb3JuZXJzOiBudW1iZXJbXTtcclxuXHJcbiAgICB0dXJuSW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICBib2FyZENvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50dXJuSW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHVybi1pbmZvXCIpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLWNvbnRhaW5lclwiKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3Qm9hcmQoZ3JhcGg6IEdyYXBoLCBncmlkbGluZXM6IGJvb2xlYW4sIGJsb2NrYWRlczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIC8vIHRoaXMgbGluZSBjb3VsZCBiZSBtYWRlIHNob3J0ZXJcclxuICAgICAgICB0aGlzLnR1cm5JbmZvLmlubmVySFRNTCA9IFwiSXQncyBcIiArIChncmFwaC55ZWxsb3dzVHVybiA/IFwieWVsbG93XCIgOiBcInJlZFwiKSArIFwiJ3MgdHVyblwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2FudmFzKGdyYXBoKTtcclxuICAgICAgICBpZiAoZ3JpZGxpbmVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RyYXdHcmlkbGluZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZHJhd0ZpbmlzaExpbmVzKCk7XHJcblxyXG4gICAgICAgIGdyYXBoLm5vZGVMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0gbm9kZS54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG4gICAgICAgICAgICBsZXQgbm9kZUNlbnRlclkgPSBub2RlLnkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMobm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZLCB0aGlzLnRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IG5vZGUuc3RhdGU7XHJcbiAgICAgICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhlZGdlLnggKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIsIGVkZ2UueSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGJsb2NrYWRlXHJcbiAgICAgICAgICAgIGlmICghYmxvY2thZGVzKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBub2RlLmJsb2NrYWRlcy5mb3JFYWNoKChibG9jaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhibG9jay54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBibG9jay55ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGlzIGNhbiBwcm9iYWJseSBiZSBjaGFuZ2VkIHdpdGggY2xlYXJSZWN0IGluc3RlYWQgb2YgY3JlYXRpbmcgYSB3aG9sZSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgX2NyZWF0ZUNhbnZhcyhncmFwaDogR3JhcGgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICB0aGlzLmJvYXJkLmlkID0gXCJib2FyZFwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUuYmFja2dyb3VuZCA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUuYm94U2hhZG93ID0gXCI1cHggNXB4IDIwcHggZ3JheVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUuYm9yZGVyUmFkaXVzID0gXCIzJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuc3R5bGUubWFyZ2luID0gXCIxJVwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmQud2lkdGggPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudFdpZHRoICogMC45ODtcclxuICAgICAgICB0aGlzLmJvYXJkLmhlaWdodCA9IHRoaXMuYm9hcmRDb250YWluZXIuY2xpZW50SGVpZ2h0ICogMC45ODtcclxuICAgICAgICAvLyB0aGlzLmJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmJvYXJkQ2xpY2tlZCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJvYXJkKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmJvYXJkLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCA9IHRoaXMuYm9hcmQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdGhpcy50aWxlU2l6ZSA9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC8gZ3JhcGgudGlsZXNBY3Jvc3M7XHJcbiAgICB9XHJcblxyXG4gICAgX2RyYXdHcmlkbGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gdGhpcy5ib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGhpcy50aWxlU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhsLCB0aGlzLmJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDI1O1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9kcmF3RmluaXNoTGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb3JuZXJzID0gW1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplIC0gdGhpcy50aWxlU2l6ZSAvIDQsXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDY7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjQ0NDRcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmZmZhYVwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpZXc7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgR3JhcGgsIFN0YXRlIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG52YXIgdGlsZXNBY3Jvc3NEZWZhdWx0ID0gNTtcclxuXHJcbmNsYXNzIENvbnRyb2xsZXIge1xyXG4gICAgbW9kZWw6IE1vZGVsO1xyXG4gICAgdmlldzogVmlldztcclxuXHJcbiAgICBzaG93R3JpZGxpbmVzOiBib29sZWFuO1xyXG4gICAgc2hvd0Jsb2NrYWRlczogYm9vbGVhbjtcclxuICAgIGdhbWVXb25Nb2RhbFNob3duOiBib29sZWFuOyAvLyBoYXMgdGhlIHBsYXllciBhbHJlYWR5IHNlZW4gdGhlIGdhbWUgd29uIE1vZGFsIGFuZCB3YW50ZWQgdG8ga2VlcCBwbGF5aW5nP1xyXG5cclxuICAgIC8vIGdhbWUtL2RlYnVnLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG5cclxuICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgIHNldHVwR2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgeWVsbG93QWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZFN0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZUxhYmVsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0QnV0dG9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lV29uTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgd2lubmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgVmlldygpO1xyXG5cclxuICAgICAgICB0aGlzLl9nZXREb21FbGVtZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0RG9tRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgLy8gZ2FtZS0vZGVidWctYnV0dG9uc1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RhcnQtZ2FtZVwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1bmRvLW1vdmVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1ncmlkbGluZXNcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCbG9ja2FkZXNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1ibG9ja2FkZXNcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1nYW1lLW1vZGFsXCIpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWxDbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJtb2RhbC1jbG9zZVwiKVswXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ5ZWxsb3ctYWlcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LXN0YXJ0c1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMucmVkQWlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1haVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtc3RhcnRzXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVTbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkLXNpemVcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1zaXplLWxhYmVsXCIpO1xyXG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPSBcIlBsYXllclwiO1xyXG4gICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID0gXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9IFwiQ29tcHV0ZXJcIjtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9IFwiZ29lcyBzZWNvbmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZVNsaWRlci52YWx1ZSA9IHRpbGVzQWNyb3NzRGVmYXVsdC50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplTGFiZWwuaW5uZXJIVE1MID0gYCR7dGlsZXNBY3Jvc3NEZWZhdWx0fXgke3RpbGVzQWNyb3NzRGVmYXVsdH1gO1xyXG5cclxuICAgICAgICAvLyBnYW1lIHdvbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLXdvbi1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMud2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0RXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS0vZGVidWctYnV0dG9uc1xyXG4gICAgICAgIHRoaXMucmVzdGFydEdhbWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC51bmRvTW92ZSgpID8gdGhpcy51cGRhdGVWaWV3KCkgOiBjb25zb2xlLmxvZyhcIm5vIG1vcmUgcG9zaXRpb25zIGluIGhpc3RvcnkgYXJyYXlcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gdGhpcy5zaG93R3JpZGxpbmVzID0gIXRoaXMuc2hvd0dyaWRsaW5lcztcclxuICAgICAgICAgICAgLy8gdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwubWluaW1heFN0YXJ0KDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBzZXR1cCBnYW1lIG1vZGFsXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMueWVsbG93QWlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93QWlCdXR0b24udmFsdWUgPT0gXCJQbGF5ZXJcIiA/IFwiQ29tcHV0ZXJcIiA6IFwiUGxheWVyXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRBaUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRBaUJ1dHRvbi52YWx1ZSA9PSBcIlBsYXllclwiID8gXCJDb21wdXRlclwiIDogXCJQbGF5ZXJcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi52YWx1ZSA9IHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID09IFwiZ29lcyBmaXJzdFwiID8gXCJnb2VzIHNlY29uZFwiIDogXCJnb2VzIGZpcnN0XCI7XHJcbiAgICAgICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZVNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2l6ZUxhYmVsLmlubmVySFRNTCA9IGAke3RoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlfXgke3RoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlfWA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQodGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIixcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJDb21wdXRlclwiXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuX2JvYXJkQ2xpY2tlZChldmVudCkpO1xyXG4gICAgfVxyXG5cclxuICAgIF9ib2FyZENsaWNrZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy52aWV3LmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgLy8gdGhlIGNvcm5lcnMgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRoaXMubW9kZWwubWFpbkdyYXBoLnRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRoaXMubW9kZWwubWFpbkdyYXBoLnRpbGVzQWNyb3NzIC0gMSkpIHJldHVybjtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcbiAgICAgICAgbGV0IG5vZGVQbGF5ZWQgPSB0aGlzLm1vZGVsLnRyeVBsYWNpbmdQaW4oeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICE9IFN0YXRlLmVtcHR5ICYmICF0aGlzLmdhbWVXb25Nb2RhbFNob3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lubmVySW5mby5pbm5lckhUTUwgPSB0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICsgXCIgd29uIVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==