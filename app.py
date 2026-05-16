from flask import Flask, render_template

from sudoku_engine import create_puzzle, generate_solution, is_valid_solution


app = Flask(__name__)

DEV_VISIBLE_COUNT = 10


@app.route("/")
def index():
    solution = generate_solution()
    puzzle = create_puzzle(solution, DEV_VISIBLE_COUNT)
    is_valid = is_valid_solution(solution)

    return render_template(
        "index.html",
        board=puzzle,
        solution=solution,
        is_valid=is_valid,
        visible_count=DEV_VISIBLE_COUNT,
    )


if __name__ == "__main__":
    app.run(debug=True)