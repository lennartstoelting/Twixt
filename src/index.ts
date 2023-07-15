import { Graph, State } from "./graph";
import Model from "./model";
import View from "./view";

/** handles all input, checks in with model and displays the result with view */

var tilesAcrossDefault = 6;

class Controller {
    model: Model;
    view: View;

    showGridlines: boolean;
    showBlockades: boolean;
    gameWonModalShown: boolean; // has the player already seen the game won Modal and wanted to keep playing?

    // game-/debug-buttons
    restartGameButton: HTMLButtonElement;
    undoMoveButton: HTMLButtonElement;
    toggleGridlinesButton: HTMLButtonElement;
    toggleBlockadesButton: HTMLButtonElement;

    // setup game modal
    setupGameModal: HTMLElement;
    setupGameModalCloseButton: HTMLElement;
    yellowAiButton: HTMLInputElement;
    yellowStartsButton: HTMLInputElement;
    redAiButton: HTMLInputElement;
    redStartsButton: HTMLInputElement;
    boardSizeSlider: HTMLInputElement;
    boardSizeLabel: HTMLElement;
    startButton: HTMLInputElement;

    // game won modal
    gameWonModal: HTMLElement;
    gameWonModalCloseButton: HTMLElement;
    winnerInfo: HTMLElement;
    restartGameAgainButton: HTMLButtonElement;
    keepPlayingButton: HTMLButtonElement;

    constructor() {
        this.model = new Model(tilesAcrossDefault, true, false, false);
        this.view = new View();

        this._getDomElements();
        this._initEventListeners();

        this.updateView();
    }

    _getDomElements(): void {
        // game-/debug-buttons
        this.restartGameButton = document.getElementById("restart-game") as HTMLButtonElement;
        this.undoMoveButton = document.getElementById("undo-move") as HTMLButtonElement;
        this.toggleGridlinesButton = document.getElementById("toggle-gridlines") as HTMLButtonElement;
        this.toggleBlockadesButton = document.getElementById("toggle-blockades") as HTMLButtonElement;

        // setup game modal
        this.setupGameModal = document.getElementById("start-game-modal");
        this.setupGameModalCloseButton = document.getElementsByClassName("modal-close")[0] as HTMLElement;
        this.yellowAiButton = document.getElementById("yellow-ai") as HTMLInputElement;
        this.yellowStartsButton = document.getElementById("yellow-starts") as HTMLInputElement;
        this.redAiButton = document.getElementById("red-ai") as HTMLInputElement;
        this.redStartsButton = document.getElementById("red-starts") as HTMLInputElement;
        this.boardSizeSlider = document.getElementById("board-size") as HTMLInputElement;
        this.boardSizeLabel = document.getElementById("board-size-label");
        this.startButton = document.getElementById("start") as HTMLInputElement;

        this.yellowAiButton.value = "Player";
        this.yellowStartsButton.value = "goes first";
        this.redAiButton.value = "Computer";
        this.redStartsButton.value = "goes second";
        this.boardSizeSlider.value = tilesAcrossDefault.toString();
        this.boardSizeLabel.innerHTML = `${tilesAcrossDefault}x${tilesAcrossDefault}`;

        // game won modal
        this.gameWonModal = document.getElementById("game-won-modal");
        this.gameWonModalCloseButton = document.getElementsByClassName("modal-close")[1] as HTMLElement;
        this.winnerInfo = document.getElementById("winner-info");
        this.restartGameAgainButton = document.getElementById("restart-game-again") as HTMLButtonElement;
        this.keepPlayingButton = document.getElementById("keep-playing") as HTMLButtonElement;
    }

    _initEventListeners(): void {
        window.addEventListener("resize", () => {
            this.updateView();
        });

        // game-/debug-buttons
        this.restartGameButton.addEventListener("click", () => {
            this.setupGameModal.style.display = "block";
        });
        this.undoMoveButton.addEventListener("click", () => {
            this.model.undoMove() ? this.updateView() : console.log("no more positions in history array");
        });
        this.toggleGridlinesButton.addEventListener("click", () => {
            // this.showGridlines = !this.showGridlines;
            // this.updateView();
            this.model.minimaxStart(4);
        });
        this.toggleBlockadesButton.addEventListener("click", () => {
            this.showBlockades = !this.showBlockades;
            this.updateView();
        });

        // setup game modal
        this.setupGameModalCloseButton.addEventListener("click", () => {
            this.setupGameModal.style.display = "none";
        });
        this.yellowAiButton.addEventListener("click", () => {
            this.yellowAiButton.value = this.yellowAiButton.value == "Player" ? "Computer" : "Player";
        });
        this.redAiButton.addEventListener("click", () => {
            this.redAiButton.value = this.redAiButton.value == "Player" ? "Computer" : "Player";
        });
        this.yellowStartsButton.addEventListener("click", () => {
            this.yellowStartsButton.value = this.yellowStartsButton.value == "goes first" ? "goes second" : "goes first";
            this.redStartsButton.value = this.redStartsButton.value == "goes first" ? "goes second" : "goes first";
        });
        this.redStartsButton.addEventListener("click", () => {
            this.yellowStartsButton.value = this.yellowStartsButton.value == "goes first" ? "goes second" : "goes first";
            this.redStartsButton.value = this.redStartsButton.value == "goes first" ? "goes second" : "goes first";
        });
        this.boardSizeSlider.addEventListener("input", () => {
            this.boardSizeLabel.innerHTML = `${this.boardSizeSlider.value}x${this.boardSizeSlider.value}`;
        });
        this.startButton.addEventListener("click", () => {
            this.model = new Model(
                parseInt(this.boardSizeSlider.value),
                this.yellowStartsButton.value == "goes first",
                this.yellowAiButton.value == "Computer",
                this.redAiButton.value == "Computer"
            );

            this.setupGameModal.style.display = "none";
            this.gameWonModalShown = false;
            this.updateView();
        });

        // game won modal
        this.gameWonModalCloseButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.gameWonModalShown = true;
        });
        this.restartGameAgainButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.setupGameModal.style.display = "block";
        });
        this.keepPlayingButton.addEventListener("click", () => {
            this.gameWonModal.style.display = "none";
            this.gameWonModalShown = true;
        });
    }

    updateView(): void {
        this.view.drawBoard(this.model.displayedGraph, this.showGridlines, this.showBlockades);
        this.view.board.addEventListener("click", () => this._boardClicked(event));
    }

    _boardClicked(event: any): void {
        let rect = this.view.board.getBoundingClientRect();
        // calculate which tile was clicked from global coordinates to matrix coordinates
        var x = Math.floor((event.clientX - rect.left) / this.view.tileSize);
        var y = Math.floor((event.clientY - rect.top) / this.view.tileSize);
        // the corners of the playing field
        if ((x == 0 || x == this.model.displayedGraph.tilesAcross - 1) && (y == 0 || y == this.model.displayedGraph.tilesAcross - 1)) return;
        // console.log("clicked hole: (x: " + x + ", y: " + y + ")");
        let nodePlayed = this.model.tryPlacingPin(x, y);
        if (nodePlayed) {
            this.updateView();
        }
        if (this.model.displayedGraph.gameWon != State.empty && !this.gameWonModalShown) {
            this.winnerInfo.innerHTML = this.model.displayedGraph.gameWon + " won!";
            this.gameWonModal.style.display = "block";
            this.gameWonModalShown = true;
        }
    }
}

const app = new Controller();
