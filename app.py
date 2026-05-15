from flask import Flask, render_template

from sudoku_engine import generate_solution, is_valid_solution


app = Flask(__name__)


@app.route("/")
def index():
    board = generate_solution()
    is_valid = is_valid_solution(board)

    return render_template(
        "index.html",
        board=board,
        is_valid=is_valid,
    )


if __name__ == "__main__":
    app.run(debug=True)
