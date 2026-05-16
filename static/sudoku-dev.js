const toggleSolutionButton = document.querySelector("#toggleSolutionButton");
const testSolutionButton = document.querySelector("#testSolutionButton");
const clearCellButton = document.querySelector("#clearCellButton");
const newPuzzleButton = document.querySelector("#newPuzzleButton");
const notesModeButton = document.querySelector("#notesModeButton");

const solutionTestResult = document.querySelector("#solutionTestResult");
const moveCountElement = document.querySelector("#moveCount");
const timerDisplay = document.querySelector("#timerDisplay");
const winMessage = document.querySelector("#winMessage");
const finalTime = document.querySelector("#finalTime");
const finalMoves = document.querySelector("#finalMoves");

const puzzleDataElement = document.querySelector("#puzzleData");
const solutionDataElement = document.querySelector("#solutionData");
const pauseButton = document.querySelector("#pauseButton");
const resumeButton = document.querySelector("#resumeButton");
const pauseOverlay = document.querySelector("#pauseOverlay");

const cells = document.querySelectorAll(".cell");
const numberButtons = document.querySelectorAll(".number-button[data-number]");

const puzzleBoard = JSON.parse(puzzleDataElement.textContent);
const solutionBoard = JSON.parse(solutionDataElement.textContent);

let selectedCell = null;
let isSolutionVisible = false;
let isGameComplete = false;
let isNotesMode = false;
let isPaused = false;
let wasTimerRunningBeforePause = false;

let moveCount = 0;
let elapsedSeconds = 0;
let timerIntervalId = null;

