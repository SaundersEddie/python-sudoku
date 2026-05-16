const toggleSolutionButton = document.querySelector("#toggleSolutionButton");
const testSolutionButton = document.querySelector("#testSolutionButton");
const clearCellButton = document.querySelector("#clearCellButton");
const solutionTestResult = document.querySelector("#solutionTestResult");

const puzzleDataElement = document.querySelector("#puzzleData");
const solutionDataElement = document.querySelector("#solutionData");

const cells = document.querySelectorAll(".cell");
const numberButtons = document.querySelectorAll(".number-button[data-number]");

const puzzleBoard = JSON.parse(puzzleDataElement.textContent);
const solutionBoard = JSON.parse(solutionDataElement.textContent);

let selectedCell = null;
let isSolutionVisible = false;

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

function applyCellHighlights(selectedCell) {
    const selectedRow = Number(selectedCell.dataset.row);
    const selectedCol = Number(selectedCell.dataset.col);
    const selectedValue = getCellValue(selectedCell);

    cells.forEach((cell) => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = getCellValue(cell);

        const sameRow = row === selectedRow;
        const sameCol = col === selectedCol;
        const sameBox = cellsAreInSameBox(selectedCell, cell);
        const sameValue = selectedValue !== 0 && value === selectedValue;

        if (sameRow || sameCol || sameBox) {
            cell.classList.add("highlight-related");
        }

        if (sameValue) {
            cell.classList.add("highlight-match");
        }
    });

    selectedCell.classList.add("selected");
}

function selectCell(cell) {
    clearHighlightClasses();

    selectedCell = cell;
    applyCellHighlights(selectedCell);

    solutionTestResult.textContent = "";
    solutionTestResult.className = "solution-test-result";
}

function setCellNumber(number) {
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible) {
        return;
    }

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

    clearHighlightClasses();
    applyCellHighlights(selectedCell);
    updateCompletedNumberButtons();
}

function clearSelectedCell() {
    if (!selectedCell || isGivenCell(selectedCell) || isSolutionVisible) {
        return;
    }

    selectedCell.textContent = "";
    selectedCell.classList.remove("correct-entry", "wrong-entry");

    clearHighlightClasses();
    applyCellHighlights(selectedCell);
    updateCompletedNumberButtons();
}

function showSolution() {
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
    updateCompletedNumberButtons();
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

function updateCompletedNumberButtons() {
    const numberCounts = new Map();

    for (let number = 1; number <= 9; number += 1) {
        numberCounts.set(number, 0);
    }

    cells.forEach((cell) => {
        const value = getCellValue(cell);

        if (value >= 1 && value <= 9) {
            numberCounts.set(value, numberCounts.get(value) + 1);
        }
    });

    numberButtons.forEach((button) => {
        const number = Number(button.dataset.number);
        const isComplete = numberCounts.get(number) >= 9;

        button.classList.toggle("number-complete", isComplete);
        button.disabled = isComplete;
    });
}

updateCompletedNumberButtons();
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

toggleSolutionButton.addEventListener("click", () => {
    if (isSolutionVisible) {
        hideSolution();
    } else {
        showSolution();
    }
});

testSolutionButton.addEventListener("click", testSolution);
