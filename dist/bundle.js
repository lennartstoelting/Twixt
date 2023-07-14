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
    /**
     * turn graph it into a bitboard where the first two bits represent yellow and red and the following 8 represent the bridges
     */
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
        console.table(transpose(matrix, 10));
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
                console.log("Edge to potential Node (" + potentialNode.x + ", " + potentialNode.y + ") couldn't be added");
                continue;
            }
            bridgeAdded = true;
        }
        if (bridgeAdded) {
            this.checkWinCondition();
            this.graphToBitboard();
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
var tilesAcrossDefault = 6;
// TODO implement the gameWonModalShown to a point that it is usable again
// clean up and organize code a lot
// potentially move some functionality from model to controller/index
var Controller = /** @class */ (function () {
    function Controller() {
        this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](tilesAcrossDefault, true, false, false);
        this.view = new _view__WEBPACK_IMPORTED_MODULE_2__["default"]();
        this._getDomElements();
        this._initEventListeners();
        this.updateView();
    }
    Controller.prototype._getDomElements = function () {
        this.restartGameButton = document.getElementById("restart-game");
        this.undoMoveButton = document.getElementById("undo-move");
        this.toggleGridlinesButton = document.getElementById("toggle-gridlines");
        this.toggleBlockadesButton = document.getElementById("toggle-blockades");
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
        // game-buttons
        this.restartGameButton.addEventListener("click", function () {
            _this.setupGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", function () {
            _this.model.undoMove() ? _this.updateView() : console.log("no more positions in history array");
        });
        // debug-buttons
        this.toggleGridlinesButton.addEventListener("click", function () {
            _this.showGridlines = !_this.showGridlines;
            _this.updateView();
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
            // TODO: add ai functionality
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQUUsT0FBTztRQUMzSCw2REFBNkQ7UUFDN0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksVUFBVSxFQUFFO1lBQ1osSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksK0NBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4RSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDMUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztTQUNqQztJQUNMLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUM7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvdmlldy50cyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3R3aXh0Ly4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFN0YXRlIHtcclxuICAgIGVtcHR5ID0gXCJibGFja1wiLFxyXG4gICAgeWVsbG93ID0gXCJZZWxsb3dcIixcclxuICAgIHJlZCA9IFwiUmVkXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHN0YXRlOiBTdGF0ZTtcclxuICAgIGVkZ2VzOiBOb2RlW107XHJcbiAgICBibG9ja2FkZXM6IFNldDxOb2RlPjtcclxuICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHRpbGVzQWNyb3NzOiBudW1iZXIsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy5lZGdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmxvY2thZGVzID0gbmV3IFNldDxOb2RlPigpO1xyXG4gICAgICAgIHRoaXMuaWQgPSB5ICogdGlsZXNBY3Jvc3MgKyB4O1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGgge1xyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICB0aWxlc0Fjcm9zczogbnVtYmVyO1xyXG4gICAgbm9kZUxpc3Q6IE5vZGVbXTtcclxuICAgIGdhbWVXb246IFN0YXRlO1xyXG4gICAgZXZhbHVhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLnRpbGVzQWNyb3NzID0gdGlsZXNBY3Jvc3M7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uID0gU3RhdGUuZW1wdHk7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBhbGwgbm9kZXMgaW4gZW1wdHkgc3RhdGVcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRpbGVzQWNyb3NzOyB5KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc0Fjcm9zczsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRpbGVzQWNyb3NzIC0gMSkpIGNvbnRpbnVlOyAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdC5wdXNoKG5ldyBOb2RlKHgsIHksIHRpbGVzQWNyb3NzLCBTdGF0ZS5lbXB0eSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy50aWxlc0Fjcm9zcywgdGhpcy55ZWxsb3dzVHVybik7XHJcbiAgICAgICAgY2xvbmVkR3JhcGgubm9kZUxpc3QgPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5ub2RlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lZEdyYXBoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHVybiBncmFwaCBpdCBpbnRvIGEgYml0Ym9hcmQgd2hlcmUgdGhlIGZpcnN0IHR3byBiaXRzIHJlcHJlc2VudCB5ZWxsb3cgYW5kIHJlZCBhbmQgdGhlIGZvbGxvd2luZyA4IHJlcHJlc2VudCB0aGUgYnJpZGdlc1xyXG4gICAgICovXHJcbiAgICBncmFwaFRvQml0Ym9hcmQoKSB7XHJcbiAgICAgICAgbGV0IG1hdHJpeCA9IEFycmF5KHRoaXMudGlsZXNBY3Jvc3MpXHJcbiAgICAgICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgICAgIC5tYXAoKCkgPT4gQXJyYXkodGhpcy50aWxlc0Fjcm9zcykuZmlsbCgzKSk7XHJcblxyXG4gICAgICAgIHRoaXMubm9kZUxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5zdGF0ZSA9PSBTdGF0ZS5lbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgbWF0cml4W25vZGUueF1bbm9kZS55XSA9IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWF0cml4W25vZGUueF1bbm9kZS55XSA9IG5vZGUuc3RhdGUgPT0gU3RhdGUueWVsbG93ID8gMSA6IDI7XHJcblxyXG4gICAgICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXRYID0gZWRnZS54IC0gbm9kZS54O1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldFkgPSBlZGdlLnkgLSBub2RlLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGJyaWRnZUluZGV4ID0gKG9mZnNldFggPCAwID8gNCA6IDApIHwgKG9mZnNldFkgPCAwID8gMSA6IDApIHwgKE1hdGguYWJzKG9mZnNldFgpID09IDEgPyAyIDogMCk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgbm9kZSBhdDogWyR7bm9kZS54fSwgJHtub2RlLnl9XVxcbiBpbiBkaXJlY3Rpb24geCA9ICR7b2Zmc2V0WH0sIHkgPSAke29mZnNldFl9XFxuIHdpdGggZGlyZWN0aW9uIGluZGV4ICR7YnJpZGdlSW5kZXh9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWF0cml4W25vZGUueF1bbm9kZS55XSB8PSAoMiAqKiBicmlkZ2VJbmRleCkgPDwgMjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUudGFibGUodHJhbnNwb3NlKG1hdHJpeCwgMTApKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUxpc3QuZmluZCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS54ID09IHggJiYgbm9kZS55ID09IHk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5nZXROb2RlKHgsIHkpO1xyXG5cclxuICAgICAgICBpZiAobm9kZS5zdGF0ZSAhPSBTdGF0ZS5lbXB0eSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBub2RlLnN0YXRlID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHggYW5kIHkgb2YgYWxsIDggcG90ZW50aWFsIChrbmlnaHQpbW92ZXNcclxuICAgICAgICAgICAgbGV0IGlJbkJpbmFyeSA9IChcIjAwMFwiICsgaS50b1N0cmluZygyKSkuc2xpY2UoLTMpO1xyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsWCA9IG5vZGUueCArIChpSW5CaW5hcnlbMF0gPT0gXCIwXCIgPyAxIDogMikgKiAoaUluQmluYXJ5WzFdID09IFwiMFwiID8gLTEgOiAxKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFkgPSBub2RlLnkgKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMiA6IDEpICogKGlJbkJpbmFyeVsyXSA9PSBcIjBcIiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBwb3RlbnRpYWxOb2RlIGlzIG9uZSBvdXQgb2YgdGhlIDggc3Vycm91bmRpbmcgbmVpZ2hib3VycyB0aGF0IG1pZ2h0IGhhdmUgdGhlIHNhbWUgY29sb3IgYW5kIGNvdWxkIGJlIGNvbm5lY3RlZFxyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsTm9kZSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxYLCBwb3RlbnRpYWxZKTtcclxuICAgICAgICAgICAgaWYgKCFwb3RlbnRpYWxOb2RlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHBvdGVudGlhbE5vZGUuc3RhdGUgIT0gbm9kZS5zdGF0ZSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgZWRnZUFkZGVkID0gdGhpcy5hZGRFZGdlKG5vZGUsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIWVkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFZGdlIHRvIHBvdGVudGlhbCBOb2RlIChcIiArIHBvdGVudGlhbE5vZGUueCArIFwiLCBcIiArIHBvdGVudGlhbE5vZGUueSArIFwiKSBjb3VsZG4ndCBiZSBhZGRlZFwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyaWRnZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChicmlkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrV2luQ29uZGl0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhUb0JpdGJvYXJkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkRWRnZShub2RlOiBOb2RlLCBwb3RlbnRpYWxOb2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHhEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueCAtIG5vZGUueCA+IDA7XHJcbiAgICAgICAgbGV0IHlEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdGVudGlhbE5vZGUueSAtIG5vZGUueSA+IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICB2ZG93bnYgICAgICAgXnVwXlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBub2RlICAgIHBvdGVudGlhbE5vZGUyXHJcbiAgICAgICAgICogICBub2RlMSAgIHBvdGVudGlhbE5vZGUxXHJcbiAgICAgICAgICogICBub2RlMiAgIHBvdGVudGlhbE5vZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgYXBwbGljYWJsZSBpbiBvdGhlciByb3RhdGlvbnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgbm9kZTEgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsTm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSksIHBvdGVudGlhbE5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAtMSA6IDEpKTtcclxuICAgICAgICBsZXQgcG90ZW50aWFsTm9kZTEgPSB0aGlzLmdldE5vZGUobm9kZS54ICsgKHhEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSksIG5vZGUueSArICh5RGlyZWN0aW9uUG9zaXRpdmUgPyAxIDogLTEpKTtcclxuXHJcbiAgICAgICAgbGV0IG5vZGUyID0gdGhpcy5nZXROb2RlKG5vZGUxLnggKiAyIC0gbm9kZS54LCBub2RlMS55ICogMiAtIG5vZGUueSk7XHJcbiAgICAgICAgbGV0IHBvdGVudGlhbE5vZGUyID0gdGhpcy5nZXROb2RlKHBvdGVudGlhbE5vZGUxLnggKiAyIC0gcG90ZW50aWFsTm9kZS54LCBwb3RlbnRpYWxOb2RlMS55ICogMiAtIHBvdGVudGlhbE5vZGUueSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBjb2xsaXNpb25zXHJcbiAgICAgICAgaWYgKG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTIpIHx8IHBvdGVudGlhbE5vZGUxLmJsb2NrYWRlcy5oYXMobm9kZTIpIHx8IG5vZGUxLmJsb2NrYWRlcy5oYXMocG90ZW50aWFsTm9kZTEpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZEJsb2NrYWRlID0gKG5vZGVBOiBOb2RlLCBub2RlQjogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBub2RlQS5ibG9ja2FkZXMuYWRkKG5vZGVCKTtcclxuICAgICAgICAgICAgbm9kZUIuYmxvY2thZGVzLmFkZChub2RlQSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlLCBub2RlMSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUobm9kZTEsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdGVudGlhbE5vZGUsIHBvdGVudGlhbE5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShwb3RlbnRpYWxOb2RlMSwgbm9kZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBicmlkZ2UgYm90aCB3YXlzXHJcbiAgICAgICAgbm9kZS5lZGdlcy5wdXNoKHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgIHBvdGVudGlhbE5vZGUuZWRnZXMucHVzaChub2RlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1dpbkNvbmRpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbm9kZVF1ZXVlID0gbmV3IFNldDxOb2RlPigpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy50aWxlc0Fjcm9zcyAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3RhcnROb2RlID0gdGhpcy55ZWxsb3dzVHVybiA/IHRoaXMuZ2V0Tm9kZShpLCAwKSA6IHRoaXMuZ2V0Tm9kZSgwLCBpKTtcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSBTdGF0ZS55ZWxsb3cpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gU3RhdGUucmVkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIG5vZGVRdWV1ZS5hZGQoc3RhcnROb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0aW9uRm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBub2RlUXVldWUuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnkgPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnggPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbm9kZVF1ZXVlLmFkZChub2RlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGNvbm5lY3Rpb25Gb3VuZCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb24gPSB0aGlzLnllbGxvd3NUdXJuID8gU3RhdGUueWVsbG93IDogU3RhdGUucmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdHJhbnNwb3NlKGE6IG51bWJlcltdW10sIG51bWVyYWw6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGFbMF0pLm1hcChmdW5jdGlvbiAoYzogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIGEubWFwKGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudW1lcmFsID09IDEwID8gcltjXSA6IHJbY10udG9TdHJpbmcobnVtZXJhbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG4iLCJpbXBvcnQgeyBHcmFwaCB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGdsb2JhbCB2YXJpYWJsZXNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgbWFpbkdyYXBoOiBHcmFwaDtcclxuICAgIGhpc3Rvcnk6IEdyYXBoW107XHJcbiAgICB5ZWxsb3dBSTogYm9vbGVhbjtcclxuICAgIHJlZEFJOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd1N0YXJ0czogYm9vbGVhbiwgeWVsbG93QUk6IGJvb2xlYW4sIHJlZEFJOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3MsIHllbGxvd1N0YXJ0cyk7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBSSA9IHllbGxvd0FJO1xyXG4gICAgICAgIHRoaXMucmVkQUkgPSByZWRBSTtcclxuICAgIH1cclxuXHJcbiAgICB0cnlQbGFjaW5nUGluKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGN1cnJHcmFwaCA9IHRoaXMubWFpbkdyYXBoLmNsb25lKCk7XHJcbiAgICAgICAgbGV0IHBpblBsYWNlZCA9IHRoaXMubWFpbkdyYXBoLmFkZE5vZGUoeCwgeSk7XHJcbiAgICAgICAgaWYgKCFwaW5QbGFjZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChjdXJyR3JhcGgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHVuZG9Nb3ZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IHRoaXMuaGlzdG9yeS5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XHJcbiIsImltcG9ydCB7IEdyYXBoIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbmNsYXNzIFZpZXcge1xyXG4gICAgYm9hcmQ6IGFueTtcclxuICAgIGN0eDogYW55O1xyXG4gICAgYm9hcmRTaWRlTGVuZ3RoOiBudW1iZXI7XHJcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xyXG4gICAgY29ybmVyczogbnVtYmVyW107XHJcblxyXG4gICAgdHVybkluZm86IEhUTUxFbGVtZW50O1xyXG4gICAgYm9hcmRDb250YWluZXI6IEhUTUxFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudHVybkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInR1cm4taW5mb1wiKTtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0JvYXJkKGdyYXBoOiBHcmFwaCwgZ3JpZGxpbmVzOiBib29sZWFuLCBibG9ja2FkZXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAvLyB0aGlzIGxpbmUgY291bGQgYmUgbWFkZSBzaG9ydGVyXHJcbiAgICAgICAgdGhpcy50dXJuSW5mby5pbm5lckhUTUwgPSBcIkl0J3MgXCIgKyAoZ3JhcGgueWVsbG93c1R1cm4gPyBcInllbGxvd1wiIDogXCJyZWRcIikgKyBcIidzIHR1cm5cIjtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyhncmFwaCk7XHJcbiAgICAgICAgaWYgKGdyaWRsaW5lcykge1xyXG4gICAgICAgICAgICB0aGlzLl9kcmF3R3JpZGxpbmVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RyYXdGaW5pc2hMaW5lcygpO1xyXG5cclxuICAgICAgICBncmFwaC5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWCA9IG5vZGUueCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0gbm9kZS55ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBob2xlIG9yIHBpblxyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguYXJjKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSwgdGhpcy50aWxlU2l6ZSAvIDYsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gbm9kZS5zdGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBicmlkZ2VzXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAxMjtcclxuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oZWRnZS54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBlZGdlLnkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBibG9ja2FkZVxyXG4gICAgICAgICAgICBpZiAoIWJsb2NrYWRlcykgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICAgICAgbm9kZS5ibG9ja2FkZXMuZm9yRWFjaCgoYmxvY2spID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oYmxvY2sueCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgYmxvY2sueSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBjYW4gcHJvYmFibHkgYmUgY2hhbmdlZCB3aXRoIGNsZWFyUmVjdCBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgd2hvbGUgbmV3IGluc3RhbmNlIG9mIHRoZSBjYW52YXNcclxuICAgIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLndpZHRoID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5oZWlnaHQgPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICAgICAgLy8gdGhpcy5ib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5ib2FyZENsaWNrZWQpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ib2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5ib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggPSB0aGlzLmJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHRoaXMudGlsZVNpemUgPSB0aGlzLmJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLnRpbGVzQWNyb3NzO1xyXG4gICAgfVxyXG5cclxuICAgIF9kcmF3R3JpZGxpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRoaXMudGlsZVNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8obCwgdGhpcy5ib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkU2lkZUxlbmd0aCwgbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAyNTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBfZHJhd0ZpbmlzaExpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29ybmVycyA9IFtcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSAtIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyA2O1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY0NDQ0XCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZmYWFcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG52YXIgdGlsZXNBY3Jvc3NEZWZhdWx0ID0gNjtcclxuXHJcbi8vIFRPRE8gaW1wbGVtZW50IHRoZSBnYW1lV29uTW9kYWxTaG93biB0byBhIHBvaW50IHRoYXQgaXQgaXMgdXNhYmxlIGFnYWluXHJcbi8vIGNsZWFuIHVwIGFuZCBvcmdhbml6ZSBjb2RlIGEgbG90XHJcbi8vIHBvdGVudGlhbGx5IG1vdmUgc29tZSBmdW5jdGlvbmFsaXR5IGZyb20gbW9kZWwgdG8gY29udHJvbGxlci9pbmRleFxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuICAgIG1vZGVsOiBNb2RlbDtcclxuICAgIHZpZXc6IFZpZXc7XHJcblxyXG4gICAgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxuICAgIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbiAgICBnYW1lV29uTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbiAgICAvLyBnYW1lLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIGRlYnVnLWJ1dHRvbnNcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxFbGVtZW50O1xyXG5cclxuICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgIHNldHVwR2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgeWVsbG93QWlCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICByZWRBaUJ1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHJlZFN0YXJ0c0J1dHRvbjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJvYXJkU2l6ZUxhYmVsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0QnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lV29uTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgd2lubmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgVmlldygpO1xyXG5cclxuICAgICAgICB0aGlzLl9nZXREb21FbGVtZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRFdmVudExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0RG9tRWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnQtZ2FtZS1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93LWFpXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWQtYWlcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnJlZFN0YXJ0c0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVkLXN0YXJ0c1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1zaXplXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtc2l6ZS1sYWJlbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9IFwiUGxheWVyXCI7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPSBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID0gXCJDb21wdXRlclwiO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLnZhbHVlID0gXCJnb2VzIHNlY29uZFwiO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyLnZhbHVlID0gdGlsZXNBY3Jvc3NEZWZhdWx0LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemVMYWJlbC5pbm5lckhUTUwgPSBgJHt0aWxlc0Fjcm9zc0RlZmF1bHR9eCR7dGlsZXNBY3Jvc3NEZWZhdWx0fWA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLXdvbi1tb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMud2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIik7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIF9pbml0RXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS1idXR0b25zXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51bmRvTW92ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnVuZG9Nb3ZlKCkgPyB0aGlzLnVwZGF0ZVZpZXcoKSA6IGNvbnNvbGUubG9nKFwibm8gbW9yZSBwb3NpdGlvbnMgaW4gaGlzdG9yeSBhcnJheVwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBkZWJ1Zy1idXR0b25zXHJcbiAgICAgICAgdGhpcy50b2dnbGVHcmlkbGluZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93R3JpZGxpbmVzID0gIXRoaXMuc2hvd0dyaWRsaW5lcztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCbG9ja2FkZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93QmxvY2thZGVzID0gIXRoaXMuc2hvd0Jsb2NrYWRlcztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHNldHVwIGdhbWUgbW9kYWxcclxuICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dBaUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dBaUJ1dHRvbi52YWx1ZSA9PSBcIlBsYXllclwiID8gXCJDb21wdXRlclwiIDogXCJQbGF5ZXJcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlZEFpQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPSB0aGlzLnJlZEFpQnV0dG9uLnZhbHVlID09IFwiUGxheWVyXCIgPyBcIkNvbXB1dGVyXCIgOiBcIlBsYXllclwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMueWVsbG93U3RhcnRzQnV0dG9uLnZhbHVlID0gdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIgPyBcImdvZXMgc2Vjb25kXCIgOiBcImdvZXMgZmlyc3RcIjtcclxuICAgICAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24udmFsdWUgPSB0aGlzLnJlZFN0YXJ0c0J1dHRvbi52YWx1ZSA9PSBcImdvZXMgZmlyc3RcIiA/IFwiZ29lcyBzZWNvbmRcIiA6IFwiZ29lcyBmaXJzdFwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplU2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaXplTGFiZWwuaW5uZXJIVE1MID0gYCR7dGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWV9eCR7dGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWV9YDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgYWkgZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQodGhpcy5ib2FyZFNpemVTbGlkZXIudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24udmFsdWUgPT0gXCJnb2VzIGZpcnN0XCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnllbGxvd0FpQnV0dG9uLnZhbHVlID09IFwiQ29tcHV0ZXJcIixcclxuICAgICAgICAgICAgICAgIHRoaXMucmVkQWlCdXR0b24udmFsdWUgPT0gXCJDb21wdXRlclwiXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHVwR2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuX2JvYXJkQ2xpY2tlZChldmVudCkpO1xyXG4gICAgfVxyXG5cclxuICAgIF9ib2FyZENsaWNrZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy52aWV3LmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB3aGljaCB0aWxlIHdhcyBjbGlja2VkIGZyb20gZ2xvYmFsIGNvb3JkaW5hdGVzIHRvIG1hdHJpeCBjb29yZGluYXRlc1xyXG4gICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcigoZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wKSAvIHRoaXMudmlldy50aWxlU2l6ZSk7XHJcbiAgICAgICAgLy8gdGhlIGNvcm5lcnMgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRoaXMubW9kZWwubWFpbkdyYXBoLnRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRoaXMubW9kZWwubWFpbkdyYXBoLnRpbGVzQWNyb3NzIC0gMSkpIHJldHVybjtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcbiAgICAgICAgbGV0IG5vZGVQbGF5ZWQgPSB0aGlzLm1vZGVsLnRyeVBsYWNpbmdQaW4oeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICE9IFN0YXRlLmVtcHR5ICYmICF0aGlzLmdhbWVXb25Nb2RhbFNob3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lubmVySW5mby5pbm5lckhUTUwgPSB0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICsgXCIgd29uIVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==