import { mode } from "../webpack.config";
import Model from "./model";
import View from "./view";

/** handles all input, checks in with model and displays the result with view */

// TODO implement the gameWonModalShown to a point that it is usable again
// clean up and organize code a lot
// potentially move some functionality from model to controller/index

var tilesAcrossDefault = 6;

class Controller {
    model: Model;
    view: View;

    showGridlines: boolean;
    showBlockades: boolean;
    gameWonModalShown: boolean; // has the player already seen the game won Modal and wanted to keep playing?

    // game-buttons
    restartGameButton: HTMLElement;
    undoMoveButton: HTMLElement;
    // debug-buttons
    toggleGridlinesButton: HTMLElement;
    toggleBlockadesButton: HTMLElement;
    // start / restart game modal
    startGameModal: HTMLElement;
    startGameModalCloseButton: any;
    yellowStartsButton: HTMLElement;
    redStartsButton: HTMLElement;
    // game won modal
    gameWonModal: HTMLElement;
    gameWonModalCloseButton: any;
    winnerInfo: HTMLElement;
    restartGameAgainButton: HTMLElement;
    keepPlayingButton: HTMLElement;

    constructor() {
        this.model = new Model(tilesAcrossDefault, true);
        this.view = new View();
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

        window.addEventListener("resize", () => {
            this.updateView();
        });

        this.restartGameButton.addEventListener("click", () => {
            this.startGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", () => {
            this.model.undoMove() ? this.updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", () => {
            this.showGridlines = !this.showGridlines;
            this.updateView();
        });
        this.toggleBlockadesButton.addEventListener("click", () => {
            this.showBlockades = !this.showBlockades;
            this.updateView();

            console.table(transpose(this.model.mainGraph.matrix, 10));
        });
        this.startGameModalCloseButton.addEventListener("click", () => {
            this.startGameModal.style.display = "none";
        });
        this.yellowStartsButton.addEventListener("click", () => {
            this.model = new Model(tilesAcrossDefault, true);
            this.updateView();
            this.startGameModal.style.display = "none";
            this.gameWonModalShown = false;
        });
        this.redStartsButton.addEventListener("click", () => {
            this.model = new Model(tilesAcrossDefault, false);
            this.updateView();
            this.startGameModal.style.display = "none";
            this.gameWonModalShown = false;
        });

        this.gameWonModalCloseButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.gameWonModalShown = true;
        });
        this.restartGameAgainButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.startGameModal.style.display = "block";
        });
        this.keepPlayingButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.gameWonModalShown = true;
        });
    }

    updateView(): void {
        this.view.drawBoard(this.model.mainGraph, this.showGridlines, this.showBlockades);
        this.view.board.addEventListener("click", () => this.boardClicked(event));
    }

    boardClicked(event: any): void {
        let rect = this.view.board.getBoundingClientRect();
        // calculate which tile was clicked from global coordinates to matrix coordinates
        var x = Math.floor((event.clientX - rect.left) / this.view.tileSize);
        var y = Math.floor((event.clientY - rect.top) / this.view.tileSize);

        // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
        let nodePlayed = this.model.tryPlacingPin(x, y);
        if (nodePlayed) {
            this.updateView();
        }
        if (this.model.mainGraph.gameWon != 0 && !this.gameWonModalShown) {
            this.winnerInfo.innerHTML = this.model.mainGraph.gameWon + " won!";
            this.gameWonModal.style.display = "block";
            this.gameWonModalShown = true;
        }
    }
}

const app = new Controller();

// mostly for console.table() but also potentially for transposition
function transpose(a: number[][], numeral: number) {
    return Object.keys(a[0]).map(function (c: any) {
        return a.map(function (r) {
            return numeral == 10 ? r[c] : r[c].toString(numeral);
        });
    });
}
