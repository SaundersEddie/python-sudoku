from flask import Flask, jsonify, render_template, request

from sudoku_engine import (
    DIFFICULTY_CLUES,
    count_solutions,
    create_unique_puzzle,
    generate_solution,
    get_normalized_difficulty,
    get_visible_count_for_difficulty,
    is_valid_solution,
)


app = Flask(__name__)


@app.route("/")
def index():
    requested_difficulty = request.args.get("difficulty", "easy")
    difficulty = get_normalized_difficulty(requested_difficulty)
    visible_count = get_visible_count_for_difficulty(difficulty)

    solution = generate_solution()
    puzzle = create_unique_puzzle(solution, visible_count=visible_count)
    is_valid = is_valid_solution(solution)

    return render_template(
        "index.html",
        board=puzzle,
        solution=solution,
        is_valid=is_valid,
        difficulty=difficulty,
        difficulties=DIFFICULTY_CLUES,
        visible_count=visible_count,
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
