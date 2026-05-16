from flask import Flask, jsonify, render_template, request

from sudoku_engine import (
    count_solutions,
    create_puzzle,
    create_unique_puzzle,
    generate_solution,
    is_valid_solution,
)


app = Flask(__name__)

DEV_VISIBLE_COUNT = 40


@app.route("/")
def index():
    solution = generate_solution()
    puzzle = create_unique_puzzle(solution, DEV_VISIBLE_COUNT)
    is_valid = is_valid_solution(solution)

    return render_template(
        "index.html",
        board=puzzle,
        solution=solution,
        is_valid=is_valid,
        visible_count=DEV_VISIBLE_COUNT,
    )


@app.route("/api/test-solution", methods=["POST"])
def test_solution():
    data = request.get_json(silent=True)

    if not data or "board" not in data:
        return jsonify(
            {
                "ok": False,
                "error": "Missing board data.",
            }
        ), 400

    board = data["board"]
    solution_count = count_solutions(board, limit=2)

    if solution_count == 0:
        status = "no_solution"
        message = "No solution found."
    elif solution_count == 1:
        status = "unique_solution"
        message = "Unique solution found."
    else:
        status = "multiple_solutions"
        message = "Multiple solutions found."

    return jsonify(
        {
            "ok": True,
            "solution_count": solution_count,
            "status": status,
            "message": message,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
