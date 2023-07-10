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
     * TODO
     * implement taking the original graph and turning it into a bitboard where the first two bits represent yellow and red and the following 8 represent the bridges
     */
    Graph.prototype.translateGraphToBitboard = function () {
        var _this = this;
        var matrix = Array(this.tilesAcross)
            .fill(0)
            .map(function () { return Array(_this.tilesAcross).fill(0); });
        // corners, potentially easier to implement
        matrix[0][0] = 3;
        matrix[0][this.tilesAcross - 1] = 3;
        matrix[this.tilesAcross - 1][0] = 3;
        matrix[this.tilesAcross - 1][this.tilesAcross - 1] = 3;
        this.nodeList.forEach(function (node) {
            if (node.state != State.empty) {
                matrix[node.x][node.y] = node.state == State.yellow ? 1 : 2;
            }
        });
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
        }
        this.yellowsTurn = !this.yellowsTurn;
        return true;
    };
    // only adds an Edge if the connections isn't blocked
    // TODO add a check that ensures the edge that is being added is exactly one knight move away to prevent future bugs
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
        var _this = this;
        this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](tilesAcrossDefault, true);
        this.view = new _view__WEBPACK_IMPORTED_MODULE_2__["default"]();
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
        });
        this.startGameModalCloseButton.addEventListener("click", function () {
            _this.startGameModal.style.display = "none";
        });
        this.yellowStartsButton.addEventListener("click", function () {
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](tilesAcrossDefault, true);
            _this.updateView();
            _this.startGameModal.style.display = "none";
            _this.gameWonModalShown = false;
        });
        this.redStartsButton.addEventListener("click", function () {
            _this.model = new _model__WEBPACK_IMPORTED_MODULE_1__["default"](tilesAcrossDefault, false);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQUUsT0FBTztRQUMzSCw2REFBNkQ7UUFDN0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksVUFBVSxFQUFFO1lBQ1osSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksK0NBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4RSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDMUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztTQUNqQztJQUNMLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUM7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvZ3JhcGgudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvdmlldy50cyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHdpeHQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3R3aXh0Ly4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFN0YXRlIHtcclxuICAgIGVtcHR5ID0gXCJibGFja1wiLFxyXG4gICAgeWVsbG93ID0gXCJZZWxsb3dcIixcclxuICAgIHJlZCA9IFwiUmVkXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHN0YXRlOiBTdGF0ZTtcclxuICAgIGVkZ2VzOiBOb2RlW107XHJcbiAgICBibG9ja2FkZXM6IFNldDxOb2RlPjtcclxuICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHRpbGVzQWNyb3NzOiBudW1iZXIsIHN0YXRlOiBTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy5lZGdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmxvY2thZGVzID0gbmV3IFNldDxOb2RlPigpO1xyXG4gICAgICAgIHRoaXMuaWQgPSB5ICogdGlsZXNBY3Jvc3MgKyB4O1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGgge1xyXG4gICAgeWVsbG93c1R1cm46IGJvb2xlYW47XHJcbiAgICB0aWxlc0Fjcm9zczogbnVtYmVyO1xyXG4gICAgbm9kZUxpc3Q6IE5vZGVbXTtcclxuICAgIGdhbWVXb246IFN0YXRlO1xyXG4gICAgZXZhbHVhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLnRpbGVzQWNyb3NzID0gdGlsZXNBY3Jvc3M7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uID0gU3RhdGUuZW1wdHk7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBhbGwgbm9kZXMgaW4gZW1wdHkgc3RhdGVcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRpbGVzQWNyb3NzOyB5KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc0Fjcm9zczsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHggPT0gMCB8fCB4ID09IHRpbGVzQWNyb3NzIC0gMSkgJiYgKHkgPT0gMCB8fCB5ID09IHRpbGVzQWNyb3NzIC0gMSkpIGNvbnRpbnVlOyAvLyB0aGUgY29ybmVycyBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdC5wdXNoKG5ldyBOb2RlKHgsIHksIHRpbGVzQWNyb3NzLCBTdGF0ZS5lbXB0eSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb25lKCk6IEdyYXBoIHtcclxuICAgICAgICBsZXQgY2xvbmVkR3JhcGggPSBuZXcgR3JhcGgodGhpcy50aWxlc0Fjcm9zcywgdGhpcy55ZWxsb3dzVHVybik7XHJcbiAgICAgICAgY2xvbmVkR3JhcGgubm9kZUxpc3QgPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5ub2RlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lZEdyYXBoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ET1xyXG4gICAgICogaW1wbGVtZW50IHRha2luZyB0aGUgb3JpZ2luYWwgZ3JhcGggYW5kIHR1cm5pbmcgaXQgaW50byBhIGJpdGJvYXJkIHdoZXJlIHRoZSBmaXJzdCB0d28gYml0cyByZXByZXNlbnQgeWVsbG93IGFuZCByZWQgYW5kIHRoZSBmb2xsb3dpbmcgOCByZXByZXNlbnQgdGhlIGJyaWRnZXNcclxuICAgICAqL1xyXG4gICAgdHJhbnNsYXRlR3JhcGhUb0JpdGJvYXJkKCkge1xyXG4gICAgICAgIGxldCBtYXRyaXggPSBBcnJheSh0aGlzLnRpbGVzQWNyb3NzKVxyXG4gICAgICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgICAgICAubWFwKCgpID0+IEFycmF5KHRoaXMudGlsZXNBY3Jvc3MpLmZpbGwoMCkpO1xyXG5cclxuICAgICAgICAvLyBjb3JuZXJzLCBwb3RlbnRpYWxseSBlYXNpZXIgdG8gaW1wbGVtZW50XHJcbiAgICAgICAgbWF0cml4WzBdWzBdID0gMztcclxuICAgICAgICBtYXRyaXhbMF1bdGhpcy50aWxlc0Fjcm9zcyAtIDFdID0gMztcclxuICAgICAgICBtYXRyaXhbdGhpcy50aWxlc0Fjcm9zcyAtIDFdWzBdID0gMztcclxuICAgICAgICBtYXRyaXhbdGhpcy50aWxlc0Fjcm9zcyAtIDFdW3RoaXMudGlsZXNBY3Jvc3MgLSAxXSA9IDM7XHJcblxyXG4gICAgICAgIHRoaXMubm9kZUxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5zdGF0ZSAhPSBTdGF0ZS5lbXB0eSkge1xyXG4gICAgICAgICAgICAgICAgbWF0cml4W25vZGUueF1bbm9kZS55XSA9IG5vZGUuc3RhdGUgPT0gU3RhdGUueWVsbG93ID8gMSA6IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogTm9kZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUxpc3QuZmluZCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS54ID09IHggJiYgbm9kZS55ID09IHk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTm9kZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub2RlID0gdGhpcy5nZXROb2RlKHgsIHkpO1xyXG5cclxuICAgICAgICBpZiAobm9kZS5zdGF0ZSAhPSBTdGF0ZS5lbXB0eSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBub2RlLnN0YXRlID0gdGhpcy55ZWxsb3dzVHVybiA/IFN0YXRlLnllbGxvdyA6IFN0YXRlLnJlZDtcclxuXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHggYW5kIHkgb2YgYWxsIDggcG90ZW50aWFsIChrbmlnaHQpbW92ZXNcclxuICAgICAgICAgICAgbGV0IGlJbkJpbmFyeSA9IChcIjAwMFwiICsgaS50b1N0cmluZygyKSkuc2xpY2UoLTMpO1xyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsWCA9IG5vZGUueCArIChpSW5CaW5hcnlbMF0gPT0gXCIwXCIgPyAxIDogMikgKiAoaUluQmluYXJ5WzFdID09IFwiMFwiID8gLTEgOiAxKTtcclxuICAgICAgICAgICAgbGV0IHBvdGVudGlhbFkgPSBub2RlLnkgKyAoaUluQmluYXJ5WzBdID09IFwiMFwiID8gMiA6IDEpICogKGlJbkJpbmFyeVsyXSA9PSBcIjBcIiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBwb3RlbnRpYWxOb2RlIGlzIG9uZSBvdXQgb2YgdGhlIDggc3Vycm91bmRpbmcgbmVpZ2hib3VycyB0aGF0IG1pZ2h0IGhhdmUgdGhlIHNhbWUgY29sb3IgYW5kIGNvdWxkIGJlIGNvbm5lY3RlZFxyXG4gICAgICAgICAgICBsZXQgcG90ZW50aWFsTm9kZSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxYLCBwb3RlbnRpYWxZKTtcclxuICAgICAgICAgICAgaWYgKCFwb3RlbnRpYWxOb2RlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHBvdGVudGlhbE5vZGUuc3RhdGUgIT0gbm9kZS5zdGF0ZSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgZWRnZUFkZGVkID0gdGhpcy5hZGRFZGdlKG5vZGUsIHBvdGVudGlhbE5vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIWVkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFZGdlIHRvIHBvdGVudGlhbCBOb2RlIChcIiArIHBvdGVudGlhbE5vZGUueCArIFwiLCBcIiArIHBvdGVudGlhbE5vZGUueSArIFwiKSBjb3VsZG4ndCBiZSBhZGRlZFwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyaWRnZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChicmlkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrV2luQ29uZGl0aW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSBhZGRzIGFuIEVkZ2UgaWYgdGhlIGNvbm5lY3Rpb25zIGlzbid0IGJsb2NrZWRcclxuICAgIC8vIFRPRE8gYWRkIGEgY2hlY2sgdGhhdCBlbnN1cmVzIHRoZSBlZGdlIHRoYXQgaXMgYmVpbmcgYWRkZWQgaXMgZXhhY3RseSBvbmUga25pZ2h0IG1vdmUgYXdheSB0byBwcmV2ZW50IGZ1dHVyZSBidWdzXHJcbiAgICBhZGRFZGdlKG5vZGU6IE5vZGUsIHBvdGVudGlhbE5vZGU6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgeERpcmVjdGlvblBvc2l0aXZlID0gcG90ZW50aWFsTm9kZS54IC0gbm9kZS54ID4gMDtcclxuICAgICAgICBsZXQgeURpcmVjdGlvblBvc2l0aXZlID0gcG90ZW50aWFsTm9kZS55IC0gbm9kZS55ID4gMDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgIHZkb3dudiAgICAgICBedXBeXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIG5vZGUgICAgcG90ZW50aWFsTm9kZTJcclxuICAgICAgICAgKiAgIG5vZGUxICAgcG90ZW50aWFsTm9kZTFcclxuICAgICAgICAgKiAgIG5vZGUyICAgcG90ZW50aWFsTm9kZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBhcHBsaWNhYmxlIGluIG90aGVyIHJvdGF0aW9uc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCBub2RlMSA9IHRoaXMuZ2V0Tm9kZShwb3RlbnRpYWxOb2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSwgcG90ZW50aWFsTm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSkpO1xyXG4gICAgICAgIGxldCBwb3RlbnRpYWxOb2RlMSA9IHRoaXMuZ2V0Tm9kZShub2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSwgbm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSkpO1xyXG5cclxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdldE5vZGUobm9kZTEueCAqIDIgLSBub2RlLngsIG5vZGUxLnkgKiAyIC0gbm9kZS55KTtcclxuICAgICAgICBsZXQgcG90ZW50aWFsTm9kZTIgPSB0aGlzLmdldE5vZGUocG90ZW50aWFsTm9kZTEueCAqIDIgLSBwb3RlbnRpYWxOb2RlLngsIHBvdGVudGlhbE5vZGUxLnkgKiAyIC0gcG90ZW50aWFsTm9kZS55KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcclxuICAgICAgICBpZiAobm9kZTEuYmxvY2thZGVzLmhhcyhwb3RlbnRpYWxOb2RlMikgfHwgcG90ZW50aWFsTm9kZTEuYmxvY2thZGVzLmhhcyhub2RlMikgfHwgbm9kZTEuYmxvY2thZGVzLmhhcyhwb3RlbnRpYWxOb2RlMSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkQmxvY2thZGUgPSAobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIG5vZGVBLmJsb2NrYWRlcy5hZGQobm9kZUIpO1xyXG4gICAgICAgICAgICBub2RlQi5ibG9ja2FkZXMuYWRkKG5vZGVBKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUsIG5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlMSwgcG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90ZW50aWFsTm9kZSwgcG90ZW50aWFsTm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdGVudGlhbE5vZGUxLCBub2RlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGJyaWRnZSBib3RoIHdheXNcclxuICAgICAgICBub2RlLmVkZ2VzLnB1c2gocG90ZW50aWFsTm9kZSk7XHJcbiAgICAgICAgcG90ZW50aWFsTm9kZS5lZGdlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrV2luQ29uZGl0aW9uKCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBub2RlUXVldWUgPSBuZXcgU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLnRpbGVzQWNyb3NzIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydE5vZGUgPSB0aGlzLnllbGxvd3NUdXJuID8gdGhpcy5nZXROb2RlKGksIDApIDogdGhpcy5nZXROb2RlKDAsIGkpO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMueWVsbG93c1R1cm4gJiYgc3RhcnROb2RlLnN0YXRlICE9IFN0YXRlLnllbGxvdykgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSBTdGF0ZS5yZWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgbm9kZVF1ZXVlLmFkZChzdGFydE5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbm5lY3Rpb25Gb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIG5vZGVRdWV1ZS5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjb25uZWN0aW9uRm91bmQpIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnllbGxvd3NUdXJuICYmIG5vZGUueSA9PSB0aGlzLnRpbGVzQWNyb3NzIC0gMSkgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIG5vZGUueCA9PSB0aGlzLnRpbGVzQWNyb3NzIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25Gb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZS5lZGdlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBub2RlUXVldWUuYWRkKG5vZGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbiA9IHRoaXMueWVsbG93c1R1cm4gPyBTdGF0ZS55ZWxsb3cgOiBTdGF0ZS5yZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IEdyYXBoIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gZ2xvYmFsIHZhcmlhYmxlc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgICBtYWluR3JhcGg6IEdyYXBoO1xyXG4gICAgaGlzdG9yeTogR3JhcGhbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc0Fjcm9zczogbnVtYmVyLCB5ZWxsb3dTdGFydHM6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zcywgeWVsbG93U3RhcnRzKTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB0cnlQbGFjaW5nUGluKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGN1cnJHcmFwaCA9IHRoaXMubWFpbkdyYXBoLmNsb25lKCk7XHJcbiAgICAgICAgbGV0IHBpblBsYWNlZCA9IHRoaXMubWFpbkdyYXBoLmFkZE5vZGUoeCwgeSk7XHJcbiAgICAgICAgaWYgKCFwaW5QbGFjZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaChjdXJyR3JhcGgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHVuZG9Nb3ZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IHRoaXMuaGlzdG9yeS5wb3AoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9kZWw7XHJcbiIsImltcG9ydCB7IEdyYXBoIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuXHJcbmNsYXNzIFZpZXcge1xyXG4gICAgYm9hcmQ6IGFueTtcclxuICAgIGN0eDogYW55O1xyXG4gICAgYm9hcmRTaWRlTGVuZ3RoOiBudW1iZXI7XHJcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xyXG4gICAgY29ybmVyczogbnVtYmVyW107XHJcblxyXG4gICAgdHVybkluZm86IEhUTUxFbGVtZW50O1xyXG4gICAgYm9hcmRDb250YWluZXI6IEhUTUxFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudHVybkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInR1cm4taW5mb1wiKTtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZC1jb250YWluZXJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd0JvYXJkKGdyYXBoOiBHcmFwaCwgZ3JpZGxpbmVzOiBib29sZWFuLCBibG9ja2FkZXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAvLyB0aGlzIGxpbmUgY291bGQgYmUgbWFkZSBzaG9ydGVyXHJcbiAgICAgICAgdGhpcy50dXJuSW5mby5pbm5lckhUTUwgPSBcIkl0J3MgXCIgKyAoZ3JhcGgueWVsbG93c1R1cm4gPyBcInllbGxvd1wiIDogXCJyZWRcIikgKyBcIidzIHR1cm5cIjtcclxuICAgICAgICB0aGlzLmJvYXJkQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNhbnZhcyhncmFwaCk7XHJcbiAgICAgICAgaWYgKGdyaWRsaW5lcykge1xyXG4gICAgICAgICAgICB0aGlzLl9kcmF3R3JpZGxpbmVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RyYXdGaW5pc2hMaW5lcygpO1xyXG5cclxuICAgICAgICBncmFwaC5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWCA9IG5vZGUueCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJZID0gbm9kZS55ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBob2xlIG9yIHBpblxyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguYXJjKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSwgdGhpcy50aWxlU2l6ZSAvIDYsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gbm9kZS5zdGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBicmlkZ2VzXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAxMjtcclxuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBub2RlLnN0YXRlO1xyXG4gICAgICAgICAgICBub2RlLmVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oZWRnZS54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBlZGdlLnkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBibG9ja2FkZVxyXG4gICAgICAgICAgICBpZiAoIWJsb2NrYWRlcykgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICAgICAgbm9kZS5ibG9ja2FkZXMuZm9yRWFjaCgoYmxvY2spID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKG5vZGVDZW50ZXJYLCBub2RlQ2VudGVyWSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oYmxvY2sueCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgYmxvY2sueSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBjYW4gcHJvYmFibHkgYmUgY2hhbmdlZCB3aXRoIGNsZWFyUmVjdCBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgd2hvbGUgbmV3IGluc3RhbmNlIG9mIHRoZSBjYW52YXNcclxuICAgIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLndpZHRoID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5oZWlnaHQgPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICAgICAgLy8gdGhpcy5ib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5ib2FyZENsaWNrZWQpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ib2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5ib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggPSB0aGlzLmJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHRoaXMudGlsZVNpemUgPSB0aGlzLmJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLnRpbGVzQWNyb3NzO1xyXG4gICAgfVxyXG5cclxuICAgIF9kcmF3R3JpZGxpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDw9IHRoaXMuYm9hcmRTaWRlTGVuZ3RoOyBsICs9IHRoaXMudGlsZVNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8obCwgdGhpcy5ib2FyZFNpZGVMZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkU2lkZUxlbmd0aCwgbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAyNTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBfZHJhd0ZpbmlzaExpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29ybmVycyA9IFtcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSxcclxuICAgICAgICAgICAgdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRTaWRlTGVuZ3RoIC0gdGhpcy50aWxlU2l6ZSAtIHRoaXMudGlsZVNpemUgLyA0LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyA2O1xyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY0NDQ0XCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzFdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzBdLCB0aGlzLmNvcm5lcnNbM10pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1syXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZmYWFcIjtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzFdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbM10sIHRoaXMuY29ybmVyc1swXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMl0pO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSBcIi4vZ3JhcGhcIjtcclxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG52YXIgdGlsZXNBY3Jvc3NEZWZhdWx0ID0gNjtcclxuXHJcbi8vIFRPRE8gaW1wbGVtZW50IHRoZSBnYW1lV29uTW9kYWxTaG93biB0byBhIHBvaW50IHRoYXQgaXQgaXMgdXNhYmxlIGFnYWluXHJcbi8vIGNsZWFuIHVwIGFuZCBvcmdhbml6ZSBjb2RlIGEgbG90XHJcbi8vIHBvdGVudGlhbGx5IG1vdmUgc29tZSBmdW5jdGlvbmFsaXR5IGZyb20gbW9kZWwgdG8gY29udHJvbGxlci9pbmRleFxyXG5jbGFzcyBDb250cm9sbGVyIHtcclxuICAgIG1vZGVsOiBNb2RlbDtcclxuICAgIHZpZXc6IFZpZXc7XHJcblxyXG4gICAgc2hvd0dyaWRsaW5lczogYm9vbGVhbjtcclxuICAgIHNob3dCbG9ja2FkZXM6IGJvb2xlYW47XHJcbiAgICBnYW1lV29uTW9kYWxTaG93bjogYm9vbGVhbjsgLy8gaGFzIHRoZSBwbGF5ZXIgYWxyZWFkeSBzZWVuIHRoZSBnYW1lIHdvbiBNb2RhbCBhbmQgd2FudGVkIHRvIGtlZXAgcGxheWluZz9cclxuXHJcbiAgICAvLyBnYW1lLWJ1dHRvbnNcclxuICAgIHJlc3RhcnRHYW1lQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIHVuZG9Nb3ZlQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIGRlYnVnLWJ1dHRvbnNcclxuICAgIHRvZ2dsZUdyaWRsaW5lc0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICB0b2dnbGVCbG9ja2FkZXNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgLy8gc3RhcnQgLyByZXN0YXJ0IGdhbWUgbW9kYWxcclxuICAgIHN0YXJ0R2FtZU1vZGFsOiBIVE1MRWxlbWVudDtcclxuICAgIHN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b246IGFueTtcclxuICAgIHllbGxvd1N0YXJ0c0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICByZWRTdGFydHNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgLy8gZ2FtZSB3b24gbW9kYWxcclxuICAgIGdhbWVXb25Nb2RhbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBnYW1lV29uTW9kYWxDbG9zZUJ1dHRvbjogYW55O1xyXG4gICAgd2lubmVySW5mbzogSFRNTEVsZW1lbnQ7XHJcbiAgICByZXN0YXJ0R2FtZUFnYWluQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIGtlZXBQbGF5aW5nQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IFZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydEdhbWVNb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF07XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVXb25Nb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdO1xyXG4gICAgICAgIHRoaXMud2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIik7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwudW5kb01vdmUoKSA/IHRoaXMudXBkYXRlVmlldygpIDogY29uc29sZS5sb2coXCJubyBtb3JlIHBvc2l0aW9ucyBpbiBoaXN0b3J5IGFycmF5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0dyaWRsaW5lcyA9ICF0aGlzLnNob3dHcmlkbGluZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWxDbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnllbGxvd1N0YXJ0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsID0gbmV3IE1vZGVsKHRpbGVzQWNyb3NzRGVmYXVsdCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVkU3RhcnRzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwodGlsZXNBY3Jvc3NEZWZhdWx0LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuYm9hcmRDbGlja2VkKGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgYm9hcmRDbGlja2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMudmlldy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgd2hpY2ggdGlsZSB3YXMgY2xpY2tlZCBmcm9tIGdsb2JhbCBjb29yZGluYXRlcyB0byBtYXRyaXggY29vcmRpbmF0ZXNcclxuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpIC8gdGhpcy52aWV3LnRpbGVTaXplKTtcclxuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG4gICAgICAgIC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgaWYgKCh4ID09IDAgfHwgeCA9PSB0aGlzLm1vZGVsLm1haW5HcmFwaC50aWxlc0Fjcm9zcyAtIDEpICYmICh5ID09IDAgfHwgeSA9PSB0aGlzLm1vZGVsLm1haW5HcmFwaC50aWxlc0Fjcm9zcyAtIDEpKSByZXR1cm47XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhvbGU6ICh4OiBcIiArIHggKyBcIiwgeTogXCIgKyB5ICsgXCIpXCIpO1xyXG4gICAgICAgIGxldCBub2RlUGxheWVkID0gdGhpcy5tb2RlbC50cnlQbGFjaW5nUGluKHgsIHkpO1xyXG4gICAgICAgIGlmIChub2RlUGxheWVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5tYWluR3JhcGguZ2FtZVdvbiAhPSBTdGF0ZS5lbXB0eSAmJiAhdGhpcy5nYW1lV29uTW9kYWxTaG93bikge1xyXG4gICAgICAgICAgICB0aGlzLndpbm5lckluZm8uaW5uZXJIVE1MID0gdGhpcy5tb2RlbC5tYWluR3JhcGguZ2FtZVdvbiArIFwiIHdvbiFcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgQ29udHJvbGxlcigpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=