const toggleSolutionButton = document.querySelector("#toggleSolutionButton");
const cells = document.querySelectorAll(".cell");

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

toggleSolutionButton.addEventListener("click", () => {
    if (isSolutionVisible) {
        hideSolution();
    } else {
        showSolution();
    }
});
