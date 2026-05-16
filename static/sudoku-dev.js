const toggleSolutionButton = document.querySelector("#toggleSolutionButton");
const testSolutionButton = document.querySelector("#testSolutionButton");
const clearCellButton = document.querySelector("#clearCellButton");
const newPuzzleButton = document.querySelector("#newPuzzleButton");

const solutionTestResult = document.querySelector("#solutionTestResult");
const moveCountElement = document.querySelector("#moveCount");
const timerDisplay = document.querySelector("#timerDisplay");
const winMessage = document.querySelector("#winMessage");
const finalTime = document.querySelector("#finalTime");
const finalMoves = document.querySelector("#finalMoves");

const puzzleDataElement = document.querySelector("#puzzleData");
const solutionDataElement = document.querySelector("#solutionData");

const cells = document.querySelectorAll(".cell");
const numberButtons = document.querySelectorAll(".number-button[data-number]");

const puzzleBoard = JSON.parse(puzzleDataElement.textContent);
const solutionBoard = JSON.parse(solutionDataElement.textContent);

let selectedCell = null;
let isSolutionVisible = false;
let isGameComplete = false;

let moveCount = 0;
let elapsedSeconds = 0;
let timerIntervalId = null;

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
    const text = cell.textContent.trim();
    return text === "" ? 0 : Number(text);
}

function isGivenCell(cell) {
    return cell.dataset.isGiven === "true";
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
    if (isGameComplete) {
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
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible || isGameComplete) {
        return;
    }

    const currentValue = getCellValue(selectedCell);

    if (currentValue === number) {
        return;
    }

    startTimerIfNeeded();

    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);
    const correctValue = solutionBoard[row][col];

    selectedCell.textContent = number;
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
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible || isGameComplete) {
        return;
    }

    const currentValue = getCellValue(selectedCell);

    if (currentValue === 0) {
        return;
    }

    startTimerIfNeeded();

    selectedCell.textContent = "";
    selectedCell.classList.remove("correct-entry", "wrong-entry");

    incrementMoveCount();
    refreshHighlights();
    updateCompletedNumberButtons();
}

function showSolution() {
    if (isGameComplete) {
        return;
    }

    cells.forEach((cell) => {
        if (!isGivenCell(cell)) {
            cell.dataset.playerValue = getCellValue(cell);
            cell.textContent = cell.dataset.solution;
            cell.classList.add("solution-value");
            cell.classList.remove("correct-entry", "wrong-entry");
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

            cell.textContent = savedValue === 0 ? "" : savedValue;
            cell.classList.remove("solution-value");

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

function startNewPuzzle() {
    window.location.reload();
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

clearCellButton.addEventListener("click", clearSelectedCell);
newPuzzleButton.addEventListener("click", startNewPuzzle);

toggleSolutionButton.addEventListener("click", () => {
    if (isSolutionVisible) {
        hideSolution();
    } else {
        showSolution();
    }
});

testSolutionButton.addEventListener("click", testSolution);

updateCompletedNumberButtons();
