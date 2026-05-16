const toggleSolutionButton = document.querySelector("#toggleSolutionButton");
const testSolutionButton = document.querySelector("#testSolutionButton");
const solutionTestResult = document.querySelector("#solutionTestResult");
const puzzleDataElement = document.querySelector("#puzzleData");
const cells = document.querySelectorAll(".cell");

const puzzleBoard = JSON.parse(puzzleDataElement.textContent);

let isSolutionVisible = false;

function showSolution() {
    cells.forEach((cell) => {
        const isGiven = cell.dataset.isGiven === "true";

        if (!isGiven) {
            cell.textContent = cell.dataset.solution;
            cell.classList.add("solution-value");
        }
    });

    toggleSolutionButton.textContent = "Hide Solution";
    isSolutionVisible = true;
}

function hideSolution() {
    cells.forEach((cell) => {
        const isGiven = cell.dataset.isGiven === "true";

        if (!isGiven) {
            cell.textContent = "";
            cell.classList.remove("solution-value");
        }
    });

    toggleSolutionButton.textContent = "Show Solution";
    isSolutionVisible = false;
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

toggleSolutionButton.addEventListener("click", () => {
    if (isSolutionVisible) {
        hideSolution();
    } else {
        showSolution();
    }
});

testSolutionButton.addEventListener("click", testSolution);