const notesByCell = new Map();

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimerIfNeeded() {
    if (timerIntervalId !== null || isGameComplete) {
        return;
    }

    timerIntervalId = window.setInterval(() => {
        elapsedSeconds += 1;
        timerDisplay.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

function stopTimer() {
    if (timerIntervalId === null) {
        return;
    }

    window.clearInterval(timerIntervalId);
    timerIntervalId = null;
}

function incrementMoveCount() {
    moveCount += 1;
    moveCountElement.textContent = moveCount;
}

function getCellValue(cell) {
    const finalValue = cell.dataset.finalValue;

    if (finalValue) {
        return Number(finalValue);
    }

    if (cell.classList.contains("has-notes")) {
        return 0;
    }

    const text = cell.textContent.trim();

    return text === "" ? 0 : Number(text);
}

function setFinalCellValue(cell, value) {
    if (value === 0) {
        delete cell.dataset.finalValue;
        cell.textContent = "";
        return;
    }

    cell.dataset.finalValue = String(value);
    cell.textContent = value;
}

function isGivenCell(cell) {
    return cell.dataset.isGiven === "true";
}

function getCellKey(cell) {
    return `${cell.dataset.row}-${cell.dataset.col}`;
}

function clearNotesForCell(cell) {
    const key = getCellKey(cell);
    notesByCell.delete(key);
    cell.classList.remove("has-notes");
}

function renderNotesForCell(cell) {
    const key = getCellKey(cell);
    const notes = notesByCell.get(key);

    if (!notes || notes.size === 0) {
        cell.innerHTML = "";
        cell.classList.remove("has-notes");
        return;
    }

    const noteGrid = document.createElement("span");
    noteGrid.className = "notes-grid";

    for (let number = 1; number <= 9; number += 1) {
        const noteSlot = document.createElement("span");
        noteSlot.className = "note-slot";
        noteSlot.textContent = notes.has(number) ? number : "";
        noteGrid.appendChild(noteSlot);
    }

    cell.innerHTML = "";
    cell.appendChild(noteGrid);
    cell.classList.add("has-notes");
}

function toggleNoteForSelectedCell(number) {
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible || isGameComplete) {
        return;
    }

    if (getCellValue(selectedCell) !== 0) {
        return;
    }

    const key = getCellKey(selectedCell);
    const notes = notesByCell.get(key) || new Set();

    if (notes.has(number)) {
        notes.delete(number);
    } else {
        notes.add(number);
    }

    if (notes.size === 0) {
        notesByCell.delete(key);
    } else {
        notesByCell.set(key, notes);
    }

    renderNotesForCell(selectedCell);
    refreshHighlights();
}

function clearHighlightClasses() {
    cells.forEach((cell) => {
        cell.classList.remove(
            "selected",
            "highlight-related",
            "highlight-match"
        );
    });
}

function cellsAreInSameBox(firstCell, secondCell) {
    const firstRow = Number(firstCell.dataset.row);
    const firstCol = Number(firstCell.dataset.col);
    const secondRow = Number(secondCell.dataset.row);
    const secondCol = Number(secondCell.dataset.col);

    return (
        Math.floor(firstRow / 3) === Math.floor(secondRow / 3) &&
        Math.floor(firstCol / 3) === Math.floor(secondCol / 3)
    );
}

function applyCellHighlights(cellToHighlight) {
    const selectedRow = Number(cellToHighlight.dataset.row);
    const selectedCol = Number(cellToHighlight.dataset.col);
    const selectedValue = getCellValue(cellToHighlight);

    cells.forEach((cell) => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = getCellValue(cell);

        const sameRow = row === selectedRow;
        const sameCol = col === selectedCol;
        const sameBox = cellsAreInSameBox(cellToHighlight, cell);
        const sameValue = selectedValue !== 0 && value === selectedValue;

        if (sameRow || sameCol || sameBox) {
            cell.classList.add("highlight-related");
        }

        if (sameValue) {
            cell.classList.add("highlight-match");
        }
    });

    cellToHighlight.classList.add("selected");
}

function refreshHighlights() {
    if (!selectedCell) {
        return;
    }

    clearHighlightClasses();
    applyCellHighlights(selectedCell);
}

function updateCompletedNumberButtons() {
    const numberCounts = new Map();

    for (let number = 1; number <= 9; number += 1) {
        numberCounts.set(number, 0);
    }

    cells.forEach((cell) => {
        if (cell.classList.contains("solution-value")) {
            return;
        }

        const value = getCellValue(cell);

        if (value >= 1 && value <= 9) {
            numberCounts.set(value, numberCounts.get(value) + 1);
        }
    });

    numberButtons.forEach((button) => {
        const number = Number(button.dataset.number);
        const isComplete = numberCounts.get(number) >= 9;

        button.classList.toggle("number-complete", isComplete);
    });
}

function selectCell(cell) {
    if (isGameComplete || isPaused) {
        return;
    }

    selectedCell = cell;
    refreshHighlights();

    solutionTestResult.textContent = "";
    solutionTestResult.className = "solution-test-result";
}

function isBoardCompleteAndCorrect() {
    for (const cell of cells) {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = getCellValue(cell);

        if (value !== solutionBoard[row][col]) {
            return false;
        }
    }

    return true;
}

function showWinMessage() {
    isGameComplete = true;
    stopTimer();

    finalTime.textContent = formatTime(elapsedSeconds);
    finalMoves.textContent = moveCount;

    winMessage.classList.remove("hidden");
    clearHighlightClasses();
}

function checkForCompletion() {
    if (isGameComplete) {
        return;
    }

    if (isBoardCompleteAndCorrect()) {
        showWinMessage();
    }
}

function setCellNumber(number) {
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible || isGameComplete || isPaused) {
        return;
    }

    if (isNotesMode) {
        toggleNoteForSelectedCell(number);
        return;
    }

    const currentValue = getCellValue(selectedCell);

    if (currentValue === number) {
        return;
    }

    startTimerIfNeeded();
    clearNotesForCell(selectedCell);

    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);
    const correctValue = solutionBoard[row][col];

    setFinalCellValue(selectedCell, number);
    selectedCell.classList.remove("correct-entry", "wrong-entry");

    if (number === correctValue) {
        selectedCell.classList.add("correct-entry");
    } else {
        selectedCell.classList.add("wrong-entry");
    }

    incrementMoveCount();
    refreshHighlights();
    updateCompletedNumberButtons();
    checkForCompletion();
}

function clearSelectedCell() {
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible || isGameComplete || isPaused) {
        return;
    }

    const currentValue = getCellValue(selectedCell);
    const key = getCellKey(selectedCell);
    const hasNotes = notesByCell.has(key);

    if (currentValue === 0 && !hasNotes) {
        return;
    }

    if (currentValue !== 0) {
        startTimerIfNeeded();
        incrementMoveCount();
    }

    setFinalCellValue(selectedCell, 0);
    clearNotesForCell(selectedCell);
    selectedCell.classList.remove("correct-entry", "wrong-entry");

    refreshHighlights();
    updateCompletedNumberButtons();
}

