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
/* harmony export */   numberToXY: () => (/* binding */ numberToXY)
/* harmony export */ });
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
        this.gameWon = 0;
        this.matrix = Array(tilesAcross)
            .fill(0)
            .map(function () { return Array(tilesAcross).fill(0); });
        // create all nodes in empty state
        for (var y = 0; y < tilesAcross; y++) {
            for (var x = 0; x < tilesAcross; x++) {
                if ((x == 0 || x == tilesAcross - 1) && (y == 0 || y == tilesAcross - 1)) {
                    // the corners of the playing field
                    this.matrix[x][y] = 3;
                    continue;
                }
                this.nodeList.push(new Node(x, y, tilesAcross, 0));
            }
        }
    }
    Graph.prototype.clone = function () {
        var clonedGraph = new Graph(this.tilesAcross, this.yellowsTurn);
        clonedGraph.nodeList = structuredClone(this.nodeList);
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
            var newCoord = numberToXY(i);
            var potX = x + newCoord[0];
            var potY = y + newCoord[1];
            // if outside or a corner or not the same color
            // TODO rework this later on!!
            if (this.matrix[potX] == undefined ||
                this.matrix[potX][potY] == undefined ||
                this.matrix[potX][potY] == 3 ||
                !((this.matrix[potX][potY] & 3) == (this.matrix[x][y] & 3))) {
                continue;
            }
            // TODO check for collisions
            // add edge in both directions
            this.matrix[x][y] |= (Math.pow(2, i)) << 4;
            var otherDirection = i & 1 ? (i + 3) % 8 : (i + 5) % 8;
            this.matrix[potX][potY] |= (Math.pow(2, otherDirection)) << 4;
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

// gets a value between 0 and 7 and returns the corresponding x and y direction
function numberToXY(value) {
    var x = (value & 2 ? 1 : 2) * (value & 4 ? -1 : 1);
    var y = (value & 2 ? 2 : 1) * (value & 1 ? -1 : 1);
    return [x, y];
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
var tilesAcrossDefault = 5;
var Model = /** @class */ (function () {
    function Model() {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcrossDefault, true);
        this.history = [];
    }
    // these things might need to move
    Model.prototype.restartGame = function (yellowStarts) {
        this.mainGraph = new _graph__WEBPACK_IMPORTED_MODULE_0__.Graph(tilesAcrossDefault, yellowStarts);
        this.history = [];
    };
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
        graph.matrix.forEach(function (column, indexX) {
            column.forEach(function (entry, indexY) {
                if (entry == 3)
                    return;
                var nodeCenterX = indexX * _this.tileSize + _this.tileSize / 2;
                var nodeCenterY = indexY * _this.tileSize + _this.tileSize / 2;
                // draw hole or pin
                _this.ctx.beginPath();
                _this.ctx.arc(nodeCenterX, nodeCenterY, _this.tileSize / 6, 0, 2 * Math.PI);
                _this.ctx.fillStyle = _this._numberToColor(entry);
                _this.ctx.fill();
                // draw bridges
                _this.ctx.lineWidth = _this.tileSize / 12;
                _this.ctx.strokeStyle = _this._numberToColor(entry);
                var bridges = entry >> 4;
                if (bridges == 0)
                    return;
                for (var i = 0; i < 8; i++) {
                    if (!((bridges & (Math.pow(2, i))) >> i))
                        continue;
                    var direction = (0,_graph__WEBPACK_IMPORTED_MODULE_0__.numberToXY)(i);
                    var connectedX = indexX + direction[0];
                    var connectedY = indexY + direction[1];
                    _this.ctx.beginPath();
                    _this.ctx.moveTo(nodeCenterX, nodeCenterY);
                    _this.ctx.lineTo(connectedX * _this.tileSize + _this.tileSize / 2, connectedY * _this.tileSize + _this.tileSize / 2);
                    _this.ctx.stroke();
                }
            });
        });
        /*
        graph.nodeList.forEach((node) => {
            let nodeCenterX = node.x * this.tileSize + this.tileSize / 2;
            let nodeCenterY = node.y * this.tileSize + this.tileSize / 2;

            // draw hole or pin
            this.ctx.beginPath();
            this.ctx.arc(nodeCenterX, nodeCenterY, this.tileSize / 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = this._numberToColor(node.state);
            this.ctx.fill();

            // draw bridges
            this.ctx.lineWidth = this.tileSize / 12;
            this.ctx.strokeStyle = this._numberToColor(node.state);
            node.edges.forEach((edge) => {
                this.ctx.beginPath();
                this.ctx.moveTo(nodeCenterX, nodeCenterY);
                this.ctx.lineTo(edge.x * this.tileSize + this.tileSize / 2, edge.y * this.tileSize + this.tileSize / 2);
                this.ctx.stroke();
            });

            // draw blockade
            if (!blockades) return;
            this.ctx.strokeStyle = "black";
            node.blockades.forEach((block) => {
                this.ctx.beginPath();
                this.ctx.moveTo(nodeCenterX, nodeCenterY);
                this.ctx.lineTo(block.x * this.tileSize + this.tileSize / 2, block.y * this.tileSize + this.tileSize / 2);
                this.ctx.stroke();
            });
        });
        */
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
    View.prototype._numberToColor = function (state) {
        if (state == 0) {
            return "black";
        }
        if (state & 1) {
            return "yellow";
        }
        if (state & 2) {
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
// TODO implement the gameWonModalShown to a point that it is usable again
// clean up and organize code a lot
// potentially move some functionality from model to controller/index
var Controller = /** @class */ (function () {
    function Controller() {
        var _this = this;
        this.model = new _model__WEBPACK_IMPORTED_MODULE_0__["default"]();
        console.log(this.model.mainGraph.matrix);
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
            console.log(_this.model.mainGraph.matrix);
        });
        this.startGameModalCloseButton.addEventListener("click", function () {
            _this.startGameModal.style.display = "none";
        });
        this.yellowStartsButton.addEventListener("click", function () {
            _this.model.restartGame(true);
            _this.updateView();
            _this.startGameModal.style.display = "none";
            _this.gameWonModalShown = false;
        });
        this.redStartsButton.addEventListener("click", function () {
            _this.model.restartGame(false);
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBcUIsRUFBRSxDQUFDO1FBQ25ELGlGQUFpRjtRQUNqRixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRSw2REFBNkQ7UUFDN0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksVUFBVSxFQUFFO1lBQ1osSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzlELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUMxQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0FBQztBQUVELElBQU0sR0FBRyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9ncmFwaC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy9tb2RlbC50cyIsIndlYnBhY2s6Ly90d2l4dC8uL3NyYy92aWV3LnRzIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90d2l4dC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3R3aXh0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHdpeHQvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE5vZGUge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgc3RhdGU6IG51bWJlcjtcclxuICAgIGVkZ2VzOiBOb2RlW107XHJcbiAgICBibG9ja2FkZXM6IFNldDxOb2RlPjtcclxuICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHRpbGVzQWNyb3NzOiBudW1iZXIsIHN0YXRlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmJsb2NrYWRlcyA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmlkID0geSAqIHRpbGVzQWNyb3NzICsgeDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuICAgIHllbGxvd3NUdXJuOiBib29sZWFuO1xyXG4gICAgdGlsZXNBY3Jvc3M6IG51bWJlcjtcclxuICAgIG5vZGVMaXN0OiBOb2RlW107XHJcbiAgICBnYW1lV29uOiBudW1iZXI7XHJcbiAgICBldmFsdWF0aW9uOiBudW1iZXI7XHJcblxyXG4gICAgbWF0cml4OiBudW1iZXJbXVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRpbGVzQWNyb3NzOiBudW1iZXIsIHllbGxvd3NUdXJuOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMueWVsbG93c1R1cm4gPSB5ZWxsb3dzVHVybjtcclxuICAgICAgICB0aGlzLnRpbGVzQWNyb3NzID0gdGlsZXNBY3Jvc3M7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uID0gMDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IEFycmF5KHRpbGVzQWNyb3NzKVxyXG4gICAgICAgICAgICAuZmlsbCgwKVxyXG4gICAgICAgICAgICAubWFwKCgpID0+IEFycmF5KHRpbGVzQWNyb3NzKS5maWxsKDApKTtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGFsbCBub2RlcyBpbiBlbXB0eSBzdGF0ZVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNBY3Jvc3M7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRpbGVzQWNyb3NzOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICgoeCA9PSAwIHx8IHggPT0gdGlsZXNBY3Jvc3MgLSAxKSAmJiAoeSA9PSAwIHx8IHkgPT0gdGlsZXNBY3Jvc3MgLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBjb3JuZXJzIG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbeF1beV0gPSAzO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTGlzdC5wdXNoKG5ldyBOb2RlKHgsIHksIHRpbGVzQWNyb3NzLCAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xvbmUoKTogR3JhcGgge1xyXG4gICAgICAgIGxldCBjbG9uZWRHcmFwaCA9IG5ldyBHcmFwaCh0aGlzLnRpbGVzQWNyb3NzLCB0aGlzLnllbGxvd3NUdXJuKTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5ub2RlTGlzdCA9IHN0cnVjdHVyZWRDbG9uZSh0aGlzLm5vZGVMaXN0KTtcclxuICAgICAgICBjbG9uZWRHcmFwaC5tYXRyaXggPSBzdHJ1Y3R1cmVkQ2xvbmUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgIHJldHVybiBjbG9uZWRHcmFwaDtcclxuICAgIH1cclxuXHJcbiAgICB0cnlBZGRpbmdOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMubWF0cml4W3hdW3ldICE9IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLm1hdHJpeFt4XVt5XSA9IHRoaXMueWVsbG93c1R1cm4gPyAxIDogMjtcclxuXHJcbiAgICAgICAgLy8gY29ubmVjdCBicmlkZ2VzXHJcbiAgICAgICAgbGV0IGJyaWRnZUFkZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IG5ld0Nvb3JkID0gbnVtYmVyVG9YWShpKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3RYID0geCArIG5ld0Nvb3JkWzBdO1xyXG4gICAgICAgICAgICBsZXQgcG90WSA9IHkgKyBuZXdDb29yZFsxXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG91dHNpZGUgb3IgYSBjb3JuZXIgb3Igbm90IHRoZSBzYW1lIGNvbG9yXHJcbiAgICAgICAgICAgIC8vIFRPRE8gcmV3b3JrIHRoaXMgbGF0ZXIgb24hIVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtwb3RYXSA9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4W3BvdFhdW3BvdFldID09IHVuZGVmaW5lZCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbcG90WF1bcG90WV0gPT0gMyB8fFxyXG4gICAgICAgICAgICAgICAgISgodGhpcy5tYXRyaXhbcG90WF1bcG90WV0gJiAzKSA9PSAodGhpcy5tYXRyaXhbeF1beV0gJiAzKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyBjaGVjayBmb3IgY29sbGlzaW9uc1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGVkZ2UgaW4gYm90aCBkaXJlY3Rpb25zXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4W3hdW3ldIHw9ICgyICoqIGkpIDw8IDQ7XHJcbiAgICAgICAgICAgIGxldCBvdGhlckRpcmVjdGlvbiA9IGkgJiAxID8gKGkgKyAzKSAlIDggOiAoaSArIDUpICUgODtcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXhbcG90WF1bcG90WV0gfD0gKDIgKiogb3RoZXJEaXJlY3Rpb24pIDw8IDQ7XHJcbiAgICAgICAgICAgIGJyaWRnZUFkZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChicmlkZ2VBZGRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrV2luQ29uZGl0aW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnllbGxvd3NUdXJuID0gIXRoaXMueWVsbG93c1R1cm47XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb25seSBhZGRzIGFuIEVkZ2UgaWYgdGhlIGNvbm5lY3Rpb25zIGlzbid0IGJsb2NrZWRcclxuICAgIC8vIFRPRE8gYWRkIGEgY2hlY2sgdGhhdCBlbnN1cmVzIHRoZSBlZGdlIHRoYXQgaXMgYmVpbmcgYWRkZWQgaXMgZXhhY3RseSBvbmUga25pZ2h0IG1vdmUgYXdheSB0byBwcmV2ZW50IGZ1dHVyZSBidWdzXHJcbiAgICAvKlxyXG4gICAgYWRkRWRnZShub2RlOiBOb2RlLCBwb3ROb2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHhEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdE5vZGUueCAtIG5vZGUueCA+IDA7XHJcbiAgICAgICAgbGV0IHlEaXJlY3Rpb25Qb3NpdGl2ZSA9IHBvdE5vZGUueSAtIG5vZGUueSA+IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICB2ZG93bnYgICAgICAgXnVwXlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogICBub2RlICAgIHBvdE5vZGUyXHJcbiAgICAgICAgICogICBub2RlMSAgIHBvdE5vZGUxXHJcbiAgICAgICAgICogICBub2RlMiAgIHBvdE5vZGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgYXBwbGljYWJsZSBpbiBvdGhlciByb3RhdGlvbnNcclxuICAgICAgICAgKlxyXG4gICAgICAgIGxldCBub2RlMSA9IHRoaXMuZ2V0Tm9kZShwb3ROb2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gLTEgOiAxKSwgcG90Tm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IC0xIDogMSkpO1xyXG4gICAgICAgIGxldCBwb3ROb2RlMSA9IHRoaXMuZ2V0Tm9kZShub2RlLnggKyAoeERpcmVjdGlvblBvc2l0aXZlID8gMSA6IC0xKSwgbm9kZS55ICsgKHlEaXJlY3Rpb25Qb3NpdGl2ZSA/IDEgOiAtMSkpO1xyXG5cclxuICAgICAgICBsZXQgbm9kZTIgPSB0aGlzLmdldE5vZGUobm9kZTEueCAqIDIgLSBub2RlLngsIG5vZGUxLnkgKiAyIC0gbm9kZS55KTtcclxuICAgICAgICBsZXQgcG90Tm9kZTIgPSB0aGlzLmdldE5vZGUocG90Tm9kZTEueCAqIDIgLSBwb3ROb2RlLngsIHBvdE5vZGUxLnkgKiAyIC0gcG90Tm9kZS55KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcclxuICAgICAgICBpZiAobm9kZTEuYmxvY2thZGVzLmhhcyhwb3ROb2RlMikgfHwgcG90Tm9kZTEuYmxvY2thZGVzLmhhcyhub2RlMikgfHwgbm9kZTEuYmxvY2thZGVzLmhhcyhwb3ROb2RlMSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkQmxvY2thZGUgPSAobm9kZUE6IE5vZGUsIG5vZGVCOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgIG5vZGVBLmJsb2NrYWRlcy5hZGQobm9kZUIpO1xyXG4gICAgICAgICAgICBub2RlQi5ibG9ja2FkZXMuYWRkKG5vZGVBKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKG5vZGUsIG5vZGUxKTtcclxuICAgICAgICBhZGRCbG9ja2FkZShub2RlMSwgcG90Tm9kZSk7XHJcbiAgICAgICAgYWRkQmxvY2thZGUocG90Tm9kZSwgcG90Tm9kZTEpO1xyXG4gICAgICAgIGFkZEJsb2NrYWRlKHBvdE5vZGUxLCBub2RlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGJyaWRnZSBib3RoIHdheXNcclxuICAgICAgICBub2RlLmVkZ2VzLnB1c2gocG90Tm9kZSk7XHJcbiAgICAgICAgcG90Tm9kZS5lZGdlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgKi9cclxuXHJcbiAgICBjaGVja1dpbkNvbmRpdGlvbigpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNoZWNraW5nIHdpbiBjb25kaXRpb24uLi5cIik7XHJcbiAgICAgICAgLy8gbGV0IG5vZGVRdWV1ZSA9IG5ldyBTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAvLyBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMudGlsZXNBY3Jvc3MgLSAxOyBpKyspIHtcclxuICAgICAgICAvLyAgICAgbGV0IHN0YXJ0Tm9kZSA9IHRoaXMueWVsbG93c1R1cm4gPyB0aGlzLmdldE5vZGUoaSwgMCkgOiB0aGlzLmdldE5vZGUoMCwgaSk7XHJcbiAgICAgICAgLy8gICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBzdGFydE5vZGUuc3RhdGUgIT0gMSkgfHwgKCF0aGlzLnllbGxvd3NUdXJuICYmIHN0YXJ0Tm9kZS5zdGF0ZSAhPSAyKSkgY29udGludWU7XHJcbiAgICAgICAgLy8gICAgIG5vZGVRdWV1ZS5hZGQoc3RhcnROb2RlKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIGxldCBjb25uZWN0aW9uRm91bmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICAvLyBub2RlUXVldWUuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIC8vICAgICBpZiAoY29ubmVjdGlvbkZvdW5kKSByZXR1cm47XHJcbiAgICAgICAgLy8gICAgIGlmICgodGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnkgPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpIHx8ICghdGhpcy55ZWxsb3dzVHVybiAmJiBub2RlLnggPT0gdGhpcy50aWxlc0Fjcm9zcyAtIDEpKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBjb25uZWN0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgIC8vICAgICAgICAgbm9kZVF1ZXVlLmFkZChub2RlKTtcclxuICAgICAgICAvLyAgICAgfSk7XHJcbiAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgLy8gaWYgKGNvbm5lY3Rpb25Gb3VuZCkge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmdhbWVXb24gPSB0aGlzLnllbGxvd3NUdXJuID8gMSA6IDI7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBnZXRzIGEgdmFsdWUgYmV0d2VlbiAwIGFuZCA3IGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHggYW5kIHkgZGlyZWN0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb1hZKHZhbHVlOiBudW1iZXIpOiBudW1iZXJbXSB7XHJcbiAgICBsZXQgeCA9ICh2YWx1ZSAmIDIgPyAxIDogMikgKiAodmFsdWUgJiA0ID8gLTEgOiAxKTtcclxuICAgIGxldCB5ID0gKHZhbHVlICYgMiA/IDIgOiAxKSAqICh2YWx1ZSAmIDEgPyAtMSA6IDEpO1xyXG5cclxuICAgIHJldHVybiBbeCwgeV07XHJcbn1cclxuIiwiaW1wb3J0IHsgR3JhcGggfSBmcm9tIFwiLi9ncmFwaFwiO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBnbG9iYWwgdmFyaWFibGVzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbnZhciB0aWxlc0Fjcm9zc0RlZmF1bHQgPSA1O1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gICAgbWFpbkdyYXBoOiBHcmFwaDtcclxuICAgIGhpc3Rvcnk6IEdyYXBoW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSBuZXcgR3JhcGgodGlsZXNBY3Jvc3NEZWZhdWx0LCB0cnVlKTtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGVzZSB0aGluZ3MgbWlnaHQgbmVlZCB0byBtb3ZlXHJcbiAgICByZXN0YXJ0R2FtZSh5ZWxsb3dTdGFydHM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1haW5HcmFwaCA9IG5ldyBHcmFwaCh0aWxlc0Fjcm9zc0RlZmF1bHQsIHllbGxvd1N0YXJ0cyk7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5UGxhY2luZ1Bpbih4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjdXJyR3JhcGggPSB0aGlzLm1haW5HcmFwaC5jbG9uZSgpO1xyXG4gICAgICAgIGxldCBwaW5QbGFjZWQgPSB0aGlzLm1haW5HcmFwaC50cnlBZGRpbmdOb2RlKHgsIHkpO1xyXG4gICAgICAgIGlmICghcGluUGxhY2VkKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2goY3VyckdyYXBoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB1bmRvTW92ZSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tYWluR3JhcGggPSB0aGlzLmhpc3RvcnkucG9wKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsO1xyXG4iLCJpbXBvcnQgeyBHcmFwaCwgbnVtYmVyVG9YWSB9IGZyb20gXCIuL2dyYXBoXCI7XHJcblxyXG5jbGFzcyBWaWV3IHtcclxuICAgIGJvYXJkOiBhbnk7XHJcbiAgICBjdHg6IGFueTtcclxuICAgIGJvYXJkU2lkZUxlbmd0aDogbnVtYmVyO1xyXG4gICAgdGlsZVNpemU6IG51bWJlcjtcclxuICAgIGNvcm5lcnM6IG51bWJlcltdO1xyXG5cclxuICAgIHR1cm5JbmZvOiBIVE1MRWxlbWVudDtcclxuICAgIGJvYXJkQ29udGFpbmVyOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnR1cm5JbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0dXJuLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmQtY29udGFpbmVyXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdCb2FyZChncmFwaDogR3JhcGgsIGdyaWRsaW5lczogYm9vbGVhbiwgYmxvY2thZGVzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgLy8gdGhpcyBsaW5lIGNvdWxkIGJlIG1hZGUgc2hvcnRlclxyXG4gICAgICAgIHRoaXMudHVybkluZm8uaW5uZXJIVE1MID0gXCJJdCdzIFwiICsgKGdyYXBoLnllbGxvd3NUdXJuID8gXCJ5ZWxsb3dcIiA6IFwicmVkXCIpICsgXCIncyB0dXJuXCI7XHJcbiAgICAgICAgdGhpcy5ib2FyZENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgICAgICB0aGlzLl9jcmVhdGVDYW52YXMoZ3JhcGgpO1xyXG4gICAgICAgIGlmIChncmlkbGluZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZHJhd0dyaWRsaW5lcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kcmF3RmluaXNoTGluZXMoKTtcclxuXHJcbiAgICAgICAgZ3JhcGgubWF0cml4LmZvckVhY2goKGNvbHVtbiwgaW5kZXhYKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKChlbnRyeSwgaW5kZXhZKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkgPT0gMykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWCA9IGluZGV4WCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2VudGVyWSA9IGluZGV4WSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhub2RlQ2VudGVyWCwgbm9kZUNlbnRlclksIHRoaXMudGlsZVNpemUgLyA2LCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLl9udW1iZXJUb0NvbG9yKGVudHJ5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMudGlsZVNpemUgLyAxMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5fbnVtYmVyVG9Db2xvcihlbnRyeSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYnJpZGdlcyA9IGVudHJ5ID4+IDQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoYnJpZGdlcyA9PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISgoYnJpZGdlcyAmICgyICoqIGkpKSA+PiBpKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkaXJlY3Rpb24gPSBudW1iZXJUb1hZKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0ZWRYID0gaW5kZXhYICsgZGlyZWN0aW9uWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25uZWN0ZWRZID0gaW5kZXhZICsgZGlyZWN0aW9uWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY29ubmVjdGVkWCAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMiwgY29ubmVjdGVkWSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIGdyYXBoLm5vZGVMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5vZGVDZW50ZXJYID0gbm9kZS54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyO1xyXG4gICAgICAgICAgICBsZXQgbm9kZUNlbnRlclkgPSBub2RlLnkgKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDI7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGhvbGUgb3IgcGluXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMobm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZLCB0aGlzLnRpbGVTaXplIC8gNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLl9udW1iZXJUb0NvbG9yKG5vZGUuc3RhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGJyaWRnZXNcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDEyO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuX251bWJlclRvQ29sb3Iobm9kZS5zdGF0ZSk7XHJcbiAgICAgICAgICAgIG5vZGUuZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhlZGdlLnggKiB0aGlzLnRpbGVTaXplICsgdGhpcy50aWxlU2l6ZSAvIDIsIGVkZ2UueSAqIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBkcmF3IGJsb2NrYWRlXHJcbiAgICAgICAgICAgIGlmICghYmxvY2thZGVzKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBub2RlLmJsb2NrYWRlcy5mb3JFYWNoKChibG9jaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obm9kZUNlbnRlclgsIG5vZGVDZW50ZXJZKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhibG9jay54ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyLCBibG9jay55ICogdGhpcy50aWxlU2l6ZSArIHRoaXMudGlsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAqL1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgY2FuIHByb2JhYmx5IGJlIGNoYW5nZWQgd2l0aCBjbGVhclJlY3QgaW5zdGVhZCBvZiBjcmVhdGluZyBhIHdob2xlIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2FudmFzXHJcbiAgICBwcml2YXRlIF9jcmVhdGVDYW52YXMoZ3JhcGg6IEdyYXBoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5pZCA9IFwiYm9hcmRcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJhY2tncm91bmQgPSBcImJsdWVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAyMHB4IGdyYXlcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLmJvcmRlclJhZGl1cyA9IFwiMyVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLnN0eWxlLm1hcmdpbiA9IFwiMSVcIjtcclxuICAgICAgICB0aGlzLmJvYXJkLndpZHRoID0gdGhpcy5ib2FyZENvbnRhaW5lci5jbGllbnRXaWR0aCAqIDAuOTg7XHJcbiAgICAgICAgdGhpcy5ib2FyZC5oZWlnaHQgPSB0aGlzLmJvYXJkQ29udGFpbmVyLmNsaWVudEhlaWdodCAqIDAuOTg7XHJcbiAgICAgICAgLy8gdGhpcy5ib2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5ib2FyZENsaWNrZWQpO1xyXG4gICAgICAgIHRoaXMuYm9hcmRDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ib2FyZCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5ib2FyZC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggPSB0aGlzLmJvYXJkLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHRoaXMudGlsZVNpemUgPSB0aGlzLmJvYXJkU2lkZUxlbmd0aCAvIGdyYXBoLnRpbGVzQWNyb3NzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdHcmlkbGluZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPD0gdGhpcy5ib2FyZFNpZGVMZW5ndGg7IGwgKz0gdGhpcy50aWxlU2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8obCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhsLCB0aGlzLmJvYXJkU2lkZUxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbygwLCBsKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRTaWRlTGVuZ3RoLCBsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy50aWxlU2l6ZSAvIDI1O1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RyYXdGaW5pc2hMaW5lcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvcm5lcnMgPSBbXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUsXHJcbiAgICAgICAgICAgIHRoaXMudGlsZVNpemUgKyB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFNpZGVMZW5ndGggLSB0aGlzLnRpbGVTaXplLFxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkU2lkZUxlbmd0aCAtIHRoaXMudGlsZVNpemUgLSB0aGlzLnRpbGVTaXplIC8gNCxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLnRpbGVTaXplIC8gNjtcclxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmNDQ0NFwiO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMF0sIHRoaXMuY29ybmVyc1sxXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1swXSwgdGhpcy5jb3JuZXJzWzNdKTtcclxuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5jb3JuZXJzWzJdLCB0aGlzLmNvcm5lcnNbMV0pO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNvcm5lcnNbMl0sIHRoaXMuY29ybmVyc1szXSk7XHJcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmFhXCI7XHJcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuY29ybmVyc1sxXSwgdGhpcy5jb3JuZXJzWzBdKTtcclxuICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5jb3JuZXJzWzNdLCB0aGlzLmNvcm5lcnNbMF0pO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmNvcm5lcnNbMV0sIHRoaXMuY29ybmVyc1syXSk7XHJcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuY29ybmVyc1szXSwgdGhpcy5jb3JuZXJzWzJdKTtcclxuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9udW1iZXJUb0NvbG9yKHN0YXRlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImJsYWNrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGF0ZSAmIDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwieWVsbG93XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGF0ZSAmIDIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwicmVkXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWV3O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IG1vZGUgfSBmcm9tIFwiLi4vd2VicGFjay5jb25maWdcIjtcclxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCI7XHJcbmltcG9ydCBWaWV3IGZyb20gXCIuL3ZpZXdcIjtcclxuXHJcbi8qKiBoYW5kbGVzIGFsbCBpbnB1dCwgY2hlY2tzIGluIHdpdGggbW9kZWwgYW5kIGRpc3BsYXlzIHRoZSByZXN1bHQgd2l0aCB2aWV3ICovXHJcblxyXG4vLyBUT0RPIGltcGxlbWVudCB0aGUgZ2FtZVdvbk1vZGFsU2hvd24gdG8gYSBwb2ludCB0aGF0IGl0IGlzIHVzYWJsZSBhZ2FpblxyXG4vLyBjbGVhbiB1cCBhbmQgb3JnYW5pemUgY29kZSBhIGxvdFxyXG4vLyBwb3RlbnRpYWxseSBtb3ZlIHNvbWUgZnVuY3Rpb25hbGl0eSBmcm9tIG1vZGVsIHRvIGNvbnRyb2xsZXIvaW5kZXhcclxuY2xhc3MgQ29udHJvbGxlciB7XHJcbiAgICBtb2RlbDogTW9kZWw7XHJcbiAgICB2aWV3OiBWaWV3O1xyXG5cclxuICAgIHNob3dHcmlkbGluZXM6IGJvb2xlYW47XHJcbiAgICBzaG93QmxvY2thZGVzOiBib29sZWFuO1xyXG4gICAgZ2FtZVdvbk1vZGFsU2hvd246IGJvb2xlYW47IC8vIGhhcyB0aGUgcGxheWVyIGFscmVhZHkgc2VlbiB0aGUgZ2FtZSB3b24gTW9kYWwgYW5kIHdhbnRlZCB0byBrZWVwIHBsYXlpbmc/XHJcblxyXG4gICAgLy8gZ2FtZS1idXR0b25zXHJcbiAgICByZXN0YXJ0R2FtZUJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICB1bmRvTW92ZUJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICAvLyBkZWJ1Zy1idXR0b25zXHJcbiAgICB0b2dnbGVHcmlkbGluZXNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgdG9nZ2xlQmxvY2thZGVzQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIHN0YXJ0IC8gcmVzdGFydCBnYW1lIG1vZGFsXHJcbiAgICBzdGFydEdhbWVNb2RhbDogSFRNTEVsZW1lbnQ7XHJcbiAgICBzdGFydEdhbWVNb2RhbENsb3NlQnV0dG9uOiBhbnk7XHJcbiAgICB5ZWxsb3dTdGFydHNCdXR0b246IEhUTUxFbGVtZW50O1xyXG4gICAgcmVkU3RhcnRzQnV0dG9uOiBIVE1MRWxlbWVudDtcclxuICAgIC8vIGdhbWUgd29uIG1vZGFsXHJcbiAgICBnYW1lV29uTW9kYWw6IEhUTUxFbGVtZW50O1xyXG4gICAgZ2FtZVdvbk1vZGFsQ2xvc2VCdXR0b246IGFueTtcclxuICAgIHdpbm5lckluZm86IEhUTUxFbGVtZW50O1xyXG4gICAgcmVzdGFydEdhbWVBZ2FpbkJ1dHRvbjogSFRNTEVsZW1lbnQ7XHJcbiAgICBrZWVwUGxheWluZ0J1dHRvbjogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBNb2RlbCgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubW9kZWwubWFpbkdyYXBoLm1hdHJpeCk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IFZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1nYW1lXCIpO1xyXG4gICAgICAgIHRoaXMudW5kb01vdmVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVuZG8tbW92ZVwiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUdyaWRsaW5lc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWdyaWRsaW5lc1wiKTtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJsb2NrYWRlc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLWJsb2NrYWRlc1wiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydEdhbWVNb2RhbFwiKTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibW9kYWwtY2xvc2VcIilbMF07XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInllbGxvdy1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZC1zdGFydHNcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVXb25Nb2RhbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1vZGFsLWNsb3NlXCIpWzFdO1xyXG4gICAgICAgIHRoaXMud2lubmVySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2lubmVyLWluZm9cIik7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LWdhbWUtYWdhaW5cIik7XHJcbiAgICAgICAgdGhpcy5rZWVwUGxheWluZ0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwia2VlcC1wbGF5aW5nXCIpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnJlc3RhcnRHYW1lQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVuZG9Nb3ZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwudW5kb01vdmUoKSA/IHRoaXMudXBkYXRlVmlldygpIDogY29uc29sZS5sb2coXCJubyBtb3JlIHBvc2l0aW9ucyBpbiBoaXN0b3J5IGFycmF5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlR3JpZGxpbmVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0dyaWRsaW5lcyA9ICF0aGlzLnNob3dHcmlkbGluZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQmxvY2thZGVzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Jsb2NrYWRlcyA9ICF0aGlzLnNob3dCbG9ja2FkZXM7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5tb2RlbC5tYWluR3JhcGgubWF0cml4KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsQ2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy55ZWxsb3dTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5yZXN0YXJ0R2FtZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRHYW1lTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZWRTdGFydHNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5yZXN0YXJ0R2FtZShmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0R2FtZU1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbENsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWxTaG93biA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5yZXN0YXJ0R2FtZUFnYWluQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEdhbWVNb2RhbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMua2VlcFBsYXlpbmdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lV29uTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVXb25Nb2RhbFNob3duID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudmlldy5kcmF3Qm9hcmQodGhpcy5tb2RlbC5tYWluR3JhcGgsIHRoaXMuc2hvd0dyaWRsaW5lcywgdGhpcy5zaG93QmxvY2thZGVzKTtcclxuICAgICAgICB0aGlzLnZpZXcuYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuYm9hcmRDbGlja2VkKGV2ZW50KSk7XHJcbiAgICB9XHJcblxyXG4gICAgYm9hcmRDbGlja2VkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMudmlldy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgd2hpY2ggdGlsZSB3YXMgY2xpY2tlZCBmcm9tIGdsb2JhbCBjb29yZGluYXRlcyB0byBtYXRyaXggY29vcmRpbmF0ZXNcclxuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQpIC8gdGhpcy52aWV3LnRpbGVTaXplKTtcclxuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoKGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCkgLyB0aGlzLnZpZXcudGlsZVNpemUpO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaG9sZTogKHg6IFwiICsgeCArIFwiLCB5OiBcIiArIHkgKyBcIilcIik7XHJcbiAgICAgICAgbGV0IG5vZGVQbGF5ZWQgPSB0aGlzLm1vZGVsLnRyeVBsYWNpbmdQaW4oeCwgeSk7XHJcbiAgICAgICAgaWYgKG5vZGVQbGF5ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLm1haW5HcmFwaC5nYW1lV29uICE9IDAgJiYgIXRoaXMuZ2FtZVdvbk1vZGFsU2hvd24pIHtcclxuICAgICAgICAgICAgdGhpcy53aW5uZXJJbmZvLmlubmVySFRNTCA9IHRoaXMubW9kZWwubWFpbkdyYXBoLmdhbWVXb24gKyBcIiB3b24hXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZVdvbk1vZGFsU2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IENvbnRyb2xsZXIoKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9