function showSolution() {
    if (isGameComplete || isPaused) {
        return;
    }

    cells.forEach((cell) => {
        if (!isGivenCell(cell)) {
            cell.dataset.playerValue = getCellValue(cell);
            cell.dataset.hadNotes = notesByCell.has(getCellKey(cell)) ? "true" : "false";

            setFinalCellValue(cell, Number(cell.dataset.solution));
            cell.classList.add("solution-value");
            cell.classList.remove("correct-entry", "wrong-entry", "has-notes");
        }
    });

    toggleSolutionButton.textContent = "Hide Solution";
    isSolutionVisible = true;

    refreshHighlights();
}

function hideSolution() {
    cells.forEach((cell) => {
        if (!isGivenCell(cell)) {
            const savedValue = Number(cell.dataset.playerValue || 0);

            cell.classList.remove("solution-value");
            setFinalCellValue(cell, savedValue);

            if (savedValue === 0 && cell.dataset.hadNotes === "true") {
                renderNotesForCell(cell);
            }

            if (savedValue !== 0) {
                const row = Number(cell.dataset.row);
                const col = Number(cell.dataset.col);
                const correctValue = solutionBoard[row][col];

                if (savedValue === correctValue) {
                    cell.classList.add("correct-entry");
                } else {
                    cell.classList.add("wrong-entry");
                }
            }

            delete cell.dataset.playerValue;
            delete cell.dataset.hadNotes;
        }
    });

    toggleSolutionButton.textContent = "Show Solution";
    isSolutionVisible = false;

    refreshHighlights();
    updateCompletedNumberButtons();
}

async function testSolution() {
    solutionTestResult.textContent = "Testing solution...";
    solutionTestResult.className = "solution-test-result";

    try {
        const response = await fetch("/api/test-solution", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                board: puzzleBoard,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            solutionTestResult.textContent = result.error || "Solution test failed.";
            solutionTestResult.classList.add("solution-test-bad");
            return;
        }

        solutionTestResult.textContent = result.message;

        if (result.status === "unique_solution") {
            solutionTestResult.classList.add("solution-test-good");
        } else if (result.status === "multiple_solutions") {
            solutionTestResult.classList.add("solution-test-warning");
        } else {
            solutionTestResult.classList.add("solution-test-bad");
        }
    } catch (error) {
        solutionTestResult.textContent = "Solution test failed.";
        solutionTestResult.classList.add("solution-test-bad");
    }
}

function toggleNotesMode() {
    if (isGameComplete || isSolutionVisible || isPaused) {
        return;
    }

    isNotesMode = !isNotesMode;

    notesModeButton.textContent = isNotesMode ? "Notes: On" : "Notes: Off";
    notesModeButton.classList.toggle("active-mode", isNotesMode);
}

function startNewPuzzle() {
    window.location.reload();
}

function pauseGame() {
    if (isGameComplete || isPaused) {
        return;
    }

    wasTimerRunningBeforePause = timerIntervalId !== null;
    stopTimer();

    isPaused = true;
    document.body.classList.add("paused");
    pauseOverlay.classList.remove("hidden");
}

function resumeGame() {
    if (!isPaused) {
        return;
    }

    isPaused = false;
    document.body.classList.remove("paused");
    pauseOverlay.classList.add("hidden");

    if (wasTimerRunningBeforePause) {
        startTimerIfNeeded();
    }

    wasTimerRunningBeforePause = false;
}

cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        selectCell(cell);
    });
});

numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const number = Number(button.dataset.number);
        setCellNumber(number);
    });
});

pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
clearCellButton.addEventListener("click", clearSelectedCell);
newPuzzleButton.addEventListener("click", startNewPuzzle);
notesModeButton.addEventListener("click", toggleNotesMode);

toggleSolutionButton.addEventListener("click", () => {
    if (isSolutionVisible) {
        hideSolution();
    } else {
        showSolution();
    }
});

testSolutionButton.addEventListener("click", testSolution);

updateCompletedNumberButtons();
